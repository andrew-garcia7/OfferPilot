import { Router } from "express";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import https from "https";

const router = Router();
const IS_WIN = process.platform === "win32";

// ─── Sandbox constants ────────────────────────────────────────────────────────
const MAX_OUTPUT_BYTES   = 100_000;   // 100 KB stdout+stderr cap per execution
const MAX_CODE_BYTES     = 65_536;    // 64 KB max code submission
const EXEC_TIMEOUT_MS    = 12_000;    // runtime limit (ms)
const COMPILE_TIMEOUT_MS = 25_000;    // compile step limit (ms)

// Only JS/TS execute locally (pattern-blocked + stripped env).
// All other languages go straight to Wandbox which provides:
//   • network=none isolation  • ephemeral containers  • memory/CPU limits
const LOCAL_ALLOWED = new Set<string>(["javascript", "typescript"]);

// Minimal environment for local JS/TS processes.
// Strips HOME, USER, API tokens, and all sensitive host variables.
const SAFE_LOCAL_ENV: NodeJS.ProcessEnv = {
  PATH:     process.env.PATH ?? "",
  TEMP:     os.tmpdir(),
  TMP:      os.tmpdir(),
  TMPDIR:   os.tmpdir(),
  NODE_ENV: "sandbox",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Cmd = [string, string[]];

interface LangCfg {
  filename: string;
  setup?: (dir: string) => void;  // optional pre-run step (e.g. write tsconfig)
  compile?: (dir: string) => Cmd;
  run: (dir: string) => Cmd;
  cloudPrepare?: (code: string) => string; // transform code before sending to cloud
}

interface ProcResult { stdout: string; stderr: string; code: number }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fp(dir: string, name: string) { return path.join(dir, name); }
function exe(name: string) { return IS_WIN ? `${name}.exe` : name; }

// Resolve .cmd / .bat files on Windows via cmd.exe
function resolveCmd(cmd: string, args: string[]): [string, string[]] {
  if (IS_WIN && /\.(cmd|bat)$/i.test(cmd)) {
    return ["cmd.exe", ["/c", cmd, ...args]];
  }
  return [cmd, args];
}

// ts-node binary path — try local node_modules first, then global fallback
const TS_NODE_BIN = (() => {
  const local = path.join(process.cwd(), "node_modules", "ts-node", "dist", "bin.js");
  if (fs.existsSync(local)) return local;
  // fallback: rely on PATH (global ts-node)
  return IS_WIN ? "ts-node.cmd" : "ts-node";
})();

// ─── Language Configurations ──────────────────────────────────────────────────
const LANGS: Record<string, LangCfg> = {
  javascript: {
    filename: "solution.js",
    // --max-old-space-size caps V8 heap at 128 MB; --disallow-code-generation-from-strings
    // blocks eval/new Function; --no-experimental-fetch removes network APIs.
    run: (dir) => ["node", [
      "--max-old-space-size=128",
      "--disallow-code-generation-from-strings",
      fp(dir, "solution.js"),
    ]],
  },
  typescript: {
    filename: "solution.ts",
    setup: (dir) => {
      fs.writeFileSync(path.join(dir, "tsconfig.json"), JSON.stringify({
        compilerOptions: {
          module: "CommonJS", target: "ES2020",
          esModuleInterop: true, skipLibCheck: true, strict: false,
        },
      }));
    },
    run: (dir) => {
      const isLocalBin = TS_NODE_BIN.endsWith(".js");
      if (isLocalBin) {
        // Invoke via node — avoids shell resolution issues on Windows.
        // NOTE: do NOT add --disallow-code-generation-from-strings here;
        //       ts-node uses dynamic module loading that requires it.
        return ["node", [
          "--max-old-space-size=128",
          TS_NODE_BIN,
          "--project", fp(dir, "tsconfig.json"),
          "--transpile-only", fp(dir, "solution.ts"),
        ]];
      }
      // Global ts-node binary on PATH
      return [TS_NODE_BIN, [
        "--project", fp(dir, "tsconfig.json"),
        "--transpile-only", fp(dir, "solution.ts"),
      ]];
    },
  },
  python: {
    filename: "solution.py",
    run: (dir) => [IS_WIN ? "python" : "python3", [fp(dir, "solution.py")]],
  },
  java: {
    filename: "Main.java",
    compile: (dir) => ["javac", [fp(dir, "Main.java")]],
    run:     (dir) => ["java", ["-cp", dir, "Main"]],
    // Wandbox uses prog.java; remove `public` so class name matches any filename
    cloudPrepare: (code) => code.replace(/\bpublic\s+(class\s)/g, "$1"),
  },
  cpp: {
    filename: "solution.cpp",
    compile: (dir) => ["g++", ["-std=c++17", "-O2", "-o", fp(dir, exe("solution")), fp(dir, "solution.cpp")]],
    run:     (dir) => [fp(dir, exe("solution")), []],
  },
  c: {
    filename: "solution.c",
    compile: (dir) => ["gcc", ["-O2", "-o", fp(dir, exe("solution")), fp(dir, "solution.c")]],
    run:     (dir) => [fp(dir, exe("solution")), []],
  },
  go: {
    filename: "solution.go",
    run: (dir) => ["go", ["run", fp(dir, "solution.go")]],
  },
  rust: {
    filename: "solution.rs",
    compile: (dir) => ["rustc", ["-o", fp(dir, exe("solution")), fp(dir, "solution.rs")]],
    run:     (dir) => [fp(dir, exe("solution")), []],
  },
};

// ─── Security policy (static code analysis — defense in depth) ────────────────
// Blocks dangerous patterns before any execution path.
// Wandbox additionally sandboxes cloud-side; these rules are a server-side gate.
interface BlockedPattern { pattern: RegExp; reason: string }
const SECURITY_RULES: Record<string, BlockedPattern[]> = {
  python: [
    { pattern: /\bos\.system\s*\(/,                                    reason: "os.system() is blocked" },
    { pattern: /\bsubprocess\b/,                                        reason: "subprocess module is blocked" },
    { pattern: /\bshutil\.(rmtree|move|copy)\s*\(/,                     reason: "shutil filesystem ops are blocked" },
    { pattern: /\bsocket\b/,                                            reason: "socket module is blocked" },
    { pattern: /\bmultiprocessing\b/,                                   reason: "multiprocessing module is blocked" },
    { pattern: /\bpty\b/,                                               reason: "pty module is blocked" },
    { pattern: /\bctypes\b/,                                            reason: "ctypes module is blocked" },
    { pattern: /\bcffi\b/,                                              reason: "cffi module is blocked" },
    // Obfuscated import detection
    { pattern: /__import__/,                                            reason: "__import__() is blocked" },
    { pattern: /\bimportlib\b/,                                         reason: "importlib is blocked" },
    { pattern: /getattr\s*\(.*__import__|getattr\s*\(.*builtins/s,     reason: "getattr-based import bypass is blocked" },
    { pattern: /\bbuiltins\b/,                                          reason: "builtins module access is blocked" },
    { pattern: /['"]o['"]\s*[+,]\s*['"]s['"]|'os'|"os"/,              reason: "string-concatenated module names are blocked" },
    { pattern: /chr\s*\(\d+\).*chr\s*\(\d+\)/,                         reason: "chr()-based string obfuscation is blocked" },
    { pattern: /\.decode\s*\(['"]utf/,                                  reason: "encoded string decoding for imports is blocked" },
    { pattern: /compile\s*\(|exec\s*\(|eval\s*\(/,                     reason: "eval/exec/compile are blocked" },
  ],
  javascript: [
    { pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)/, reason: "child_process module is blocked" },
    { pattern: /require\s*\(\s*['"`]fs['"`]\s*\)/,            reason: "fs module is blocked" },
    { pattern: /require\s*\(\s*['"`]net['"`]\s*\)/,           reason: "net module is blocked" },
    { pattern: /require\s*\(\s*['"`]http['"`]\s*\)/,          reason: "http module is blocked" },
    { pattern: /require\s*\(\s*['"`]https['"`]\s*\)/,         reason: "https module is blocked" },
    { pattern: /require\s*\(\s*['"`]dgram['"`]\s*\)/,         reason: "dgram module is blocked" },
    { pattern: /require\s*\(\s*['"`]cluster['"`]\s*\)/,       reason: "cluster module is blocked" },
    { pattern: /require\s*\(\s*['"`]worker_threads['"`]\s*\)/, reason: "worker_threads module is blocked" },
    { pattern: /process\.env\b/,                                          reason: "process.env access is blocked" },
    { pattern: /process\.exit\s*\(/,                                      reason: "process.exit() is blocked" },
    { pattern: /process\.binding\s*\(/,                                   reason: "process.binding() is blocked" },
    // Memory abuse
    { pattern: /Buffer\.alloc\s*\(\s*\d{7,}/,                            reason: "Buffer.alloc with size ≥10MB is blocked" },
    { pattern: /Buffer\.allocUnsafe\s*\(/,                                reason: "Buffer.allocUnsafe is blocked" },
    { pattern: /new\s+ArrayBuffer\s*\(\s*\d{7,}/,                         reason: "Large ArrayBuffer allocation is blocked" },
    { pattern: /new\s+SharedArrayBuffer\s*\(/,                            reason: "SharedArrayBuffer is blocked" },
    { pattern: /new\s+Worker\s*\(/,                                       reason: "Worker threads are blocked" },
    { pattern: /eval\s*\(|new\s+Function\s*\(/,                           reason: "eval and new Function are blocked" },
  ],
  typescript: [
    { pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)/, reason: "child_process module is blocked" },
    { pattern: /from\s+['"`]child_process['"`]/,               reason: "child_process module is blocked" },
    { pattern: /require\s*\(\s*['"`]fs['"`]\s*\)/,             reason: "fs module is blocked" },
    { pattern: /from\s+['"`]fs['"`]/,                          reason: "fs module is blocked" },
    { pattern: /require\s*\(\s*['"`]net['"`]\s*\)/,            reason: "net module is blocked" },
    { pattern: /from\s+['"`]net['"`]/,                         reason: "net module is blocked" },
    { pattern: /require\s*\(\s*['"`]https?['"`]\s*\)/,         reason: "http/https module is blocked" },
    { pattern: /from\s+['"`]https?['"`]/,                      reason: "http/https module is blocked" },
    { pattern: /process\.env\b/,                                          reason: "process.env access is blocked" },
    { pattern: /process\.exit\s*\(/,                                      reason: "process.exit() is blocked" },
    { pattern: /new\s+SharedArrayBuffer\s*\(/,                            reason: "SharedArrayBuffer is blocked" },
    { pattern: /new\s+Worker\s*\(/,                                       reason: "Worker threads are blocked" },
    { pattern: /Buffer\.alloc\s*\(\s*\d{7,}/,                            reason: "Large Buffer.alloc is blocked" },
    { pattern: /Buffer\.allocUnsafe\s*\(/,                                reason: "Buffer.allocUnsafe is blocked" },
    { pattern: /eval\s*\(|new\s+Function\s*\(/,                           reason: "eval and new Function are blocked" },
  ],
  c: [
    { pattern: /\bsystem\s*\(/,               reason: "system() is blocked" },
    { pattern: /\bpopen\s*\(/,                reason: "popen() is blocked" },
    { pattern: /\bfork\s*\(/,                 reason: "fork() is blocked" },
    { pattern: /\bexecv?[elp]{0,2}p?\s*\(/,  reason: "exec() family is blocked" },
    { pattern: /\bunlink\s*\(/,               reason: "unlink() is blocked" },
    { pattern: /\brmdir\s*\(/,                reason: "rmdir() is blocked" },
  ],
  cpp: [
    { pattern: /\bsystem\s*\(/,               reason: "system() is blocked" },
    { pattern: /\bpopen\s*\(/,                reason: "popen() is blocked" },
    { pattern: /\bfork\s*\(/,                 reason: "fork() is blocked" },
    { pattern: /\bexecv?[elp]{0,2}p?\s*\(/,  reason: "exec() family is blocked" },
    { pattern: /std::system/,                 reason: "std::system is blocked" },
  ],
  java: [
    { pattern: /Runtime\.getRuntime\s*\(\s*\)\.exec/, reason: "Runtime.exec() is blocked" },
    { pattern: /new\s+ProcessBuilder\s*\(/,            reason: "ProcessBuilder is blocked" },
    { pattern: /System\.exit\s*\(/,                    reason: "System.exit() is blocked" },
  ],
  go: [
    { pattern: /exec\.Command\s*\(/,  reason: "exec.Command is blocked" },
    { pattern: /os\.Remove\s*\(/,     reason: "os.Remove is blocked" },
    { pattern: /os\.RemoveAll\s*\(/, reason: "os.RemoveAll is blocked" },
    { pattern: /\bsyscall\./,         reason: "syscall package is blocked" },
  ],
  rust: [
    { pattern: /std::process::Command/,           reason: "std::process::Command is blocked" },
    { pattern: /Command::new\s*\(/,               reason: "process spawning is blocked" },
    { pattern: /std::fs::remove/,                 reason: "filesystem removal is blocked" },
    { pattern: /std::net::/,                      reason: "std::net (networking) is blocked" },
    { pattern: /TcpStream|TcpListener|UdpSocket/, reason: "network sockets are blocked" },
  ],
};

function enforceSecurityPolicy(language: string, code: string): string | null {
  for (const { pattern, reason } of SECURITY_RULES[language] ?? []) {
    if (pattern.test(code)) return reason;
  }
  return null;
}

// ─── Process runner ───────────────────────────────────────────────────────────
function runProc(
  cmd: string,
  args: string[],
  stdin = "",
  timeoutMs = EXEC_TIMEOUT_MS,
  env: NodeJS.ProcessEnv = process.env,
): Promise<ProcResult> {
  return new Promise((resolve, reject) => {
    const [resolvedCmd, resolvedArgs] = resolveCmd(cmd, args);
    const child = spawn(resolvedCmd, resolvedArgs, { shell: false, env });
    let stdout = "";
    let stderr = "";
    let killed = false;
    let limitHit = false;

    // Hard-kill after timeout (SIGKILL, not SIGTERM — no chance to ignore it)
    const timer = setTimeout(() => {
      if (!killed) { killed = true; child.kill("SIGKILL"); }
    }, timeoutMs);

    // Per-chunk cap: slice the incoming chunk to the remaining budget BEFORE
    // appending it. This prevents a single large chunk from inflating memory.
    const onData = (chunk: string, isStdout: boolean) => {
      if (limitHit) return;
      const used = stdout.length + stderr.length;
      const remaining = MAX_OUTPUT_BYTES - used;
      if (remaining <= 0 || chunk.length >= remaining) {
        // Take only what fits, then hard-stop
        const slice = chunk.slice(0, Math.max(0, remaining));
        if (isStdout) stdout += slice;
        else         stderr += slice;
        limitHit = true;
        killed   = true;
        stdout  += "\n[Output truncated: exceeded 100 KB limit]";
        child.stdout.destroy();
        child.stderr.destroy();
        child.kill("SIGKILL");
      } else {
        if (isStdout) stdout += chunk;
        else         stderr += chunk;
      }
    };

    child.stdout.on("data", (d: Buffer) => onData(d.toString(), true));
    child.stderr.on("data", (d: Buffer) => onData(d.toString(), false));

    try {
      if (stdin) child.stdin.write(stdin);
      child.stdin.end();
    } catch { /* some processes close stdin early */ }

    child.on("close", (code) => {
      clearTimeout(timer);
      if (limitHit) {
        resolve({ stdout, stderr, code: -2 });  // -2 = output limit
      } else if (killed) {
        resolve({ stdout, stderr: `${stderr}\n[TLE: process killed — time limit exceeded]`.trim(), code: -1 });
      } else {
        resolve({ stdout, stderr, code: code ?? 0 });
      }
    });
    child.on("error", (e) => { clearTimeout(timer); reject(e); });
  });
}

// ─── Wandbox cloud execution (tier 2) ────────────────────────────────────────
// Wandbox is a free, no-auth cloud compiler at wandbox.org.
// We fetch their live compiler list once and pick the latest stable compiler.

// Map our language keys → Wandbox "language" field in their list
const WANDBOX_LANG: Record<string, string> = {
  java:       "Java",
  c:          "C",
  cpp:        "C++",
  go:         "Go",
  rust:       "Rust",
  python:     "Python",
  javascript: "JavaScript",
  typescript: "TypeScript",
};

interface WandboxCompiler { name: string; language: string; "display-version"?: string }
interface WandboxResult {
  status:           string;  // exit code as string
  compiler_output:  string;
  compiler_error:   string;
  program_output:   string;
  program_error:    string;
}

let _wbCache: WandboxCompiler[] = [];
let _wbCacheAt = 0;

function wandboxGet(apiPath: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: "wandbox.org", path: apiPath, headers: { Accept: "application/json" } },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          try { resolve(JSON.parse(raw)); }
          catch { reject(new Error(`Wandbox GET ${apiPath}: non-JSON (HTTP ${res.statusCode})`)); }
        });
      },
    );
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("Wandbox list: timed out")); });
    req.on("error", reject);
    req.end();
  });
}

async function getWandboxCompiler(lang: string): Promise<string> {
  if (Date.now() - _wbCacheAt > 30 * 60_000) {
    try {
      const data = await wandboxGet("/api/list.json");
      if (Array.isArray(data)) { _wbCache = data; _wbCacheAt = Date.now(); }
    } catch (e: any) {
      console.warn("[wandbox] list fetch failed:", e.message);
    }
  }
  const wbLang = WANDBOX_LANG[lang];
  if (!wbLang) throw new Error(`No Wandbox mapping for: ${lang}`);
  const all = _wbCache.filter(c => c.language === wbLang);
  if (!all.length) throw new Error(`No Wandbox compiler found for: ${wbLang}`);
  // Prefer stable (non-"head") compilers, sorted descending by name
  const stable = all.filter(c => !c.name.includes("head")).sort((a, b) => b.name.localeCompare(a.name));
  return (stable[0] ?? all[0]).name;
}

function wandboxRun(
  compiler: string,
  code: string,
  stdin: string,
): Promise<WandboxResult> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ compiler, code, stdin: stdin || "" });
    const req = https.request(
      {
        hostname: "wandbox.org",
        path: "/api/compile.json",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "Accept": "application/json",
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Wandbox HTTP ${res.statusCode}: ${raw.substring(0, 200)}`));
          }
          try { resolve(JSON.parse(raw) as WandboxResult); }
          catch { reject(new Error("Wandbox: invalid JSON response")); }
        });
      },
    );
    req.setTimeout(90000, () => { req.destroy(); reject(new Error("Wandbox: timed out after 90s")); });
    req.on("error", (e: any) => {
      if (e.code === "ECONNRESET") reject(new Error("Wandbox: connection reset (server overloaded, try again)"));
      else reject(e);
    });
    req.write(body);
    req.end();
  });
}

// Patterns that indicate the code reads from stdin
const STDIN_PATTERNS: Record<string, RegExp> = {
  rust:       /read_line|stdin\(\)|BufRead|read_to_string/,
  python:     /\binput\s*\(/,
  java:       /Scanner|BufferedReader|System\.in|nextLine|nextInt/,
  cpp:        /cin\s*>>|scanf|getline/,
  c:          /scanf|fgets|getchar|fread/,
  go:         /fmt\.Scan|bufio\.NewReader|os\.Stdin/,
  javascript: /readline|process\.stdin/,
  typescript: /readline|process\.stdin/,
};

function needsStdin(language: string, code: string): boolean {
  return STDIN_PATTERNS[language]?.test(code) ?? false;
}

// Normalize stdin: ensure non-empty stdin always ends with \n so that
// read_line / input() / Scanner receive a properly terminated line.
// Wandbox buffers stdin and only flushes on newline — without this,
// read_line returns an empty string even when the user typed a value.
function normalizeStdin(raw: string): string {
  if (!raw) return "";
  return raw.endsWith("\n") ? raw : raw + "\n";
}

// ─── POST /api/code/run ───────────────────────────────────────────────────────
router.post("/run", async (req, res) => {
  const { code, language, stdin: rawStdin = "" } = req.body as {
    code: string;
    language: string;
    stdin?: string;
  };

  const stdin = normalizeStdin(rawStdin);

  // ── 1. Code size guard ──────────────────────────────────────────────────────
  if (Buffer.byteLength(code ?? "") > MAX_CODE_BYTES) {
    return res.json({
      success: false,
      output: "🚫 Submission too large. Maximum code size is 64 KB.",
      time: "0.00s", exitCode: 1, version: "", isError: true,
    });
  }

  // ── 2. Security policy check ────────────────────────────────────────────────
  const secViolation = enforceSecurityPolicy(language, code ?? "");
  if (secViolation) {
    console.warn(`[SECURITY] BLOCKED lang=${language} rule="${secViolation}" ip=${req.ip ?? "unknown"}`);
    return res.json({
      success: false,
      output: [
        `🚫  Security Policy Violation`,
        ``,
        `   ${secViolation}`,
        ``,
        `This sandbox blocks: shell commands, network access, dangerous filesystem`,
        `operations, and process spawning. Normal I/O, algorithms, data structures,`,
        `stdin input, OOP, and competitive programming patterns all work fine.`,
      ].join("\n"),
      time: "0.00s", exitCode: 1, version: "", isError: true,
    });
  }

  const cfg = LANGS[language];
  if (!code?.trim() || !cfg) {
    return res.json({
      success: false,
      output: `Unsupported language: ${language ?? "(none)"}`,
      time: "—", exitCode: 1, version: "", isError: true,
    });
  }

  // ── 3. Stdin guard ─────────────────────────────────────────────────────────
  if (!stdin && needsStdin(language, code)) {
    console.warn(`[code/run] stdin-reading code with empty stdin (lang=${language})`);
    return res.json({
      success: false,
      output: [
        `⚠️  This code reads from stdin, but the Custom Input box is empty.`,
        ``,
        `Please enter your input in the "stdin / Custom Input" box below the editor and run again.`,
        `Example: if your code does  read_line / input() / Scanner / cin, you need to provide a value.`,
      ].join("\n"),
      time: "0.00s", exitCode: 1, version: "", isError: true,
    });
  }

  console.log(`[code/run] lang=${language} local=${LOCAL_ALLOWED.has(language)} codeLen=${code.length} stdinLen=${stdin.length} ip=${req.ip ?? "unknown"}`);

  const t0 = Date.now();
  const elapsed = () => `${((Date.now() - t0) / 1000).toFixed(2)}s`;
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "automock-"));

  try {
    fs.writeFileSync(path.join(tmpDir, cfg.filename), code, "utf8");
    if (cfg.setup) cfg.setup(tmpDir);

    // ── Tier 1: Local execution (JS/TS only, restricted environment) ───────
    // Python, Java, C, C++, Go, Rust skip this and go straight to Wandbox.
    // Wandbox provides: network isolation, ephemeral containers, resource limits.
    if (LOCAL_ALLOWED.has(language)) {
      try {
        if (cfg.compile) {
          const [cc, ca] = cfg.compile(tmpDir);
          const cr = await runProc(cc, ca, "", COMPILE_TIMEOUT_MS, SAFE_LOCAL_ENV);
          if (cr.code !== 0) {
            const errText = (cr.stderr || cr.stdout || "Compilation failed").trim();
            return res.json({
              success: false, output: `[Compile Error]\n${errText}`,
              time: elapsed(), exitCode: cr.code, version: language, isError: true,
            });
          }
        }

        const [rc, ra] = cfg.run(tmpDir);
        const rr = await runProc(rc, ra, stdin, EXEC_TIMEOUT_MS, SAFE_LOCAL_ENV);
        const isError = rr.code !== 0;
        let output = rr.stdout;
        if (rr.stderr) output += (output ? "\n[stderr]\n" : "") + rr.stderr;

        return res.json({
          success: !isError,
          output: output.trim() || "(no output)",
          time: elapsed(), exitCode: rr.code, version: language, isError,
        });
      } catch (localErr: any) {
        console.warn(`[code] local exec unavailable (${language}): ${localErr.message}`);
        // Fall through to Wandbox
      }
    }

    // ── Tier 2: Wandbox cloud execution ─────────────────────────────────────
    // Sandboxed by Wandbox: network=none, ephemeral FS, memory/CPU limits.
    try {
      const compiler = await getWandboxCompiler(language);
      const cloudCode = cfg.cloudPrepare ? cfg.cloudPrepare(code) : code;
      const wr = await wandboxRun(compiler, cloudCode, stdin);
      // Cap Wandbox output — program_output is a plain string in the JSON body
      // and can be megabytes if the program prints without bounds.
      const capCloud = (s: string) =>
        s.length > MAX_OUTPUT_BYTES
          ? s.slice(0, MAX_OUTPUT_BYTES) + "\n[Output truncated: exceeded 100 KB limit]"
          : s;

      const compErr = (wr.compiler_error ?? "").trim();
      const compOut = (wr.compiler_output ?? "").trim();
      const runOut  = capCloud((wr.program_output ?? "").trim());
      const runErr  = capCloud((wr.program_error  ?? "").trim());
      const exitCode = parseInt(wr.status ?? "0", 10);
      const ver = compiler;

      if (compErr && !runOut && exitCode !== 0) {
        return res.json({
          success: false,
          output: `[Compile Error]\n${compErr}${compOut ? "\n" + compOut : ""}`,
          time: elapsed(), exitCode, version: ver, isError: true,
        });
      }

      const isError = exitCode !== 0;
      let output = runOut;
      if (runErr) output += (output ? "\n[stderr]\n" : "") + runErr;
      if (!output && compOut) output = compOut;

      return res.json({
        success: !isError,
        output: output || "(no output)",
        time: elapsed(), exitCode, version: ver, isError,
      });
    } catch (cloudErr: any) {
      return res.json({
        success: false,
        output: [
          `❌ Cloud (Wandbox): ${cloudErr.message}`,
          ``,
          `Check the server's internet connection or try again in a moment.`,
        ].join("\n"),
        time: elapsed(), exitCode: 1, version: "", isError: true,
      });
    }
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best-effort */ }
  }
});

export default router;



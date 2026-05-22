import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  SiJavascript, SiTypescript, SiPython,
  SiCplusplus, SiC, SiGo, SiRust,
} from "react-icons/si";
import { FaJava } from "react-icons/fa";
import monaco from "../lib/monaco";
import { useSettings } from "../contexts/SettingsContext";
import PlaygroundNav from "../components/PlaygroundNav";

// ─── Types ───────────────────────────────────────────────────────────────────
type Language = "javascript" | "python" | "java" | "cpp" | "c" | "go" | "rust" | "typescript";
type Theme = "dark" | "light" | "dracula";
type AIMode = "explain" | "debug" | "optimize" | "complexity" | "hints" | "testgen" | "convert" | "comments";
type RightTab = "terminal" | "tests" | "ai";
type ExecPhase = "idle" | "compiling" | "running" | "done" | "error";

interface TestCase {
  id: string;
  label: string;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  status: "pending" | "running" | "pass" | "fail" | "error";
}

interface SavedProject {
  id: string;
  name: string;
  language: Language;
  code: string;
  stdin: string;
  savedAt: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const COMPILED_LANGS = new Set<Language>(["java", "c", "cpp", "rust"]);

const LANG_ICON_COLOR: Record<Language, string> = {
  javascript: "#F7DF1E", typescript: "#3178C6", python: "#3776AB",
  java: "#ED8B00", cpp: "#00599C", c: "#A8B9CC", go: "#00ADD8", rust: "#CE422B",
};

const LANG_ICON: Record<Language, React.ReactElement> = {
  javascript: <SiJavascript />, typescript: <SiTypescript />, python: <SiPython />,
  java: <FaJava />, cpp: <SiCplusplus />, c: <SiC />, go: <SiGo />, rust: <SiRust />,
};

const LANG_FILENAME: Record<Language, string> = {
  javascript: "solution.js", typescript: "solution.ts", python: "solution.py",
  java: "Main.java", cpp: "solution.cpp", c: "solution.c", go: "solution.go", rust: "solution.rs",
};

const LANGUAGES: { id: Language; name: string }[] = [
  { id: "javascript", name: "JavaScript" }, { id: "typescript", name: "TypeScript" },
  { id: "python",     name: "Python"     }, { id: "java",       name: "Java"       },
  { id: "cpp",        name: "C++"        }, { id: "c",          name: "C"          },
  { id: "go",         name: "Go"         }, { id: "rust",       name: "Rust"       },
];

const MONACO_LANG: Record<Language, string> = {
  javascript: "javascript", typescript: "typescript", python: "python",
  java: "java", cpp: "cpp", c: "c", go: "go", rust: "rust",
};

const DIFF_COLOR: Record<string, string> = { Easy: "#34D399", Medium: "#FBBF24", Hard: "#F87171" };

// ─── Starter code per language ────────────────────────────────────────────────
const SAMPLE_CODE: Record<Language, string> = {
  javascript: `// Two Sum — JavaScript
function twoSum(nums, target) {
  const map = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) return [map[complement], i];
    map[nums[i]] = i;
  }
  return [];
}
console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));  // [0,1]
console.log(JSON.stringify(twoSum([3, 2, 4], 6)));       // [1,2]`,

  typescript: `// Two Sum — TypeScript
function twoSum(nums: number[], target: number): number[] {
  const map: Record<number, number> = {};
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map[complement] !== undefined) return [map[complement], i];
    map[nums[i]] = i;
  }
  return [];
}
console.log(JSON.stringify(twoSum([2, 7, 11, 15], 9)));  // [0,1]
console.log(JSON.stringify(twoSum([3, 2, 4], 6)));       // [1,2]`,

  python: `# Two Sum — Python
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]
print(two_sum([3, 2, 4], 6))       # [1, 2]`,

  java: `// Two Sum — Java
import java.util.*;
public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement))
                return new int[]{map.get(complement), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2,7,11,15}, 9)));
        System.out.println(Arrays.toString(twoSum(new int[]{3,2,4}, 6)));
    }
}`,

  cpp: `// Two Sum — C++
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;
vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int,int> m;
    for (int i = 0; i < (int)nums.size(); i++) {
        int c = target - nums[i];
        if (m.count(c)) return {m[c], i};
        m[nums[i]] = i;
    }
    return {};
}
int main() {
    vector<int> n = {2,7,11,15};
    auto r = twoSum(n, 9);
    cout << "[" << r[0] << "," << r[1] << "]" << endl;
}`,

  c: `// Two Sum — C
#include <stdio.h>
#include <stdlib.h>
int* twoSum(int* nums, int n, int target, int* sz) {
    for (int i = 0; i < n; i++)
        for (int j = i+1; j < n; j++)
            if (nums[i]+nums[j]==target) {
                int* r = malloc(2*sizeof(int));
                r[0]=i; r[1]=j; *sz=2; return r;
            }
    *sz=0; return NULL;
}
int main() {
    int nums[]={2,7,11,15}; int sz;
    int* r=twoSum(nums,4,9,&sz);
    printf("[%d,%d]\\n",r[0],r[1]); free(r);
}`,

  go: `// Two Sum — Go
package main
import "fmt"
func twoSum(nums []int, target int) []int {
    seen := make(map[int]int)
    for i, num := range nums {
        if j, ok := seen[target-num]; ok { return []int{j, i} }
        seen[num] = i
    }
    return nil
}
func main() {
    fmt.Println(twoSum([]int{2,7,11,15}, 9))
    fmt.Println(twoSum([]int{3,2,4}, 6))
}`,

  rust: `// Two Sum — Rust
use std::collections::HashMap;
fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut map: HashMap<i32, usize> = HashMap::new();
    for (i, &n) in nums.iter().enumerate() {
        if let Some(&j) = map.get(&(target - n)) { return vec![j as i32, i as i32]; }
        map.insert(n, i);
    }
    vec![]
}
fn main() {
    println!("{:?}", two_sum(vec![2,7,11,15], 9));
    println!("{:?}", two_sum(vec![3,2,4], 6));
}`,
};

// ─── Default test cases ────────────────────────────────────────────────────────
function makeTests(lang: Language): TestCase[] {
  const jsOut  = (s: string) => s;
  const pyOut  = (s: string) => s.replace(/,/g, ", ");
  const javaOut= (s: string) => s.replace(/,/g, ", ");
  const fmt    = lang === "python" ? pyOut : lang === "java" ? javaOut : jsOut;
  return [
    { id: "1", label: "Test 1 — Basic",    input: "", expectedOutput: fmt("[0,1]"), actualOutput: "", status: "pending" },
    { id: "2", label: "Test 2 — Indices",  input: "", expectedOutput: fmt("[1,2]"), actualOutput: "", status: "pending" },
    { id: "3", label: "Test 3 — Edge",     input: "", expectedOutput: "[]",         actualOutput: "", status: "pending" },
  ];
}

// ─── Backend execution ─────────────────────────────────────────────────────────
async function executeCode(
  lang: Language,
  code: string,
  stdin: string,
): Promise<{ output: string; time: string; exitCode: number; version: string; isError: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/code/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: lang, code, stdin }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    return { output: d.output ?? "(no output)", time: d.time ?? "—", exitCode: d.exitCode ?? 0, version: d.version ?? "", isError: d.isError ?? false };
  } catch (e: any) {
    return { output: `Connection error: ${e.message}\n\nMake sure the backend is running on ${API_BASE}`, time: "—", exitCode: 1, version: "", isError: true };
  }
}

// ─── AI heuristic analysis ─────────────────────────────────────────────────────
function analyzeCode(code: string, lang: Language, mode: AIMode, lastOutput: string): string[] {
  const lines = code.split("\n");
  const results: string[] = [];

  if (mode === "explain") {
    results.push(`📄 Language: ${lang.toUpperCase()}`);
    results.push(`📏 Lines: ${lines.filter(l => l.trim()).length} (non-empty)`);
    const funcs = code.match(/function\s+\w+|def\s+\w+|fn\s+\w+|func\s+\w+/g);
    if (funcs?.length) results.push(`🔧 Functions: ${[...new Set(funcs)].join(", ")}`);
    const loops = (code.match(/\bfor\b|\bwhile\b/g) || []).length;
    if (loops) results.push(`🔁 Loops: ${loops} found`);
    if (code.includes("class ")) results.push(`🏛️ OOP: class definition detected`);
    if (code.includes("async") || code.includes("await")) results.push(`⚡ Async code detected`);
    const imports = code.match(/^import\s+.+|^from\s+\w+\s+import|#include\s+|^use\s+/gm);
    if (imports?.length) results.push(`📦 ${imports.length} import(s) found`);
    results.push(`✅ Code appears syntactically complete.`);
  }

  if (mode === "debug") {
    if (lastOutput.toLowerCase().includes("error") || lastOutput.toLowerCase().includes("exception")) {
      const errLines = lastOutput.split("\n").filter(l => l.toLowerCase().includes("error") || l.toLowerCase().includes("exception") || l.includes("line "));
      results.push("🔴 Errors in last execution:");
      errLines.slice(0, 6).forEach(l => results.push(`   ${l.trim()}`));
    }
    if ((code.match(/{/g)?.length||0) !== (code.match(/}/g)?.length||0)) results.push("⚠️ Mismatched braces { }");
    if ((code.match(/\(/g)?.length||0) !== (code.match(/\)/g)?.length||0)) results.push("⚠️ Mismatched parentheses ( )");
    if (code.includes("var ") && (lang==="javascript"||lang==="typescript")) results.push("🐛 Using var — prefer let/const");
    if (code.includes("==") && !code.includes("===") && (lang==="javascript"||lang==="typescript")) results.push("🐛 Loose == found — use ===");
    if (lang==="python" && code.includes("\t") && code.includes("    ")) results.push("🐛 Mixed tabs/spaces — will cause IndentationError");
    if (!results.length) results.push("✅ No obvious bugs detected.");
  }

  if (mode === "optimize") {
    const nested = (code.match(/for\b/g)?.length||0);
    if (nested>=2) results.push("🔴 O(n²)+: nested loops — consider hash map or two-pointer");
    if (code.includes("splice")||code.includes(".shift()")) results.push("⚠️ shift/splice is O(n) — use index pointer");
    if (code.match(/fibonacci|fib/i) && !code.includes("memo") && !code.includes("dp")) results.push("💡 Recursive fib without memo is O(2ⁿ) — add memoization");
    if ((code.match(/\.indexOf\b/g)?.length||0)>1) results.push("💡 Multiple indexOf — use Set or Map for O(1)");
    if (!results.length) results.push("✅ No major performance issues found.");
  }

  if (mode === "complexity") {
    const hasBinary = code.includes("mid")&&code.includes("low")&&code.includes("high");
    const nested3 = code.match(/for[\s\S]{1,80}for[\s\S]{1,80}for\b/);
    const nested2 = code.match(/for[\s\S]{1,80}for\b/);
    let time = "O(n)";
    if (nested3) time="O(n³)"; else if (nested2) time="O(n²)"; else if (hasBinary) time="O(log n)";
    else if (!code.includes("for")&&!code.includes("while")) time="O(1)";
    results.push(`⏱ Time Complexity: ${time}`);
    const usesMap=code.includes("Map(")||code.includes("{}")||code.includes("HashMap")||code.includes("dict(");
    results.push(`💾 Space Complexity: ${usesMap ? "O(n)" : "O(1)"}`);
    results.push("─────────────────────");
    results.push("O(1) hash lookup · O(log n) binary search");
    results.push("O(n) linear · O(n log n) sort · O(n²) nested loops");
  }

  if (mode === "hints") {
    results.push("💼 Interview tips:");
    if (code.includes("sort")||code.includes("sorted")) results.push("→ You're sorting — ask: can you avoid sorting? (hash map = O(n))");
    if ((code.match(/for\b/g)?.length||0)>=2) results.push("→ Nested loops: state the O(n²) complexity proactively");
    results.push("→ Mention edge cases: empty, null, overflow, duplicates");
    results.push("→ Talk through approach BEFORE coding");
    results.push("→ Framework: Clarify → Brute force → Optimize → Code → Test");
    results.push("→ Common patterns: Two Pointers, Sliding Window, HashMap, BFS/DFS, DP");
    results.push("→ Always mention time AND space complexity");
  }

  if (mode === "testgen") {
    results.push("🧪 Suggested test cases:");
    results.push("─────────────────────");
    results.push("▶ Happy path: typical valid input");
    results.push("▶ Empty array / empty string");
    results.push("▶ Single element");
    results.push("▶ All elements identical");
    results.push("▶ Large n (stress test)");
    results.push("▶ Negative numbers");
    results.push("▶ Already / reverse sorted");
    results.push("▶ No valid solution exists");
    if (lang==="java"||lang==="c"||lang==="cpp") results.push("▶ Integer overflow: INT_MAX / INT_MIN");
    results.push("─────────────────────");
    results.push("💡 Use the Tests tab to run these automatically.");
  }

  if (mode === "convert") {
    results.push("🔄 Language Conversion Guide:");
    results.push("─────────────────────");
    results.push(`Current: ${lang.toUpperCase()}`);
    results.push("Select a different language tab — the editor loads a template.");
    results.push("Port your logic using these equivalents:");
    results.push("");
    if (lang==="javascript"||lang==="typescript") {
      results.push("Map{} → Python dict / Java HashMap / Rust HashMap");
      results.push("console.log() → print() / System.out.println() / println!()");
      results.push("array.length → len() / .length / .size() / .len()");
    } else if (lang==="python") {
      results.push("dict{} → JS {} / Java HashMap / Rust HashMap");
      results.push("enumerate() → for(int i=0;…) with index");
      results.push("list comprehension → map/filter (JS) / stream (Java)");
    }
    results.push("");
    results.push("✅ All 8 languages are fully supported.");
  }

  if (mode === "comments") {
    const cs = lang==="python" ? "#" : "//";
    results.push("💬 Suggested comment additions:");
    results.push("─────────────────────");
    const fns = code.match(/function\s+(\w+)|def\s+(\w+)|fn\s+(\w+)|func\s+(\w+)/g)||[];
    fns.forEach(f => {
      const name = f.replace(/^(function|def|fn|func)\s+/,"");
      results.push(`Above ${name}():`);
      results.push(`  ${cs} @param  — describe inputs`);
      results.push(`  ${cs} @returns — describe return value`);
      results.push(`  ${cs} @complexity — Time: O(?), Space: O(?)`);
    });
    if (code.includes("Map(")||code.includes("{}")||code.includes("HashMap")||code.includes("dict("))
      results.push(`${cs} Hash map: key=value, val=index — O(1) lookup`);
    results.push("─────────────────────");
    results.push("💡 Well-commented code impresses interviewers.");
  }

  return results;
}

// ─── Timer helper ──────────────────────────────────────────────────────────────
function fmtTimer(sec: number) {
  return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
}

// ─── Shortcuts Modal ───────────────────────────────────────────────────────────
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const items = [
    { key: "Ctrl + Enter",  action: "Run code"              },
    { key: "Ctrl + S",      action: "Save project"          },
    { key: "Ctrl + /",      action: "Toggle shortcuts panel"},
    { key: "Ctrl + K",      action: "Clear terminal"        },
    { key: "F11",           action: "Toggle fullscreen"     },
    { key: "Esc",           action: "Exit fullscreen"       },
  ];
  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 shadow-2xl w-80 max-w-[90vw]"
        style={{ backgroundColor: "#16161F", border: "1px solid rgba(99,102,241,0.25)" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-sm text-white">⌨ Keyboard Shortcuts</h2>
          <button onClick={onClose} className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.3)" }}
            onMouseEnter={e => e.currentTarget.style.color="#fff"}
            onMouseLeave={e => e.currentTarget.style.color="rgba(255,255,255,0.3)"}>✕</button>
        </div>
        <div className="space-y-2">
          {items.map(s => (
            <div key={s.key} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{s.action}</span>
              <kbd className="text-[11px] px-2 py-0.5 rounded-md font-mono"
                style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)" }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Share Toast ───────────────────────────────────────────────────────────────
function ShareToast({ link, onClose }: { link: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => { navigator.clipboard.writeText(link); setCopied(true); setTimeout(onClose, 1500); };
  return (
    <div className="fixed bottom-6 left-1/2 z-998 rounded-xl px-4 py-3 shadow-2xl"
      style={{ transform: "translateX(-50%)", backgroundColor: "#1C1C2A", border: "1px solid rgba(99,102,241,0.3)", minWidth: "320px" }}>
      <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Shareable link (code encoded in URL):</div>
      <div className="flex gap-2">
        <input readOnly value={link} className="flex-1 text-[11px] font-mono bg-transparent focus:outline-none"
          style={{ color: "#818CF8" }} onClick={e => (e.target as HTMLInputElement).select()} />
        <button onClick={doCopy} className="text-xs px-3 py-1 rounded-lg font-medium transition-all"
          style={{ background: copied ? "rgba(52,211,153,0.15)" : "rgba(99,102,241,0.2)", color: copied ? "#34D399" : "#818CF8", border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(99,102,241,0.3)"}` }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <button onClick={onClose} className="text-xs px-2 py-1 rounded-lg" style={{ color: "rgba(255,255,255,0.3)" }}>✕</button>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Coding() {
  useNavigate(); // keep for potential future use
  const { settings } = useSettings();

  // ── Refs ──────────────────────────────────────────────────────────────────
  const editorRef      = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const rootRef        = useRef<HTMLDivElement>(null);
  const terminalRef    = useRef<HTMLDivElement>(null);
  const mainRef        = useRef<HTMLDivElement>(null);
  const dragging       = useRef(false);
  const autoSaveTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerInterval  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Core ──────────────────────────────────────────────────────────────────
  const [language,    setLanguage]    = useState<Language>("javascript");
  const [theme,       setTheme]       = useState<Theme>(() => (localStorage.getItem("pg-theme") as Theme) || "dracula");
  const [output,      setOutput]      = useState("");
  const [loading,     setLoading]     = useState(false);
  const [execPhase,   setExecPhase]   = useState<ExecPhase>("idle");
  const [execTime,    setExecTime]    = useState<string | null>(null);
  const [exitCode,    setExitCode]    = useState<number | null>(null);
  const [rtVersion,   setRtVersion]   = useState("");
  const [isError,     setIsError]     = useState(false);
  const [stdin,       setStdin]       = useState("");

  // ── Editor options ─────────────────────────────────────────────────────────
  const [fontSize,  setFontSize]  = useState(() => Number(localStorage.getItem("pg-fontSize") || 14));
  const [minimap,   setMinimap]   = useState(() => localStorage.getItem("pg-minimap") !== "false");
  const [wordWrap,  setWordWrap]  = useState(() => localStorage.getItem("pg-wordWrap") !== "false");
  const [tabSize,   setTabSize]   = useState(() => Number(localStorage.getItem("pg-tabSize") || 2));
  const [lineNumbers, setLineNumbers] = useState(() => localStorage.getItem("pg-lineNumbers") !== "false");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(() => localStorage.getItem("op-autoSave") !== "false");

  // ── Layout ─────────────────────────────────────────────────────────────────
  const [leftWidthPct,  setLeftWidthPct]  = useState(() => Number(localStorage.getItem("pg-leftPct") || 60));
  const [isFullscreen,  setIsFullscreen]  = useState(false);

  // ── Panel tabs ─────────────────────────────────────────────────────────────
  const [rightTab, setRightTab] = useState<RightTab>("terminal");

  // ── Copy ───────────────────────────────────────────────────────────────────
  const [copied,    setCopied]    = useState(false);
  const [copiedOut, setCopiedOut] = useState(false);

  // ── AI ─────────────────────────────────────────────────────────────────────
  const [aiMode,      setAiMode]      = useState<AIMode>("explain");
  const [aiResults,   setAiResults]   = useState<string[]>([]);
  const [aiRefreshing, setAiRefreshing] = useState(false);

  // ── Test cases ──────────────────────────────────────────────────────────────
  const [testCases,      setTestCases]      = useState<TestCase[]>(() => makeTests("javascript"));
  const [runningTests,   setRunningTests]   = useState(false);
  const [customInput,    setCustomInput]    = useState("");
  const [customExpected, setCustomExpected] = useState("");

  // ── Project ─────────────────────────────────────────────────────────────────
  const [projectName, setProjectName] = useState("Untitled Project");
  const [autoSaved,   setAutoSaved]   = useState(false);
  const [shareLink,   setShareLink]   = useState<string | null>(null);

  // ── Overlays ────────────────────────────────────────────────────────────────
  const [showShortcuts, setShowShortcuts] = useState(false);

  // ── Interview mode ──────────────────────────────────────────────────────────
  const [interviewMode, setInterviewMode] = useState(false);
  const [timerSec,      setTimerSec]      = useState(0);
  const [timerOn,       setTimerOn]       = useState(false);
  const [difficulty,    setDifficulty]    = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [company,       setCompany]       = useState("Google");

  // ── Load from URL hash ──────────────────────────────────────────────────────
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    try {
      const p = new URLSearchParams(hash);
      const lang = p.get("lang") as Language | null;
      const enc  = p.get("code");
      if (lang && enc && SAMPLE_CODE[lang]) {
        setLanguage(lang);
        setTimeout(() => editorRef.current?.setValue(decodeURIComponent(escape(atob(enc)))), 300);
      }
    } catch { /* ignore malformed hashes */ }
  }, []);

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // ── Editor option sync ──────────────────────────────────────────────────────
  useEffect(() => { editorRef.current?.updateOptions({ fontSize }); localStorage.setItem("pg-fontSize", String(fontSize)); }, [fontSize]);
  useEffect(() => { editorRef.current?.updateOptions({ minimap: { enabled: minimap } }); localStorage.setItem("pg-minimap", String(minimap)); }, [minimap]);
  useEffect(() => { editorRef.current?.updateOptions({ wordWrap: wordWrap ? "on" : "off" }); localStorage.setItem("pg-wordWrap", String(wordWrap)); }, [wordWrap]);
  useEffect(() => { editorRef.current?.updateOptions({ tabSize }); localStorage.setItem("pg-tabSize", String(tabSize)); }, [tabSize]);
  useEffect(() => { editorRef.current?.updateOptions({ lineNumbers: lineNumbers ? "on" : "off" }); localStorage.setItem("pg-lineNumbers", String(lineNumbers)); }, [lineNumbers]);
  useEffect(() => { localStorage.setItem("op-autoSave", String(autoSaveEnabled)); }, [autoSaveEnabled]);

  const editorThemeFromSettings = (id: string): Theme => {
    const map: Record<string, Theme> = { dracula: "dracula", dark: "dark", light: "light", vsdark: "dark", vscode: "dark" };
    return map[id.toLowerCase()] || "dracula";
  };

  useEffect(() => {
    setFontSize(settings.fontSize);
    setMinimap(settings.minimap);
    setWordWrap(settings.wordWrap);
    setTabSize(settings.tabSize);
    setLineNumbers(settings.lineNumbers);
    setAutoSaveEnabled(settings.autoSave);
    setTheme(editorThemeFromSettings(settings.editorTheme));
  }, [
    settings.fontSize,
    settings.minimap,
    settings.wordWrap,
    settings.tabSize,
    settings.lineNumbers,
    settings.autoSave,
    settings.editorTheme,
  ]);

  useEffect(() => {
    const onSettingsChange = () => {
      setFontSize(Number(localStorage.getItem("pg-fontSize") || settings.fontSize));
      setMinimap(localStorage.getItem("pg-minimap") !== "false");
      setWordWrap(localStorage.getItem("pg-wordWrap") !== "false");
      setTabSize(Number(localStorage.getItem("pg-tabSize") || settings.tabSize));
      setLineNumbers(localStorage.getItem("pg-lineNumbers") !== "false");
      setAutoSaveEnabled(localStorage.getItem("op-autoSave") !== "false");
      const pgTheme = localStorage.getItem("pg-theme") || settings.editorTheme;
      setTheme(editorThemeFromSettings(pgTheme));
    };
    window.addEventListener("op-settings-change", onSettingsChange);
    return () => window.removeEventListener("op-settings-change", onSettingsChange);
  }, [settings.fontSize, settings.minimap, settings.wordWrap, settings.tabSize, settings.lineNumbers, settings.autoSave, settings.editorTheme]);

  // ── Monaco init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    monaco.editor.defineTheme("dracula", {
      base: "vs-dark", inherit: true,
      rules: [
        { token: "comment",  foreground: "6272a4" },
        { token: "string",   foreground: "f1fa8c" },
        { token: "keyword",  foreground: "ff79c6" },
        { token: "number",   foreground: "bd93f9" },
        { token: "type",     foreground: "8be9fd" },
        { token: "function", foreground: "50fa7b" },
      ],
      colors: {
        "editor.background":              "#0D0D14",
        "editor.lineHighlightBackground": "#ffffff09",
        "editorCursor.foreground":        "#ff79c6",
        "editor.selectionBackground":     "#6272a450",
        "editorLineNumber.foreground":    "#6272a470",
        "editorGutter.background":        "#0D0D14",
      },
    });

    editorRef.current = monaco.editor.create(containerRef.current, {
      value:                    SAMPLE_CODE.javascript,
      language:                 "javascript",
      theme:                    "dracula",
      fontSize:                 fontSize,
      minimap:                  { enabled: minimap },
      automaticLayout:          true,
      lineNumbers:              lineNumbers ? "on" : "off",
      renderLineHighlight:      "all",
      scrollBeyondLastLine:     false,
      fontFamily:               "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      fontLigatures:            true,
      bracketPairColorization:  { enabled: true },
      cursorBlinking:           "phase",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling:          true,
      wordWrap:                 wordWrap ? "on" : "off",
      tabSize:                  tabSize,
      formatOnPaste:            true,
    });

    editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => document.getElementById("run-btn")?.click());
    editorRef.current.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,  () => document.getElementById("save-btn")?.click());

    return () => editorRef.current?.dispose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Language change ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!editorRef.current) return;
    const m = editorRef.current.getModel();
    if (m) monaco.editor.setModelLanguage(m, MONACO_LANG[language]);
    editorRef.current.setValue(SAMPLE_CODE[language]);
    setOutput(""); setExecTime(null); setExitCode(null); setRtVersion("");
    setIsError(false); setExecPhase("idle"); setAiResults([]);
    setTestCases(makeTests(language)); setShareLink(null);
  }, [language]);

  // ── Theme change ────────────────────────────────────────────────────────────
  useEffect(() => {
    monaco.editor.setTheme(theme === "dark" ? "vs-dark" : theme === "light" ? "vs" : "dracula");
    localStorage.setItem("pg-theme", theme);
  }, [theme]);

  // ── Interview timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (timerOn) timerInterval.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    else if (timerInterval.current) clearInterval(timerInterval.current);
    return () => { if (timerInterval.current) clearInterval(timerInterval.current); };
  }, [timerOn]);

  // ── Global keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey||e.metaKey) && e.key==="/") { e.preventDefault(); setShowShortcuts(s=>!s); }
      if ((e.ctrlKey||e.metaKey) && e.key==="k")  { e.preventDefault(); setOutput(""); setExecTime(null); setExitCode(null); setIsError(false); setExecPhase("idle"); }
      if (e.key==="F11") { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [toggleFullscreen]);

  // ── Resizable divider ───────────────────────────────────────────────────────
  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const move = (ev: MouseEvent) => {
      if (!dragging.current || !mainRef.current) return;
      const rect = mainRef.current.getBoundingClientRect();
      const pct  = ((ev.clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(Math.max(pct, 28), 78);
      setLeftWidthPct(clamped);
      localStorage.setItem("pg-leftPct", String(clamped));
    };
    const up = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  }, []);

  // ── Auto-save ────────────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaved(false);
    autoSaveTimer.current = setTimeout(() => {
      const code = editorRef.current?.getValue() ?? "";
      try {
        localStorage.setItem("pg-autosave", JSON.stringify({ name: projectName, language, code, stdin, savedAt: Date.now() }));
        setAutoSaved(true);
        setTimeout(() => setAutoSaved(false), 2500);
      } catch { /* storage full */ }
    }, 2000);
  }, [projectName, language, stdin]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const disposable = editor.onDidChangeModelContent(() => {
      if (autoSaveEnabled) triggerAutoSave();
    });

    return () => disposable.dispose();
  }, [autoSaveEnabled, triggerAutoSave]);

  // ── Manual save ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const code = editorRef.current?.getValue() ?? "";
    try {
      const existing: SavedProject[] = JSON.parse(localStorage.getItem("pg-projects") ?? "[]");
      const idx = existing.findIndex(p => p.name === projectName);
      const proj: SavedProject = { id: `proj-${Date.now()}`, name: projectName, language, code, stdin, savedAt: Date.now() };
      if (idx >= 0) existing[idx] = proj; else existing.unshift(proj);
      localStorage.setItem("pg-projects", JSON.stringify(existing.slice(0, 10)));
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2500);
    } catch { /* storage full */ }
  }, [projectName, language, stdin]);

  // ── Share link ──────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    const code = editorRef.current?.getValue() ?? "";
    try {
      const enc = btoa(unescape(encodeURIComponent(code)));
      setShareLink(`${window.location.origin}/coding#lang=${language}&code=${enc}`);
    } catch { setShareLink(window.location.href); }
  }, [language]);

  // ── AI refresh ──────────────────────────────────────────────────────────────
  const handleAiRefresh = useCallback(() => {
    if (aiRefreshing) return;
    setAiRefreshing(true);
    setAiResults([]);
    requestAnimationFrame(() => {
      setAiResults(analyzeCode(editorRef.current?.getValue() ?? "", language, aiMode, output));
      setAiRefreshing(false);
    });
  }, [aiRefreshing, language, aiMode, output]);

  // ── Run code ─────────────────────────────────────────────────────────────────
  const runCode = useCallback(async () => {
    const code = editorRef.current?.getValue() ?? "";
    if (!code.trim()) return;
    setLoading(true); setOutput(""); setExecTime(null); setExitCode(null); setIsError(false);

    if (COMPILED_LANGS.has(language)) {
      setExecPhase("compiling");
      await new Promise(r => setTimeout(r, 380));
    }
    setExecPhase("running");

    const result = await executeCode(language, code, stdin);
    setOutput(result.output); setExecTime(result.time); setExitCode(result.exitCode);
    setRtVersion(result.version); setIsError(result.isError);
    setLoading(false); setExecPhase(result.isError ? "error" : "done");
    setRightTab("terminal");

    setTimeout(() => { if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight; }, 60);
    triggerAutoSave();
  }, [language, stdin, triggerAutoSave]);

  // ── Run all test cases ──────────────────────────────────────────────────────
  const runAllTests = useCallback(async () => {
    const code = editorRef.current?.getValue() ?? "";
    if (!code.trim() || runningTests) return;
    setRunningTests(true);
    const updated = testCases.map(tc => ({ ...tc, status: "running" as const, actualOutput: "" }));
    setTestCases(updated);

    for (let i = 0; i < updated.length; i++) {
      const result = await executeCode(language, code, updated[i].input);
      const actual   = result.output.trim();
      const expected = updated[i].expectedOutput.trim();
      const pass     = actual === expected || actual.replace(/\s+/g,"") === expected.replace(/\s+/g,"");
      updated[i] = { ...updated[i], actualOutput: actual, status: result.isError ? "error" : pass ? "pass" : "fail" };
      setTestCases([...updated]);
    }
    setRunningTests(false);
  }, [testCases, language, runningTests]);

  // ── Add custom test ─────────────────────────────────────────────────────────
  const addCustomTest = useCallback(() => {
    if (!customInput && !customExpected) return;
    const tc: TestCase = {
      id: `c-${Date.now()}`,
      label: `Custom ${testCases.filter(t=>t.id.startsWith("c-")).length + 1}`,
      input: customInput, expectedOutput: customExpected, actualOutput: "", status: "pending",
    };
    setTestCases(prev => [...prev, tc]);
    setCustomInput(""); setCustomExpected("");
  }, [customInput, customExpected, testCases]);

  // ── Copy ─────────────────────────────────────────────────────────────────────
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(editorRef.current?.getValue() ?? "").then(() => { setCopied(true); setTimeout(()=>setCopied(false),2000); });
  }, []);
  const copyOutput = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => { setCopiedOut(true); setTimeout(()=>setCopiedOut(false),2000); });
  }, [output]);
  const downloadLogs = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${LANG_FILENAME[language]}.log`;
    a.click(); URL.revokeObjectURL(url);
  }, [output, language]);
  const resetCode = useCallback(() => {
    editorRef.current?.setValue(SAMPLE_CODE[language]);
    setOutput(""); setExecTime(null); setExitCode(null); setIsError(false);
    setExecPhase("idle"); setAiResults([]); setTestCases(makeTests(language));
  }, [language]);

  // ── Terminal colorizer ──────────────────────────────────────────────────────
  const renderLines = () =>
    output.split("\n").map((line, i) => {
      const lo = line.toLowerCase();
      let c = "rgba(230,230,255,0.82)";
      if (lo.startsWith("[compile"))              c = "#F87171";
      else if (lo.includes("error")||lo.includes("exception")||lo.includes("panic")) c = "#F87171";
      else if (lo.includes("[output truncated]")||lo.includes("tle:"))               c = "#FBBF24";
      else if (lo.includes("[stderr]")||lo.includes("warning"))                     c = "#FBBF24";
      else if (line.trim()==="true"||line.trim()==="false")                         c = "#A78BFA";
      else if (!isNaN(Number(line.trim()))&&line.trim()!=="")                       c = "#818CF8";
      return <div key={i} style={{ color: c, lineHeight: "1.65", minHeight: "1.65em" }}>{line||" "}</div>;
    });

  // ── Execution phase indicator ─────────────────────────────────────────────────
  const steps = COMPILED_LANGS.has(language)
    ? [{ label: "Compiling", phase: "compiling" }, { label: "Running", phase: "running" }]
    : [{ label: "Running", phase: "running" }];

  // ── Derived ─────────────────────────────────────────────────────────────────
  const testsPassed = testCases.filter(t=>t.status==="pass").length;
  const testsFailed = testCases.filter(t=>t.status==="fail"||t.status==="error").length;
  const testsBadge  = testCases.some(t=>t.status!=="pending")
    ? testsFailed > 0 ? `${testsFailed} fail` : `${testsPassed}/${testCases.length} ✓`
    : null;

  const editorH = isFullscreen ? "calc(100vh - 190px)" : "clamp(260px, calc(100vh - 400px), 540px)";
  const btn = "px-3 py-1.5 rounded-xl text-xs font-medium transition-all border select-none";

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div ref={rootRef} className="flex flex-col" style={{ height: "100vh", backgroundColor: "#0D0D14", overflow: "hidden" }}>

      {/* ── NAV ───────────────────────────────────────────────────────────── */}
      {!isFullscreen && (
        <PlaygroundNav
          projectName={projectName}
          onProjectNameChange={setProjectName}
          autoSaved={autoSaved}
          onSave={handleSave}
          onShare={handleShare}
          onShowShortcuts={() => setShowShortcuts(true)}
          shareLink={shareLink}
        />
      )}

      {/* ── TOOLBAR ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", backgroundColor: "#0E0E16", flexShrink: 0 }}>
        {/* Language pills */}
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map(l => {
            const active = language === l.id;
            return (
              <button key={l.id} onClick={() => setLanguage(l.id)} className={btn}
                style={active
                  ? { background: `${LANG_ICON_COLOR[l.id]}18`, borderColor: `${LANG_ICON_COLOR[l.id]}70`, color: LANG_ICON_COLOR[l.id], boxShadow: `0 0 8px ${LANG_ICON_COLOR[l.id]}22` }
                  : { backgroundColor: "transparent", borderColor: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)" }}>
                <span style={{ color: active ? LANG_ICON_COLOR[l.id] : "rgba(255,255,255,0.3)", display: "inline-flex", alignItems: "center", marginRight: 4, fontSize: 12 }}>
                  {LANG_ICON[l.id]}
                </span>
                {l.name}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {/* Font size */}
          <div className="flex items-center" style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: "10px", overflow: "hidden" }}>
            <button onClick={()=>setFontSize(f=>Math.max(10,f-1))} className="px-2 py-1.5 text-xs transition-colors" style={{ color:"rgba(255,255,255,0.4)",background:"transparent" }}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}>A−</button>
            <span className="text-xs px-2 font-mono tabular-nums" style={{ color:"rgba(255,255,255,0.3)", borderLeft:"1px solid rgba(255,255,255,0.07)", borderRight:"1px solid rgba(255,255,255,0.07)" }}>{fontSize}</span>
            <button onClick={()=>setFontSize(f=>Math.min(24,f+1))} className="px-2 py-1.5 text-xs transition-colors" style={{ color:"rgba(255,255,255,0.4)",background:"transparent" }}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.4)"}>A+</button>
          </div>

          {/* Minimap */}
          <button onClick={()=>setMinimap(m=>!m)} className={btn} title="Toggle minimap"
            style={minimap ? { background:"rgba(99,102,241,0.1)",borderColor:"rgba(99,102,241,0.3)",color:"#818CF8" } : { backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)" }}>
            ▦ Map
          </button>

          {/* Word wrap */}
          <button onClick={()=>setWordWrap(w=>!w)} className={btn} title="Toggle word wrap"
            style={wordWrap ? { background:"rgba(99,102,241,0.1)",borderColor:"rgba(99,102,241,0.3)",color:"#818CF8" } : { backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)" }}>
            ↩ Wrap
          </button>

          {/* Theme */}
          {(["dracula","dark","light"] as Theme[]).map(t => (
            <button key={t} onClick={()=>setTheme(t)} className={btn}
              style={theme===t ? { background:"rgba(99,102,241,0.12)",borderColor:"rgba(99,102,241,0.35)",color:"#818CF8" } : { backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)" }}>
              {t==="dark" ? "🌑" : t==="light" ? "☀️" : "🧛"}
            </button>
          ))}

          {/* Interview */}
          <button onClick={()=>setInterviewMode(m=>!m)} className={btn}
            style={interviewMode ? { background:"rgba(251,191,36,0.12)",borderColor:"rgba(251,191,36,0.4)",color:"#FBBF24" } : { backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.35)" }}>
            🎯 Interview
          </button>

          {/* Copy */}
          <button onClick={copyCode} className={btn}
            style={{ backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color: copied?"#10B981":"rgba(255,255,255,0.4)" }}>
            {copied ? "✓ Copied" : "⎘ Copy"}
          </button>

          {/* Fullscreen */}
          <button onClick={toggleFullscreen} className={btn} title="Fullscreen (F11)"
            style={{ backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.4)" }}>
            {isFullscreen ? "⊡" : "⛶"}
          </button>

          {/* Run */}
          <button id="run-btn" onClick={runCode} disabled={loading}
            className="px-4 py-1.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow:"0 4px 14px rgba(99,102,241,0.3)" }}>
            {loading ? <><span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Running…</> : "▶  Run"}
          </button>

          {/* Reset */}
          <button onClick={resetCode} className={btn}
            style={{ backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.35)" }}>
            ↺ Reset
          </button>

          {/* Hidden save trigger */}
          <button id="save-btn" onClick={handleSave} style={{ display:"none" }} />
        </div>
      </div>

      {/* ── INTERVIEW PANEL ───────────────────────────────────────────────── */}
      {interviewMode && (
        <div className="flex flex-wrap items-center gap-4 px-4 py-2"
          style={{ backgroundColor:"rgba(251,191,36,0.03)", borderBottom:"1px solid rgba(251,191,36,0.12)", flexShrink:0 }}>
          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest mr-1" style={{ color:"rgba(255,255,255,0.2)" }}>Difficulty</span>
            {(["Easy","Medium","Hard"] as const).map(d => (
              <button key={d} onClick={()=>setDifficulty(d)} className="px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all"
                style={difficulty===d ? { backgroundColor:DIFF_COLOR[d]+"20",color:DIFF_COLOR[d],border:`1px solid ${DIFF_COLOR[d]}50` } : { backgroundColor:"transparent",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.08)" }}>
                {d}
              </button>
            ))}
          </div>
          {/* Company */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest mr-1" style={{ color:"rgba(255,255,255,0.2)" }}>Company</span>
            {["Google","Meta","Amazon","Apple","Netflix","Microsoft"].map(c => (
              <button key={c} onClick={()=>setCompany(c)} className="px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all"
                style={company===c ? { background:"rgba(99,102,241,0.18)",color:"#818CF8",border:"1px solid rgba(99,102,241,0.4)" } : { backgroundColor:"transparent",color:"rgba(255,255,255,0.22)",border:"1px solid rgba(255,255,255,0.06)" }}>
                {c}
              </button>
            ))}
          </div>
          {/* Timer */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="font-mono text-sm font-bold tabular-nums"
              style={{ color: timerSec>2700?"#F87171":timerSec>1800?"#FBBF24":"#34D399" }}>
              ⏱ {fmtTimer(timerSec)}
            </span>
            <button onClick={()=>setTimerOn(t=>!t)} className={btn}
              style={timerOn ? { background:"rgba(248,113,113,0.12)",borderColor:"rgba(248,113,113,0.4)",color:"#F87171" } : { backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.08)",color:"#34D399" }}>
              {timerOn?"⏸ Pause":"▶ Start"}
            </button>
            <button onClick={()=>{setTimerSec(0);setTimerOn(false);}} className={btn}
              style={{ backgroundColor:"transparent",borderColor:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.3)" }}>↺</button>
          </div>
        </div>
      )}

      {/* ── MAIN RESIZABLE AREA ───────────────────────────────────────────── */}
      <div ref={mainRef} className="flex flex-1 min-h-0 px-3 pb-3 pt-2.5 gap-0">

        {/* ── LEFT: EDITOR ─────────────────────────────────────────────────── */}
        <div className="flex flex-col min-w-0 min-h-0 gap-2" style={{ width:`${leftWidthPct}%`, flexShrink:0 }}>

          {/* File tab */}
          <div className="flex items-center" style={{ backgroundColor:"#13131C", borderRadius:"10px 10px 0 0", border:"1px solid rgba(255,255,255,0.07)", borderBottom:"none" }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
              style={{ color:"#818CF8", borderRight:"1px solid rgba(255,255,255,0.07)", borderBottom:"2px solid #6366F1", marginBottom:"-1px" }}>
              <span style={{ fontSize:11 }}>{LANG_ICON[language]}</span>
              {LANG_FILENAME[language]}
            </div>
            <span className="ml-auto mr-3 text-[10px]" style={{ color:"rgba(255,255,255,0.1)" }}>Ctrl+Enter to run</span>
          </div>

          {/* Monaco */}
          <div className="overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.07)", borderTop:"none", borderRadius:"0 0 10px 10px", boxShadow:"0 8px 32px rgba(0,0,0,0.35)" }}>
            <div ref={containerRef} style={{ height: editorH }} />
          </div>

          {/* Stdin */}
          <div className="rounded-xl px-3.5 py-2.5" style={{ backgroundColor:"#13131C", border:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.22)" }}>stdin / Custom Input</label>
              <span className="text-[10px]" style={{ color:"rgba(255,255,255,0.1)" }}>Multi-line ok</span>
            </div>
            <textarea value={stdin} onChange={e=>{setStdin(e.target.value);triggerAutoSave();}} rows={3}
              className="w-full bg-transparent text-[13px] focus:outline-none font-mono resize-y"
              style={{ color:"rgba(255,255,255,0.6)", minHeight:"48px", maxHeight:"140px" }}
              placeholder={"5\n1 2 3 4 5"} />
          </div>
        </div>

        {/* ── DRAG DIVIDER ──────────────────────────────────────────────────── */}
        <div onMouseDown={onDividerMouseDown}
          className="flex items-center justify-center shrink-0 cursor-col-resize group mx-1"
          style={{ width:"12px" }}>
          <div className="h-16 w-0.5 rounded-full group-hover:h-24 transition-all duration-150"
            style={{ backgroundColor:"rgba(99,102,241,0.2)" }}
            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.backgroundColor="rgba(99,102,241,0.6)"}
            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.backgroundColor="rgba(99,102,241,0.2)"} />
        </div>

        {/* ── RIGHT: TABBED PANEL ───────────────────────────────────────────── */}
        <div className="flex flex-col rounded-xl font-mono text-sm overflow-hidden"
          style={{ flex:1, minWidth:0, backgroundColor:"#0A0A12", border:"1px solid rgba(255,255,255,0.08)", boxShadow:"inset 0 0 40px rgba(99,102,241,0.03)" }}>

          {/* Tab bar */}
          <div className="flex items-center shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", backgroundColor:"#0E0E16" }}>
            {/* Tabs */}
            {([
              { id:"terminal" as RightTab, label:"Terminal",     icon:"⬛"  },
              { id:"tests"    as RightTab, label:"Tests",        icon:"🧪", badge: testsBadge, badgeRed: testsFailed > 0 },
              { id:"ai"       as RightTab, label:"AI Assistant", icon:"🤖"  },
            ]).map(tab => (
              <button key={tab.id} onClick={()=>setRightTab(tab.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all"
                style={rightTab===tab.id ? { color:"#818CF8", borderBottom:"2px solid #6366F1" } : { color:"rgba(255,255,255,0.3)", borderBottom:"2px solid transparent" }}>
                <span className="text-[11px]">{tab.icon}</span>
                {tab.label}
                {tab.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: tab.badgeRed ? "rgba(248,113,113,0.15)" : "rgba(52,211,153,0.12)",
                      color: tab.badgeRed ? "#F87171" : "#34D399",
                      border: `1px solid ${tab.badgeRed ? "rgba(248,113,113,0.3)" : "rgba(52,211,153,0.25)"}` }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}

            {/* Actions per tab */}
            <div className="ml-auto flex items-center gap-1 pr-2 shrink-0">
              {rightTab==="terminal" && (
                <>
                  {execTime && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ color:"#34D399", backgroundColor:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.15)" }}>⚡ {execTime}</span>
                  )}
                  {exitCode!==null && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                      style={{ color: exitCode===0?"#34D399":"#F87171", backgroundColor: exitCode===0?"rgba(52,211,153,0.08)":"rgba(248,113,113,0.08)", border:`1px solid ${exitCode===0?"rgba(52,211,153,0.2)":"rgba(248,113,113,0.2)"}` }}>
                      exit {exitCode}
                    </span>
                  )}
                  {output && <>
                    <button onClick={copyOutput} className="text-[10px] px-2 py-0.5 rounded-md transition-colors"
                      style={{ color: copiedOut?"#34D399":"rgba(255,255,255,0.25)", border:"1px solid rgba(255,255,255,0.08)" }}
                      title="Copy output">{copiedOut?"✓":"⎘"}</button>
                    <button onClick={downloadLogs} className="text-[10px] px-2 py-0.5 rounded-md" style={{ color:"rgba(255,255,255,0.25)", border:"1px solid rgba(255,255,255,0.08)" }} title="Download logs">↓</button>
                    <button onClick={()=>{setOutput("");setExecTime(null);setExitCode(null);setIsError(false);setExecPhase("idle");}}
                      className="text-[10px] px-2 py-0.5 rounded-md" style={{ color:"rgba(255,255,255,0.25)", border:"1px solid rgba(255,255,255,0.08)" }} title="Clear (Ctrl+K)">✕</button>
                  </>}
                </>
              )}
              {rightTab==="tests" && (
                <button onClick={runAllTests} disabled={runningTests}
                  className="text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all"
                  style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.25)", opacity: runningTests?0.6:1 }}>
                  {runningTests?"Running…":"▶ Run All"}
                </button>
              )}
              {rightTab==="ai" && (
                <button onClick={handleAiRefresh} disabled={aiRefreshing}
                  className="text-[10px] px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                  style={{ color:"#34D399", background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", opacity: aiRefreshing?0.6:1 }}>
                  <span style={{ display:"inline-block", animation: aiRefreshing?"spin 0.7s linear infinite":"none" }}>↻</span>
                  {aiRefreshing?"…":"Refresh"}
                </button>
              )}
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto" style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(255,255,255,0.06) transparent" }}>

            {/* ─ TERMINAL ─ */}
            {rightTab==="terminal" && (
              <div ref={terminalRef} className="h-full px-4 py-3">
                {/* Execution phase */}
                {loading && (
                  <div className="mb-3">
                    <div className="flex items-center gap-3 mb-1.5">
                      {steps.map((step, i) => {
                        const active = execPhase === step.phase;
                        const done   = steps.findIndex(s=>s.phase===execPhase) > i;
                        return (
                          <div key={step.label} className="flex items-center gap-1.5">
                            {i>0 && <span style={{ color:"rgba(255,255,255,0.12)" }}>→</span>}
                            {done  ? <span style={{ color:"#34D399",fontSize:11 }}>✓</span>
                                   : active ? <span className="w-2.5 h-2.5 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin inline-block" />
                                            : <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor:"rgba(255,255,255,0.1)" }} />}
                            <span className="text-xs" style={{ color: active?"#818CF8":done?"#34D399":"rgba(255,255,255,0.2)" }}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-[11px] animate-pulse" style={{ color:"rgba(255,255,255,0.2)" }}>
                      {execPhase==="compiling" ? "→ Compiling…" : "→ Executing in sandbox…"}
                    </div>
                  </div>
                )}

                {!loading && output ? (
                  <>
                    <div className="text-[11px] mb-2" style={{ color:"rgba(255,255,255,0.15)" }}>
                      $ {language} · {new Date().toLocaleTimeString()}
                    </div>
                    <pre className="whitespace-pre-wrap text-[13px]">{renderLines()}</pre>
                    <div className="mt-3 pt-2 text-[10px] flex items-center gap-1.5" style={{ color:"rgba(255,255,255,0.1)", borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: isError?"#F87171":"#34D399" }}>{isError?"✗":"✓"}</span>
                      {isError ? "Process exited with error" : "Process completed"}
                      {rtVersion && <span className="ml-1">{rtVersion}</span>}
                    </div>
                  </>
                ) : !loading ? (
                  <div>
                    <div className="text-[13px] mb-1" style={{ color:"rgba(255,255,255,0.15)" }}>$ ready</div>
                    <div className="text-[13px] mb-4" style={{ color:"rgba(255,255,255,0.1)" }}>
                      Press <span style={{ color:"#818CF8" }}>▶ Run</span> or <span style={{ color:"#818CF8" }}>Ctrl+Enter</span>
                    </div>
                    <div className="space-y-1 text-[11px]" style={{ color:"rgba(255,255,255,0.07)" }}>
                      <div>✓ 8 languages · secure cloud sandbox</div>
                      <div>✓ stdin · recursion · classes · DSA</div>
                      <div>✓ real compile &amp; runtime errors</div>
                      <div>✓ drag divider to resize panels</div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* ─ TEST CASES ─ */}
            {rightTab==="tests" && (
              <div className="px-4 py-3 space-y-2">
                <div className="text-[10px] mb-3" style={{ color:"rgba(255,255,255,0.18)",fontFamily:"Inter,sans-serif" }}>
                  Each test runs your code with that input and compares to expected output.
                </div>
                {testCases.map(tc => (
                  <div key={tc.id} className="rounded-xl overflow-hidden" style={{ border:"1px solid rgba(255,255,255,0.07)", backgroundColor:"rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-2">
                        {tc.status==="pending" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor:"rgba(255,255,255,0.12)" }} />}
                        {tc.status==="running" && <span className="w-2.5 h-2.5 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin inline-block" />}
                        {tc.status==="pass"    && <span style={{ color:"#34D399",fontSize:12 }}>✓</span>}
                        {tc.status==="fail"    && <span style={{ color:"#F87171",fontSize:12 }}>✗</span>}
                        {tc.status==="error"   && <span style={{ color:"#FBBF24",fontSize:12 }}>!</span>}
                        <span className="text-[11px] font-medium" style={{ color:"rgba(255,255,255,0.55)" }}>{tc.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tc.status==="pass"  && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor:"rgba(52,211,153,0.12)",color:"#34D399",border:"1px solid rgba(52,211,153,0.25)" }}>PASS</span>}
                        {tc.status==="fail"  && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor:"rgba(248,113,113,0.12)",color:"#F87171",border:"1px solid rgba(248,113,113,0.25)" }}>FAIL</span>}
                        {tc.status==="error" && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor:"rgba(251,191,36,0.12)",color:"#FBBF24",border:"1px solid rgba(251,191,36,0.25)" }}>ERR</span>}
                        {tc.id.startsWith("c-") && (
                          <button onClick={()=>setTestCases(p=>p.filter(t=>t.id!==tc.id))} className="text-[10px] ml-1"
                            style={{ color:"rgba(255,255,255,0.12)" }}
                            onMouseEnter={e=>e.currentTarget.style.color="#F87171"}
                            onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.12)"}>✕</button>
                        )}
                      </div>
                    </div>
                    <div className="px-3 py-2 text-[11px] space-y-0.5">
                      {tc.input && <div className="flex gap-2"><span style={{ color:"rgba(255,255,255,0.18)",minWidth:"58px" }}>Input:</span><span style={{ color:"#818CF8" }}>{tc.input}</span></div>}
                      <div className="flex gap-2"><span style={{ color:"rgba(255,255,255,0.18)",minWidth:"58px" }}>Expected:</span><span style={{ color:"#34D399" }}>{tc.expectedOutput}</span></div>
                      {tc.actualOutput && <div className="flex gap-2"><span style={{ color:"rgba(255,255,255,0.18)",minWidth:"58px" }}>Got:</span><span style={{ color: tc.status==="pass"?"#34D399":"#F87171" }}>{tc.actualOutput}</span></div>}
                    </div>
                  </div>
                ))}

                {/* Add custom test */}
                <div className="mt-2 rounded-xl p-3" style={{ border:"1px dashed rgba(255,255,255,0.09)", backgroundColor:"rgba(255,255,255,0.01)", fontFamily:"Inter,sans-serif" }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color:"rgba(255,255,255,0.18)" }}>+ Add Custom Test</div>
                  <div className="space-y-1.5">
                    <input value={customInput} onChange={e=>setCustomInput(e.target.value)} placeholder="stdin input"
                      className="w-full bg-transparent text-[11px] font-mono focus:outline-none px-2 py-1.5 rounded-lg"
                      style={{ color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.08)" }} />
                    <input value={customExpected} onChange={e=>setCustomExpected(e.target.value)} placeholder="Expected output"
                      className="w-full bg-transparent text-[11px] font-mono focus:outline-none px-2 py-1.5 rounded-lg"
                      style={{ color:"rgba(255,255,255,0.6)", border:"1px solid rgba(255,255,255,0.08)" }} />
                    <button onClick={addCustomTest} className="text-[10px] px-3 py-1 rounded-lg font-medium"
                      style={{ background:"rgba(99,102,241,0.15)", color:"#818CF8", border:"1px solid rgba(99,102,241,0.25)" }}>
                      Add Test Case
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─ AI ASSISTANT ─ */}
            {rightTab==="ai" && (
              <div className="h-full flex flex-col" style={{ fontFamily:"Inter,sans-serif" }}>
                {/* Mode selector */}
                <div className="flex flex-wrap gap-1 px-3 py-2.5 shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
                  {([
                    { id:"explain",    label:"📄 Explain"    },
                    { id:"debug",      label:"🐛 Debug"      },
                    { id:"optimize",   label:"⚡ Optimize"   },
                    { id:"complexity", label:"📊 Complexity" },
                    { id:"hints",      label:"💼 Interview"  },
                    { id:"testgen",    label:"🧪 Test Ideas" },
                    { id:"convert",    label:"🔄 Convert"    },
                    { id:"comments",   label:"💬 Comments"   },
                  ] as { id: AIMode; label: string }[]).map(m => (
                    <button key={m.id} onClick={()=>setAiMode(m.id)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all"
                      style={aiMode===m.id ? { background:"rgba(99,102,241,0.2)",color:"#818CF8",border:"1px solid rgba(99,102,241,0.4)" } : { background:"transparent",color:"rgba(255,255,255,0.28)",border:"1px solid rgba(255,255,255,0.06)" }}>
                      {m.label}
                    </button>
                  ))}
                </div>
                {/* Results */}
                <div className="flex-1 overflow-auto px-4 py-3 space-y-1" style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(255,255,255,0.06) transparent" }}>
                  {aiResults.length ? aiResults.map((line, i) => {
                    let color="#C4B5FD";
                    if (line.startsWith("🔴"))  color="#F87171";
                    else if (line.startsWith("⚠️")) color="#FBBF24";
                    else if (line.startsWith("✅")||line.startsWith("✓")) color="#34D399";
                    else if (line.startsWith("─")) color="rgba(255,255,255,0.08)";
                    else if (line.startsWith("→")||line.startsWith("▶")||line.startsWith("  ")) color="rgba(200,190,255,0.6)";
                    return (
                      <div key={i} className="text-[12px] leading-relaxed" style={{ color, fontFamily: line.startsWith("  ")?"'JetBrains Mono',monospace":"inherit" }}>
                        {line}
                      </div>
                    );
                  }) : (
                    <div className="text-[12px]" style={{ color:"rgba(255,255,255,0.18)" }}>
                      Select a mode above, then click <span style={{ color:"#34D399" }}>Refresh</span> or run your code.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── OVERLAYS ──────────────────────────────────────────────────────── */}
      {showShortcuts && <ShortcutsModal onClose={()=>setShowShortcuts(false)} />}
      {shareLink && <ShareToast link={shareLink} onClose={()=>setShareLink(null)} />}
    </div>
  );
}

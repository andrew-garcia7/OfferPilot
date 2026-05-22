import { useEffect, useRef, useState } from "react";
import monaco from "../lib/monaco";

type Theme = "dark" | "light" | "dracula";

const SAMPLE_JS = `// JavaScript Example
console.log("Hello, AutoMock!");

function greet(name) {
  return "Hello, " + name;
}

console.log(greet("World"));

const nums = [1,2,3,4];
console.log(nums.map(n => n * 2));
`;

export default function CodeEditor({
  onRun,
}: {
  onRun: (code: string) => void;
}) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<Theme>("dark");
  const [code, setCode] = useState(SAMPLE_JS);
  const [aiOn, setAiOn] = useState(false);
  const [aiTips, setAiTips] = useState<string[]>([]);

  /* ---------- THEMES ---------- */
  useEffect(() => {
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4" },
        { token: "string", foreground: "f1fa8c" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "number", foreground: "bd93f9" },
      ],
      colors: {
        "editor.background": "#282a36",
      },
    });
  }, []);

  /* ---------- EDITOR INIT ---------- */
  useEffect(() => {
    if (!containerRef.current) return;

    editorRef.current = monaco.editor.create(containerRef.current, {
      value: SAMPLE_JS,
      language: "javascript",
      theme: theme === "dark" ? "vs-dark" : theme === "light" ? "vs" : "dracula",
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
    });

    editorRef.current.onDidChangeModelContent(() => {
      const val = editorRef.current!.getValue();
      setCode(val);
      if (aiOn) runAI(val);
    });

    return () => editorRef.current?.dispose();
  }, []);

  /* ---------- THEME CHANGE ---------- */
  useEffect(() => {
    monaco.editor.setTheme(
      theme === "dark" ? "vs-dark" : theme === "light" ? "vs" : "dracula"
    );
  }, [theme]);

  /* ---------- AI ANALYSIS ---------- */
  function runAI(src: string) {
    const tips: string[] = [];
    if (src.includes("var ")) tips.push("Prefer let / const instead of var.");
    if (src.includes("==")) tips.push("Use === instead of ==");
    if (!src.includes("function"))
      tips.push("Consider splitting logic into functions.");

    setAiTips(tips);
  }

  /* ---------- ACTIONS ---------- */
  const reset = () => {
    editorRef.current?.setValue(SAMPLE_JS);
    setAiTips([]);
  };

  const run = () => {
    onRun(editorRef.current?.getValue() || "");
  };

  return (
    <div className="bg-[#111829] border border-gray-700 rounded-xl p-4">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="bg-[#0a0f1f] border border-gray-600 px-2 py-1 rounded text-sm"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="dracula">Dracula</option>
          </select>

          <button
            onClick={() => setAiOn(!aiOn)}
            className={`px-3 py-1 rounded text-sm ${
              aiOn
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            🤖 AI {aiOn ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={reset}
            className="px-3 py-1 bg-gray-700 rounded text-sm"
          >
            Reset
          </button>
          <button
            onClick={run}
            className="px-4 py-1 bg-cyan-600 rounded text-sm text-white"
          >
            ▶ Run
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={containerRef}
        className="h-95 rounded border border-gray-700"
      />

      {/* AI Panel */}
      {aiOn && aiTips.length > 0 && (
        <div className="mt-4 bg-[#1a2337] border border-cyan-500/30 rounded p-3">
          <div className="text-cyan-400 font-semibold mb-2">
            🤖 AI Suggestions
          </div>
          {aiTips.map((t, i) => (
            <div key={i} className="text-sm text-gray-300">
              • {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

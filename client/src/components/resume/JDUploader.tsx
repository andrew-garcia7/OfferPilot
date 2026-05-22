import React, { useState } from "react";
import { API } from "../../api";
import { JDAnalysis } from "../../types/resume";

interface JDUploaderProps {
  onAnalyzed: (jd: JDAnalysis) => void;
  onClear: () => void;
  jd: JDAnalysis | null;
}

export function JDUploader({ onAnalyzed, onClear, jd }: JDUploaderProps) {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const analyze = async () => {
    if (jdText.trim().length < 20) {
      setError("Paste at least a few lines of the job description.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/api/resume/analyze-jd", { text: jdText });
      onAnalyzed(res.data);
      setExpanded(false);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to analyze JD.");
    } finally {
      setLoading(false);
    }
  };

  if (jd) {
    return (
      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-200">JD Loaded — {jd.role || "Role detected"}</span>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {jd.requiredSkills.slice(0, 12).map(skill => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded-md text-xs bg-violet-900/40 text-violet-300 border border-violet-800/50"
            >
              {skill}
            </span>
          ))}
          {jd.requiredSkills.length > 12 && (
            <span className="px-2 py-0.5 text-xs text-slate-500">
              +{jd.requiredSkills.length - 12} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 p-4 space-y-3">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <div>
          <p className="text-sm font-semibold text-slate-200">Add Job Description</p>
          <p className="text-xs text-slate-500 mt-0.5">Paste the JD to get an exact ATS match score</p>
        </div>
        <span className="text-slate-500 text-lg">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="space-y-3">
          <textarea
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            rows={6}
            placeholder="Paste the job description here…"
            className="w-full rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm px-3 py-2.5 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={analyze}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {loading ? "Analyzing…" : "Analyze JD"}
          </button>
        </div>
      )}
    </div>
  );
}

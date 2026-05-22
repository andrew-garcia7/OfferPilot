import React, { useState } from "react";
import { API } from "../../api";

interface BulletRewriterProps {
  bullet: string;
  context?: string;
  onApply: (rewritten: string) => void;
}

export function BulletRewriter({ bullet, context, onApply }: BulletRewriterProps) {
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiUsed, setAiUsed] = useState(false);

  const rewrite = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/api/resume/rewrite-bullet", { bullet, context });
      setRewritten(res.data.rewritten);
      setAiUsed(res.data.aiUsed);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Rewrite failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-700">
        {bullet}
      </div>
      <div className="flex gap-2">
        <button
          onClick={rewrite}
          disabled={loading}
          className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-700/50 text-violet-300 text-xs font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Rewriting…" : "✦ Improve"}
        </button>
        {rewritten && (
          <button
            onClick={() => onApply(rewritten)}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-700/50 text-emerald-300 text-xs font-medium transition-colors"
          >
            Apply
          </button>
        )}
      </div>
      {rewritten && (
        <div className="text-sm text-slate-200 bg-violet-950/30 rounded-lg px-3 py-2 border border-violet-800/40">
          <span className="text-xs text-violet-400 font-medium block mb-1">
            {aiUsed ? "AI rewrite" : "Rule-based rewrite"}
          </span>
          {rewritten}
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

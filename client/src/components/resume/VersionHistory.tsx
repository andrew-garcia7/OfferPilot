import React from "react";
import { ResumeVersion } from "../../types/resume";

interface VersionHistoryProps {
  versions: ResumeVersion[];
  onRestore: (versionId: number) => void;
  loading?: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function scoreColor(score?: number): string {
  if (!score) return "text-slate-500";
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-red-400";
}

export function VersionHistory({ versions, onRestore, loading }: VersionHistoryProps) {
  if (loading) {
    return (
      <div className="text-sm text-slate-500 text-center py-6">Loading versions…</div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-6 text-center">
        <p className="text-sm text-slate-500">No saved versions yet</p>
        <p className="text-xs text-slate-600 mt-1">Save your draft to create a version snapshot</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/80">
        <h3 className="text-sm font-semibold text-slate-200">Version History</h3>
        <p className="text-xs text-slate-500 mt-0.5">{versions.length} saved version{versions.length > 1 ? "s" : ""}</p>
      </div>
      <ul className="divide-y divide-slate-800/60">
        {versions.map(v => (
          <li key={v.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-200">{v.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{formatDate(v.createdAt)}</p>
            </div>
            <div className="flex items-center gap-3">
              {v.atsScore !== undefined && (
                <span className={`text-sm font-semibold ${scoreColor(v.atsScore)}`}>
                  {Math.round(v.atsScore)}
                </span>
              )}
              <button
                onClick={() => onRestore(v.id)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:border-violet-600 hover:text-violet-300 transition-colors"
              >
                Restore
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

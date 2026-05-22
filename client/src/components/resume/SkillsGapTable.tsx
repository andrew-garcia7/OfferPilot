import React from "react";

interface SkillsGapTableProps {
  required: string[];
  detected: string[];
  matchPercent?: number;
}

export function SkillsGapTable({ required, detected, matchPercent }: SkillsGapTableProps) {
  const detectedLower = detected.map(s => s.toLowerCase());

  const rows = required.map(skill => ({
    skill,
    present: detectedLower.some(d => d.includes(skill.toLowerCase())),
  }));

  const present = rows.filter(r => r.present);
  const missing = rows.filter(r => !r.present);

  if (required.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Skills Gap Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">{required.length} skills required by the JD</p>
        </div>
        {matchPercent !== undefined && (
          <div className="text-right">
            <div
              className="text-xl font-bold"
              style={{ color: matchPercent >= 70 ? "#10b981" : matchPercent >= 45 ? "#f59e0b" : "#ef4444" }}
            >
              {matchPercent}%
            </div>
            <div className="text-xs text-slate-500">JD Match</div>
          </div>
        )}
      </div>

      {/* Missing skills */}
      {missing.length > 0 && (
        <div className="p-4 border-b border-slate-800">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">
            Missing ({missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missing.map(r => (
              <span
                key={r.skill}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-950/40 text-red-300 border border-red-900/50"
              >
                {r.skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Present skills */}
      {present.length > 0 && (
        <div className="p-4">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
            Present ({present.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {present.map(r => (
              <span
                key={r.skill}
                className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-900/50"
              >
                {r.skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

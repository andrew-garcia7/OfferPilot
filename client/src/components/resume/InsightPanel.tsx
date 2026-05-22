import React, { useState } from "react";
import { InsightGroup } from "../../types/resume";

interface InsightPanelProps {
  insights: InsightGroup[];
  suggestions?: string[];
}

const SEVERITY_CONFIG = {
  high:   { dot: "bg-red-400",    label: "Critical",   badgeBg: "bg-red-50 border-red-100",   badgeText: "text-red-600"   },
  medium: { dot: "bg-amber-400",  label: "Important",  badgeBg: "bg-amber-50 border-amber-100",badgeText: "text-amber-600" },
  low:    { dot: "bg-blue-400",   label: "Suggestion", badgeBg: "bg-blue-50 border-blue-100",  badgeText: "text-blue-600"  },
};

function InsightGroupCard({ group }: { group: InsightGroup }) {
  const [open, setOpen] = useState(true);
  const config = SEVERITY_CONFIG[group.severity];

  return (
    <div className="rounded-xl border border-[#FFD6E8]/60 overflow-hidden bg-white">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF0F7] transition-colors text-left"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
        <span className="text-sm font-semibold text-[#1a1a2e] flex-1">{group.title}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.badgeBg} ${config.badgeText}`}>
          {config.label}
        </span>
        <span className="text-[#9ca3af] text-xs ml-1">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="px-4 py-3 space-y-1.5 bg-[#FFF8FC] border-t border-[#FFD6E8]/40">
          {group.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-[#6b7280]">
              <span className="flex-shrink-0 mt-0.5 text-[#be185d]">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InsightPanel({ insights, suggestions }: InsightPanelProps) {
  if (!insights || insights.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
        <p className="text-sm font-semibold text-emerald-700">Strong resume — no critical issues found</p>
        <p className="text-xs text-emerald-500 mt-1">Upload a job description for a detailed match analysis</p>
      </div>
    );
  }

  const highCount = insights.filter(g => g.severity === "high").length;
  const medCount  = insights.filter(g => g.severity === "medium").length;

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-xs text-[#9ca3af]">
        <span>
          <span className="text-red-500 font-semibold">{highCount}</span> critical
        </span>
        <span>
          <span className="text-amber-500 font-semibold">{medCount}</span> important
        </span>
        <span>
          <span className="text-blue-400 font-semibold">
            {insights.filter(g => g.severity === "low").length}
          </span>{" "}
          suggestions
        </span>
      </div>

      {[...insights]
        .sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.severity] - order[b.severity];
        })
        .map((g, i) => (
          <InsightGroupCard key={i} group={g} />
        ))}

      {suggestions && suggestions.length > 0 && (
        <div className="rounded-xl border border-[#FFD6E8]/60 p-4 bg-white">
          <p className="text-xs font-semibold text-[#be185d] uppercase tracking-wider mb-2">Quick Wins</p>
          <ul className="space-y-1.5">
            {suggestions.slice(0, 5).map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#6b7280]">
                <span className="text-[#E91E8C] flex-shrink-0">✦</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


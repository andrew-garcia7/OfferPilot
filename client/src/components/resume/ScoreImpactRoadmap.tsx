import React from "react";
import { ScoreImprovement } from "../../types/resume";

interface Props {
  improvements: ScoreImprovement[];
  currentScore: number;
}

const PRIORITY_CONFIG = {
  high:   { label: "Critical", dot: "bg-red-400",   text: "text-red-600",   bg: "bg-red-50 border-red-100" },
  medium: { label: "Helpful",  dot: "bg-amber-400", text: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  low:    { label: "Bonus",    dot: "bg-emerald-400",text: "text-emerald-600",bg: "bg-emerald-50 border-emerald-100" },
};

export function ScoreImpactRoadmap({ improvements, currentScore }: Props) {
  if (!improvements || improvements.length === 0) return null;

  const topImprovements = improvements.filter(i => i.impact > 0).slice(0, 6);
  const potentialGain = topImprovements.reduce((sum, i) => sum + i.impact, 0);
  const projectedScore = Math.min(100, currentScore + potentialGain);

  return (
    <div className="rounded-2xl border border-[#FFD6E8]/60 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#FFF0F7] to-white border-b border-[#FFD6E8]/60">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1a2e]">Score Improvement Roadmap</h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">Exact steps to raise your ATS score</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#dc2626]">{Math.round(currentScore)}</span>
              <span className="text-xs text-[#9ca3af]">→</span>
              <span className="text-sm font-bold text-[#16a34a]">{Math.round(projectedScore)}</span>
            </div>
            <p className="text-xs text-[#9ca3af]">potential score</p>
          </div>
        </div>

        {/* Progress bar showing potential */}
        <div className="mt-3 relative h-3 rounded-full bg-[#F3E8F0]">
          <div
            className="h-full rounded-full bg-[#dc2626] transition-all duration-700"
            style={{ width: `${currentScore}%` }}
          />
          <div
            className="absolute top-0 h-full rounded-full bg-[#16a34a]/40 transition-all duration-700"
            style={{ left: `${currentScore}%`, width: `${Math.min(potentialGain, 100 - currentScore)}%` }}
          />
          <span
            className="absolute -top-0.5 text-[10px] font-bold text-[#16a34a]"
            style={{ left: `${Math.min(projectedScore, 96)}%` }}
          >
            +{Math.round(potentialGain)}
          </span>
        </div>
      </div>

      {/* Improvement list */}
      <div className="divide-y divide-[#FFD6E8]/40">
        {topImprovements.map((item, idx) => {
          const cfg = PRIORITY_CONFIG[item.priority];
          return (
            <div
              key={idx}
              className="flex items-start gap-4 px-5 py-3.5 hover:bg-[#FFF8FC] transition-colors"
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FFD6E8]/60 flex items-center justify-center text-xs font-bold text-[#be185d]">
                {idx + 1}
              </div>

              {/* Action text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1a1a2e] leading-snug">{item.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Impact badge */}
              <div className="flex-shrink-0 text-right">
                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-[#dcfce7] text-[#16a34a] text-xs font-bold border border-[#bbf7d0]">
                  +{item.impact} pts
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-3 bg-[#FFF8FC] border-t border-[#FFD6E8]/40">
        <p className="text-xs text-[#9ca3af] text-center">
          Fix all {topImprovements.length} issues above → projected score{" "}
          <span className="font-semibold text-[#16a34a]">{Math.round(projectedScore)}/100</span>
        </p>
      </div>
    </div>
  );
}

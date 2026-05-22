import React, { useState } from "react";
import { ATSBreakdown, ScoreBreakdownDetail } from "../../types/resume";

interface Props {
  score: number;
  breakdown?: ATSBreakdown;
  breakdownDetail?: ScoreBreakdownDetail;
}

/* ── Donut SVG ── */
function DonutScore({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const color = score >= 75 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  const label = score >= 75 ? "Strong" : score >= 50 ? "Average" : "Needs Work";
  const labelColor = score >= 75 ? "#15803d" : score >= 50 ? "#b45309" : "#b91c1c";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="#F3E8F0" strokeWidth="11" />
          <circle
            cx="64" cy="64" r={r} fill="none"
            stroke={color} strokeWidth="11"
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>{Math.round(score)}</span>
          <span className="text-xs text-[#9ca3af] font-medium">/100</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm font-semibold" style={{ color: labelColor }}>{label}</span>
        <p className="text-xs text-[#9ca3af] mt-0.5">ATS Score</p>
      </div>
    </div>
  );
}

/* ── 6-Category Breakdown ── */
const DETAIL_META: { key: keyof ScoreBreakdownDetail; label: string; icon: string }[] = [
  { key: "skillsMatch",  label: "Skills Match",   icon: "⚡" },
  { key: "experience",   label: "Experience",      icon: "💼" },
  { key: "projects",     label: "Projects & Links",icon: "🔗" },
  { key: "education",    label: "Education",       icon: "🎓" },
  { key: "formatting",   label: "Formatting",      icon: "📐" },
  { key: "keywords",     label: "Keyword Match",   icon: "🎯" },
];

function CategoryBar({ cat, label, icon, isOpen, onToggle }: {
  cat: { score: number; max: number; why: string };
  label: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const pct = (cat.score / cat.max) * 100;
  const barColor = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
  const bgBar = pct >= 70 ? "#dcfce7" : pct >= 40 ? "#fef3c7" : "#fee2e2";

  return (
    <div className="border border-[#FFD6E8]/60 rounded-xl overflow-hidden bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF0F7] transition-colors"
      >
        <span className="text-base">{icon}</span>
        <span className="flex-1 text-sm font-medium text-[#1a1a2e] text-left">{label}</span>
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 rounded-full" style={{ background: bgBar }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: barColor }}
            />
          </div>
          <span className="text-sm font-semibold w-12 text-right" style={{ color: barColor }}>
            {cat.score}/{cat.max}
          </span>
          <span className="text-[#9ca3af] text-xs">{isOpen ? "▲" : "▼"}</span>
        </div>
      </button>
      {isOpen && (
        <div className="px-4 pb-3 text-xs text-[#6b7280] bg-[#FFF8FC] border-t border-[#FFD6E8]/40">
          <p className="pt-2 leading-relaxed">{cat.why}</p>
        </div>
      )}
    </div>
  );
}

export function ATSScoreGauge({ score, breakdown, breakdownDetail }: Props) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggle = (key: string) => setOpenKey(prev => (prev === key ? null : key));

  return (
    <div className="rounded-2xl border border-[#FFD6E8]/60 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#FFD6E8]/60 bg-gradient-to-r from-[#FFF8FC] to-white">
        <h3 className="text-sm font-semibold text-[#1a1a2e]">ATS Score Analysis</h3>
        <p className="text-xs text-[#9ca3af] mt-0.5">Click any category to see why you got that score</p>
      </div>

      <div className="p-5">
        {/* Score donut */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
          <DonutScore score={score} />

          {/* Legacy breakdown bars (compact) when no detail */}
          {breakdown && !breakdownDetail && (
            <div className="flex-1 space-y-2 w-full">
              {([
                { label: "Skills Match",    val: breakdown.skillsMatch,    max: 25 },
                { label: "Experience",      val: breakdown.experience,     max: 20 },
                { label: "Education",       val: breakdown.education,      max: 15 },
                { label: "Projects & Links",val: breakdown.projectsLinks,  max: 10 },
              ] as { label: string; val: number; max: number }[]).map(({ label, val, max }) => {
                const pct = (val / max) * 100;
                const barColor = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
                return (
                  <div key={label} className="flex items-center gap-3">
                    <span className="text-xs text-[#6b7280] w-28 text-right shrink-0">{label}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F3E8F0]">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: barColor }}>{val}/{max}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Score label when detail available */}
          {breakdownDetail && (
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2">
                {DETAIL_META.map(({ key, label, icon }) => {
                  const cat = breakdownDetail[key];
                  if (!cat) return null;
                  const pct = (cat.score / cat.max) * 100;
                  const color = pct >= 70 ? "#16a34a" : pct >= 40 ? "#d97706" : "#dc2626";
                  return (
                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-[#FFF8FC] border border-[#FFD6E8]/40">
                      <span className="text-sm">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#6b7280] truncate">{label}</p>
                        <p className="text-sm font-bold" style={{ color }}>{cat.score}/{cat.max}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Detailed expandable breakdown */}
        {breakdownDetail && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-3">Score Breakdown — click to expand</p>
            {DETAIL_META.map(({ key, label, icon }) => {
              const cat = breakdownDetail[key];
              if (!cat) return null;
              return (
                <CategoryBar
                  key={key}
                  cat={cat}
                  label={label}
                  icon={icon}
                  isOpen={openKey === key}
                  onToggle={() => toggle(key)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


import React from "react";
import { ATSBreakdown } from "../../types/resume";

interface RadarChartProps {
  breakdown: ATSBreakdown;
  size?: number;
}

interface Axis {
  label: string;
  key: keyof ATSBreakdown;
  max: number;
}

const AXES: Axis[] = [
  { label: "Skills",    key: "skillsMatch",   max: 25 },
  { label: "Relevance", key: "roleRelevance", max: 20 },
  { label: "Experience",key: "experience",    max: 20 },
  { label: "Education", key: "education",     max: 15 },
  { label: "Projects",  key: "projectsLinks", max: 10 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleRad: number) {
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

export function RadarChart({ breakdown, size = 240 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const labelR = size * 0.47;
  const n = AXES.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  // Build guide rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1];
  const ringPaths = rings.map(ratio => {
    const pts = AXES.map((_, i) => {
      const angle = startAngle + i * angleStep;
      return polarToCartesian(cx, cy, maxR * ratio, angle);
    });
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + "Z";
  });

  // Data polygon
  const dataPts = AXES.map((axis, i) => {
    const ratio = Math.min(breakdown[axis.key] / axis.max, 1);
    const angle = startAngle + i * angleStep;
    return polarToCartesian(cx, cy, maxR * ratio, angle);
  });
  const dataPath =
    dataPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ") + "Z";

  // Axis lines
  const axisLines = AXES.map((_, i) => {
    const angle = startAngle + i * angleStep;
    const end = polarToCartesian(cx, cy, maxR, angle);
    return { x1: cx, y1: cy, x2: end.x, y2: end.y };
  });

  // Labels
  const labels = AXES.map((axis, i) => {
    const angle = startAngle + i * angleStep;
    const pt = polarToCartesian(cx, cy, labelR, angle);
    const value = Math.round((breakdown[axis.key] / axis.max) * 100);
    return { ...axis, ...pt, value };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Guide rings */}
        {ringPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke="#334155"
            strokeWidth={0.8}
            opacity={0.5}
          />
        ))}
        {/* Axis lines */}
        {axisLines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#475569"
            strokeWidth={0.8}
            opacity={0.6}
          />
        ))}
        {/* Data area */}
        <path
          d={dataPath}
          fill="rgba(124,58,237,0.18)"
          stroke="#7c3aed"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Data points */}
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#7c3aed" />
        ))}
        {/* Labels */}
        {labels.map((l, i) => (
          <g key={i}>
            <text
              x={l.x}
              y={l.y - 7}
              textAnchor="middle"
              fontSize={size * 0.053}
              fontWeight={600}
              fill="#e2e8f0"
            >
              {l.label}
            </text>
            <text
              x={l.x}
              y={l.y + 7}
              textAnchor="middle"
              fontSize={size * 0.045}
              fill="#94a3b8"
            >
              {l.value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

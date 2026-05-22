import React from "react";

interface CircularScoreProps {
  score: number;
  size?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#10b981"; // emerald
  if (score >= 50) return "#f59e0b"; // amber
  return "#ef4444";                  // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 35) return "Weak";
  return "Poor";
}

export function CircularScore({ score, size = 160, label }: CircularScoreProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const color = getScoreColor(progress);
  const qualityLabel = getScoreLabel(progress);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        {/* Center text — counter-rotate */}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-current"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${cx}px ${cy - 6}px`,
            fontSize: size * 0.22,
            fontWeight: 700,
            fill: color,
          }}
        >
          {Math.round(progress)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.16}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${cx}px ${cy + size * 0.16}px`,
            fontSize: size * 0.09,
            fill: "#94a3b8",
            fontWeight: 500,
          }}
        >
          / 100
        </text>
      </svg>
      <div className="text-center">
        <div className="text-sm font-semibold" style={{ color }}>{qualityLabel}</div>
        {label && <div className="text-xs text-slate-500 mt-0.5">{label}</div>}
      </div>
    </div>
  );
}

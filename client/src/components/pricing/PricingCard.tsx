import { Check, X, Zap } from "lucide-react";
import type { CSSProperties } from "react";
import type { PricingPlan } from "../../data/pricingPlans";

export function PricingCard({
  plan,
  yearly,
  onSelect,
}: {
  plan: PricingPlan;
  yearly: boolean;
  onSelect: (plan: PricingPlan) => void;
}) {
  const isPro = plan.id === "pro";
  const isFree = plan.id === "free";
  const isTeam = plan.id === "team";

  const containerStyle: CSSProperties = isPro
    ? {
        background: "linear-gradient(160deg, rgba(99,102,241,0.20), rgba(139,92,246,0.20), rgba(236,72,153,0.16))",
        border: "1px solid rgba(129,140,248,0.35)",
      }
    : isFree
      ? {
          background: "linear-gradient(160deg, rgba(16,185,129,0.18), rgba(6,182,212,0.16), rgba(99,102,241,0.14))",
          border: "1px solid rgba(16,185,129,0.28)",
        }
      : isTeam
        ? {
            background: "linear-gradient(160deg, rgba(245,158,11,0.18), rgba(236,72,153,0.18), rgba(139,92,246,0.16))",
            border: "1px solid rgba(236,72,153,0.28)",
          }
        : {
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.10)",
          };

  return (
    <div className="relative rounded-2xl p-6" style={containerStyle}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[#F59E0B] px-3 py-1 text-[11px] font-bold text-[#0F0F14]">
          <span className="inline-flex items-center gap-1">
            <Zap size={11} />
            {plan.badge}
          </span>
        </div>
      )}

      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#A78BFA]">{plan.name}</p>
      <div className="mb-1 flex items-baseline gap-1">
        <span className="text-5xl font-black text-white">${yearly ? plan.yearly : plan.monthly}</span>
        <span className="text-sm text-white/40">/mo</span>
      </div>
      {yearly && plan.monthly > 0 && (
        <p className="mb-1 text-xs text-white/30">
          <span className="line-through">${plan.monthly}/mo</span> billed annually
        </p>
      )}
      <p className="mb-6 text-sm text-white/50">{plan.description}</p>

      <ul className="mb-7 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-3 text-sm">
            {feature.included ? (
              <Check size={16} className="shrink-0 text-[#10B981]" />
            ) : (
              <X size={16} className="shrink-0 text-white/20" />
            )}
            <span className={feature.included ? "text-white/80" : "text-white/30 line-through"}>{feature.text}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-bold text-white transition hover:bg-white/[0.10]"
      >
        {plan.cta}
      </button>
    </div>
  );
}

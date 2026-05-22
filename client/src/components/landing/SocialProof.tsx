import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import CompanyChip from "../common/CompanyChip";
import type { CompanyBrand } from "../../lib/companyLogos";
import {
  SOCIAL_PROOF_ROW1,
  SOCIAL_PROOF_ROW2,
  SOCIAL_PROOF_ROW3,
  SOCIAL_PROOF_ROW4,
} from "../../data/companyBrands";

function useCountUp(target: number, duration = 2000, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);
  return count;
}

const STATS = [
  {
    value: 12000, suffix: "+", label: "Engineers Placed",
    from: "#6366F1", to: "#818CF8",
    glow: "rgba(99,102,241,0.35)",
    border: "rgba(99,102,241,0.35)",
    emoji: "🚀",
  },
  {
    value: 94, suffix: "%", label: "Offer Rate",
    from: "#EC4899", to: "#F472B6",
    glow: "rgba(236,72,153,0.35)",
    border: "rgba(236,72,153,0.35)",
    emoji: "🎯",
  },
  {
    value: 145, prefix: "$", suffix: "K", label: "Avg Salary Increase",
    from: "#10B981", to: "#34D399",
    glow: "rgba(16,185,129,0.35)",
    border: "rgba(16,185,129,0.35)",
    emoji: "💰",
  },
];

function StatItem({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const count = useCountUp(stat.value, 2000, inView);

  return (
    <motion.div
      ref={ref}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.08, zIndex: 50, cursor: "grabbing" }}
      whileHover={{ y: -6, scale: 1.04 }}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative cursor-grab select-none rounded-2xl px-8 py-6 text-center"
      style={{
        background: `linear-gradient(135deg, rgba(22,22,31,0.9) 0%, rgba(22,22,31,0.7) 100%)`,
        border: `1px solid ${stat.border}`,
        boxShadow: `0 0 32px ${stat.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${stat.from}, transparent 70%)` }} />
      <div className="relative z-10">
        <div className="text-2xl mb-2">{stat.emoji}</div>
        <div className="text-4xl lg:text-5xl font-extrabold tracking-[-0.03em] mb-1"
          style={{ background: `linear-gradient(135deg, ${stat.from}, ${stat.to})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {stat.prefix ?? ""}{count.toLocaleString()}{stat.suffix}
        </div>
        <div className="text-sm text-white/50 font-medium">{stat.label}</div>
      </div>
    </motion.div>
  );
}

function MarqueeRow({ companies, trackClass, gap = "gap-3" }: { companies: CompanyBrand[]; trackClass: string; gap?: string }) {
  const doubled = [...companies, ...companies, ...companies];
  return (
    <div className="relative overflow-hidden">
      <div className={`${trackClass} flex ${gap} whitespace-nowrap px-2 py-1.5`} style={{ width: "max-content" }}>
        {doubled.map((co, i) => (
          <CompanyChip key={`${co.slug}-${i}`} brand={co} />
        ))}
      </div>
      <div className="absolute inset-y-0 left-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to right, var(--theme-bg), transparent)" }} />
      <div className="absolute inset-y-0 right-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to left, var(--theme-bg), transparent)" }} />
    </div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

export default function SocialProof() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="relative z-40 -mt-10 md:-mt-14 py-12 md:py-14 overflow-hidden"
    >
      <motion.div variants={fadeUp} className="text-center mb-10 px-6">
        <p className="text-[11px] font-bold text-white/25 uppercase tracking-[0.2em] mb-3">
          Candidates targeting top companies use OfferPilot
        </p>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818CF8" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8] inline-block" />
            300+ companies
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34D399" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] inline-block" />
            12,000+ engineers placed
          </span>
        </div>
      </motion.div>

      <div className="flex flex-col gap-3">
        <MarqueeRow companies={SOCIAL_PROOF_ROW1} trackClass="marquee-track" />
        <MarqueeRow companies={SOCIAL_PROOF_ROW2} trackClass="marquee-track2" />
        <MarqueeRow companies={SOCIAL_PROOF_ROW3} trackClass="marquee-track3" />
        <MarqueeRow companies={SOCIAL_PROOF_ROW4} trackClass="marquee-track4" />
      </div>

      <div className="mt-16 flex flex-wrap justify-center items-stretch gap-4 max-w-3xl mx-auto px-6">
        {STATS.map((stat, i) => (
          <StatItem key={i} stat={stat} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

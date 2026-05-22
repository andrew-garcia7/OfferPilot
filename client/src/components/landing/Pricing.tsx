import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { PricingCard } from "../pricing/PricingCard";
import { PRICING_PLANS, type PricingPlan } from "../../data/pricingPlans";
import { openPlanCheckout } from "../../lib/paymentFlow";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

const COMPARE_ROWS = [
  { feature: "Mock Interviews",         free: "5/mo",   pro: "Unlimited", team: "Unlimited" },
  { feature: "Resume ATS Scanner",      free: "✓",      pro: "✓",         team: "✓" },
  { feature: "AI Resume Builder",       free: "—",      pro: "✓",         team: "✓" },
  { feature: "Coding Simulator",        free: "Basic",  pro: "Full",      team: "Full" },
  { feature: "Company Question Banks",  free: "—",      pro: "✓",         team: "✓" },
  { feature: "AI Career Roadmap",       free: "—",      pro: "✓",         team: "✓" },
  { feature: "Session Replay",          free: "—",      pro: "✓",         team: "✓" },
  { feature: "Team Dashboard",          free: "—",      pro: "—",         team: "✓" },
];

export default function Pricing() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [annual, setAnnual] = useState(true);

  const handleSelectPlan = async (plan: PricingPlan) => {
    try {
      const checkoutPlanId = plan.id === "free" ? "pro" : plan.id;
      await openPlanCheckout(checkoutPlanId, annual, {
        onSuccess: ({ paymentId, orderId, planId, yearly }) => {
          navigate(
            `/payment/success?payment_id=${encodeURIComponent(paymentId)}&order_id=${encodeURIComponent(orderId)}&plan=${encodeURIComponent(planId)}&cycle=${yearly ? "yearly" : "monthly"}`
          );
        },
        onFailure: () => navigate("/payment/failure"),
      });
    } catch {
      navigate("/payment/failure");
    }
  };

  return (
    <motion.section
      ref={ref}
      id="pricing"
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className="py-24 px-6 lg:px-16"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div variants={fadeUp} className="text-center mb-12">
          <span className="px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] bg-[#6366F1]/15 text-[#8B5CF6] border border-[#6366F1]/25">
            Pricing
          </span>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mt-5 mb-4 tracking-[-0.02em]">
            Simple, transparent{" "}
            <span className="gradient-text">pricing.</span>
          </h2>
          <p className="text-white/45 mb-8">Start free. Upgrade when you're ready to go all-in.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-[#16161F] border border-white/8 rounded-2xl p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                !annual ? "bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30" : "text-white/40 hover:text-white/60"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                annual ? "bg-[#6366F1] text-white shadow-md shadow-[#6366F1]/30" : "text-white/40 hover:text-white/60"
              }`}
            >
              Annual
              <span className="text-[10px] font-extrabold bg-[#10B981] text-white px-1.5 py-0.5 rounded-md">-40%</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-5 items-center mb-14">
          {PRICING_PLANS.map((plan, i) => {
            const wrapClass = plan.id === "pro" ? "conic-border-wrap" : plan.id === "free" ? "conic-border-wrap-green" : "conic-border-wrap-pink";
            return (
              <motion.div key={plan.id} variants={fadeUp} custom={i * 0.4} className={wrapClass}>
                <PricingCard plan={plan} yearly={annual} onSelect={handleSelectPlan} />
              </motion.div>
            );
          })}
        </div>

        {/* Comparison table */}
        <motion.div variants={fadeUp} className="bg-[#16161F] border border-white/[0.06] rounded-3xl overflow-hidden">
          <div className="grid grid-cols-4 bg-white/[0.03] border-b border-white/[0.06]">
            <div className="col-span-1 px-6 py-4 text-xs font-bold text-white/30 uppercase tracking-wide">Feature</div>
            {["Free","Pro","Team"].map((h,i) => (
              <div key={h} className={`px-4 py-4 text-center text-xs font-bold ${i===1 ? "text-[#8B5CF6]" : "text-white/30"}`}>{h}</div>
            ))}
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-4 border-b border-white/[0.04] last:border-0 ${i % 2 === 1 ? "bg-white/[0.02]" : ""}`}>
              <div className="col-span-1 px-6 py-3.5 text-xs text-white/55 font-medium">{row.feature}</div>
              {[row.free, row.pro, row.team].map((val, j) => (
                <div key={j} className={`px-4 py-3.5 text-center text-xs font-semibold ${
                  val === "✓" ? (j===1 ? "text-[#8B5CF6]" : "text-[#10B981]") :
                  val === "—" ? "text-white/15" : j===1 ? "text-[#8B5CF6]" : "text-white/50"
                }`}>{val}</div>
              ))}
            </div>
          ))}
        </motion.div>

        {/* Trust strip */}
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-6 mt-10 text-xs text-white/30 font-medium">
          {["30-day money back","Cancel anytime","SOC 2 Type II","AES-256 encrypted"].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <Check size={11} className="text-[#10B981]" /> {t}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}

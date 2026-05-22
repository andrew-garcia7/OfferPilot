import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Shield, BarChart3, ChevronDown, Star } from "lucide-react";
import CompanyChip from "../components/common/CompanyChip";
import { PRICING_COMPANIES } from "../data/companyBrands";
import { motion, useInView } from "framer-motion";
import Footer from "../components/landing/Footer";
import { PRICING_PLANS, type PricingPlan } from "../data/pricingPlans";
import { PricingCard } from "../components/pricing/PricingCard";
import { openPlanCheckout } from "../lib/paymentFlow";

function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return val;
}

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. There are no long-term commitments. You can cancel your subscription at any time and retain access until the end of your billing period." },
  { q: "Is there a free trial for Pro?", a: "Yes — all new users get a 7-day free trial of Pro. No credit card required to start." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and Apple/Google Pay." },
  { q: "Do you offer student discounts?", a: "Absolutely. Students with a valid .edu email get 40% off any paid plan. Reach out to support to redeem." },
  { q: "How is OfferPilot different from just practicing on LeetCode?", a: "OfferPilot combines behavioral + technical + resume in one platform. Our AI simulates the full interview experience — not just coding — and gives structured feedback on communication, problem-solving approach, and job-fit alignment." },
];

const TESTIMONIALS = [
  {
    quote: "I went from bombing every technical screen to 3 offers in 6 weeks. The AI feedback is scary accurate — it caught that I say 'um' 40+ times per session.",
    name: "Alex W.", role: "SWE → Google L5", avatar: "AW", avatarImg: 11,
    bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", stars: 5,
  },
  {
    quote: "The ROI is unreal. I paid $228 for a full year and got a $45K raise. My subscription paid for itself 197 times over.",
    name: "Priya M.", role: "Sr. SWE → Staff Eng, Meta", avatar: "PM", avatarImg: 3,
    bg: "linear-gradient(135deg,#EC4899,#8B5CF6)", stars: 5,
  },
  {
    quote: "I thought prep was just LeetCode. OfferPilot exposed that I was failing on behavioral — and fixed it in 3 weeks. Director offer at Shopify.",
    name: "Jordan K.", role: "PM → Director, Shopify", avatar: "JK", avatarImg: 5,
    bg: "linear-gradient(135deg,#10B981,#6366F1)", stars: 5,
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const roiRef = useRef<HTMLDivElement>(null);
  const roiInView = useInView(roiRef, { once: true });

  const salaryCount = useCountUp(28400, roiInView, 1800);
  const roiCount = useCountUp(124, roiInView, 1800);
  const costCount = useCountUp(228, roiInView, 1800);

  const handlePurchase = async (plan: PricingPlan) => {
    try {
      const checkoutPlanId = plan.id === "free" ? "pro" : plan.id;
      await openPlanCheckout(checkoutPlanId, yearly, {
        onSuccess: ({ paymentId, orderId, planId, yearly: annualCycle }) => {
          navigate(
            `/payment/success?payment_id=${encodeURIComponent(paymentId)}&order_id=${encodeURIComponent(orderId)}&plan=${encodeURIComponent(planId)}&cycle=${annualCycle ? "yearly" : "monthly"}`
          );
        },
        onFailure: () => navigate("/payment/failure"),
      });
    } catch {
      navigate("/payment/failure");
    }
  };

  return (
    <div className="op-dark-page op-pricing-page min-h-screen" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)", paddingTop: "80px" }}>

      {/* ← Back / ✕ Close nav */}
      <div className="flex items-center justify-between max-w-6xl mx-auto px-6 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: "var(--theme-muted)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--theme-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--theme-muted)")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <button onClick={() => navigate("/")} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ color: "var(--theme-muted)", background: "color-mix(in srgb, var(--theme-text) 8%, transparent)" }} onMouseEnter={e => (e.currentTarget.style.color = "var(--theme-text)")} onMouseLeave={e => (e.currentTarget.style.color = "var(--theme-muted)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Hero — cinematic */}
      <section className="relative text-center py-32 px-6 overflow-hidden" style={{ minHeight: "520px" }}>
        {/* Background image: professional growth / career workspace */}
        <img
          src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(5,5,20,0.70) 0%, rgba(10,10,35,0.88) 100%)" }} />
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.22, 0.36, 0.22] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{ background: "radial-gradient(ellipse at center, #6366F1 0%, #8B5CF6 38%, transparent 68%)" }} />
        </motion.div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--theme-bg))" }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border backdrop-blur-sm"
            style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)", color: "#818CF8" }}>
            <Zap size={14} />
            7-day free trial on Pro — no card needed
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Invest in your next<br />
            <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              $30,000 raise
            </span>
          </h1>
          <p className="text-xl text-white/55 max-w-xl mx-auto mb-10">
            OfferPilot users average a <strong className="text-white/80">$28,400</strong> salary increase within 90 days of landing their new role.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 rounded-2xl"
            style={{ background: "color-mix(in srgb, var(--theme-surface) 82%, transparent)", backdropFilter: "blur(12px)", border: "1px solid var(--theme-border)" }}>
            <button onClick={() => setYearly(false)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={!yearly ? { background: "#6366F1", color: "white" } : { color: "rgba(255,255,255,0.4)" }}>
              Monthly
            </button>
            <button onClick={() => setYearly(true)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={yearly ? { background: "#6366F1", color: "white" } : { color: "rgba(255,255,255,0.4)" }}>
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}>Save 40%</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Company trust strip — marquee chips */}
      <section className="py-12 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: "rgba(255,255,255,0.22)" }}>
          Trusted by engineers at the world's top companies
        </p>
        {/* Marquee row */}
        <div className="relative">
          <div className="marquee-track flex gap-4 whitespace-nowrap" style={{ width: "max-content" }}>
            {[...PRICING_COMPANIES, ...PRICING_COMPANIES, ...PRICING_COMPANIES].map((co, i) => (
              <motion.div
                key={`${co.slug}-${i}`}
                whileHover={{ y: -6, scale: 1.04 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CompanyChip brand={co} className="rounded-2xl" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan, i) => {
            const wrapperClass = plan.id === "pro" ? "conic-border-wrap" : plan.id === "free" ? "conic-border-wrap-green" : "conic-border-wrap-pink";
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={wrapperClass}
              >
                <PricingCard plan={plan} yearly={yearly} onSelect={handlePurchase} />
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-[#6366F1]" />
              <span className="font-bold text-white">Enterprise</span>
            </div>
            <p className="text-sm text-white/50">Custom seats, SSO, HRIS integrations, dedicated success manager, and SLA-backed uptime for teams of 20+.</p>
          </div>
          <a href="mailto:enterprise@offerpilot.ai"
            className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 transition-all whitespace-nowrap">
            Contact sales →
          </a>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">What our users say</h2>
          <p className="text-white/40 text-sm">Real results from real job seekers.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p className="text-white/70 text-sm leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0" style={{ background: t.bg }}>
                  <img src={`https://i.pravatar.cc/80?img=${t.avatarImg}`} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div ref={roiRef} className="rounded-2xl p-8"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)" }}>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-[#6366F1]" size={24} />
            <h2 className="text-2xl font-bold text-white">ROI Calculator</h2>
          </div>
          <p className="text-white/50 text-sm mb-6">See how OfferPilot pays for itself — before your first interview.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Avg salary increase", display: `$${salaryCount.toLocaleString()}`, sub: "after 90 days" },
              { label: "OfferPilot Pro cost", display: `$${costCount}`, sub: "for full year" },
              { label: "Your ROI", display: `${roiCount}×`, sub: "return on investment" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-5 text-center"
                style={{ background: "color-mix(in srgb, var(--theme-text) 6%, var(--theme-surface))", border: "1px solid var(--theme-border)" }}>
                <div className="text-3xl font-black text-white mb-1">{item.display}</div>
                <div className="text-xs text-white/40">{item.label}</div>
                <div className="text-xs text-white/25 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden"
              style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left flex items-center justify-between px-6 py-4 text-white/80 hover:text-white transition-colors">
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown size={16} style={{ transition: "transform 300ms", transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)" }} />
              </button>
              <div style={{ maxHeight: openFaq === i ? "400px" : "0", overflow: "hidden", transition: "max-height 350ms cubic-bezier(.16,1,.3,1)" }}>
                <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.3)", color: "#34D399" }}>
            7-day free trial · No credit card required
          </div>
          <h2 className="text-5xl font-black text-white mb-4 leading-tight">Ready to land<br />the offer?</h2>
          <p className="text-white/50 mb-8 text-lg">Join 47,000+ professionals who used OfferPilot to get hired faster and earn more.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/resume-optimizer">
              <button className="px-10 py-4 rounded-2xl text-base font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 16px 48px rgba(99,102,241,0.4)" }}>
                Start free trial →
              </button>
            </Link>
            <Link to="/success-stories">
              <button className="px-8 py-4 rounded-2xl text-base font-semibold transition border"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", backgroundColor: "transparent" }}>
                Read success stories
              </button>
            </Link>
          </div>
          <p className="text-white/25 text-xs mt-6">Average user lands offer in 6.2 weeks · $28,400 avg salary increase</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}

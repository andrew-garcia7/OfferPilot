import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Zap, Target, Users, TrendingUp, ArrowRight, CheckCircle } from "lucide-react";
import Footer from "../components/landing/Footer";

const PRESS = ["TechCrunch", "Forbes", "Product Hunt", "YC News", "The Verge", "Wired"];
const INVESTORS = ["Sequoia Scout", "a16z Seed", "Y Combinator", "First Round"];

const TEAM = [
  {
    name: "Arjun Desai", role: "CEO & Co-founder", bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", avatar: "AD", avatarImg: 33,
    bio: "Ex-Google PM. Led hiring for 3 engineering teams. Interviewed 500+ candidates before building the tool he wished existed.",
  },
  {
    name: "Maya Kim", role: "CTO & Co-founder", bg: "linear-gradient(135deg,#8B5CF6,#EC4899)", avatar: "MK", avatarImg: 44,
    bio: "Ex-Meta Staff Engineer. MS CS Stanford. Built the original AI scoring engine from scratch in 90 days.",
  },
  {
    name: "Luca Moretti", role: "Head of AI/ML", bg: "linear-gradient(135deg,#10B981,#6366F1)", avatar: "LM", avatarImg: 52,
    bio: "PhD NLP from CMU. Spent 4 years at OpenAI before joining to build OfferPilot's proprietary language models.",
  },
  {
    name: "Zoe Nakamura", role: "Head of Product", bg: "linear-gradient(135deg,#F59E0B,#EC4899)", avatar: "ZN", avatarImg: 65,
    bio: "Ex-LinkedIn PM. Obsessed with the job seeker experience. Redesigned onboarding flow that cut churn by 62%.",
  },
];

const TIMELINE = [
  { year: "2022", label: "Founded", desc: "Three YC applicants get rejected. Decide to build the prep tool that should have existed years ago." },
  { year: "Q2 2023", label: "First 1,000 users", desc: "Shipped MVP in 8 weeks. First cohort of 1,000 beta users lands offers — avg $31K salary bump." },
  { year: "Q4 2023", label: "Seed round closed", desc: "$3.8M seed led by Sequoia Scout Fund. Expanded team to 12 and launched real-time AI scoring." },
  { year: "2024", label: "47K+ users hired", desc: "Launched mobile, coding simulator, and resume builder. Crossed 47,000 users who got hired using OfferPilot." },
  { year: "2025 →", label: "What's next", desc: "Enterprise tier, team prep mode, and live AI interviews with voice + video analysis. Building the future of hiring." },
];

const STATS = [
  { value: "47,000+", label: "Professionals hired", Icon: Users },
  { value: "$28,400", label: "Avg salary increase", Icon: TrendingUp },
  { value: "91%", label: "Interview pass rate", Icon: Target },
  { value: "3", label: "Years building", Icon: Zap },
];

function useCountUp(target: number, duration = 1800, inView = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return val;
}

export default function About() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  return (
    <div className="op-dark-page op-about-page min-h-screen" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)", paddingTop: "80px" }}>

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

      {/* Mission hero — cinematic */}
      <section className="relative py-32 px-6 text-center overflow-hidden" style={{ minHeight: "520px" }}>
        {/* Background image: modern startup team */}
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        {/* Dark cinematic overlay */}
        <div className="op-about-hero-overlay absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, color-mix(in srgb, var(--theme-bg) 35%, transparent) 0%, color-mix(in srgb, var(--theme-bg) 58%, transparent) 100%)" }} />
        {/* Animated purple glow pulse */}
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

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="op-about-hero-copy relative max-w-3xl mx-auto rounded-3xl px-5 py-6 md:px-8 md:py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border backdrop-blur-sm"
            style={{ background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)", color: "#818CF8" }}>
            <Zap size={14} />
            On a mission to close the interview gap
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight" style={{ color: "#F8FAFC", textShadow: "0 2px 10px rgba(15,23,42,0.28)" }}>
            The best candidate shouldn't<br />lose to the<br />
            <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              best-prepared candidate.
            </span>
          </h1>
          <p className="text-xl leading-relaxed" style={{ color: "rgba(241,245,249,0.92)", textShadow: "0 1px 8px rgba(15,23,42,0.22)" }}>
            Millions of talented people get passed over every year — not because they can't do the job, but because they haven't been trained to perform in a 45-minute loop. We're changing that.
          </p>
        </motion.div>
      </section>

      {/* Press / investor strip */}
      <section className="py-10 overflow-hidden" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>As featured in</p>
              <div className="flex flex-wrap gap-6 items-center">
                {PRESS.map(p => (
                  <span key={p} className="text-sm font-black tracking-tight" style={{ color: "rgba(255,255,255,0.15)" }}>{p}</span>
                ))}
              </div>
            </div>
            <div className="h-px sm:h-12 sm:w-px w-full" style={{ background: "rgba(255,255,255,0.07)" }} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>Backed by</p>
              <div className="flex flex-wrap gap-6 items-center">
                {INVESTORS.map(inv => (
                  <span key={inv} className="text-sm font-black tracking-tight" style={{ color: "rgba(255,255,255,0.15)" }}>{inv}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 relative overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06), rgba(236,72,153,0.03))" }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 24 }} animate={statsInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "rgba(99,102,241,0.15)" }}>
                  <s.Icon size={18} className="text-[#818CF8]" />
                </div>
                <div className="text-3xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder story */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-8 md:p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))", border: "1px solid rgba(99,102,241,0.25)", borderLeft: "3px solid #7C3AED" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, #8B5CF6 0%, transparent 70%)", transform: "translate(30%,-30%)" }} />
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              <img src="https://i.pravatar.cc/120?img=33" alt="Arjun Desai" className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div>
              <div className="text-sm text-white/30 uppercase tracking-widest mb-2">Founder's note</div>
              <h2 className="text-2xl font-bold text-white mb-4">Why we built this</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                I spent four years at Google reviewing hundreds of candidate loops. I watched smart, talented engineers fail — not on the technical content, but on the way they structured their thinking, the cadence of their explanations, the confidence in their voice. These are learnable skills. Nobody teaches them.
              </p>
              <p className="text-white/60 leading-relaxed mb-4">
                I left Google in 2022 with a simple question: what if every job seeker had access to the same caliber of prep that FAANG employees give to friends preparing for interviews? OfferPilot is that answer — AI-powered, data-driven, and ruthlessly focused on outcomes.
              </p>
              <p className="text-white/40 text-sm font-medium">— Arjun Desai, CEO & Co-founder</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-2">The team</h2>
        <p className="text-white/40 text-center mb-10">Ex-Google, Meta, Stanford, CMU. Obsessed with hiring outcomes.</p>
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {TEAM.map((member, i) => (
            <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8, boxShadow: "0 0 0 1px rgba(139,92,246,0.35), 0 20px 50px rgba(139,92,246,0.15)" }}
              className="magnetic-card rounded-2xl p-6 text-center transition-all cursor-default"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)" }}>
              <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4" style={{ background: member.bg }}>
                <img src={`https://i.pravatar.cc/120?img=${member.avatarImg}`} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="font-bold text-white mb-0.5">{member.name}</div>
              <div className="text-xs text-[#8B5CF6] mb-3">{member.role}</div>
              <p className="text-xs text-white/40 leading-relaxed">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Our journey</h2>
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: "rgba(99,102,241,0.25)" }} />
          <div className="space-y-8">
            {TIMELINE.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="pl-20 relative">
                <div className="absolute left-4 top-1 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)" }}>
                  <CheckCircle size={16} className="text-[#6366F1]" />
                </div>
                <div className="text-xs text-[#8B5CF6] font-bold mb-1">{item.year}</div>
                <div className="font-bold text-white mb-1">{item.label}</div>
                <p className="text-sm text-white/50">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">Come fly with us.</h2>
          <p className="text-white/50 mb-8">Join 47,000+ professionals who trust OfferPilot to help them land the offers they deserve.</p>
          <Link to="/register">
            <button className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 12px 40px rgba(99,102,241,0.35)" }}>
              Start for free <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { Star, TrendingUp, MapPin, ArrowRight, Quote } from "lucide-react";
import Footer from "../components/landing/Footer";
import CompanyChip from "../components/common/CompanyChip";
import {
  SUCCESS_STORIES_ROW1,
  SUCCESS_STORIES_ROW2,
} from "../data/companyBrands";

const CATEGORIES = ["All", "Software Engineering", "Product", "Data Science", "Design", "Marketing"];

const STORIES = [
  {
    name: "Priya Menon", role: "SWE II → Senior SWE", company: "Meta", location: "Seattle, WA",
    category: "Software Engineering", before: 145000, after: 210000, time: "11 weeks", avatar: "PM", avatarImg: 3,
    avatarBg: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    quote: "I failed 3 FAANG loops before OfferPilot. The AI feedback on my system design explanations was exactly what I was missing. Passed my Meta loop first try.",
    tags: ["System Design", "Behavioral", "LeetCode"],
  },
  {
    name: "Jordan Lee", role: "PM → Sr. PM", company: "Google", location: "New York, NY",
    category: "Product", before: 168000, after: 248000, time: "8 weeks", avatar: "JL", avatarImg: 5,
    avatarBg: "linear-gradient(135deg,#EC4899,#8B5CF6)",
    quote: "My product sense interviews were weak — I was too technical and not user-centric enough. OfferPilot's behavioral AI caught that pattern in week 1.",
    tags: ["Product Sense", "Strategy", "Executive Presence"],
  },
  {
    name: "Marcus Chen", role: "Data Analyst → Staff DS", company: "Stripe", location: "San Francisco, CA",
    category: "Data Science", before: 132000, after: 198000, time: "14 weeks", avatar: "MC", avatarImg: 8,
    avatarBg: "linear-gradient(135deg,#10B981,#6366F1)",
    quote: "The mock ML system design rounds exposed every gap in my knowledge. I'd literally practice the same scenario 6 times until I sounded like a staff engineer.",
    tags: ["ML Design", "Case Studies", "SQL"],
  },
  {
    name: "Aisha Okonkwo", role: "Jr. Designer → Lead UX", company: "Airbnb", location: "Remote",
    category: "Design", before: 110000, after: 175000, time: "10 weeks", avatar: "AO", avatarImg: 12,
    avatarBg: "linear-gradient(135deg,#F59E0B,#EC4899)",
    quote: "The resume builder alone got me through 3 more ATS filters than before. But it was the portfolio presentation mock that really leveled me up.",
    tags: ["Portfolio Review", "Resume ATS", "Storytelling"],
  },
  {
    name: "Ryan Patel", role: "Marketing Mgr → Director", company: "Shopify", location: "Austin, TX",
    category: "Marketing", before: 98000, after: 162000, time: "7 weeks", avatar: "RP", avatarImg: 15,
    avatarBg: "linear-gradient(135deg,#6366F1,#EC4899)",
    quote: "I had zero idea how to structure a marketing leadership case interview. OfferPilot's AI gave detailed feedback on my frameworks after every session.",
    tags: ["Case Interviews", "Leadership", "GTM Strategy"],
  },
  {
    name: "Sofia Rodriguez", role: "SWE → Staff Engineer", company: "Netflix", location: "Los Angeles, CA",
    category: "Software Engineering", before: 198000, after: 310000, time: "16 weeks", avatar: "SR", avatarImg: 20,
    avatarBg: "linear-gradient(135deg,#8B5CF6,#10B981)",
    quote: "Staff-level loops are completely different. The cross-functional influence questions destroyed me in practice until the AI helped me reframe my stories.",
    tags: ["Staff Design", "Leadership", "Distributed Systems"],
  },
];

const STATS = [
  { value: "47,000+", label: "Professionals hired" },
  { value: "$28,400", label: "Avg. salary increase" },
  { value: "91%", label: "Interview pass rate" },
  { value: "6.2 weeks", label: "Avg. time to offer" },
];

export default function SuccessStories() {
  const navigate = useNavigate();
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? STORIES : STORIES.filter(s => s.category === active);
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });

  return (
    <div className="op-dark-page op-success-page min-h-screen" style={{ backgroundColor: "var(--theme-bg)", color: "var(--theme-text)", paddingTop: "80px" }}>

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
      <section className="relative py-32 text-center px-6 overflow-hidden" style={{ minHeight: "500px" }}>
        {/* Background image: professionals celebrating / career success */}
        <img
          src="https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1920&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(5,5,20,0.68) 0%, rgba(10,10,35,0.88) 100%)" }} />
        {/* Animated glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.20, 0.34, 0.20] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px]"
            style={{ background: "radial-gradient(ellipse at center, #8B5CF6 0%, #6366F1 38%, transparent 68%)" }} />
        </motion.div>
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--theme-bg))" }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border backdrop-blur-sm"
            style={{ background: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.4)", color: "#A78BFA" }}>
            <Star size={14} fill="currentColor" />
            Real people. Real results.
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight tracking-tight">
            They got the offer.<br />
            <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              You're next.
            </span>
          </h1>
          <p className="text-xl text-white/55 max-w-xl mx-auto">
            Stories from professionals who used OfferPilot to land roles at top companies and negotiate life-changing salaries.
          </p>
        </motion.div>
      </section>

      {/* Stats strip — full bleed */}
      <section ref={statsRef} className="py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08), rgba(236,72,153,0.05))", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((s, i) => (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 20 }} animate={statsInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
                className="text-center">
                <div className="text-4xl font-black mb-1" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActive(c)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={active === c
                ? { background: "linear-gradient(135deg,#6366F1,#8B5CF6)", border: "1px solid rgba(99,102,241,0.6)", color: "white", boxShadow: "0 0 14px rgba(99,102,241,0.4)", transform: "scale(1.03)" }
                : { background: "var(--theme-surface)", border: "1px solid var(--theme-border)", color: "var(--theme-muted)" }}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Stories grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((s, i) => (
            <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              whileHover={{ y: -8, scale: 1.01, boxShadow: "0 0 0 1px rgba(139,92,246,0.4), 0 24px 60px rgba(139,92,246,0.18)" }}
              className="magnetic-card rounded-2xl p-6 flex flex-col cursor-default transition-all"
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
              }}
              style={{ background: "var(--theme-surface)", border: "1px solid var(--theme-border)", borderRadius: "20px" }}>

              {/* Header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ background: s.avatarBg }}>
                  <img src={`https://i.pravatar.cc/80?img=${s.avatarImg}`} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={10} />{s.location}
                  </div>
                </div>
                <div className="ml-auto shrink-0 flex">
                  {[...Array(5)].map((_, j) => <Star key={j} size={11} className="text-yellow-400" fill="currentColor" />)}
                </div>
              </div>

              <div className="text-xs text-white/30 uppercase tracking-widest mb-1">{s.category}</div>
              <div className="font-semibold text-white/80 text-sm mb-1">{s.role}</div>
              <div className="text-xs text-white/40 mb-5">@ {s.company}</div>

              {/* Salary jump */}
              <div className="p-3 rounded-xl mb-5" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <div className="flex items-center justify-between text-xs text-white/40 mb-2">
                  <span className="font-semibold text-white/60">${(s.before / 1000).toFixed(0)}K</span>
                  <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[#10B981]" /> +${Math.round((s.after - s.before) / 1000)}K raise</span>
                  <span className="font-bold text-[#10B981]">${(s.after / 1000).toFixed(0)}K</span>
                </div>
                {/* Animated salary bar */}
                <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="salary-bar h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((s.after - s.before) / s.after) * 100 + 40)}%`,
                      background: "linear-gradient(90deg, #6366F1, #10B981)",
                    }}
                  />
                </div>
              </div>

              <p className="text-sm text-white/60 leading-relaxed mb-5 flex-1">"{s.quote}"</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {s.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>{t}</span>
                ))}
              </div>

              <div className="text-xs text-white/25">Hired in {s.time}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Companies strip — marquee */}
      <section className="pb-16 overflow-hidden">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-semibold uppercase tracking-widest mb-8"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Our users now work at
        </motion.p>

        {/* Row 1 — forward */}
        <div className="relative mb-3">
          <div className="marquee-track flex gap-3 whitespace-nowrap py-1.5" style={{ width: "max-content" }}>
            {[...SUCCESS_STORIES_ROW1, ...SUCCESS_STORIES_ROW1, ...SUCCESS_STORIES_ROW1].map((co, i) => (
              <CompanyChip key={`${co.slug}-${i}`} brand={co} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to right, var(--theme-bg), transparent)" }} />
          <div className="absolute inset-y-0 right-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to left, var(--theme-bg), transparent)" }} />
        </div>

        {/* Row 2 — reverse */}
        <div className="relative">
          <div className="marquee-track2 flex gap-3 whitespace-nowrap py-1.5" style={{ width: "max-content" }}>
            {[...SUCCESS_STORIES_ROW2, ...SUCCESS_STORIES_ROW2, ...SUCCESS_STORIES_ROW2].map((co, i) => (
              <CompanyChip key={`${co.slug}-${i}`} brand={co} />
            ))}
          </div>
          <div className="absolute inset-y-0 left-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to right, var(--theme-bg), transparent)" }} />
          <div className="absolute inset-y-0 right-0 w-12 pointer-events-none" style={{ background: "linear-gradient(to left, var(--theme-bg), transparent)" }} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #8B5CF6 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto text-center">
          <Quote size={32} className="mx-auto mb-6" style={{ color: "rgba(99,102,241,0.4)" }} />
          <h2 className="text-5xl font-black text-white mb-4 leading-tight">Write your<br />own story.</h2>
          <p className="text-white/50 mb-8 text-lg">Join 47,000+ professionals and start landing the interviews you deserve.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register">
              <button className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 16px 48px rgba(99,102,241,0.4)" }}>
                Start free today <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/pricing">
              <button className="px-8 py-4 rounded-2xl text-base font-semibold transition border"
                style={{ borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", backgroundColor: "transparent" }}>
                View pricing
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

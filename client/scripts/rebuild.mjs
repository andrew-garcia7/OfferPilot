import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pages = resolve(__dirname, "../src/pages");
const src = resolve(__dirname, "../src");
const components = resolve(__dirname, "../src/components");

function w(path, content) { writeFileSync(path, content); console.log("✅", path.split("\\").pop()); }

// ─────────────────────────────────────────────────────────────────────────────
// 1. App.tsx — with auth guard + 4 new routes
// ─────────────────────────────────────────────────────────────────────────────
w(resolve(src, "App.tsx"), `import { Navigate, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Landing from "./pages/Landing";
import NewInterview from "./pages/NewInterview";
import InterviewRoom from "./pages/InterviewRoom";
import Coding from "./pages/Coding";
import Resume from "./pages/Resume";
import History from "./pages/History";
import Protocols from "./pages/Protocols";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PricingPage from "./pages/PricingPage";
import SuccessStories from "./pages/SuccessStories";
import Blog from "./pages/Blog";
import About from "./pages/About";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/success-stories" element={<SuccessStories />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/protocols" element={<Protocols />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/new" element={<ProtectedRoute><NewInterview /></ProtectedRoute>} />
        <Route path="/room/:id" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><Resume /></ProtectedRoute>} />
        <Route path="/coding" element={<ProtectedRoute><Coding /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. Navbar.tsx — fix NAV_LINKS to real routes
// ─────────────────────────────────────────────────────────────────────────────
w(resolve(components, "Navbar.tsx"), `import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  FileText, Mic, Code2, Target, BarChart3, Map,
  ChevronDown, Menu, X, Zap, LogOut, User
} from "lucide-react";

const FEATURES_MENU = [
  { icon: FileText, label: "Resume Builder",       desc: "ATS-optimized in seconds",          to: "/resume" },
  { icon: Mic,      label: "Interview Simulator",   desc: "Practice interviews that feel real", to: "/new" },
  { icon: Target,   label: "JD Matcher",            desc: "Know your fit before you apply",     to: "/new" },
  { icon: Code2,    label: "Coding Simulator",      desc: "Ace the coding round every time",    to: "/coding" },
  { icon: BarChart3,label: "ATS Analyzer",          desc: "Beat the applicant filter",          to: "/resume" },
  { icon: Map,      label: "AI Career Roadmap",     desc: "Your path to L5 and beyond",         to: "/new" },
];

const NAV_LINKS = [
  { label: "Pricing",         to: "/pricing" },
  { label: "Success Stories", to: "/success-stories" },
  { label: "Blog",            to: "/blog" },
  { label: "About",           to: "/about" },
];

export default function Navbar() {
  const loc = useLocation();
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen,   setMegaOpen]   = useState(false);
  const [user,       setUser]       = useState<string | null>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem("user"));
  }, [loc]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openMega  = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMegaOpen(true); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setMegaOpen(false), 120); };
  const logout    = () => { localStorage.removeItem("user"); setUser(null); };

  return (
    <>
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={\`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 lg:px-12 transition-all duration-200 \${
          scrolled
            ? "h-[60px] bg-[rgba(15,15,20,0.88)] backdrop-blur-[20px] border-b border-white/[0.08] shadow-xl shadow-black/20"
            : "h-[72px] bg-transparent"
        }\`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" className="group-hover:scale-105 transition-transform duration-200">
            <rect width="34" height="34" rx="9" fill="#6366F1"/>
            <path d="M8 17 L26 8 L20 26 L16 20 L8 17Z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
            <path d="M16 20 L20 16" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span className="text-white font-extrabold text-[17px] tracking-[-0.02em] select-none">
            Offer<span className="text-[#8B5CF6]">Pilot</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          <div ref={megaRef} className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/80 hover:text-white rounded-xl hover:bg-white/5 transition-all link-sweep">
              Features
              <ChevronDown size={14} className={\`transition-transform duration-200 \${megaOpen ? "rotate-180" : ""}\`} />
            </button>
            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onMouseEnter={openMega} onMouseLeave={closeMega}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[520px] bg-[#16161F] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-4 grid grid-cols-2 gap-1"
                >
                  {FEATURES_MENU.map(({ icon: Icon, label, desc, to }) => (
                    <Link key={label} to={to} onClick={() => setMegaOpen(false)}
                      className="flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-all group/item"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#6366F1]/15 flex items-center justify-center shrink-0 group-hover/item:bg-[#6366F1]/25 transition-colors">
                        <Icon size={17} className="text-[#8B5CF6]" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-white/90 leading-tight">{label}</div>
                        <div className="text-[11px] text-white/40 mt-0.5">{desc}</div>
                      </div>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}
              className={\`px-4 py-2 text-sm font-medium rounded-xl hover:bg-white/5 transition-all link-sweep \${
                loc.pathname === to ? "text-white" : "text-white/80 hover:text-white"
              }\`}
            >{label}</Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8">
                <User size={14} className="text-[#8B5CF6]" />
                <span className="text-sm text-white/70 max-w-[100px] truncate">{user}</span>
              </div>
              <button onClick={logout} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors">
                <LogOut size={14} />
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition-colors">Log in</Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558e8] hover:to-[#7c3aed] shadow-lg shadow-[#6366F1]/30 hover:shadow-[#6366F1]/50 transition-all glow-pulse">
                  <Zap size={14} />
                  Get Started →
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="lg:hidden p-2 text-white/80 hover:text-white transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-0 top-0 z-[999] bg-[#0F0F14]/97 backdrop-blur-xl flex flex-col px-6 pt-20 pb-8 overflow-y-auto"
          >
            <button onClick={() => setMobileOpen(false)} className="absolute top-5 right-5 text-white/60 hover:text-white"><X size={24} /></button>

            <div className="space-y-1 mb-6">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Features</p>
              {FEATURES_MENU.map(({ icon: Icon, label, to }) => (
                <Link key={label} to={to} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/5 text-white/80 hover:text-white transition-all"
                >
                  <Icon size={18} className="text-[#8B5CF6]" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            <div className="space-y-1 border-t border-white/8 pt-6 mb-8">
              {NAV_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >{label}</Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              {user ? (
                <button onClick={() => { logout(); setMobileOpen(false); }}
                  className="w-full py-3 text-center text-sm font-medium text-white/70 hover:text-white border border-white/10 rounded-xl transition-all"
                >Log out ({user})</button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-3 text-center text-sm font-medium text-white/70 hover:text-white border border-white/10 rounded-xl transition-all">Log in</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-3.5 text-center text-sm font-bold text-white bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-[#6366F1]/30">Get Started Free →</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 3. PricingPage.tsx
// ─────────────────────────────────────────────────────────────────────────────
w(resolve(pages, "PricingPage.tsx"), `import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, X, Zap, Shield, BarChart3, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

const TIERS = [
  {
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    desc: "Perfect for getting started",
    badge: null,
    color: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)",
    cta: "Start for free",
    ctaTo: "/register",
    ctaStyle: { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8" },
    features: [
      { text: "3 mock interviews / month", yes: true },
      { text: "Resume upload & basic scan", yes: true },
      { text: "5 coding challenges", yes: true },
      { text: "Basic feedback report", yes: true },
      { text: "AI scoring", yes: false },
      { text: "Full analytics dashboard", yes: false },
      { text: "Salary negotiation scripts", yes: false },
      { text: "Priority support", yes: false },
    ],
  },
  {
    name: "Pro",
    price: { monthly: 19, yearly: 15 },
    desc: "For serious job seekers",
    badge: "Most Popular",
    color: "linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%)",
    border: "rgba(99,102,241,0.5)",
    cta: "Start Pro trial",
    ctaTo: "/register",
    ctaStyle: { background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 8px 32px rgba(99,102,241,0.35)" },
    features: [
      { text: "Unlimited mock interviews", yes: true },
      { text: "Advanced resume builder (ATS)", yes: true },
      { text: "All 50+ coding challenges", yes: true },
      { text: "Full AI scoring + feedback", yes: true },
      { text: "Personalized improvement plan", yes: true },
      { text: "Analytics dashboard", yes: true },
      { text: "Salary negotiation scripts", yes: false },
      { text: "Priority support", yes: false },
    ],
  },
  {
    name: "Premium",
    price: { monthly: 39, yearly: 29 },
    desc: "For landing FAANG & top-tier roles",
    badge: "Best Value",
    color: "linear-gradient(160deg, rgba(236,72,153,0.08) 0%, rgba(139,92,246,0.12) 100%)",
    border: "rgba(236,72,153,0.4)",
    cta: "Go Premium",
    ctaTo: "/register",
    ctaStyle: { background: "linear-gradient(135deg, #EC4899, #8B5CF6)", boxShadow: "0 8px 32px rgba(236,72,153,0.3)" },
    features: [
      { text: "Everything in Pro", yes: true },
      { text: "Live mock with AI interviewer", yes: true },
      { text: "Company-specific prep (FAANG)", yes: true },
      { text: "Offer letter review & negotiation", yes: true },
      { text: "1-on-1 career coach session (monthly)", yes: true },
      { text: "Salary negotiation scripts + scripts", yes: true },
      { text: "Analytics dashboard", yes: true },
      { text: "Priority 24/7 support", yes: true },
    ],
  },
];

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. There are no long-term commitments. You can cancel your subscription at any time and retain access until the end of your billing period." },
  { q: "Is there a free trial for Pro?", a: "Yes — all new users get a 7-day free trial of Pro. No credit card required to start." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards (Visa, Mastercard, Amex), PayPal, and Apple/Google Pay." },
  { q: "Do you offer student discounts?", a: "Absolutely. Students with a valid .edu email get 40% off any paid plan. Reach out to support to redeem." },
  { q: "How is OfferPilot different from just practicing on LeetCode?", a: "OfferPilot combines behavioral + technical + resume in one platform. Our AI simulates the full interview experience — not just coding — and gives structured feedback on communication, problem-solving approach, and job-fit alignment." },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F0F14", color: "#F1F5F9", paddingTop: "80px" }}>

      {/* ── HERO ── */}
      <section className="text-center py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20" style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)", color: "#818CF8" }}>
            <Zap size={14} />
            7-day free trial on Pro — no card needed
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-[1.1] tracking-tight">
            Invest in your next<br />
            <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              $30,000 raise
            </span>
          </h1>
          <p className="text-xl text-white/50 max-w-xl mx-auto mb-10">
            OfferPilot users average a <strong className="text-white/80">$28,400</strong> salary increase within 90 days of landing their new role.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-2xl" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)" }}>
            <button onClick={() => setYearly(false)} className="px-5 py-2 rounded-xl text-sm font-semibold transition-all" style={!yearly ? { background: "#6366F1", color: "white" } : { color: "rgba(255,255,255,0.4)" }}>Monthly</button>
            <button onClick={() => setYearly(true)} className="px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2" style={yearly ? { background: "#6366F1", color: "white" } : { color: "rgba(255,255,255,0.4)" }}>
              Yearly
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "rgba(16,185,129,0.15)", color: "#34D399" }}>Save 22%</span>
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── TIERS ── */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier, i) => (
            <motion.div key={tier.name}
              initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative rounded-2xl p-8 flex flex-col"
              style={{ background: tier.color, border: \`1px solid \${tier.border}\` }}
            >
              {tier.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
                  style={{ background: tier.name === "Pro" ? "linear-gradient(135deg,#6366F1,#8B5CF6)" : "linear-gradient(135deg,#EC4899,#8B5CF6)" }}>
                  {tier.badge}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-1">{tier.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-black text-white">\${yearly ? tier.price.yearly : tier.price.monthly}</span>
                  {tier.price.monthly > 0 && <span className="text-white/40 text-sm">/mo</span>}
                </div>
                {tier.price.monthly > 0 && yearly && (
                  <p className="text-xs text-white/30 mb-1">Billed annually — \${(yearly ? tier.price.yearly : tier.price.monthly) * 12}/yr</p>
                )}
                <p className="text-white/50 text-sm mb-8">{tier.desc}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {tier.features.map(f => (
                  <li key={f.text} className="flex items-center gap-3">
                    {f.yes
                      ? <Check size={16} className="text-[#10B981] shrink-0" />
                      : <X size={16} className="text-white/20 shrink-0" />}
                    <span className={\`text-sm \${f.yes ? "text-white/80" : "text-white/30 line-through"}\`}>{f.text}</span>
                  </li>
                ))}
              </ul>

              <Link to={tier.ctaTo}>
                <button className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90" style={tier.ctaStyle}>
                  {tier.cta}
                </button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Enterprise bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-8 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={18} className="text-[#6366F1]" />
              <span className="font-bold text-white">Enterprise</span>
            </div>
            <p className="text-sm text-white/50">Custom seats, SSO, HRIS integrations, dedicated success manager, and SLA-backed uptime for teams of 20+.</p>
          </div>
          <a href="mailto:enterprise@offerpilot.ai" className="shrink-0 px-6 py-3 rounded-xl text-sm font-semibold text-white/80 hover:text-white border border-white/10 hover:border-white/20 transition-all whitespace-nowrap">
            Contact sales →
          </a>
        </motion.div>
      </section>

      {/* ── ROI CALCULATOR ── */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)" }}>
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="text-[#6366F1]" size={24} />
            <h2 className="text-2xl font-bold text-white">ROI Calculator</h2>
          </div>
          <p className="text-white/50 text-sm mb-6">See how OfferPilot pays for itself — before your first interview.</p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Avg salary increase", value: "$28,400", sub: "after 90 days" },
              { label: "OfferPilot Pro cost", value: "$228", sub: "for full year" },
              { label: "Your ROI", value: "124×", sub: "return on investment" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-5 text-center" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-3xl font-black text-white mb-1">{item.value}</div>
                <div className="text-xs text-white/40">{item.label}</div>
                <div className="text-xs text-white/25 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-white text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="rounded-xl overflow-hidden" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left flex items-center justify-between px-6 py-4 text-white/80 hover:text-white transition-colors">
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown size={16} className={\`transition-transform duration-200 \${openFaq === i ? "rotate-180" : ""}\`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-sm text-white/50 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="text-center pb-24 px-6">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">Ready to land the offer?</h2>
          <p className="text-white/50 mb-8">Join 47,000+ professionals who used OfferPilot to get hired faster.</p>
          <Link to="/register">
            <button className="px-10 py-4 rounded-2xl text-base font-bold text-white" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 12px 40px rgba(99,102,241,0.35)" }}>
              Start your free trial →
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. SuccessStories.tsx
// ─────────────────────────────────────────────────────────────────────────────
w(resolve(pages, "SuccessStories.tsx"), `import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, TrendingUp, MapPin, ArrowRight } from "lucide-react";

const CATEGORIES = ["All", "Software Engineering", "Product", "Data Science", "Design", "Marketing"];

const STORIES = [
  { name: "Priya Menon", role: "SWE II → Senior SWE", company: "Meta", location: "Seattle, WA", category: "Software Engineering",
    before: 145000, after: 210000, time: "11 weeks", avatar: "PM",
    avatarBg: "linear-gradient(135deg,#6366F1,#8B5CF6)",
    quote: "I failed 3 FAANG loops before OfferPilot. The AI feedback on my system design explanations was exactly what I was missing. Passed my Meta loop first try.",
    tags: ["System Design", "Behavioral", "LeetCode"] },
  { name: "Jordan Lee", role: "PM → Sr. PM", company: "Google", location: "New York, NY", category: "Product",
    before: 168000, after: 248000, time: "8 weeks", avatar: "JL",
    avatarBg: "linear-gradient(135deg,#EC4899,#8B5CF6)",
    quote: "My product sense interviews were weak — I was too technical and not user-centric enough. OfferPilot's behavioral AI caught that pattern in week 1.",
    tags: ["Product Sense", "Strategy", "Executive Presence"] },
  { name: "Marcus Chen", role: "Data Analyst → Staff DS", company: "Stripe", location: "San Francisco, CA", category: "Data Science",
    before: 132000, after: 198000, time: "14 weeks", avatar: "MC",
    avatarBg: "linear-gradient(135deg,#10B981,#6366F1)",
    quote: "The mock ML system design rounds exposed every gap in my knowledge. I'd literally practice the same scenario 6 times until I sounded like a staff engineer.",
    tags: ["ML Design", "Case Studies", "SQL"] },
  { name: "Aisha Okonkwo", role: "Jr. Designer → Lead UX", company: "Airbnb", location: "Remote", category: "Design",
    before: 110000, after: 175000, time: "10 weeks", avatar: "AO",
    avatarBg: "linear-gradient(135deg,#F59E0B,#EC4899)",
    quote: "The resume builder alone got me through 3 more ATS filters than before. But it was the portfolio presentation mock that really leveled me up.",
    tags: ["Portfolio Review", "Resume ATS", "Storytelling"] },
  { name: "Ryan Patel", role: "Marketing Mgr → Director", company: "Shopify", location: "Austin, TX", category: "Marketing",
    before: 98000, after: 162000, time: "7 weeks", avatar: "RP",
    avatarBg: "linear-gradient(135deg,#6366F1,#EC4899)",
    quote: "I had zero idea how to structure a marketing leadership case interview. OfferPilot's AI gave detailed feedback on my frameworks after every session.",
    tags: ["Case Interviews", "Leadership", "GTM Strategy"] },
  { name: "Sofia Rodriguez", role: "SWE → Staff Engineer", company: "Netflix", location: "Los Angeles, CA", category: "Software Engineering",
    before: 198000, after: 310000, time: "16 weeks", avatar: "SR",
    avatarBg: "linear-gradient(135deg,#8B5CF6,#10B981)",
    quote: "Staff-level loops are completely different. The cross-functional influence questions destroyed me in practice until the AI helped me reframe my stories.",
    tags: ["Staff Design", "Leadership", "Distributed Systems"] },
];

const STATS = [
  { value: "47,000+", label: "Professionals hired" },
  { value: "$28,400", label: "Avg. salary increase" },
  { value: "91%", label: "Interview pass rate" },
  { value: "6.2 weeks", label: "Avg. time to offer" },
];

export default function SuccessStories() {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? STORIES : STORIES.filter(s => s.category === active);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F0F14", color: "#F1F5F9", paddingTop: "80px" }}>

      {/* Hero */}
      <section className="relative py-20 text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(ellipse, #8B5CF6 0%, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.3)", color: "#A78BFA" }}>
            <Star size={14} fill="currentColor" />
            Real people. Real results.
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-5 leading-tight tracking-tight">
            They got the offer.<br />
            <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              You're next.
            </span>
          </h1>
          <p className="text-xl text-white/50 max-w-xl mx-auto">Stories from professionals who used OfferPilot to land roles at top companies and negotiate life-changing salaries.</p>
        </motion.div>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-8 mt-14">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Category filter */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActive(c)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={active === c
                ? { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.5)", color: "#818CF8" }
                : { background: "#16161F", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
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
              className="rounded-2xl p-6 flex flex-col" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              
              {/* Header */}
              <div className="flex items-start gap-3 mb-5">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: s.avatarBg }}>
                  {s.avatar}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-white">{s.name}</div>
                  <div className="text-xs text-white/40 flex items-center gap-1.5 mt-0.5">
                    <MapPin size={10} />
                    {s.location}
                  </div>
                </div>
                <div className="ml-auto shrink-0">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-yellow-400" fill="currentColor" />)}
                  </div>
                </div>
              </div>

              {/* Role */}
              <div className="text-xs text-white/30 uppercase tracking-widest mb-1">{s.category}</div>
              <div className="font-semibold text-white/80 text-sm mb-1">{s.role}</div>
              <div className="text-xs text-white/40 mb-5">@ {s.company}</div>

              {/* Salary jump */}
              <div className="flex items-center gap-3 p-3 rounded-xl mb-5" style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <div className="text-center">
                  <div className="text-xs text-white/30 mb-0.5">Before</div>
                  <div className="font-bold text-white/60">\${(s.before / 1000).toFixed(0)}K</div>
                </div>
                <TrendingUp size={18} className="text-[#10B981] mx-auto flex-1" />
                <div className="text-center">
                  <div className="text-xs text-white/30 mb-0.5">After</div>
                  <div className="font-bold text-[#10B981]">\${(s.after / 1000).toFixed(0)}K</div>
                </div>
                <div className="text-center ml-2">
                  <div className="text-xs text-white/30 mb-0.5">↑ increase</div>
                  <div className="font-bold text-[#10B981]">+\${Math.round((s.after - s.before) / 1000)}K</div>
                </div>
              </div>

              {/* Quote */}
              <p className="text-sm text-white/60 leading-relaxed mb-5 flex-1">"{s.quote}"</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {s.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>{t}</span>
                ))}
              </div>

              <div className="text-xs text-white/25">Hired in {s.time}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-24 px-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-4xl font-black text-white mb-4">Write your own story.</h2>
          <p className="text-white/50 mb-8">Join 47,000+ professionals and start landing the interviews you deserve.</p>
          <Link to="/register">
            <button className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 12px 40px rgba(99,102,241,0.35)" }}>
              Start free today <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 5. Blog.tsx
// ─────────────────────────────────────────────────────────────────────────────
w(resolve(pages, "Blog.tsx"), `import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, ArrowRight, BookOpen } from "lucide-react";

const CATEGORIES = ["All", "Interview Prep", "Resume Tips", "Coding", "FAANG Prep", "Career Growth"];

const POSTS = [
  { id: 1, category: "FAANG Prep", title: "How I Cracked the Google L5 Loop in 60 Days (Complete Blueprint)", excerpt: "A step-by-step breakdown of the exact system I used — mock schedules, resource lists, and the mental frameworks that got me through 6 grueling rounds.", author: "Priya M.", date: "Dec 12, 2024", read: "12 min", featured: true, img: "bg-gradient-to-br from-[#4338CA] to-[#7C3AED]" },
  { id: 2, category: "Interview Prep", title: "The 5 Behavioral Interview Frameworks Every Engineer Needs", excerpt: "STAR is a starting point, not a finish line. Here are the refined frameworks that senior and staff engineers actually use to answer leadership questions.", author: "Jordan L.", date: "Dec 8, 2024", read: "8 min", featured: false, img: "bg-gradient-to-br from-[#7C3AED] to-[#EC4899]" },
  { id: 3, category: "Resume Tips", title: "Your Resume Is Getting Rejected Before a Human Reads It — Here's Why", excerpt: "73% of resumes are filtered out by ATS before reaching a recruiter. We analyzed 1,200 rejected resumes to find the exact patterns you must avoid.", author: "Marcus C.", date: "Dec 5, 2024", read: "6 min", featured: false, img: "bg-gradient-to-br from-[#0891B2] to-[#6366F1]" },
  { id: 4, category: "Coding", title: "Dynamic Programming Explained Without the Headache", excerpt: "Most DP tutorials overwhelm you with theory. This guide uses just 7 core patterns and real interview problems to build genuine intuition.", author: "Sofia R.", date: "Nov 28, 2024", read: "15 min", featured: false, img: "bg-gradient-to-br from-[#10B981] to-[#6366F1]" },
  { id: 5, category: "Career Growth", title: "Negotiating Your First $200K+ Offer: The Exact Scripts That Work", excerpt: "Most candidates leave $15,000–$40,000 on the table by accepting the first offer. Here's the negotiation script used by 2,400 OfferPilot users.", author: "Aisha O.", date: "Nov 22, 2024", read: "10 min", featured: false, img: "bg-gradient-to-br from-[#F59E0B] to-[#EC4899]" },
  { id: 6, category: "Interview Prep", title: "System Design Interviews: The Hidden Scoring Rubric", excerpt: "Interviewers don't score what you think they score. After interviewing 300+ candidates, here's what actually determines pass vs. fail.", author: "Ryan P.", date: "Nov 18, 2024", read: "11 min", featured: false, img: "bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9]" },
  { id: 7, category: "FAANG Prep", title: "Meta vs. Amazon vs. Google: How Their Interview Loops Actually Differ", excerpt: "Same role, completely different interview cultures. This comparison guide breaks down what each company actually tests and how to adapt.", author: "Priya M.", date: "Nov 14, 2024", read: "9 min", featured: false, img: "bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]" },
  { id: 8, category: "Resume Tips", title: "The LinkedIn Profile Optimization Checklist Used by Recruiters", excerpt: "12 specific changes to your LinkedIn profile that get you found by inbound recruiters — based on how their search algorithm actually ranks profiles.", author: "Marcus C.", date: "Nov 10, 2024", read: "7 min", featured: false, img: "bg-gradient-to-br from-[#EC4899] to-[#F59E0B]" },
];

export default function Blog() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");
  const featured = POSTS.find(p => p.featured)!;
  const rest = POSTS.filter(p => !p.featured && (active === "All" || p.category === active) && (p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase())));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F0F14", color: "#F1F5F9", paddingTop: "80px" }}>

      {/* Hero */}
      <section className="py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-15" style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)", color: "#818CF8" }}>
            <BookOpen size={14} />
            Insights from top career coaches & hired engineers
          </div>
          <h1 className="text-5xl font-black mb-4 leading-tight tracking-tight">
            The <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>OfferPilot</span> Blog
          </h1>
          <p className="text-white/50 text-lg mb-8">Interview strategy, resume science, and career intelligence — written by people who've done it.</p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm text-white outline-none transition"
              style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.1)", color: "#F1F5F9" }}
            />
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl overflow-hidden grid md:grid-cols-2" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className={\`\${featured.img} h-52 md:h-full min-h-[200px] flex items-center justify-center\`}>
            <div className="text-6xl opacity-30">✍️</div>
          </div>
          <div className="p-8 flex flex-col justify-center" style={{ background: "#16161F" }}>
            <span className="text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-lg self-start" style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>Featured</span>
            <h2 className="text-2xl font-black text-white leading-snug mb-3">{featured.title}</h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">{featured.excerpt}</p>
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/30">{featured.author} · {featured.date}</div>
              <div className="flex items-center gap-1.5 text-xs text-white/30"><Clock size={12} />{featured.read} read</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setActive(c)} className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={active === c
                ? { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.5)", color: "#818CF8" }
                : { background: "#16161F", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rest.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl overflow-hidden group cursor-pointer hover:border-white/20 transition-all" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className={\`\${post.img} h-40 flex items-center justify-center group-hover:scale-105 transition-transform duration-300\`}>
                <div className="text-4xl opacity-25">✍️</div>
              </div>
              <div className="p-5">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "rgba(99,102,241,0.1)", color: "#818CF8" }}>{post.category}</span>
                <h3 className="font-bold text-white text-[15px] leading-snug mt-3 mb-2 group-hover:text-[#818CF8] transition-colors">{post.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-white/25">
                  <span>{post.author} · {post.date}</span>
                  <div className="flex items-center gap-1"><Clock size={11} />{post.read}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {rest.length === 0 && (
          <div className="text-center py-20 text-white/30">No articles match your search.</div>
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-2xl p-8" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))", border: "1px solid rgba(99,102,241,0.25)" }}>
          <h2 className="text-2xl font-bold text-white mb-2">Get weekly career insights</h2>
          <p className="text-white/40 text-sm mb-6">Join 12,000+ subscribers. No spam, unsubscribe anytime.</p>
          <div className="flex gap-3">
            <input placeholder="your@email.com" className="flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none" style={{ background: "#0F0F14", border: "1px solid rgba(255,255,255,0.1)" }} />
            <button className="px-5 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 shrink-0" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
              Subscribe <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
`);

// ─────────────────────────────────────────────────────────────────────────────
// 6. About.tsx
// ─────────────────────────────────────────────────────────────────────────────
w(resolve(pages, "About.tsx"), `import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, Target, Users, ArrowRight, CheckCircle } from "lucide-react";

const TEAM = [
  { name: "Arjun Desai", role: "CEO & Co-founder", bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", avatar: "AD",
    bio: "Ex-Google PM. Led hiring for 3 engineering teams. Interviewed 500+ candidates before building the tool he wished existed." },
  { name: "Maya Kim", role: "CTO & Co-founder", bg: "linear-gradient(135deg,#8B5CF6,#EC4899)", avatar: "MK",
    bio: "Ex-Meta Staff Engineer. MS CS Stanford. Built the original AI scoring engine from scratch in 90 days." },
  { name: "Luca Moretti", role: "Head of AI/ML", bg: "linear-gradient(135deg,#10B981,#6366F1)", avatar: "LM",
    bio: "PhD NLP from CMU. Spent 4 years at OpenAI before joining to build OfferPilot's proprietary language models." },
  { name: "Zoe Nakamura", role: "Head of Product", bg: "linear-gradient(135deg,#F59E0B,#EC4899)", avatar: "ZN",
    bio: "Ex-LinkedIn PM. Obsessed with the job seeker experience. Redesigned the onboarding flow that cut churn by 62%." },
];

const TIMELINE = [
  { year: "2022", label: "Founded", desc: "Three YC applicants get rejected. Decide to build the prep tool that should have existed years ago." },
  { year: "Q2 2023", label: "First 1,000 users", desc: "Shipped MVP in 8 weeks. First cohort of 1,000 beta users lands offers — avg $31K salary bump." },
  { year: "Q4 2023", label: "Seed round closed", desc: "$3.8M seed led by Sequoia Scout Fund. Expanded team to 12 and launched real-time AI scoring." },
  { year: "2024", label: "47K+ users hired", desc: "Launched mobile, coding simulator, and resume builder. Crossed 47,000 users who got hired using OfferPilot." },
  { year: "2025 →", label: "What's next", desc: "Enterprise tier, team prep mode, and live AI interviews with voice + video analysis. Building the future of hiring." },
];

const STATS = [
  { value: "47,000+", label: "Professionals hired", icon: Users },
  { value: "$28,400", label: "Avg salary increase", icon: TrendingUp },
  { value: "91%", label: "Interview pass rate", icon: Target },
  { value: "3", label: "Years of operation", icon: Zap },
];

import { TrendingUp } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0F0F14", color: "#F1F5F9", paddingTop: "80px" }}>

      {/* Mission hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-15" style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }} />
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.3)", color: "#818CF8" }}>
            <Zap size={14} />
            On a mission to close the interview gap
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 tracking-tight">
            The best candidate shouldn't<br />lose to the<br />
            <span style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              best-prepared candidate.
            </span>
          </h1>
          <p className="text-xl text-white/50 leading-relaxed">
            Millions of talented people get passed over every year — not because they can't do the job, but because they haven't been trained to perform in a 45-minute loop designed by someone who already has the job. We're changing that.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => (
            <div key={s.label} className="rounded-2xl p-6 text-center" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <s.icon size={20} className="text-[#6366F1] mx-auto mb-3" />
              <div className="text-3xl font-black text-white mb-1">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder story */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-8 md:p-12" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-start gap-6 flex-col md:flex-row">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>AD</div>
            <div>
              <div className="text-sm text-white/30 uppercase tracking-widest mb-2">Founder's note</div>
              <h2 className="text-2xl font-bold text-white mb-4">Why we built this</h2>
              <p className="text-white/60 leading-relaxed mb-4">
                I spent four years at Google reviewing hundreds of candidate loops. I watched smart, talented engineers fail — not on the technical content, but on the way they structured their thinking, the cadence of their explanations, the confidence in their voice. These are learnable skills. Nobody teaches them.
              </p>
              <p className="text-white/60 leading-relaxed mb-4">
                I left Google in 2022 with a simple question: what if every job seeker had access to the same caliber of prep that FAANG employees give to friends who are preparing for interviews? OfferPilot is that answer — AI-powered, data-driven, and ruthlessly focused on outcomes.
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
              className="rounded-2xl p-6 text-center" style={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4" style={{ background: member.bg }}>{member.avatar}</div>
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
                <div className="absolute left-4 top-1 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.4)" }}>
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
            <button className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-base font-bold text-white" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 12px 40px rgba(99,102,241,0.35)" }}>
              Start for free <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
`);

console.log("\n🎉 All files written. Run: node node_modules/vite/bin/vite.js build");

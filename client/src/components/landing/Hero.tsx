import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Play, TrendingUp, X } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import CompanyLogo from "../common/CompanyLogo";
import { HERO_COMPANIES } from "../../data/companyBrands";

function DemoModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      key="demo-backdrop"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(5,5,20,0.85)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 24 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="relative w-full max-w-3xl aspect-video rounded-2xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
        >
          <X size={15} />
        </button>
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0"
          title="OfferPilot Demo"
          allow="autoplay; fullscreen"
          allowFullScreen
          className="w-full h-full"
        />
      </motion.div>
    </motion.div>
  );
}

const BG_URL = "/hero-bg.png";

const FLOAT_CARDS = [
  {
    pos: "left-[4%] top-[32%]",
    delay: 0,
    yRange: [0, -14, 0] as const,
    content: (
      <div className="flex items-center gap-3 p-4 w-52">
        <div className="relative w-12 h-12 shrink-0">
          <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
            <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4"/>
            <circle cx="24" cy="24" r="18" fill="none" stroke="#10B981" strokeWidth="4"
              strokeLinecap="round" strokeDasharray="113" strokeDashoffset="16"/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-[#10B981]">94</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] text-white/40 mb-0.5">ATS Score</div>
          <div className="text-sm font-bold text-white">94 / 100</div>
          <div className="text-[10px] text-[#10B981] font-semibold">↑ Top 3%</div>
        </div>
      </div>
    ),
  },
  {
    pos: "right-[5%] top-[28%]",
    delay: 1,
    yRange: [0, 12, 0] as const,
    content: (
      <div className="p-4 w-56">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
          </div>
          <span className="text-[11px] text-[#10B981] font-bold uppercase tracking-wide">Offer Received</span>
        </div>
        <div className="text-sm font-bold text-white leading-tight">Google SWE L4</div>
        <div className="text-[13px] font-black text-[#8B5CF6] mt-0.5">$185K / yr</div>
        <div className="text-[10px] text-white/40 mt-1">Total comp $248K</div>
      </div>
    ),
  },
  {
    pos: "left-[6%] bottom-[24%]",
    delay: 1.6,
    yRange: [0, -10, 0] as const,
    content: (
      <div className="p-4 w-48">
        <div className="text-[11px] text-white/40 mb-2">Interview Score</div>
        <div className="flex items-end gap-1 mb-2">
          <span className="text-2xl font-black text-white">87</span>
          <span className="text-white/40 text-sm mb-1">%</span>
        </div>
        {[0.9, 0.75, 0.95, 0.7, 0.85].map((h, i) => (
          <div key={i} className="inline-block w-3 mr-0.5 rounded-sm bg-gradient-to-t from-[#6366F1] to-[#8B5CF6]"
            style={{ height: `${h * 24}px`, verticalAlign: "bottom" }}
          />
        ))}
      </div>
    ),
  },
  {
    pos: "right-[4%] bottom-[28%]",
    delay: 0.5,
    yRange: [0, 10, 0] as const,
    content: (
      <div className="p-4 w-52">
        <div className="text-[11px] text-white/40 mb-2">JD Match Score</div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-black text-white">91%</span>
          <span className="text-[10px] text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded-full">Strong fit</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "91%" }}
            transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#10B981] rounded-full"
          />
        </div>
      </div>
    ),
  },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const { settings } = useSettings();
  const [isLight, setIsLight] = useState(
    () => document.documentElement.dataset.theme === "light"
  );

  useEffect(() => {
    const syncTheme = () => {
      setIsLight(document.documentElement.dataset.theme === "light");
    };
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", syncTheme);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncTheme);
    };
  }, [settings.theme]);

  const headingShadow = isLight
    ? "0 2px 12px rgba(255,255,255,0.45)"
    : "0 2px 20px rgba(0,0,0,0.55)";

  return (
    <div
      ref={ref}
      className="op-landing-hero relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden"
      style={{ paddingTop: "72px" }}
    >
      {/* Background — single image (blog-style) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <img
          src={BG_URL}
          alt=""
          className="op-landing-hero-bg-img absolute inset-0 w-full h-full object-cover object-center"
          style={{
            filter: isLight ? undefined : "brightness(0.58)",
            transform: "scale(1.02)",
          }}
        />
        <div
          className="op-landing-hero-tint absolute inset-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] opacity-15"
        />
        <div
          className="op-landing-hero-overlay absolute inset-0"
          style={
            isLight
              ? undefined
              : {
                  background:
                    "linear-gradient(to bottom, rgba(5,5,15,0.55) 0%, rgba(5,5,15,0.42) 45%, rgba(5,5,15,0.82) 100%)",
                }
          }
        />
      </div>

      {/* Dark-only ambient layers */}
      {!isLight && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0.3, 0.48, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[900px] h-[650px]"
              style={{
                background:
                  "radial-gradient(ellipse at center, #6366F1 0%, #8B5CF6 38%, transparent 68%)",
              }}
            />
          </motion.div>
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-[8%] left-[-8%] w-[480px] h-[480px] opacity-[0.12]"
              style={{ background: "radial-gradient(ellipse, #8B5CF6, transparent 70%)" }}
            />
            <div
              className="absolute top-[18%] right-[-6%] w-[380px] h-[380px] opacity-[0.09]"
              style={{ background: "radial-gradient(ellipse, #EC4899, transparent 70%)" }}
            />
          </div>
          <div className="noise-overlay" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 42%, rgba(5,5,20,0.55) 100%)",
            }}
          />
        </>
      )}

      {/* Floating stat cards */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOAT_CARDS.map((card, i) => (
          <motion.div
            key={i}
            animate={{ y: card.yRange }}
           transition={{
  duration: 5 + i * 0.7,
  repeat: Infinity,
  repeatType: "loop",
  ease: "easeInOut",
  delay: card.delay,
}}
         className={`op-landing-hero-float hidden lg:block absolute rounded-2xl ${card.pos}`}
            style={
              isLight
                ? undefined
                : { boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)" }
            }
          >
            {card.content}
          </motion.div>
        ))}
      </div>

      {/* Main content — glass panel like blog hero */}
      <div className="relative z-10 px-6 max-w-[820px] mx-auto w-full flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="op-landing-hero-copy glass-panel rounded-3xl px-5 py-8 sm:px-8 sm:py-10 w-full flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="op-landing-hero-trust flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] border border-white/[0.14] text-xs font-semibold text-white/80 mb-8"
          >
            <span className="text-[#10B981]">✦</span>
            Trusted by 12,000+ engineers at top companies
            <TrendingUp size={12} className="text-[#10B981] ml-1" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-[74px] font-extrabold leading-[1.05] tracking-[-0.04em] text-white mb-6"
            style={{ textShadow: headingShadow }}
          >
            Land your dream offer at{" "}
            <span className="gradient-text">top-tier companies.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="text-lg text-white/55 max-w-[560px] leading-[1.75] mb-10"
            style={{ textShadow: headingShadow }}
          >
            AI-powered resume, interview, and offer tracking.
            Every tool you need — in one focused platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38, duration: 0.45 }}
            className="flex flex-wrap gap-4 justify-center mb-10"
          >
            <Link
              to="/register"
              className="op-landing-hero-cta-primary flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all hover:opacity-95"
              style={{
                boxShadow: "0 0 28px rgba(99,102,241,0.45), 0 4px 20px rgba(99,102,241,0.3)",
              }}
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>

            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              className="op-landing-hero-demo-btn flex items-center gap-2.5 px-7 py-4 rounded-2xl font-semibold text-white/80 hover:text-white text-base bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.14] hover:border-white/[0.25] transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Play size={13} fill="currentColor" />
              </div>
              Watch 2-min Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.45 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="op-landing-hero-companies-label text-[11px] text-white/30 uppercase tracking-[0.18em] font-semibold">
              Engineers hired at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
              {HERO_COMPANIES.map((co) => (
                <div
                  key={co.name}
                  className="flex items-center gap-2 opacity-50 hover:opacity-90 transition-opacity cursor-default"
                >
                  <CompanyLogo brand={co} size={20} />
                  <span className="op-landing-hero-company-name text-[13px] font-bold text-white/70 tracking-tight">
                    {co.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

     

    {/* Single bottom fade */}
<div
  className="op-landing-hero-bottom-fade absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
  style={
    isLight
      ? {
          height: "180px",
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 30%, rgba(255,255,255,0.34) 58%, rgba(246,248,255,0.92) 100%)",
          backdropFilter: "blur(2px)",
        }
      : {
          height: "120px",
          background:
            "linear-gradient(to bottom, rgba(5,5,15,0) 0%, rgba(5,5,15,0.82) 100%)",
        }
  }
/>

      <AnimatePresence>
        {demoOpen && <DemoModal onClose={() => setDemoOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import Footer from "../components/landing/Footer";

export default function Protocols() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const steps = [
    {
      icon: "🎙",
      title: "AI Interview Simulation",
      desc: "Start a realistic AI-powered interview session designed to mimic real technical interviews.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
      tint: "from-indigo-500/35 via-violet-500/20 to-transparent",
    },
    {
      icon: "💻",
      title: "Live Coding Evaluation",
      desc: "Solve coding problems in the integrated IDE with real-time code analysis.",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1400&q=80",
      tint: "from-cyan-500/35 via-blue-500/15 to-transparent",
    },
    {
      icon: "🧠",
      title: "Behavioral Analysis",
      desc: "AI analyzes speech patterns, hesitation, and confidence levels.",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=80",
      tint: "from-fuchsia-500/30 via-pink-500/18 to-transparent",
    },
    {
      icon: "📊",
      title: "Performance Insights",
      desc: "Receive detailed feedback including strengths, weaknesses, and improvement tips.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
      tint: "from-emerald-500/28 via-teal-500/15 to-transparent",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0F0F14] text-white">
      <div className="relative px-5 pb-12 pt-24 sm:px-8 sm:pt-28">

      {/* ← Back / ✕ Close nav */}
      <div className="flex items-center justify-between max-w-7xl mx-auto mb-4 relative z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.4)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <button onClick={() => navigate("/")} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {/* Glow */}
      <div
        className="absolute top-8 left-1/2 -translate-x-1/2 h-100 w-200 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-40 right-[-8%] h-80 w-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 72%)" }}
      />

      <div className="text-center mb-16 relative z-10">
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-4"
          style={{
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            color: "#818CF8",
          }}
        >
          HOW IT WORKS
        </span>
        <h1 className="text-5xl font-bold mt-4 text-white">
          Interview{" "}
          <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Protocols
          </span>
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Follow these steps to get the most out of your AI mock interview session.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-7 max-w-7xl mx-auto relative z-10">
        {steps.map((step, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.2, delay: i * 0.06 }}
            whileHover={reduceMotion ? undefined : { y: -6, scale: 1.01 }}
            className="group relative overflow-hidden rounded-3xl border border-white/12 bg-white/4 p-8 transition-all"
            style={{
              boxShadow: "0 16px 42px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${step.tint}`} />

            <div className="relative mb-5 overflow-hidden rounded-2xl border border-white/12">
              <img
                src={step.image}
                alt={step.title}
                className="h-34 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#101527]/85 via-[#101527]/25 to-transparent" />
              <div className="absolute right-3 top-3 rounded-full border border-white/18 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white/85">
                Step {i + 1}
              </div>
            </div>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg mb-5"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#818CF8",
                fontSize: "20px",
              }}
            >
              {step.icon}
            </div>
            <h2 className="text-[30px] leading-tight font-bold mb-2 text-white tracking-tight">{step.title}</h2>
            <p className="text-lg leading-8" style={{ color: "rgba(255,255,255,0.62)" }}>{step.desc}</p>
            {!reduceMotion && (
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-12 -right-12 h-30 w-30 rounded-full bg-indigo-400/16 blur-3xl"
                animate={{ y: [0, -8, 0], x: [0, -6, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
              />
            )}
          </motion.article>
        ))}
      </div>

      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

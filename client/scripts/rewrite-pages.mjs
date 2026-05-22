import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pages = resolve(__dirname, "../src/pages");
const src = resolve(__dirname, "../src");

// ─── HELPER ──────────────────────────────────────────────────────────────────
function w(path, content) { writeFileSync(path, content); console.log("✅ wrote", path.split("\\").pop()); }

// ─── LOGIN ───────────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "Login.tsx"), `import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem("user", email);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F0F14" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="relative rounded-3xl p-10 w-[420px]"
        style={{ backgroundColor: "#16161F", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
      >
        <div className="flex justify-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1 text-white">Welcome back</h1>
        <p className="text-center text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Sign in to your OfferPilot account
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
              style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.10)" }}
              onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition"
              style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.10)" }}
              onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center text-xs mb-7">
            <label className="flex items-center gap-2 cursor-pointer" style={{ color: "rgba(255,255,255,0.35)" }}>
              <input type="checkbox" className="accent-[#6366F1]" /> Remember Me
            </label>
            <span className="hover:text-white cursor-pointer transition" style={{ color: "rgba(139,92,246,0.8)" }}>
              Forgot Password?
            </span>
          </div>

          <button
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
          >
            Sign In
          </button>

          <p className="text-center mt-5 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold hover:text-white transition" style={{ color: "#8B5CF6" }}>
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
`);

// ─── REGISTER ────────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "Register.tsx"), `import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e: any) => {
    e.preventDefault();
    localStorage.setItem("user", JSON.stringify({ name, email, password }));
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F0F14" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)" }}
      />
      <div
        className="relative rounded-3xl p-10 w-[420px]"
        style={{ backgroundColor: "#16161F", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
      >
        <div className="flex justify-center mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-1 text-white">Create account</h1>
        <p className="text-center text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
          Join OfferPilot for free
        </p>

        <form onSubmit={handleRegister}>
          {[
            { type: "text",     placeholder: "Full Name",      onChange: setName },
            { type: "email",    placeholder: "Email address",  onChange: setEmail },
            { type: "password", placeholder: "Password",       onChange: setPassword },
          ].map(({ type, placeholder, onChange }) => (
            <input
              key={placeholder}
              type={type}
              placeholder={placeholder}
              className="w-full rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition mb-4"
              style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.10)" }}
              onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
              onChange={e => onChange(e.target.value)}
            />
          ))}

          <button
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition hover:opacity-90 active:scale-[0.98] mt-2"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 8px 24px rgba(99,102,241,0.3)" }}
          >
            Create Account
          </button>

          <p className="text-center mt-5 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:text-white transition" style={{ color: "#8B5CF6" }}>
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
`);

// ─── NEW INTERVIEW ────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "NewInterview.tsx"), `import { API } from "../api";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NewInterview() {
  const navigate = useNavigate();

  const [category, setCategory] = useState("technical");
  const [level, setLevel] = useState("junior");
  const [duration, setDuration] = useState(15);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startInterview = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("userId", "1");
      form.append("category", category);
      form.append("level", level);
      form.append("duration", String(duration));
      form.append("count", "4");
      if (resume) form.append("resume", resume);

      const res = await API.post("/api/interview/start", form, { timeout: 60000 });

      if (res.data?.success) {
        const questions = res.data.questions || [];
        const interviewId = res.data.interviewId;
        try {
          localStorage.setItem(\`interview_\${interviewId}_questions\`, JSON.stringify(questions));
        } catch {}
        navigate(\`/room/\${interviewId}\`, { state: { questions, interviewId } });
      } else {
        alert("Could not start interview");
      }
    } catch (err: any) {
      alert("Start failed: " + (err?.response?.data?.error || err?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const selectStyle = {
    backgroundColor: "#0F0F14",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "white",
    borderRadius: "12px",
    padding: "12px 16px",
    width: "100%",
    marginBottom: "24px",
    fontSize: "14px",
    outline: "none",
    appearance: "none" as const,
  };

  return (
    <div
      className="min-h-screen pt-20 pb-28 flex justify-center items-start"
      style={{ backgroundColor: "#0F0F14" }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
      />

      <div
        className="relative w-full max-w-2xl mx-4 rounded-3xl p-10 mt-6"
        style={{ backgroundColor: "#16161F", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 60px rgba(0,0,0,0.4)" }}
      >
        <h1 className="text-3xl font-extrabold text-white mb-2">
          Initialize{" "}
          <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Simulation
          </span>
        </h1>
        <p className="mb-10 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
          Configure your interview parameters. The AI adapts questions in real-time based on your performance.
        </p>

        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          <option value="technical">Technical</option>
          <option value="hr">HR</option>
          <option value="system-design">System Design</option>
          <option value="behavioral">Behavioral</option>
          <option value="dsa">DSA + Coding</option>
        </select>

        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Level</label>
        <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
          <option value="junior">Junior</option>
          <option value="medium">Medium</option>
          <option value="senior">Senior</option>
          <option value="expert">Expert</option>
        </select>

        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Duration (Minutes)</label>
        <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={selectStyle}>
          <option value={10}>10 Minutes</option>
          <option value={15}>15 Minutes</option>
          <option value={20}>20 Minutes</option>
          <option value={30}>30 Minutes</option>
        </select>

        <label className="block text-xs font-semibold mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Upload Resume (optional)</label>
        <input
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={e => setResume(e.target.files ? e.target.files[0] : null)}
          className="w-full p-3 mb-8 text-sm rounded-xl"
          style={{
            backgroundColor: "#0F0F14",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.5)",
          }}
        />

        <button
          onClick={startInterview}
          disabled={loading}
          className="w-full py-4 font-bold rounded-xl text-base text-white transition hover:opacity-90 active:scale-[0.98]"
          style={
            loading
              ? { backgroundColor: "rgba(99,102,241,0.35)", cursor: "not-allowed" }
              : {
                  background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
                }
          }
        >
          {loading ? "Starting…" : "Start Simulation →"}
        </button>
      </div>
    </div>
  );
}
`);

// ─── PROTOCOLS ───────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "Protocols.tsx"), `import React from "react";

export default function Protocols() {
  const steps = [
    {
      icon: "🎙",
      title: "AI Interview Simulation",
      desc: "Start a realistic AI-powered interview session designed to mimic real technical interviews.",
    },
    {
      icon: "💻",
      title: "Live Coding Evaluation",
      desc: "Solve coding problems in the integrated IDE with real-time code analysis.",
    },
    {
      icon: "🧠",
      title: "Behavioral Analysis",
      desc: "AI analyzes speech patterns, hesitation, and confidence levels.",
    },
    {
      icon: "📊",
      title: "Performance Insights",
      desc: "Receive detailed feedback including strengths, weaknesses, and improvement tips.",
    },
  ];

  return (
    <div className="min-h-screen px-8 py-24" style={{ backgroundColor: "#0F0F14" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }}
      />

      <div className="text-center mb-16 relative">
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

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto relative">
        {steps.map((step, i) => (
          <div
            key={i}
            className="p-8 rounded-2xl transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: "#16161F",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          >
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
            <h2 className="text-xl font-bold mb-2 text-white">{step.title}</h2>
            <p style={{ color: "rgba(255,255,255,0.5)" }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// ─── HISTORY ─────────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "History.tsx"), `import { useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "../api";

interface Interview {
  id: number;
  category: string;
  level: string;
  score: number | null;
  startedAt: string;
  endedAt: string | null;
  questions: string[];
  responses: Array<{ question: string; answer: string; score: number; createdAt: string }>;
  responseCount: number;
}

const cardStyle = {
  backgroundColor: "#16161F",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "24px",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function History() {
  const [list, setList] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);

  const location = useLocation();

  const loadHistory = () => {
    setLoading(true);
    API.get("/api/interview/list")
      .then(r => setList(Array.isArray(r.data) ? r.data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadHistory(); }, [location.state]);

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleString() : "N/A";

  const clearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all interview history? This cannot be undone.")) return;
    setClearing(true);
    try {
      await API.delete("/api/interview/clear");
      setList([]);
      alert("History cleared successfully");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || err.message
        : err instanceof Error ? err.message : "Unknown error";
      alert("Failed to clear history: " + message);
    } finally {
      setClearing(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F0F14" }}>
        <div style={{ color: "#818CF8" }} className="font-semibold animate-pulse">Loading…</div>
      </div>
    );

  if (!list.length)
    return (
      <div className="min-h-screen p-10" style={{ backgroundColor: "#0F0F14" }}>
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-white">
            Interview{" "}
            <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>History</span>
          </h1>
        </div>
        <div className="max-w-4xl mx-auto p-10 rounded-2xl text-center" style={cardStyle}>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.5)" }}>No interviews yet.</p>
          <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>Start a new interview to see your history here.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen p-10" style={{ backgroundColor: "#0F0F14" }}>
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white">
          Interview{" "}
          <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>History</span>
        </h1>
        <button
          onClick={clearHistory}
          disabled={clearing}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.3)" }}
        >
          {clearing ? "Clearing…" : "Clear History"}
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {list.map(i => (
          <div
            key={i.id}
            className="rounded-2xl p-6 transition-all hover:border-[rgba(99,102,241,0.3)]"
            style={cardStyle}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">Interview #{i.id}</h2>
                  {i.endedAt ? (
                    <span
                      className="px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#34D399", border: "1px solid rgba(16,185,129,0.3)" }}
                    >
                      Completed
                    </span>
                  ) : (
                    <span
                      className="px-2 py-0.5 text-xs font-semibold rounded-full"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.3)" }}
                    >
                      In Progress
                    </span>
                  )}
                </div>
                <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span>{i.category} · {i.level}</span>
                  <span className="ml-3">Started: {formatDate(i.startedAt)}</span>
                  {i.endedAt && <span className="ml-3">Ended: {formatDate(i.endedAt)}</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold" style={{ color: "#818CF8" }}>
                  {i.score != null ? Number(i.score).toFixed(1) : "—"}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {i.responseCount || 0} response{i.responseCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            <button
              onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
              className="text-sm font-medium transition hover:text-white"
              style={{ color: "#8B5CF6" }}
            >
              {expandedId === i.id ? "▼ Hide Details" : "▶ Show Details"}
            </button>

            {expandedId === i.id && (
              <div
                className="mt-4 pt-4 space-y-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                {i.questions?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">Questions</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {i.questions.map((q, idx) => <li key={idx} className="ml-2">{q}</li>)}
                    </ol>
                  </div>
                )}

                {i.responses?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2">Answers & Scores</h3>
                    <div className="space-y-3">
                      {i.responses.map((r, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl p-4"
                          style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <div className="text-sm font-semibold mb-1" style={{ color: "#818CF8" }}>Q: {r.question}</div>
                          <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.55)" }}>A: {r.answer}</div>
                          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                            Score: <span className="font-bold text-white">{r.score != null ? r.score.toFixed(2) : "N/A"}</span>
                            {" · "}{formatDate(r.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!i.responses || i.responses.length === 0) && (
                  <div className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>No responses recorded.</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
`);

// ─── INTERVIEW ROOM ───────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "InterviewRoom.tsx"), `import React, { useEffect, useRef, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import Webcam from "react-webcam";

type InterviewQuestion = string | { text?: string; question?: string };
type AnswerFeedback = { score: number; fb: string };

export default function InterviewRoom() {
  const { id } = useParams();
  const interviewId = Number(id);
  const location = useLocation();
  const navigate = useNavigate();

  const initialQuestions = (location.state?.questions as InterviewQuestion[] | undefined) || null;
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(initialQuestions);
  const [loading, setLoading] = useState(!initialQuestions);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null);
  const [scores, setScores] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .catch(() => alert("Please allow camera permission."));
  }, []);

  useEffect(() => {
    if (questions?.length) { setLoading(false); return; }
    API.get(\`/api/interview/\${interviewId}\`)
      .then(res => {
        if (Array.isArray(res.data?.questions)) setQuestions(res.data.questions);
        else setError("No questions found.");
      })
      .catch(() => setError("Failed to load interview."))
      .finally(() => setLoading(false));
  }, [interviewId]);

  const currentQuestion = questions?.[index] ?? "";
  const currentQuestionText =
    typeof currentQuestion === "string"
      ? currentQuestion
      : currentQuestion.text || currentQuestion.question || "";
  const questionCount = questions?.length ?? 0;

  const submitAnswer = async ({ autoNext = false } = {}) => {
    if (!questions?.[index]) { alert("Question not ready yet."); return; }
    if (!answer.trim()) { alert("Please type your answer first."); return; }
    const rawQ = questions[index];
    const question = typeof rawQ === "string" ? rawQ : rawQ.text || rawQ.question || JSON.stringify(rawQ);
    try {
      const res = await API.post(\`/api/interview/\${interviewId}/answer\`, { question, answer });
      if (!res.data?.success) throw new Error("Backend rejected answer");
      setScores(p => [...p, res.data.score]);
      setFeedback({ score: res.data.score, fb: res.data.feedback });
      if (autoNext) setTimeout(goNext, 900);
    } catch { alert("Failed to submit answer."); }
  };

  const goNext = () => {
    if (index + 1 < questionCount) { setIndex(i => i + 1); setAnswer(""); setFeedback(null); }
    else endInterview();
  };

  const endInterview = async () => {
    if (!window.confirm("End interview?")) return;
    try {
      const res = await API.post(\`/api/interview/\${interviewId}/end\`);
      if (res.data?.success) setShowSummary(true);
    } catch { alert("Failed to end interview."); }
  };

  const panelStyle = {
    backgroundColor: "#16161F",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F0F14" }}>
        <div className="font-semibold animate-pulse" style={{ color: "#818CF8" }}>Loading interview…</div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F0F14" }}>
        <div className="text-red-400">{error}</div>
      </div>
    );

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#0F0F14" }}>
      <div className="grid grid-cols-3 gap-6">

        {/* CAMERA */}
        <div
          className="col-span-2 rounded-2xl overflow-hidden relative"
          style={{ height: "550px", backgroundColor: "#0A0A0F", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              Starting Camera…
            </div>
          )}
          <Webcam
            ref={webcamRef}
            audio={true}
            mirrored={true}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={() => alert("Camera not accessible.")}
            className="w-full h-full object-cover"
          />
          {/* Live badge */}
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", color: "#FCA5A5" }}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block" />
            LIVE
          </div>
        </div>

        {/* QUESTION PANEL */}
        <div className="flex flex-col p-6" style={panelStyle}>
          <div className="text-xs font-semibold mb-1" style={{ color: "#818CF8" }}>
            QUESTION {index + 1} / {questionCount}
          </div>
          <h2 className="text-lg font-bold text-white mb-5 leading-snug">{currentQuestionText}</h2>

          <textarea
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            className="w-full flex-1 min-h-[140px] p-4 rounded-xl text-sm text-white focus:outline-none resize-none transition"
            style={{
              backgroundColor: "#0F0F14",
              border: "1px solid rgba(255,255,255,0.10)",
              color: "white",
            }}
            onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.5)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.10)")}
            placeholder="Type your answer…"
          />

          <div className="flex gap-3 mt-5 flex-wrap">
            <button
              onClick={() => submitAnswer({ autoNext: true })}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              Submit & Next
            </button>
            <button
              onClick={() => submitAnswer()}
              className="px-5 py-2 rounded-xl text-sm transition"
              style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
            >
              Submit Only
            </button>
            <button
              onClick={endInterview}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-80"
              style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.35)", color: "#FCA5A5" }}
            >
              End Interview
            </button>
          </div>

          {feedback && (
            <div
              className="mt-4 p-4 rounded-xl"
              style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
            >
              <p className="text-sm font-bold mb-1" style={{ color: "#818CF8" }}>Score: {feedback.score}</p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{feedback.fb}</p>
            </div>
          )}
        </div>
      </div>

      {/* SUMMARY MODAL */}
      {showSummary && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div
            className="rounded-3xl p-10 text-center w-[380px]"
            style={{ backgroundColor: "#16161F", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5"
              style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Interview Complete</h2>
            <p className="text-sm mb-5" style={{ color: "rgba(255,255,255,0.45)" }}>Here's how you did:</p>
            <div className="text-4xl font-extrabold mb-1" style={{ color: "#818CF8" }}>
              {scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : "—"}
            </div>
            <p className="text-xs mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Average Score</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/history", { state: { refresh: true } })}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
              >
                View History
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-xl text-sm transition"
                style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`);

// ─── CODING ───────────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "Coding.tsx"), `import React, { useEffect, useRef, useState } from "react";
import monaco from "../lib/monaco";
import { API } from "../api";

type Language = "javascript" | "python" | "java" | "cpp";
type Theme = "dark" | "light" | "dracula";

const SAMPLE_CODE: Record<Language, string> = {
  javascript: \`// JavaScript Example
function greet(name) {
  return "Hello, " + name;
}
console.log(greet("OfferPilot"));
const nums = [1,2,3,4];
console.log(nums.map(n => n * 2));\`,
  python: \`# Python Example
def greet(name):
    return "Hello " + name
print(greet("World"))\`,
  java: \`// Java Example
class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}\`,
  cpp: \`// C++ Example
#include <iostream>
using namespace std;
int main() {
  cout << "Hello World";
  return 0;
}\`,
};

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", icon: "⚡", exec: true },
  { id: "python",     name: "Python",     icon: "🐍", exec: false },
  { id: "java",       name: "Java",       icon: "☕", exec: false },
  { id: "cpp",        name: "C++",        icon: "⚙️", exec: false },
] as const;

export default function Coding() {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [language, setLanguage] = useState<Language>("javascript");
  const [theme, setTheme] = useState<Theme>("dracula");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiOn, setAiOn] = useState(false);
  const [aiHints, setAiHints] = useState<string[]>([]);

  useEffect(() => {
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4" },
        { token: "string",  foreground: "f1fa8c" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "number",  foreground: "bd93f9" },
      ],
      colors: { "editor.background": "#0F0F14" },
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: SAMPLE_CODE.javascript,
      language: "javascript",
      theme: "dracula",
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
    });
    editorRef.current.onDidChangeModelContent(() => {
      if (!aiOn) return;
      const code = editorRef.current!.getValue();
      const hints: string[] = [];
      if (!code.includes("return")) hints.push("Function without return detected.");
      if (code.includes("for") && code.includes("for")) hints.push("Nested loops detected → possible O(n²).");
      if ((code.match(/{/g)?.length || 0) !== (code.match(/}/g)?.length || 0)) hints.push("Unbalanced { } braces detected.");
      setAiHints(hints);
    });
    return () => editorRef.current?.dispose();
  }, [aiOn]);

  useEffect(() => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    if (!model) return;
    monaco.editor.setModelLanguage(model, language);
    editorRef.current.setValue(SAMPLE_CODE[language]);
    setOutput("");
    setAiHints([]);
  }, [language]);

  useEffect(() => {
    monaco.editor.setTheme(theme === "dark" ? "vs-dark" : theme === "light" ? "vs" : "dracula");
  }, [theme]);

  const runCode = async () => {
    const code = editorRef.current?.getValue() || "";
    if (language !== "javascript") {
      setOutput(\`⚠ \${language.toUpperCase()} execution disabled.\\n\\n✔ Syntax highlighting enabled\\n✔ AI reasoning enabled\\n✖ Runtime execution requires sandbox\\n\\nExplain logic verbally in interviews.\`);
      return;
    }
    try {
      setLoading(true);
      setOutput("");
      const res = await API.post("/api/code/run", { code, language: "node" });
      setOutput(res.data.success ? (res.data.output || "") : (res.data.error || "Execution failed"));
    } catch {
      setOutput("❌ Runtime Error");
    } finally {
      setLoading(false);
    }
  };

  const resetCode = () => { editorRef.current?.setValue(SAMPLE_CODE[language]); setOutput(""); setAiHints([]); };

  const renderOutput = () =>
    output.split("\\n").map((line, i) => {
      if (line.toLowerCase().includes("error"))   return <div key={i} className="text-red-400">⛔ {line}</div>;
      if (line.toLowerCase().includes("warn"))    return <div key={i} className="text-yellow-400">⚠ {line}</div>;
      if (line === "true" || line === "false")    return <div key={i} className="text-yellow-300">{line}</div>;
      if (!isNaN(Number(line)) && line !== "")   return <div key={i} style={{ color: "#818CF8" }}>{line}</div>;
      return <div key={i} style={{ color: "rgba(255,255,255,0.75)" }}>{line}</div>;
    });

  const btnBase = "px-4 py-2 rounded-xl text-sm font-medium transition-all border";
  const panelStyle = { backgroundColor: "#16161F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#0F0F14" }}>
      <h1 className="text-2xl font-bold text-white mb-4">
        💻 Coding{" "}
        <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Playground
        </span>
      </h1>

      {/* CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-4">
        {LANGUAGES.map(l => (
          <button
            key={l.id}
            onClick={() => setLanguage(l.id)}
            className={btnBase}
            style={
              language === l.id
                ? { background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.5)", color: "#818CF8" }
                : { backgroundColor: "#16161F", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }
            }
          >
            {l.icon} {l.name}
          </button>
        ))}

        <div className="ml-auto flex gap-2">
          {(["dark", "light", "dracula"] as Theme[]).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={btnBase + " text-xs"}
              style={
                theme === t
                  ? { background: "rgba(99,102,241,0.15)", borderColor: "rgba(99,102,241,0.4)", color: "#818CF8" }
                  : { backgroundColor: "#16161F", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
              }
            >
              {t}
            </button>
          ))}

          <button
            onClick={() => setAiOn(!aiOn)}
            className={btnBase}
            style={
              aiOn
                ? { background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.4)", color: "#34D399" }
                : { backgroundColor: "#16161F", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
            }
          >
            🤖 AI {aiOn ? "ON" : "OFF"}
          </button>

          <button
            onClick={runCode}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
          >
            ▶ Run
          </button>

          <button
            onClick={resetCode}
            className={btnBase}
            style={{ backgroundColor: "#16161F", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-[3fr_2fr] gap-4">
        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <div ref={containerRef} style={{ height: 420 }} />
        </div>

        <div className="rounded-2xl p-4 font-mono text-sm" style={panelStyle}>
          <div
            className="flex justify-between text-xs pb-1 mb-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
          >
            <span>🖥 TERMINAL</span>
            <span>{language === "javascript" ? "Node.js" : "Explanation Mode"}</span>
          </div>

          {loading ? (
            <div className="animate-pulse" style={{ color: "#818CF8" }}>⏳ Running...</div>
          ) : (
            <pre className="whitespace-pre-wrap">{renderOutput()}</pre>
          )}
        </div>
      </div>

      {/* AI PANEL */}
      {aiOn && aiHints.length > 0 && (
        <div
          className="mt-4 p-4 rounded-2xl"
          style={{ backgroundColor: "#16161F", border: "1px solid rgba(99,102,241,0.25)" }}
        >
          <h3 className="text-sm font-semibold text-white mb-2">🤖 AI Interview Assistant</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {aiHints.map((h, i) => (
              <li key={i} style={{ color: "#818CF8" }}>{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* FOOTER */}
      <div className="mt-4 text-xs flex justify-between items-center" style={{ color: "rgba(255,255,255,0.35)" }}>
        <span className="font-semibold text-red-400">⚠ Live execution: JavaScript only</span>
        <span>⌨ Ctrl + Enter</span>
        <span className="font-bold animate-pulse" style={{ color: "#34D399" }}>🚀 Interview-Grade Environment</span>
      </div>
    </div>
  );
}
`);

// ─── RESUME ───────────────────────────────────────────────────────────────────
writeFileSync(resolve(pages, "Resume.tsx"), `import React, { useEffect, useRef, useState } from "react";
import { API } from "../api";
import {
  ATSReport,
  BuilderState,
  JDAnalysis,
  MatchResult,
  ResumeVersion,
} from "../types/resume";
import { ATSScoreGauge }      from "../components/resume/ATSScoreGauge";
import { InsightPanel }        from "../components/resume/InsightPanel";
import { JDUploader }          from "../components/resume/JDUploader";
import { SkillsGapTable }      from "../components/resume/SkillsGapTable";
import { ScoreImpactRoadmap }  from "../components/resume/ScoreImpactRoadmap";
import { ResumeBuilder, builderToText } from "../components/resume/ResumeBuilder";
import { VersionHistory }      from "../components/resume/VersionHistory";

const EMPTY_BUILDER: BuilderState = {
  personal: { name: "", email: "", phone: "", location: "", headline: "", summary: "", linkedin: "", github: "" },
  skills: [],
  experience: [{ role: "", company: "", start: "", end: "Present", bullets: [""] }],
  education:  [{ school: "", degree: "", start: "", end: "", details: "" }],
  projects:   [{ name: "", link: "", description: "", bullets: [""] }],
};

type TabKey = "analyzer" | "builder" | "versions";

export default function Resume() {
  const [tab, setTab] = useState<TabKey>("analyzer");

  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ATSReport | null>(null);
  const [uploading, setUploading] = useState(false);

  const [jd, setJd] = useState<JDAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [matching, setMatching] = useState(false);

  const [builderState, setBuilderState] = useState<BuilderState>(EMPTY_BUILDER);
  const [templateKey, setTemplateKey] = useState("software_engineer");
  const [savingDraft, setSavingDraft] = useState(false);
  const [analyzingBuilder, setAnalyzingBuilder] = useState(false);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [builderReport, setBuilderReport] = useState<ATSReport | null>(null);

  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved   = localStorage.getItem("resume_builder_v2");
      const savedTpl = localStorage.getItem("resume_builder_template");
      const savedId  = localStorage.getItem("resume_draft_id");
      if (saved)    setBuilderState(JSON.parse(saved));
      if (savedTpl) setTemplateKey(savedTpl);
      if (savedId)  setDraftId(Number(savedId));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("resume_builder_v2", JSON.stringify(builderState));
      localStorage.setItem("resume_builder_template", templateKey);
    } catch { /* ignore */ }
  }, [builderState, templateKey]);

  useEffect(() => {
    if (draftId) localStorage.setItem("resume_draft_id", String(draftId));
  }, [draftId]);

  useEffect(() => {
    if (tab === "versions" && draftId) loadVersions();
  }, [tab, draftId]);

  const uploadResume = async () => {
    if (!file) { setError("Select a PDF, DOCX, or TXT file."); return; }
    setUploading(true); setError(""); setReport(null); setMatchResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (jd) fd.append("jdSkills", JSON.stringify(jd.requiredSkills));
      const res = await API.post("/api/resume/upload", fd);
      setReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleJDAnalyzed = async (analyzed: JDAnalysis) => {
    setJd(analyzed); setMatchResult(null);
    if (report?.text) await runMatch(report.text, analyzed.requiredSkills);
  };

  const runMatch = async (resumeText: string, skills: string[]) => {
    setMatching(true);
    try {
      const res = await API.post("/api/resume/match", { resumeText, jdSkills: skills });
      setMatchResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Match analysis failed.");
    } finally {
      setMatching(false);
    }
  };

  const saveDraft = async (text: string) => {
    setSavingDraft(true);
    try {
      const res = await API.post("/api/resume-builder/draft", {
        id: draftId,
        title: builderState.personal.headline || builderState.personal.name || "Untitled Resume",
        payload: builderState,
        templateKey,
        atsScore: builderReport?.atsScore,
        userId: null,
      });
      const newId = res.data?.draft?.id;
      if (newId) setDraftId(newId);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Could not save draft.");
    } finally {
      setSavingDraft(false);
    }
  };

  const saveVersion = async (text: string) => {
    if (!draftId) { await saveDraft(text); return; }
    setSavingVersion(true);
    try {
      await API.post("/api/resume-builder/version", {
        draftId,
        label: new Date().toLocaleString(),
        payload: builderState,
        atsScore: builderReport?.atsScore,
      });
      if (tab === "versions") loadVersions();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Version save failed.");
    } finally {
      setSavingVersion(false);
    }
  };

  const analyzeBuilder = async (text: string) => {
    setAnalyzingBuilder(true); setError("");
    try {
      const res = await API.post("/api/resume/analyze-text", { text, jdSkills: jd?.requiredSkills ?? [] });
      setBuilderReport(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Analysis failed.");
    } finally {
      setAnalyzingBuilder(false);
    }
  };

  const loadVersions = async () => {
    if (!draftId) return;
    setLoadingVersions(true);
    try {
      const res = await API.get(\`/api/resume-builder/versions/\${draftId}\`);
      setVersions(res.data.versions ?? []);
    } catch { /* ignore */ } finally {
      setLoadingVersions(false);
    }
  };

  const restoreVersion = async (versionId: number) => {
    try {
      const res = await API.get(\`/api/resume-builder/version/\${versionId}\`);
      setBuilderState(JSON.parse(res.data.version.payload));
      setTab("builder");
    } catch { setError("Failed to restore version."); }
  };

  const activeDisplay = matchResult ?? report;

  const headerStyle = {
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    backgroundColor: "#16161F",
  };

  const cardStyle = {
    backgroundColor: "#16161F",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "20px",
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#0F0F14" }}>
      {/* Page header */}
      <div className="px-6 py-5 shadow-sm" style={headerStyle}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">Resume Studio</h1>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              ATS analysis · JD matching · AI rewrites · Builder · Export
            </p>
          </div>

          {/* Tab bar */}
          <div
            className="flex p-1 rounded-xl gap-1"
            style={{ backgroundColor: "#0F0F14", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {(["analyzer", "builder", "versions"] as TabKey[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={
                  tab === t
                    ? { background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "white" }
                    : { color: "rgba(255,255,255,0.4)", backgroundColor: "transparent" }
                }
              >
                {t === "analyzer" ? "Analyze" : t === "builder" ? "Build" : "History"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {error && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
          >
            <span className="text-red-400 text-sm">{error}</span>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300 text-xs">✕</button>
          </div>
        )}

        {/* ─── ANALYZER TAB ─── */}
        {tab === "analyzer" && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="space-y-4">
              {/* Upload card */}
              <div style={cardStyle}>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-white">Upload Resume</h2>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>PDF, DOCX, or TXT · max 10 MB</p>
                </div>

                <div
                  onClick={() => fileRef.current?.click()}
                  className="relative rounded-xl border-2 border-dashed cursor-pointer py-8 text-center transition-colors"
                  style={{ borderColor: "rgba(99,102,241,0.25)" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.5)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.25)")}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={e => { setFile(e.target.files?.[0] || null); setError(""); }}
                  />
                  {file ? (
                    <div className="space-y-1">
                      <p className="text-sm font-medium" style={{ color: "#818CF8" }}>{file.name}</p>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-3xl">📄</div>
                      <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Click to select resume</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={uploadResume}
                  disabled={uploading || !file}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all mt-4"
                  style={
                    uploading || !file
                      ? { background: "rgba(99,102,241,0.3)", cursor: "not-allowed" }
                      : { background: "linear-gradient(135deg, #6366F1, #8B5CF6)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }
                  }
                >
                  {uploading ? "Analyzing…" : "Analyze Resume"}
                </button>
              </div>

              <JDUploader
                jd={jd}
                onAnalyzed={handleJDAnalyzed}
                onClear={() => { setJd(null); setMatchResult(null); }}
              />

              {jd && report && !matchResult && (
                <button
                  onClick={() => runMatch(report.text, jd.requiredSkills)}
                  disabled={matching}
                  className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: "#16161F", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8" }}
                >
                  {matching ? "Matching…" : "Run JD Match Analysis"}
                </button>
              )}

              {report && (
                <div style={cardStyle}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>Detected Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {report.detectedSkills.length > 0
                      ? report.detectedSkills.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: "rgba(99,102,241,0.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.25)" }}
                          >
                            {s}
                          </span>
                        ))
                      : <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>None detected — check your Skills section</span>
                    }
                  </div>
                </div>
              )}
            </div>

            {/* Center + Right */}
            <div className="lg:col-span-2 space-y-4">
              {!report && !matchResult && (
                <div
                  className="rounded-2xl py-20 flex flex-col items-center gap-3 text-center border-2 border-dashed"
                  style={{ borderColor: "rgba(99,102,241,0.2)", backgroundColor: "rgba(99,102,241,0.04)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                    style={{ backgroundColor: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
                  >
                    📊
                  </div>
                  <p className="font-medium text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>Upload your resume to see your ATS score</p>
                  <p className="text-xs max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Add a job description for exact keyword matching and gap analysis</p>
                </div>
              )}

              {activeDisplay && (
                <>
                  <ATSScoreGauge score={activeDisplay.atsScore ?? 0} breakdown={activeDisplay.breakdown} breakdownDetail={activeDisplay.breakdownDetail} />

                  {activeDisplay.improvements?.length > 0 && (
                    <ScoreImpactRoadmap improvements={activeDisplay.improvements} currentScore={activeDisplay.atsScore ?? 0} />
                  )}

                  {jd && (
                    <SkillsGapTable required={jd.requiredSkills} detected={report?.detectedSkills ?? []} matchPercent={matchResult?.matchPercent} />
                  )}

                  {report?.missingSections?.length > 0 && (
                    <div
                      className="rounded-2xl p-4"
                      style={{ backgroundColor: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#FCD34D" }}>Missing Sections</p>
                      <div className="flex flex-wrap gap-1.5">
                        {report.missingSections.map(s => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.3)" }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">Improvement Insights</h3>
                    <InsightPanel insights={activeDisplay.insights ?? []} suggestions={report?.suggestions} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── BUILDER TAB ─── */}
        {tab === "builder" && (
          <ResumeBuilder
            state={builderState}
            setState={setBuilderState}
            templateKey={templateKey}
            onTemplateChange={key => setTemplateKey(key)}
            onSaveDraft={saveDraft}
            onAnalyze={analyzeBuilder}
            onSaveVersion={saveVersion}
            atsFeedback={builderReport}
            saving={savingDraft}
            analyzing={analyzingBuilder}
          />
        )}

        {/* ─── VERSIONS TAB ─── */}
        {tab === "versions" && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">Version History</h2>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {draftId ? \`Draft #\${draftId}\` : "Save a draft first to enable versioning"}
                </p>
              </div>
              {draftId && (
                <button
                  onClick={() => saveVersion(builderToText(builderState))}
                  disabled={savingVersion}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                >
                  {savingVersion ? "Saving…" : "Save Version Now"}
                </button>
              )}
            </div>
            <VersionHistory versions={versions} onRestore={restoreVersion} loading={loadingVersions} />
            {!draftId && (
              <div className="text-center">
                <button
                  onClick={() => setTab("builder")}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "#8B5CF6" }}
                >
                  → Go to Builder to start
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
`);

console.log("✅ All 7 page files rewritten with OfferPilot dark theme!");

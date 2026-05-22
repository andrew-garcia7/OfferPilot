import { API } from "../api";
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
          localStorage.setItem(`interview_${interviewId}_questions`, JSON.stringify(questions));
        } catch {}
        navigate(`/room/${interviewId}`, { state: { questions, interviewId } });
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
      {/* Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)" }}
      />
      {/* ← Back / ✕ Close nav */}
      <div className="fixed top-20 left-0 right-0 flex items-center justify-between px-6 py-2 z-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-medium transition-colors" style={{ color: "rgba(255,255,255,0.4)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <button onClick={() => navigate("/")} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" }} onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

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

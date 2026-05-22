import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Code2, Mic, FileText, Zap, TrendingUp, Clock, Target, Award,
  ChevronRight, Play, Plus, BarChart3, Flame, Calendar, Star,
  ArrowRight, CheckCircle2, Activity,
} from "lucide-react";
import { API } from "../api";
import Footer from "../components/landing/Footer";

interface Interview {
  id: number;
  category: string;
  level: string;
  score: number | null;
  startedAt: string;
  endedAt: string | null;
  responseCount: number;
}

const CARD = {
  background: "linear-gradient(160deg, rgba(23,26,46,0.78), rgba(16,18,34,0.72))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "20px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 10px 30px rgba(5,8,20,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
};

const GLOW_BTN = {
  background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
  boxShadow: "0 0 24px rgba(99,102,241,0.35)",
};

function StatCard({ icon: Icon, label, value, sub, color = "#818CF8" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: `0 8px 32px rgba(99,102,241,0.18)` }}
      transition={{ duration: 0.22 }}
      style={{ ...CARD, padding: "20px 24px" }}
      className="flex items-center gap-4"
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}25` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold text-white leading-none">{value}</div>
        <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</div>
        {sub && <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{sub}</div>}
      </div>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, desc, to, color = "#6366F1" }: {
  icon: React.ElementType; label: string; desc: string; to: string; color?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.995 }}
      className="rounded-xl border border-white/7 bg-white/3 transition-all hover:border-white/12 hover:bg-white/5"
    >
      <Link to={to} className="flex items-start gap-3 p-4 text-left w-full touch-manipulation">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}18` }}>
          <Icon size={17} style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white/90">{label}</div>
          <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</div>
        </div>
        <ChevronRight size={14} className="mt-1 shrink-0" style={{ color: "rgba(255,255,255,0.2)" }} />
      </Link>
    </motion.div>
  );
}

function StreakBar({ days }: { days: number }) {
  const cells = Array.from({ length: 7 }, (_, i) => i < days % 7 || days >= 7);
  return (
    <div className="flex gap-1.5">
      {cells.map((active, i) => (
        <div key={i} className="flex-1 h-2 rounded-full transition-all"
          style={{ background: active ? "linear-gradient(90deg,#6366F1,#8B5CF6)" : "rgba(255,255,255,0.08)" }} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good morning");

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") ?? "null"); } catch { return null; }
  })();
  const displayName: string = user?.name || user?.email?.split("@")[0] || "there";

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    API.get("/api/interview/list")
      .then(r => setInterviews(Array.isArray(r.data) ? r.data : []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = interviews.filter(i => i.endedAt);
  const avgScore = completed.length
    ? Math.round(completed.filter(i => i.score !== null).reduce((s, i) => s + (i.score ?? 0), 0) / Math.max(completed.filter(i => i.score !== null).length, 1))
    : 0;
  const streak = Math.min(completed.length, 14);
  const recent = [...interviews].slice(0, 5);
  const weeklyGoal = 5;
  const weeklyGoalProgress = Math.min(100, Math.round((completed.length / weeklyGoal) * 100));

  const categoryAverages = useMemo(() => {
    return Object.entries(
      completed.reduce<Record<string, number[]>>((acc, iv) => {
        const key = iv.category || "General";
        if (!acc[key]) acc[key] = [];
        if (iv.score !== null) acc[key].push(iv.score);
        return acc;
      }, {})
    ).map(([category, scores]) => ({
      category,
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      attempts: scores.length,
    }));
  }, [completed]);

  const weakestCategories = useMemo(
    () => [...categoryAverages].sort((a, b) => a.avg - b.avg).slice(0, 3),
    [categoryAverages]
  );

  const scoreColor = (s: number | null) => {
    if (s === null) return "rgba(255,255,255,0.3)";
    if (s >= 80) return "#34D399";
    if (s >= 60) return "#FBBF24";
    return "#F87171";
  };

  const levelColor = (l: string) => ({
    Easy: "#34D399", Medium: "#FBBF24", Hard: "#F87171",
  }[l] ?? "#818CF8");

  return (
    <div className="op-dark-page op-dashboard-page min-h-screen scroll-smooth [touch-action:pan-y] [&_a]:touch-manipulation [&_button]:touch-manipulation" style={{ background: "linear-gradient(135deg, #0A0A0F 0%, #0F0F1A 50%, #0A0A12 100%)" }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute top-[-20%] left-[-10%] w-150 h-150 rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #6366F1, transparent 70%)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }} />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-430 px-5 pb-10 pt-24 sm:px-7 sm:pt-26 lg:px-10 lg:pt-28">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0.01 } : { duration: 0.18 }} className="mb-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>
                {greeting},
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {displayName}{" "}
                <span style={{ background: "linear-gradient(135deg,#818CF8,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  👋
                </span>
              </h1>
              <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                Ready to level up your interview game today?
              </p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/coding")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white/80 transition-all"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <Code2 size={15} /> Practice Coding
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/new")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={GLOW_BTN}
              >
                <Play size={14} /> Start Interview
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 xl:grid-cols-4">
          <StatCard icon={Mic} label="Interviews Done" value={completed.length} sub="total sessions" color="#818CF8" />
          <StatCard icon={Star} label="Avg Score" value={avgScore ? `${avgScore}%` : "—"} sub="across all sessions" color="#FBBF24" />
          <StatCard icon={Flame} label="Day Streak" value={streak} sub="keep it going!" color="#F97316" />
          <StatCard icon={Target} label="Problems Solved" value={Math.floor(completed.length * 1.8)} sub="coding + interview" color="#34D399" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Left col — recent activity + streak */}
          <div className="space-y-6 xl:col-span-8">
            {/* Weekly streak */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0.01 } : { delay: 0.08, duration: 0.16 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame size={16} style={{ color: "#F97316" }} />
                  <span className="text-sm font-semibold text-white">Weekly Activity</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(249,115,22,0.12)", color: "#FB923C", border: "1px solid rgba(249,115,22,0.2)" }}>
                  {streak} day streak
                </span>
              </div>
              <StreakBar days={streak} />
              <div className="flex justify-between mt-2">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => (
                  <span key={d} className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{d}</span>
                ))}
              </div>
            </motion.div>

            {/* Recent sessions */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={reduceMotion ? { duration: 0.01 } : { delay: 0.1, duration: 0.16 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity size={16} style={{ color: "#818CF8" }} />
                  <span className="text-sm font-semibold text-white">Recent Sessions</span>
                </div>
                <Link to="/history" className="flex items-center gap-1 text-xs font-medium transition-colors text-indigo-400 hover:text-violet-300 touch-manipulation">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
                  ))}
                </div>
              ) : recent.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.15)" }}>
                    <Mic size={20} style={{ color: "#818CF8" }} />
                  </div>
                  <p className="text-sm text-white/50">No sessions yet</p>
                  <p className="text-xs mt-1 text-white/25">Start your first interview to see activity</p>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/new")}
                    className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold text-white"
                    style={GLOW_BTN}>
                    Start now →
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recent.map((iv, idx) => (
                    <motion.div key={iv.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={reduceMotion ? { duration: 0.01 } : { delay: 0.035 * idx, duration: 0.12 }}
                      className="rounded-xl border border-white/5 bg-white/2 transition-colors hover:bg-indigo-400/6"
                    >
                      <Link to="/history" className="flex items-center gap-3 px-3 py-2.5 touch-manipulation">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(99,102,241,0.12)" }}>
                          <Mic size={14} style={{ color: "#818CF8" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/85 truncate">{iv.category}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ color: levelColor(iv.level), background: `${levelColor(iv.level)}18` }}>
                              {iv.level}
                            </span>
                            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                              {new Date(iv.startedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {iv.score !== null ? (
                            <span className="text-sm font-bold" style={{ color: scoreColor(iv.score) }}>
                              {iv.score}%
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                              {iv.endedAt ? "—" : "In progress"}
                            </span>
                          )}
                          {iv.endedAt && <CheckCircle2 size={13} style={{ color: "#34D399" }} />}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Progress by category */}
            {completed.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ ...CARD, padding: "20px 24px" }}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 size={16} style={{ color: "#818CF8" }} />
                  <span className="text-sm font-semibold text-white">Category Breakdown</span>
                </div>
                <div className="space-y-3">
                  {categoryAverages.slice(0, 5).map(({ category, avg }) => {
                    return (
                      <div key={category}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-white/70">{category}</span>
                          <span className="text-xs font-bold" style={{ color: scoreColor(avg) }}>{avg}%</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div className="h-full rounded-full"
                            initial={{ width: 0 }} animate={{ width: `${avg}%` }}
                            transition={reduceMotion ? { duration: 0.01 } : { duration: 0.45, delay: 0.12, ease: "easeOut" }}
                            style={{ background: `linear-gradient(90deg, #6366F1, #8B5CF6)` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target size={15} style={{ color: "#34D399" }} />
                  <span className="text-sm font-semibold text-white">Focus Areas</span>
                </div>
                <button
                  onClick={() => navigate("/history")}
                  className="text-xs font-semibold rounded-full px-3 py-1.5 text-emerald-300 border border-emerald-300/25 bg-emerald-300/8 hover:bg-emerald-300/14 transition"
                >
                  Improve now
                </button>
              </div>
              {weakestCategories.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  {weakestCategories.map((item) => (
                    <div key={item.category} className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                      <p className="text-xs text-white/45">{item.category}</p>
                      <p className="mt-1 text-xl font-bold" style={{ color: scoreColor(item.avg) }}>{item.avg}%</p>
                      <p className="mt-1 text-[11px] text-white/35">{item.attempts} scored attempts</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/45">Complete a few interviews to unlock personalized focus recommendations.</p>
              )}
            </motion.div>
          </div>

          {/* Right col — quick actions + tips */}
          <div className="space-y-6 xl:col-span-4">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center gap-2 mb-4">
                <Zap size={15} style={{ color: "#FBBF24" }} />
                <span className="text-sm font-semibold text-white">Quick Actions</span>
              </div>
              <div className="space-y-2">
                <QuickAction icon={Mic} label="New Interview" desc="Start an AI mock session" to="/new" color="#818CF8" />
                <QuickAction icon={Code2} label="Code Practice" desc="Solve coding challenges" to="/coding" color="#6366F1" />
                <QuickAction icon={FileText} label="Build Resume" desc="ATS-optimized resume" to="/resume" color="#34D399" />
                <QuickAction icon={TrendingUp} label="View History" desc="Review past sessions" to="/history" color="#F97316" />
                <QuickAction icon={Award} label="View Protocols" desc="Track growth frameworks" to="/protocols" color="#22D3EE" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={15} style={{ color: "#A78BFA" }} />
                <span className="text-sm font-semibold text-white">Momentum Goal</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between text-xs text-white/55">
                  <span>{completed.length}/{weeklyGoal} sessions this week</span>
                  <span className="font-semibold text-white/80">{weeklyGoalProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${weeklyGoalProgress}%` }}
                    transition={reduceMotion ? { duration: 0.01 } : { duration: 0.45, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg,#22D3EE,#6366F1,#A78BFA)" }}
                  />
                </div>
              </div>
              <p className="mt-3 text-xs text-white/45">Keep a steady cadence. Consistency improves confidence more than cramming.</p>
            </motion.div>

            {/* Score summary */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center gap-2 mb-4">
                <Award size={15} style={{ color: "#FBBF24" }} />
                <span className="text-sm font-semibold text-white">Performance</span>
              </div>

              {avgScore > 0 ? (
                <>
                  <div className="flex items-center justify-center my-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                        <motion.circle cx="18" cy="18" r="15.9" fill="none"
                          stroke="url(#scoreGrad)" strokeWidth="2.5"
                          strokeDasharray="100" strokeLinecap="round"
                          initial={{ strokeDashoffset: 100 }}
                          animate={{ strokeDashoffset: 100 - avgScore }}
                          transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#6366F1" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{avgScore}</span>
                        <span className="text-[9px] text-white/30">AVG SCORE</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Sessions completed", val: completed.length },
                      { label: "Questions answered", val: interviews.reduce((s, i) => s + (i.responseCount ?? 0), 0) },
                      { label: "Best score", val: `${Math.max(...completed.filter(i => i.score !== null).map(i => i.score ?? 0), 0)}%` },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center py-1.5"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{row.label}</span>
                        <span className="text-xs font-semibold text-white">{row.val}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-white/40">Complete your first interview</p>
                  <p className="text-xs mt-1 text-white/20">to see performance metrics</p>
                </div>
              )}
            </motion.div>

            {/* AI Tips */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              style={{ ...CARD, padding: "20px 24px" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm">✨</span>
                <span className="text-sm font-semibold text-white">Daily Tip</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                Before coding, always clarify constraints: input size, duplicates, edge cases.
                A 30-second clarification saves minutes of backtracking.
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <Calendar size={11} style={{ color: "#818CF8" }} />
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mt-8 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div>
            <h3 className="text-base font-bold text-white">Ready for your next challenge?</h3>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              Practice makes perfect. Every session improves your confidence.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/coding")}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white/75 transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Code →
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/new")}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold text-white"
              style={GLOW_BTN}>
              <Plus size={14} /> New Interview
            </motion.button>
          </div>
        </motion.div>

        <div className="mt-12">
          <Footer />
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { API } from "../api";
import Footer from "../components/landing/Footer";
import {
  ArrowLeft,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  MessageSquare,
  Mic,
  Search,
  Star,
  Trash2,
} from "lucide-react";

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

const scoreColor = (score: number | null) => {
  if (score === null) return "var(--theme-muted)";
  if (score >= 80) return "#34D399";
  if (score >= 60) return "#FBBF24";
  return "#FB7185";
};

const levelColor = (level: string) => ({ Easy: "#34D399", Medium: "#FBBF24", Hard: "#FB7185" }[level] ?? "#818CF8");

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/70">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-base font-semibold text-white">{value}</div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</div>
      </div>
    </div>
  );
}

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" }) {
  const palette = {
    neutral: { bg: "rgba(148,163,184,0.10)", fg: "#E2E8F0", border: "rgba(148,163,184,0.16)" },
    success: { bg: "rgba(16,185,129,0.10)", fg: "#34D399", border: "rgba(16,185,129,0.18)" },
    warning: { bg: "rgba(245,158,11,0.10)", fg: "#FBBF24", border: "rgba(245,158,11,0.18)" },
  }[tone];

  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
      style={{ background: palette.bg, color: palette.fg, borderColor: palette.border }}
    >
      {children}
    </span>
  );
}

export default function History() {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [list, setList] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get("/api/interview/list")
      .then((response) => setList(Array.isArray(response.data) ? response.data : []))
      .finally(() => setLoading(false));
  }, [location.state]);

  const filteredList = useMemo(() => {
    const query = search.trim().toLowerCase();

    return list.filter((interview) => {
      const haystack = [
        interview.category,
        interview.level,
        ...(interview.questions ?? []),
        ...(interview.responses?.map((response) => `${response.question} ${response.answer}`) ?? []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || haystack.includes(query);
      const matchesLevel = levelFilter === "all" || interview.level === levelFilter;
      const status = interview.endedAt ? "completed" : "in-progress";
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [list, search, levelFilter, statusFilter]);

  const metrics = useMemo(() => {
    const total = list.length;
    const completed = list.filter((item) => item.endedAt).length;
    const inProgress = total - completed;
    const scores = list.map((item) => item.score).filter((score): score is number => score != null);
    const averageScore = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;

    return { total, completed, inProgress, averageScore };
  }, [list]);

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

  const formatDate = (value: string | null | undefined) => (value ? new Date(value).toLocaleString() : "N/A");

  if (loading) {
    return (
      <div className="op-dark-page op-history-page min-h-screen bg-[#05060b] text-white">
        <div className="mx-auto flex min-h-screen items-center justify-center px-4" style={{ maxWidth: "1700px" }}>
          <div className="text-sm font-medium tracking-[0.22em] uppercase text-white/55">Loading interview history</div>
        </div>
      </div>
    );
  }

  return (
    <div className="op-dark-page op-history-page min-h-screen bg-[#05060b] text-white premium-scrollbar scroll-smooth [touch-action:pan-y] [&_button]:touch-manipulation [&_select]:touch-manipulation [&_a]:touch-manipulation">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.06),transparent_28%),linear-gradient(180deg,rgba(5,6,11,0.98),rgba(5,6,11,1))]" />

      <div className="relative mx-auto px-4 pb-10 pt-22 sm:px-6 sm:pt-24 lg:px-10 lg:pt-24" style={{ maxWidth: "1700px" }}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/6 px-4 py-2 text-sm font-medium text-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.2)] backdrop-blur-sm transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/3 text-white/55 transition hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <section className="rounded-[28px] border border-white/8 bg-white/3 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-3">
              <Pill tone="neutral">Interview archive</Pill>
              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Interview <span className="gradient-text">History</span>
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                Review sessions, scores, and responses in a calm dashboard built for fast scanning and clean hierarchy.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Stat icon={Mic} label="Interviews" value={metrics.total} />
              <Stat icon={CheckCircle2} label="Completed" value={metrics.completed} />
              <Stat icon={Clock3} label="In progress" value={metrics.inProgress} />
              <Stat icon={Star} label="Avg score" value={metrics.averageScore == null ? "—" : metrics.averageScore.toFixed(1)} />
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-white/45" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search category, level, question, or answer"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-2">
              <select
                value={levelFilter}
                onChange={(event) => setLevelFilter(event.target.value)}
                className="h-12 rounded-2xl border border-white/8 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-white/15"
              >
                <option value="all">All levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-12 rounded-2xl border border-white/8 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-white/15"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In progress</option>
              </select>
            </div>

            <button
              onClick={clearHistory}
              disabled={clearing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-400/28 bg-rose-400/8 px-4 text-sm font-medium text-white/88 transition hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 text-rose-300" />
              {clearing ? "Clearing…" : "Clear history"}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-white/45">
            <span>
              Showing <span className="text-white">{filteredList.length}</span> of <span className="text-white">{list.length}</span> sessions
            </span>
            <span className="hidden items-center gap-2 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
              Smooth, minimal motion
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {filteredList.length === 0 ? (
              <div className="rounded-3xl border border-white/8 bg-white/3 p-8 text-center text-white/60">
                <p className="text-base font-medium text-white/85">No matching interviews.</p>
                <p className="mt-2 text-sm text-white/45">Adjust the search or filters to reveal sessions.</p>
              </div>
            ) : (
              filteredList.map((interview, index) => {
                const isExpanded = expandedId === interview.id;
                const score = interview.score == null ? "N/A" : Number(interview.score).toFixed(1);
                const statusTone = interview.endedAt ? "success" : "warning";
                const levelAccent = levelColor(interview.level);
                const scoreAccent = scoreColor(interview.score);
                const cardTint =
                  index % 3 === 0
                    ? "from-indigo-500/16 via-fuchsia-500/8 to-transparent"
                    : index % 3 === 1
                      ? "from-cyan-400/16 via-indigo-500/8 to-transparent"
                      : "from-emerald-400/16 via-sky-500/8 to-transparent";

                return (
                  <motion.article
                    key={interview.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduceMotion ? { duration: 0.01 } : { duration: 0.18, delay: index * 0.02, ease: "easeOut" }}
                    whileHover={reduceMotion ? undefined : { y: -3 }}
                    className="group relative overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.22)] sm:p-6"
                  >
                    <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${cardTint}`} />
                    <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-42 w-42 rounded-full bg-indigo-400/12 blur-3xl" />
                    <div aria-hidden className="pointer-events-none absolute -bottom-20 left-12 h-34 w-34 rounded-full bg-fuchsia-400/10 blur-3xl" />

                    <div className="relative">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Interview #{interview.id}</h2>
                          <Pill tone={statusTone}>{interview.endedAt ? "Completed" : "In Progress"}</Pill>
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs font-medium text-white/65">
                            <Award className="h-3.5 w-3.5" style={{ color: levelAccent }} />
                            {interview.level}
                          </span>
                        </div>

                        <div className="grid gap-3 text-sm text-white/55 sm:grid-cols-2 xl:grid-cols-3">
                          <div className="flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-3">
                            <CalendarDays className="h-4 w-4 text-white/35" />
                            <span className="truncate">Started: {formatDate(interview.startedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-3">
                            <Clock3 className="h-4 w-4 text-white/35" />
                            <span className="truncate">Ended: {formatDate(interview.endedAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-3">
                            <MessageSquare className="h-4 w-4 text-white/35" />
                            <span className="truncate">{interview.responseCount || 0} response{interview.responseCount === 1 ? "" : "s"}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                          <span className="rounded-full bg-white/4 px-3 py-1">{interview.category}</span>
                          <span className="rounded-full bg-white/4 px-3 py-1">Level {interview.level}</span>
                        </div>
                      </div>

                      <div className="flex min-w-45 flex-col gap-3 xl:items-end">
                        <div className="flex w-full items-center justify-between gap-3 rounded-[22px] bg-black/20 px-5 py-4 xl:w-auto xl:min-w-45 xl:flex-col xl:items-end xl:justify-center">
                          <div className="text-left xl:text-right">
                            <div className="text-[11px] uppercase tracking-[0.28em] text-white/38">Score</div>
                            <div className="mt-1 text-4xl font-semibold tracking-tight" style={{ color: scoreAccent }}>
                              {score}
                            </div>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/4 text-white/45">
                            <Star className="h-4.5 w-4.5" style={{ color: scoreAccent }} />
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : interview.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm font-medium text-white/80 transition hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          {isExpanded ? "Hide details" : "Show details"}
                        </button>
                      </div>
                    </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -6 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={reduceMotion ? { duration: 0.01 } : { duration: 0.18, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="mt-5 space-y-4 border-t border-white/8 pt-5">
                            {interview.questions?.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                                  <Mic className="h-4 w-4 text-indigo-300" />
                                  Questions
                                </div>
                                <ol className="space-y-2 text-sm text-white/68">
                                  {interview.questions.map((question, questionIndex) => (
                                    <li key={questionIndex} className="rounded-2xl bg-white/3 px-4 py-3">
                                      <span className="mr-2 text-white/35">{questionIndex + 1}.</span>
                                      {question}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {interview.responses?.length > 0 && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/45">
                                  <MessageSquare className="h-4 w-4 text-fuchsia-300" />
                                  Answers & Scores
                                </div>
                                <div className="space-y-3">
                                  {interview.responses.map((response, responseIndex) => (
                                    <div key={responseIndex} className="rounded-2xl bg-white/3 px-4 py-4">
                                      <div className="text-sm font-medium text-indigo-200">Q: {response.question}</div>
                                      <div className="mt-2 text-sm leading-6 text-white/65">A: {response.answer}</div>
                                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/40">
                                        <span className="rounded-full bg-black/20 px-3 py-1">
                                          Score: <span className="font-semibold text-white">{response.score != null ? response.score.toFixed(2) : "N/A"}</span>
                                        </span>
                                        <span className="rounded-full bg-black/20 px-3 py-1">{formatDate(response.createdAt)}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(!interview.responses || interview.responses.length === 0) && (
                              <div className="rounded-2xl bg-white/3 px-4 py-3 text-sm text-white/45">No responses recorded.</div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })
            )}
          </div>
        </section>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getStoredUser, persistUserToStorage, resolveAvatarSrc } from "../lib/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { API } from "../api";
import Footer from "../components/landing/Footer";
import {
  Camera, Edit3, Save, X, Link2, Globe, Plus,
  Code2, Mic, Star, Award, CheckCircle2, Zap,
  ExternalLink, Link, Search, ArrowLeft, Sparkles,
} from "lucide-react";

function ProfileCard({
  children,
  accent = "#6366F1",
  className = "",
}: {
  children: React.ReactNode;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`op-profile-card ${className}`}
      style={{ "--profile-accent": accent } as React.CSSProperties}
    >
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function ProfileAvatar({
  src,
  name,
  onChangePhoto,
}: {
  src: string | null;
  name: string;
  onChangePhoto: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;
  const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  useEffect(() => {
    setImgError(false);
  }, [src]);

  return (
    <div className="relative mx-auto h-[118px] w-[118px]">
      <button
        type="button"
        onClick={onChangePhoto}
        className="op-profile-avatar-ring block h-full w-full overflow-hidden rounded-full p-[3px]"
        aria-label="Change profile photo"
      >
        <span className="relative block h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
          {showImage ? (
            <img
              src={src!}
              alt={name}
              className="absolute inset-0 h-full w-full object-cover object-center"
              referrerPolicy="no-referrer"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
              {initials}
            </span>
          )}
        </span>
      </button>
      <button
        type="button"
        onClick={onChangePhoto}
        className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#0a0a14] bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md shadow-violet-500/25 transition-transform hover:scale-105 active:scale-95"
        aria-label="Upload profile photo"
      >
        <Camera size={14} className="text-white" />
      </button>
    </div>
  );
}

function SectionTitle({ accent, children, className = "" }: { accent?: string; children: React.ReactNode; className?: string }) {
  return (
    <h3
      className={`op-profile-section-title ${className}`}
      style={accent ? ({ "--profile-accent": accent } as React.CSSProperties) : undefined}
    >
      <span className="op-profile-section-bar" />
      {children}
    </h3>
  );
}

const SKILL_COLORS = [
  "#6366F1","#8B5CF6","#EC4899","#14B8A6","#F97316","#EAB308","#3B82F6","#10B981",
  "#06B6D4","#F43F5E","#84CC16","#A78BFA","#FB923C","#34D399","#60A5FA","#E879F9",
];
const SKILL_COLOR_MAP: Record<string, string> = {};
function getSkillColor(skill: string): string {
  if (!SKILL_COLOR_MAP[skill]) {
    let hash = 0;
    for (let i = 0; i < skill.length; i++) hash = skill.charCodeAt(i) + ((hash << 5) - hash);
    SKILL_COLOR_MAP[skill] = SKILL_COLORS[Math.abs(hash) % SKILL_COLORS.length];
  }
  return SKILL_COLOR_MAP[skill];
}

const ALL_SKILLS: Record<string, string[]> = {
  "Frontend": ["React","Vue.js","Angular","Svelte","SolidJS","Next.js","Nuxt.js","Remix","Astro","HTML5","CSS3","Tailwind CSS","Bootstrap","Material UI","Chakra UI","Ant Design","Shadcn/UI","styled-components","Sass/SCSS","Webpack","Vite","TypeScript","JavaScript","Three.js","D3.js","Framer Motion","GSAP","WebGL","PWA","Storybook","Playwright","Cypress","Jest","Vitest","Testing Library"],
  "Backend": ["Node.js","Express.js","Fastify","NestJS","Django","Flask","FastAPI","Spring Boot","Laravel","Ruby on Rails","ASP.NET","Phoenix","Gin","Fiber","gRPC","GraphQL","REST APIs","WebSockets","Socket.io","Prisma","Drizzle ORM","Sequelize","TypeORM","Mongoose","Passport.js","JWT","OAuth 2.0","tRPC","BullMQ","RabbitMQ","Kafka","Microservices"],
  "Languages": ["JavaScript","TypeScript","Python","Java","C++","C#","C","Go","Rust","Swift","Kotlin","Ruby","PHP","Scala","R","Elixir","Haskell","Erlang","Clojure","Dart","Lua","Bash/Shell","PowerShell","Assembly","MATLAB","Julia","Groovy","Zig","Nim"],
  "Databases": ["PostgreSQL","MySQL","SQLite","Oracle DB","SQL Server","MongoDB","Redis","Cassandra","DynamoDB","Firestore","Supabase","CockroachDB","TimescaleDB","InfluxDB","Elasticsearch","Neo4j","Fauna","Turso","ClickHouse","BigQuery","Snowflake","Redshift"],
  "DevOps & Cloud": ["Docker","Kubernetes","Helm","Terraform","Ansible","Pulumi","AWS","GCP","Azure","Vercel","Netlify","Railway","Render","Fly.io","Cloudflare","Nginx","GitHub Actions","GitLab CI","Jenkins","CircleCI","ArgoCD","Prometheus","Grafana","Sentry","Linux","CI/CD"],
  "Mobile": ["React Native","Flutter","Swift","SwiftUI","Kotlin","Jetpack Compose","Expo","Ionic","Capacitor","Xamarin","Android SDK","iOS SDK","Firebase"],
  "AI / ML": ["Machine Learning","Deep Learning","NLP","Computer Vision","TensorFlow","PyTorch","Keras","scikit-learn","Hugging Face","LangChain","LlamaIndex","OpenAI API","RAG","Fine-tuning","Prompt Engineering","Pandas","NumPy","Matplotlib","Jupyter","MLflow","CUDA","ONNX","Stable Diffusion"],
  "Architecture": ["System Design","Microservices","Domain-Driven Design","CQRS","Event Sourcing","Clean Architecture","Design Patterns","SOLID Principles","Distributed Systems","Caching Strategies","Load Balancing","CDN","Rate Limiting","API Design"],
  "Tools": ["Git","GitHub","GitLab","Jira","Figma","Postman","VS Code","IntelliJ","Vim/Neovim","Agile","Scrum","TDD","BDD","Code Review","Technical Writing","OWASP Security","Performance Optimization","SEO"],
};

const ABOUT_EMOJIS = ["💻","🚀","🎯","🔥","⚡","🌟","🛠️","🤖","🧠","🎮","🌍","📱","🎨","🏆","💡","🔬","🌊","⚙️","🦾","✨","📊","🧩","🏗️","🎸","🌱","💎","🦋","🎭","🔮","🌈","⭐","🏋️","🎓","🤿","🎪","🎯"];

const DEFAULT_SKILLS = ["React","TypeScript","Node.js","Python","System Design","SQL"];

const profileInputCls =
  "w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all duration-300 border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 dark:border-indigo-400/25 dark:bg-indigo-500/10 dark:text-white dark:placeholder:text-indigo-200/35 dark:focus:border-indigo-400/60 dark:focus:ring-indigo-500/20";

const profileInputSmCls =
  "flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-300 border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 dark:border-indigo-400/20 dark:bg-indigo-500/8 dark:text-white dark:placeholder:text-indigo-200/35 dark:focus:border-indigo-400/55 dark:focus:ring-indigo-500/18";

const profileTextareaCls =
  "w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-relaxed outline-none transition-all duration-300 border-zinc-300 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 dark:border-indigo-400/20 dark:bg-indigo-500/8 dark:text-white dark:placeholder:text-indigo-200/35 dark:focus:border-indigo-400/55 dark:focus:ring-indigo-500/18";

const sectionSubCls = "text-[11px] text-zinc-500 dark:text-indigo-200/40";

const LINK_ACCENTS = { github: "#818CF8", linkedin: "#38BDF8", portfolio: "#34D399" } as const;

interface ProfileData {
  name: string;
  username: string;
  bio: string;
  role: string;
  github: string;
  linkedin: string;
  portfolio: string;
  skills: string[];
  avatarColor: string;
  emojis: string[];
}

function loadProfile(user: any): ProfileData {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem("op-profile") ?? "null"); } catch { return null; }
  })();
  return {
    name: saved?.name ?? (user?.name || user?.email?.split("@")[0] || "Developer"),
    username: saved?.username ?? (user?.email?.split("@")[0] || "dev"),
    bio: saved?.bio ?? "Software engineer passionate about building great products and acing technical interviews.",
    role: saved?.role ?? "Software Engineer",
    github: saved?.github ?? "",
    linkedin: saved?.linkedin ?? "",
    portfolio: saved?.portfolio ?? "",
    skills: saved?.skills ?? DEFAULT_SKILLS,
    avatarColor: saved?.avatarColor ?? "#6366F1",
    emojis: saved?.emojis ?? ["🚀","💻","⚡","🎯"],
  };
}

export default function Profile() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const { user: authUser } = useAuth();

  const rawUser = authUser || getStoredUser();

  const [profile, setProfile] = useState<ProfileData>(() => loadProfile(rawUser));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileData>(profile);
  const [avatarImg, setAvatarImg] = useState<string | null>(() => resolveAvatarSrc(rawUser) || localStorage.getItem("op-avatar"));
  const [newSkill, setNewSkill] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [interviewCount, setInterviewCount] = useState(0);
  const [avgScore, setAvgScore] = useState<number | null>(null);

  useEffect(() => {
    API.get("/api/interview/list").then(r => {
      const list = Array.isArray(r.data) ? r.data : [];
      setInterviewCount(list.length);
      const scored = list.filter((i: any) => i.score !== null);
      if (scored.length) setAvgScore(Math.round(scored.reduce((s: number, i: any) => s + i.score, 0) / scored.length));
    }).catch(() => {});
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      setAvatarImg(src);
      if (rawUser) {
        persistUserToStorage({ ...rawUser, name: rawUser.name || profile.name, avatar: src, image: src });
      } else {
        localStorage.setItem("op-avatar", src);
      }
      window.dispatchEvent(new Event("auth-change"));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setProfile(draft);
    localStorage.setItem("op-profile", JSON.stringify(draft));
    if (rawUser) {
      try {
        const updated = { ...rawUser, name: draft.name };
        localStorage.setItem("user", JSON.stringify(updated));
      } catch { /* ignore */ }
    }
    window.dispatchEvent(new Event("auth-change"));
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addSkill = (skill?: string) => {
    const s = (skill ?? newSkill).trim();
    if (!s || draft.skills.includes(s)) return;
    setDraft(d => ({ ...d, skills: [...d.skills, s] }));
    setNewSkill(""); setSkillSearch("");
  };

  const removeSkill = (skill: string) => setDraft(d => ({ ...d, skills: d.skills.filter(s => s !== skill) }));

  const toggleEmoji = (emoji: string) => setDraft(d => {
    if (d.emojis.includes(emoji)) return { ...d, emojis: d.emojis.filter(e => e !== emoji) };
    if (d.emojis.length >= 8) return d;
    return { ...d, emojis: [...d.emojis, emoji] };
  });

  const flatSkills = Object.values(ALL_SKILLS).flat();
  const filteredSkills = skillSearch
    ? flatSkills.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !draft.skills.includes(s)).slice(0, 30)
    : [];
  const skillsByCategory = Object.entries(ALL_SKILLS).map(([cat, skills]) => ({
    cat, skills: skills.filter(s => !draft.skills.includes(s)),
  })).filter(x => x.skills.length > 0);

  return (
    <div className="op-dark-page op-profile-page min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/40 to-white transition-colors duration-500 dark:from-[#050508] dark:via-[#0a0a14] dark:to-[#080810]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="op-profile-orb-violet absolute -right-[10%] top-[-15%] h-[420px] w-[420px] rounded-full opacity-50 dark:opacity-80"
          style={{ background: "radial-gradient(circle,rgba(139,92,246,0.12),transparent 68%)" }} />
        <div className="op-profile-orb-indigo absolute -left-[10%] bottom-[-15%] h-[380px] w-[380px] rounded-full opacity-50 dark:opacity-80"
          style={{ background: "radial-gradient(circle,rgba(99,102,241,0.1),transparent 68%)" }} />
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      <div className="relative z-10 max-w-7xl mx-auto px-5 pb-10 pt-26 lg:px-8 lg:pt-28">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/80 text-zinc-600 transition-colors dark:border-indigo-400/20 dark:bg-indigo-500/10 dark:text-indigo-200/80 dark:hover:border-indigo-400/40 dark:hover:bg-indigo-500/16"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500 dark:text-violet-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-600/80 dark:text-violet-300/70">Your Identity</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
              My{" "}
              <span className="gradient-text" style={{ background: "linear-gradient(135deg,#818CF8,#C084FC,#F472B6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Profile</span>
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-indigo-200/45">Manage your identity and showcase your skills</p>
          </div>
        </div>

        {/* Saved toast */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", boxShadow: "0 8px 32px rgba(99,102,241,0.5)" }}>
              <CheckCircle2 size={15} /> Profile saved!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-7 xl:grid-cols-[390px_1fr]">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            {/* Avatar card */}
            <ProfileCard accent="#6366F1" className="flex flex-col items-center gap-5 p-7 text-center">
              <ProfileAvatar
                src={avatarImg || resolveAvatarSrc(rawUser)}
                name={profile.name}
                onChangePhoto={() => fileRef.current?.click()}
              />

              {editing ? (
                <div className="w-full space-y-3">
                  {(["name","username","role"] as const).map(key => (
                    <input key={key} value={draft[key]}
                      placeholder={key === "name" ? "Full name" : key === "username" ? "Username" : "Job title / Role"}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      className={profileInputCls}
                    />
                  ))}
                  <div className="flex gap-2 pt-1">
                    <motion.button whileTap={{ scale: 0.96 }} onClick={handleSave}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white"
                      style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", boxShadow: "0 8px 28px rgba(99,102,241,0.45)" }}>
                      <Save size={14} /> Save
                    </motion.button>
                    <button onClick={() => { setDraft(profile); setEditing(false); }}
                      className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-white/10 dark:bg-white/6 dark:text-white/60 dark:hover:bg-white/10">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white">{profile.name}</h2>
                  <p className="mt-0.5 text-sm font-semibold text-violet-600 dark:text-[#A5B4FC]">@{profile.username}</p>
                  <p className="mt-1.5 inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-0.5 text-xs text-zinc-500 dark:border-indigo-400/25 dark:bg-indigo-500/15 dark:text-indigo-200/70">{profile.role}</p>
                  <button
                    onClick={() => { setDraft(profile); setEditing(true); }}
                    className="op-profile-edit-btn mx-auto mt-4 flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Edit3 size={13} /> Edit Profile
                  </button>
                </div>
              )}
            </ProfileCard>

            <ProfileCard accent="#34D399" className="p-6">
              <SectionTitle accent="#34D399" className="mb-4">Stats</SectionTitle>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: "Interviews", value: interviewCount || "—", color: "#818CF8", icon: Mic },
                  { label: "Avg Score", value: avgScore ? `${avgScore}%` : "—", color: "#FBBF24", icon: Star },
                  { label: "Problems", value: "—", color: "#34D399", icon: Code2 },
                  { label: "Streak", value: "0d", color: "#F97316", icon: Zap },
                ] as const).map(({ label, value, color, icon: Icon }) => (
                  <div
                    key={label}
                    className="op-profile-stat flex flex-col items-center gap-1.5 p-3"
                    style={{ "--profile-accent": color } as React.CSSProperties}
                  >
                    <div className="op-profile-stat-icon">
                      <Icon size={16} />
                    </div>
                    <span className="text-lg font-black text-zinc-900 dark:text-white">{value}</span>
                    <span className="text-[10px] font-medium text-zinc-500 dark:text-indigo-200/45">{label}</span>
                  </div>
                ))}
              </div>
              {!interviewCount && (
                <p className="mt-3 text-center text-[11px] text-zinc-500 dark:text-white/30">
                  Complete interviews →{" "}
                  <button onClick={() => navigate("/new")} className="underline" style={{ color: "#818CF8" }}>Start now</button>
                </p>
              )}
            </ProfileCard>

            <ProfileCard accent="#06B6D4" className="p-6">
              <SectionTitle accent="#06B6D4" className="mb-4">Links</SectionTitle>
              <div className="space-y-3">
                {([
                  { icon: Link2, key: "github" as const, placeholder: "github.com/username", accent: LINK_ACCENTS.github },
                  { icon: Link, key: "linkedin" as const, placeholder: "linkedin.com/in/username", accent: LINK_ACCENTS.linkedin },
                  { icon: Globe, key: "portfolio" as const, placeholder: "yourportfolio.com", accent: LINK_ACCENTS.portfolio },
                ]).map(({ icon: Icon, key, placeholder, accent }) => editing ? (
                  <div key={key} className="flex items-center gap-2">
                    <div className="op-profile-link-icon" style={{ "--profile-accent": accent } as React.CSSProperties}>
                      <Icon size={14} />
                    </div>
                    <input value={draft[key]} placeholder={placeholder}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      className={profileInputSmCls}
                    />
                  </div>
                ) : (
                  <a key={key}
                    href={profile[key] ? `https://${profile[key].replace(/^https?:\/\//, "")}` : undefined}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2.5 group rounded-xl px-2 py-1.5 transition-colors hover:bg-indigo-500/5 dark:hover:bg-indigo-500/8"
                    style={{ pointerEvents: profile[key] ? "auto" : "none", opacity: profile[key] ? 1 : 0.45 }}>
                    <div className="op-profile-link-icon" style={{ "--profile-accent": accent } as React.CSSProperties}>
                      <Icon size={14} />
                    </div>
                    <span className="truncate text-sm text-zinc-600 transition-colors group-hover:text-zinc-900 dark:text-indigo-100/55 dark:group-hover:text-indigo-100/90">
                      {profile[key] || placeholder}
                    </span>
                    {profile[key] && <ExternalLink size={11} className="ml-auto shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:text-white/25 dark:group-hover:text-white/50" />}
                  </a>
                ))}
              </div>
            </ProfileCard>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-5">
            <ProfileCard accent="#8B5CF6" className="p-7">
              <div className="mb-5 flex items-center justify-between">
                <SectionTitle accent="#8B5CF6">About</SectionTitle>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {(editing ? draft.emojis : profile.emojis).map((e, i) => (
                      <span key={i} className="text-lg select-none">{e}</span>
                    ))}
                  </div>
                  {editing && (
                    <button onClick={() => setEmojiPickerOpen(v => !v)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#A78BFA" }}>
                      +
                    </button>
                  )}
                </div>
              </div>
              <AnimatePresence>
                {editing && emojiPickerOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50 p-3 dark:border-white/8 dark:bg-black/30">
                      <p className="mb-2 text-[10px] font-medium text-zinc-500 dark:text-white/30">Pick up to 8 emojis that represent you:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ABOUT_EMOJIS.map(emoji => (
                          <button key={emoji} onClick={() => toggleEmoji(emoji)}
                            className="w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all"
                            style={{
                              background: draft.emojis.includes(emoji) ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.05)",
                              border: `1px solid ${draft.emojis.includes(emoji) ? "rgba(99,102,241,0.5)" : "rgba(255,255,255,0.07)"}`,
                              transform: draft.emojis.includes(emoji) ? "scale(1.1)" : "scale(1)",
                            }}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {editing ? (
                <textarea value={draft.bio} rows={4}
                  onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                  placeholder="Tell the world about yourself…"
                  className={profileTextareaCls}
                />
              ) : (
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-indigo-100/75">{profile.bio}</p>
              )}
            </ProfileCard>

            <ProfileCard accent="#6366F1" className="p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <SectionTitle accent="#6366F1">Skills</SectionTitle>
                  <p className={`${sectionSubCls} mt-0.5`}>{(editing ? draft : profile).skills.length} selected</p>
                </div>
                {editing && (
                  <button onClick={() => setSkillPickerOpen(v => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: skillPickerOpen ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.1)", color: "#818CF8", border: "1px solid rgba(99,102,241,0.3)" }}>
                    <Plus size={11} /> Browse 300+ skills
                  </button>
                )}
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {(editing ? draft : profile).skills.map(skill => {
                  const color = getSkillColor(skill);
                  return (
                    <div
                      key={skill}
                      className="flex cursor-default items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold"
                      style={{ background: `${color}22`, color, border: `1px solid ${color}45` }}
                    >
                      {skill}
                      {editing && (
                        <button onClick={() => removeSkill(skill)} className="ml-0.5 opacity-60 hover:opacity-100">
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {editing && skillPickerOpen && (
                <div className="overflow-hidden">
                    <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 dark:border-white/8 dark:bg-black/35">
                      <div className="relative border-b border-zinc-200/70 p-3 dark:border-white/5">
                        <Search size={13} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-white/30" />
                        <input value={skillSearch} onChange={e => setSkillSearch(e.target.value)}
                          placeholder="Search 300+ skills…"
                          className={`${profileInputSmCls} w-full pl-8`}
                        />
                      </div>
                      <div className="p-3 max-h-60 overflow-y-auto">
                        {skillSearch ? (
                          filteredSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {filteredSkills.map(s => {
                                const c = getSkillColor(s);
                                return (
                                  <button key={s} onClick={() => addSkill(s)}
                                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                    style={{ background: `${c}15`, color: c, border: `1px solid ${c}25` }}>
                                    + {s}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="mb-2 text-xs text-zinc-500 dark:text-white/30">No match — add custom:</p>
                              <button onClick={() => addSkill(skillSearch)}
                                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white"
                                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                                Add "{skillSearch}"
                              </button>
                            </div>
                          )
                        ) : (
                          <div className="space-y-4">
                            {skillsByCategory.slice(0, 6).map(({ cat, skills }) => (
                              <div key={cat}>
                                <p className={`${sectionSubCls} mb-2 font-black uppercase tracking-widest`}>{cat}</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {skills.slice(0, 12).map(s => {
                                    const c = getSkillColor(s);
                                    return (
                                      <button key={s} onClick={() => addSkill(s)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                        style={{ background: `${c}12`, color: c, border: `1px solid ${c}20` }}>
                                        + {s}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 border-t border-zinc-200/70 p-3 dark:border-white/5">
                        <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addSkill()}
                          placeholder="Or type a custom skill…"
                          className={profileInputSmCls}
                        />
                        <button onClick={() => addSkill()}
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
                          style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                </div>
              )}
            </ProfileCard>

            <ProfileCard accent="#F97316" className="p-7">
              <SectionTitle accent="#F97316" className="mb-5">Quick Access</SectionTitle>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {([
                  { label: "New Interview", icon: Mic, color: "#818CF8", path: "/new" },
                  { label: "Practice Code", icon: Code2, color: "#34D399", path: "/coding" },
                  { label: "History", icon: Star, color: "#FBBF24", path: "/history" },
                  { label: "Dashboard", icon: Award, color: "#F97316", path: "/dashboard" },
                  { label: "Resume", icon: ExternalLink, color: "#EC4899", path: "/resume" },
                  { label: "Settings", icon: CheckCircle2, color: "#06B6D4", path: "/settings" },
                ] as const).map(({ label, icon: Icon, color, path }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(path)}
                    className="op-profile-quick-btn flex flex-col items-center gap-2 p-4 text-center transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                    style={{ "--profile-accent": color } as React.CSSProperties}
                  >
                    <div className="op-profile-quick-icon">
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-indigo-100/70">{label}</span>
                  </button>
                ))}
              </div>
            </ProfileCard>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

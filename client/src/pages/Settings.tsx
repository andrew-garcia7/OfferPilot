import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  Code2,
  Download,
  Eye,
  EyeOff,
  Lock,
  Menu,
  Mic,
  Monitor,
  Moon,
  Palette,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { API } from "../api";
import Footer from "../components/landing/Footer";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import UserAvatar from "../components/common/UserAvatar";
import { persistUserToStorage, resolveAvatarSrc } from "../lib/avatar";

type Section = "account" | "appearance" | "editor" | "notifications" | "privacy" | "security" | "advanced";

type SessionItem = {
  id: string;
  label: string;
  platform: string;
  userAgent: string;
  createdAt: string;
  lastSeen: string;
  isCurrent: boolean;
};

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "account", label: "Account", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "editor", label: "Editor Preferences", icon: Code2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "security", label: "Security", icon: Lock },
  { id: "advanced", label: "Advanced", icon: Sparkles },
];

const ACCENT_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#3B82F6", "#10B981"];
const EDITOR_THEMES = [
  { id: "dracula", label: "Dracula" },
  { id: "dark", label: "VS Dark" },
  { id: "light", label: "Light" },
];
const INTERVIEW_TIPS = [
  "Explain your tradeoffs out loud before writing code.",
  "Start with brute force, then optimize with pattern reasoning.",
  "Verify edge cases first: empty, duplicates, single-element.",
  "Name variables by intent, not by type.",
];

function GlassCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[color-mix(in_srgb,var(--theme-surface)_84%,transparent)] backdrop-blur-xl shadow-[0_20px_80px_-24px_var(--accent-glow)] hover:shadow-[0_30px_100px_-20px_var(--accent-glow)] hover:-translate-y-1 transition-all duration-500 ${className}`}
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl opacity-60" style={{ background: "var(--accent-glow)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full blur-3xl opacity-30" style={{ background: "var(--accent-primary)" }} />
      {children}
    </div>
  );
}

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/6">
      <div>
        <p className="text-sm font-semibold text-(--theme-text)">{label}</p>
        {desc ? <p className="text-xs text-(--theme-muted) mt-0.5">{desc}</p> : null}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-all duration-250"
      style={{ background: checked ? "var(--accent-primary)" : "rgba(148,163,184,0.36)" }}
    >
      <motion.span
        animate={{ x: checked ? 22 : 3 }}
        transition={{ type: "spring", stiffness: 460, damping: 28 }}
        className="absolute top-1 h-4 w-4 rounded-full bg-white"
      />
    </button>
  );
}

function prettyDate(raw: string) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { settings, updateSettings, syncing, hydrated, syncNow } = useSettings();
  const { user: authUser } = useAuth();

  const [active, setActive] = useState<Section>("appearance");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [savedToast, setSavedToast] = useState(false);

  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordValues, setPasswordValues] = useState({ current: "", next: "", confirm: "" });
  const [passwordVisible, setPasswordVisible] = useState({ current: false, next: false, confirm: false });
  const [passwordError, setPasswordError] = useState("");

  const [tipMessage, setTipMessage] = useState<string | null>(null);
  const [updateBannerVisible, setUpdateBannerVisible] = useState(false);

  const [resumeUploading, setResumeUploading] = useState(false);

  const triggerSavedToast = () => {
    setSavedToast(true);
    window.setTimeout(() => setSavedToast(false), 1400);
  };

  const patchSettings = (patch: any) => {
    updateSettings(patch);
    triggerSavedToast();
  };

  const userEmail = user?.email || "";

  const accountSkillsText = useMemo(() => settings.account.skills.join(", "), [settings.account.skills]);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!settings.notifications.tips) {
      setTipMessage(null);
      return;
    }
    const timer = window.setInterval(() => {
      const nextTip = INTERVIEW_TIPS[Math.floor(Math.random() * INTERVIEW_TIPS.length)];
      setTipMessage(nextTip);
    }, 45000);
    return () => window.clearInterval(timer);
  }, [settings.notifications.tips]);

  useEffect(() => {
    setUpdateBannerVisible(settings.notifications.updates);
  }, [settings.notifications.updates]);

  useEffect(() => {
    const maybeNotify = async () => {
      if (!settings.notifications.sessions) return;
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch {
          return;
        }
      }
      if (Notification.permission !== "granted") return;
      const key = "op-reminder-last";
      const last = Number(localStorage.getItem(key) || 0);
      const now = Date.now();
      if (now - last > 8 * 60 * 60 * 1000) {
        new Notification("OfferPilot reminder", { body: "Take a quick mock interview today to stay sharp." });
        localStorage.setItem(key, String(now));
      }
    };
    void maybeNotify();
  }, [settings.notifications.sessions]);

  useEffect(() => {
    const loadSessions = async () => {
      setSessionsLoading(true);
      try {
        const res = await API.get("/api/settings/sessions");
        setSessions(res.data?.sessions || []);
      } catch {
        setSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    if (active === "security") {
      void loadSessions();
    }
  }, [active]);

  const uploadAvatar = async (file: File) => {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to load image"));
      reader.readAsDataURL(file);
    });

    patchSettings({ account: { ...settings.account, avatar: dataUrl } });
    if (authUser) {
      persistUserToStorage({ ...authUser, avatar: dataUrl, image: dataUrl });
    } else {
      localStorage.setItem("op-avatar", dataUrl);
    }
    window.dispatchEvent(new Event("auth-change"));
  };

  const uploadResume = async (file: File) => {
    setResumeUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("jdSkills", "[]");
      const res = await API.post("/api/resume/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const filename = res.data?.filename || file.name;
      patchSettings({ account: { ...settings.account, resumeUrl: filename } });
    } finally {
      setResumeUploading(false);
    }
  };

  const submitPassword = async () => {
    setPasswordError("");
    try {
      await API.post("/api/settings/password", {
        currentPassword: passwordValues.current,
        newPassword: passwordValues.next,
        confirmPassword: passwordValues.confirm,
      });
      setPasswordValues({ current: "", next: "", confirm: "" });
      setPasswordOpen(false);
      triggerSavedToast();
    } catch (error: any) {
      setPasswordError(error?.response?.data?.error || "Failed to change password");
    }
  };

  const logoutOtherSessions = async () => {
    await API.post("/api/settings/sessions/logout-others");
    const res = await API.get("/api/settings/sessions");
    setSessions(res.data?.sessions || []);
  };

  const removeSession = async (id: string) => {
    await API.delete(`/api/settings/sessions/${id}`);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const renderSection = () => {
    if (!hydrated) {
      return <p className="text-sm text-(--theme-muted)">Loading settings...</p>;
    }

    switch (active) {
      case "account":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Account Profile</h2>
            <p className="text-sm text-(--theme-muted) mt-1">Manage profile visibility and public identity details.</p>

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <GlassCard className="p-4 md:col-span-1">
                <div className="flex flex-col items-center gap-3">
                  <UserAvatar
                    src={resolveAvatarSrc({ avatar: settings.account.avatar }) || resolveAvatarSrc(authUser)}
                    name={settings.account.username || authUser?.name || user?.name || "User"}
                    size={80}
                    className="rounded-2xl"
                  />
                  <label className="text-xs rounded-xl px-3 py-2 border border-white/10 bg-white/5 hover:border-(--accent-border) transition">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadAvatar(file);
                      }}
                    />
                    <span className="inline-flex items-center gap-1.5"><Camera size={14} /> Upload photo</span>
                  </label>
                </div>
              </GlassCard>

              <GlassCard className="p-5 md:col-span-2">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={settings.account.username}
                    onChange={(e) => patchSettings({ account: { ...settings.account, username: e.target.value } })}
                    placeholder="Username"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                  />
                  <input
                    value={settings.account.role}
                    onChange={(e) => patchSettings({ account: { ...settings.account, role: e.target.value } })}
                    placeholder="Role (e.g. Senior Frontend Engineer)"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                  />
                  <textarea
                    value={settings.account.bio}
                    onChange={(e) => patchSettings({ account: { ...settings.account, bio: e.target.value } })}
                    placeholder="Bio"
                    rows={3}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border) md:col-span-2"
                  />
                  <input
                    value={settings.account.socialLinks.github}
                    onChange={(e) => patchSettings({ account: { ...settings.account, socialLinks: { ...settings.account.socialLinks, github: e.target.value } } })}
                    placeholder="GitHub URL"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                  />
                  <input
                    value={settings.account.socialLinks.linkedin}
                    onChange={(e) => patchSettings({ account: { ...settings.account, socialLinks: { ...settings.account.socialLinks, linkedin: e.target.value } } })}
                    placeholder="LinkedIn URL"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                  />
                  <input
                    value={settings.account.socialLinks.website}
                    onChange={(e) => patchSettings({ account: { ...settings.account, socialLinks: { ...settings.account.socialLinks, website: e.target.value } } })}
                    placeholder="Portfolio URL"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                  />
                  <input
                    value={settings.account.socialLinks.x}
                    onChange={(e) => patchSettings({ account: { ...settings.account, socialLinks: { ...settings.account.socialLinks, x: e.target.value } } })}
                    placeholder="X / Twitter URL"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                  />
                  <input
                    value={accountSkillsText}
                    onChange={(e) => patchSettings({ account: { ...settings.account, skills: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) } })}
                    placeholder="Skills (comma separated)"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-(--theme-text) outline-none focus:border-(--accent-border) md:col-span-2"
                  />
                  <div className="md:col-span-2 flex flex-wrap items-center gap-2 text-xs text-(--theme-muted)">
                    <label className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:border-(--accent-border) transition">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.txt"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void uploadResume(file);
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5">
                        <Upload size={14} /> {resumeUploading ? "Uploading..." : "Upload resume"}
                      </span>
                    </label>
                    <span>{settings.account.resumeUrl ? `Current: ${settings.account.resumeUrl}` : "No resume uploaded"}</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Appearance</h2>
            <p className="text-sm text-(--theme-muted) mt-1">Switch global theme and accent instantly across the app.</p>

            <div className="mt-6">
              <SettingRow label="Color Mode" desc="Dark, light, or automatically follow your OS preference.">
                <div className="flex gap-2">
                  {[
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "light", label: "Light", icon: Sun },
                    { id: "system", label: "System", icon: Monitor },
                  ].map((item) => {
                    const activeTheme = settings.theme === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => patchSettings({ theme: item.id as any })}
                        className="rounded-xl px-3 py-2 text-xs font-semibold border transition-all"
                        style={{
                          color: activeTheme ? "var(--accent-primary)" : "var(--theme-muted)",
                          borderColor: activeTheme ? "var(--accent-border)" : "var(--theme-border)",
                          background: activeTheme ? "color-mix(in srgb, var(--accent-primary) 14%, transparent)" : "transparent",
                        }}
                      >
                        <span className="inline-flex items-center gap-1.5"><Icon size={13} />{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </SettingRow>

              <SettingRow label="Accent Color" desc="Primary color for highlights, glows, switches, and active states.">
                <div className="flex gap-2">
                  {ACCENT_COLORS.map((color) => {
                    const activeColor = settings.accentColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => patchSettings({ accentColor: color })}
                        className="h-7 w-7 rounded-full border transition-transform hover:scale-110"
                        style={{
                          background: color,
                          borderColor: activeColor ? "#fff" : "rgba(255,255,255,0.2)",
                          boxShadow: activeColor ? "0 0 0 2px var(--accent-border)" : "none",
                        }}
                      />
                    );
                  })}
                </div>
              </SettingRow>
            </div>
          </div>
        );

      case "editor":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Editor Preferences</h2>
            <p className="text-sm text-(--theme-muted) mt-1">These update Monaco behavior immediately and persist for coding sessions.</p>

            <div className="mt-6">
              <SettingRow label="Font Size" desc="Code editor font size.">
                <div className="flex items-center gap-2">
                  <button onClick={() => patchSettings({ fontSize: Math.max(11, settings.fontSize - 1) })} className="h-8 w-8 rounded-lg border border-white/10">-</button>
                  <span className="w-8 text-center font-mono text-sm">{settings.fontSize}</span>
                  <button onClick={() => patchSettings({ fontSize: Math.min(26, settings.fontSize + 1) })} className="h-8 w-8 rounded-lg border border-white/10">+</button>
                </div>
              </SettingRow>
              <SettingRow label="Tab Size" desc="Spaces per tab in editor indentation.">
                <div className="flex gap-2">
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => patchSettings({ tabSize: size })}
                      className="h-8 w-9 rounded-lg border text-xs font-semibold"
                      style={{
                        borderColor: settings.tabSize === size ? "var(--accent-border)" : "var(--theme-border)",
                        color: settings.tabSize === size ? "var(--accent-primary)" : "var(--theme-muted)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <SettingRow label="Editor Theme" desc="Monaco syntax highlighting theme.">
                <div className="flex gap-2">
                  {EDITOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => patchSettings({ editorTheme: theme.id })}
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                      style={{
                        borderColor: settings.editorTheme === theme.id ? "var(--accent-border)" : "var(--theme-border)",
                        color: settings.editorTheme === theme.id ? "var(--accent-primary)" : "var(--theme-muted)",
                      }}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </SettingRow>

              <SettingRow label="Auto Save" desc="Save code automatically while typing.">
                <Toggle checked={settings.autoSave} onChange={(value) => patchSettings({ autoSave: value })} />
              </SettingRow>
              <SettingRow label="Show Minimap" desc="Display minimap on right side of Monaco editor.">
                <Toggle checked={settings.minimap} onChange={(value) => patchSettings({ minimap: value })} />
              </SettingRow>
              <SettingRow label="Word Wrap" desc="Wrap long lines automatically.">
                <Toggle checked={settings.wordWrap} onChange={(value) => patchSettings({ wordWrap: value })} />
              </SettingRow>
              <SettingRow label="Line Numbers" desc="Show or hide editor gutter line numbers.">
                <Toggle checked={settings.lineNumbers} onChange={(value) => patchSettings({ lineNumbers: value })} />
              </SettingRow>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Notifications</h2>
            <p className="text-sm text-(--theme-muted) mt-1">Control reminders, daily tips, and release announcements.</p>

            <div className="mt-6">
              <SettingRow label="Session reminders" desc="Browser reminder to practice interviews regularly.">
                <Toggle
                  checked={settings.notifications.sessions}
                  onChange={(value) => patchSettings({ notifications: { ...settings.notifications, sessions: value } })}
                />
              </SettingRow>
              <SettingRow label="Daily tips" desc="Show random coding and interview prep tips.">
                <Toggle
                  checked={settings.notifications.tips}
                  onChange={(value) => patchSettings({ notifications: { ...settings.notifications, tips: value } })}
                />
              </SettingRow>
              <SettingRow label="Product updates" desc="Show update banners when new features are released.">
                <Toggle
                  checked={settings.notifications.updates}
                  onChange={(value) => patchSettings({ notifications: { ...settings.notifications, updates: value } })}
                />
              </SettingRow>
            </div>

            <AnimatePresence>
              {tipMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-5 rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm"
                >
                  <span className="font-semibold mr-1" style={{ color: "var(--accent-primary)" }}>Tip:</span>
                  <span className="text-(--theme-muted)">{tipMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "privacy":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Privacy</h2>
            <p className="text-sm text-(--theme-muted) mt-1">Choose how your identity and activity are shared.</p>

            <div className="mt-6">
              <SettingRow label="Public profile" desc="Allow others to view your profile and skill overview.">
                <Toggle
                  checked={settings.privacy.showProfile}
                  onChange={(value) => patchSettings({ privacy: { ...settings.privacy, showProfile: value } })}
                />
              </SettingRow>
              <SettingRow label="Share activity" desc="Share anonymized interview activity for community analytics.">
                <Toggle
                  checked={settings.privacy.shareActivity}
                  onChange={(value) => patchSettings({ privacy: { ...settings.privacy, shareActivity: value } })}
                />
              </SettingRow>
            </div>
          </div>
        );

      case "security":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Security</h2>
            <p className="text-sm text-(--theme-muted) mt-1">Password protection, device sessions, and identity safety.</p>

            <div className="mt-6 space-y-5">
              <GlassCard className="p-4">
                <SettingRow label="Change password" desc="Update your account password with verification.">
                  <button
                    onClick={() => setPasswordOpen(true)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold"
                    style={{ borderColor: "var(--accent-border)", color: "var(--accent-primary)" }}
                  >
                    Update
                  </button>
                </SettingRow>
                <SettingRow label="2FA" desc="Two-factor authentication support placeholder.">
                  <Toggle
                    checked={settings.advanced.twoFactorEnabled}
                    onChange={(value) => patchSettings({ advanced: { ...settings.advanced, twoFactorEnabled: value } })}
                  />
                </SettingRow>
                <SettingRow label="Biometric unlock" desc="Biometric login support placeholder.">
                  <Toggle
                    checked={settings.advanced.biometricEnabled}
                    onChange={(value) => patchSettings({ advanced: { ...settings.advanced, biometricEnabled: value } })}
                  />
                </SettingRow>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-(--theme-text)">Active sessions</h3>
                  <button
                    onClick={() => void logoutOtherSessions()}
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-(--theme-muted) hover:border-(--accent-border)"
                  >
                    Logout other devices
                  </button>
                </div>
                {sessionsLoading ? (
                  <p className="text-xs text-(--theme-muted)">Loading sessions...</p>
                ) : sessions.length === 0 ? (
                  <p className="text-xs text-(--theme-muted)">No active sessions found.</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-(--theme-text) font-semibold inline-flex items-center gap-1.5"><Smartphone size={13} /> {session.label}</p>
                            <p className="text-[11px] text-(--theme-muted) mt-0.5">{session.platform} • Last active {prettyDate(session.lastSeen)}</p>
                          </div>
                          {session.isCurrent ? (
                            <span className="text-[11px] rounded-full px-2 py-1 border border-emerald-400/30 text-emerald-400">Current</span>
                          ) : (
                            <button
                              onClick={() => void removeSession(session.id)}
                              className="text-xs rounded-lg border border-red-400/25 px-2 py-1 text-red-300 hover:bg-red-400/10"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        );

      case "advanced":
        return (
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-(--theme-text)">Advanced Settings</h2>
            <p className="text-sm text-(--theme-muted) mt-1">Fine tune interview experience, AI behavior, and accessibility.</p>

            <div className="mt-6">
              <SettingRow label="AI voice preference" desc="Tone used in interviewer responses.">
                <select
                  value={settings.advanced.aiVoice}
                  onChange={(e) => patchSettings({ advanced: { ...settings.advanced, aiVoice: e.target.value as any } })}
                  className="settings-select rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-(--theme-text)"
                >
                  <option value="neutral">Neutral</option>
                  <option value="friendly">Friendly</option>
                  <option value="coach">Coach</option>
                </select>
              </SettingRow>
              <SettingRow label="Interview difficulty" desc="Default challenge level for mock sessions.">
                <select
                  value={settings.advanced.interviewDifficulty}
                  onChange={(e) => patchSettings({ advanced: { ...settings.advanced, interviewDifficulty: e.target.value as any } })}
                  className="settings-select rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-(--theme-text)"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </SettingRow>
              <SettingRow label="Webcam quality" desc="Preferred camera stream quality.">
                <select
                  value={settings.advanced.webcamQuality}
                  onChange={(e) => patchSettings({ advanced: { ...settings.advanced, webcamQuality: e.target.value as any } })}
                  className="settings-select rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-(--theme-text)"
                >
                  <option value="auto">Auto</option>
                  <option value="720p">720p</option>
                  <option value="1080p">1080p</option>
                </select>
              </SettingRow>
              <SettingRow label="Noise suppression" desc="Filter background noise during speaking rounds.">
                <Toggle
                  checked={settings.advanced.noiseSuppression}
                  onChange={(value) => patchSettings({ advanced: { ...settings.advanced, noiseSuppression: value } })}
                />
              </SettingRow>
              <SettingRow label="Keyboard shortcuts" desc="Enable productivity shortcuts in coding and interview tools.">
                <Toggle
                  checked={settings.advanced.keyboardShortcuts}
                  onChange={(value) => patchSettings({ advanced: { ...settings.advanced, keyboardShortcuts: value } })}
                />
              </SettingRow>
              <SettingRow label="Accessibility mode" desc="Increase contrast and simplify motion effects.">
                <Toggle
                  checked={settings.advanced.accessibilityMode}
                  onChange={(value) => patchSettings({ advanced: { ...settings.advanced, accessibilityMode: value } })}
                />
              </SettingRow>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="op-dark-page op-settings-page relative min-h-screen pt-26">
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{ y: [0, -18, 0], opacity: [0.16, 0.24, 0.16] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-20 w-72 h-72 rounded-full blur-[120px] opacity-20"
          style={{ background: "var(--accent-primary)" }}
        />
        <motion.div
          animate={{ y: [0, 22, 0], opacity: [0.14, 0.22, 0.14] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-20 w-72 h-72 rounded-full blur-[120px] opacity-20"
          style={{ background: "#8B5CF6" }}
        />
        <motion.div
          animate={{ y: [0, -24, 0], x: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[22%] right-[14%] h-4 w-4 rounded-full"
          style={{ background: "var(--accent-primary)", boxShadow: "0 0 28px var(--accent-glow)" }}
        />
        <motion.div
          animate={{ y: [0, 20, 0], x: [0, -14, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[14%] left-[20%] h-3 w-3 rounded-full"
          style={{ background: "var(--accent-primary)", boxShadow: "0 0 22px var(--accent-glow)" }}
        />
      </div>

      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            className="fixed top-24 left-1/2 z-60 -translate-x-1/2 rounded-xl border px-4 py-2 text-sm font-semibold backdrop-blur-xl"
            style={{ borderColor: "var(--accent-border)", color: "var(--accent-primary)", background: "color-mix(in srgb, var(--theme-surface) 82%, transparent)" }}
          >
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} /> Settings saved</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto w-full max-w-[1600px] px-6 xl:px-12 pb-14">
        <button onClick={() => navigate(-1)} className="mb-6 text-sm text-(--theme-muted) hover:text-(--theme-text) inline-flex items-center gap-1.5">← Back</button>

        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-(--theme-text)">Settings</h1>
            <p className="text-sm text-(--theme-muted) mt-1">Manage your account, preferences, privacy, and security.</p>
          </div>
          <div className="inline-flex items-center gap-2">
            <button onClick={() => setSidebarOpen((v) => !v)} className="lg:hidden rounded-xl border border-white/10 p-2 text-(--theme-muted)"><Menu size={16} /></button>
            <button
              onClick={() => void syncNow()}
              className="rounded-xl border px-3 py-2 text-xs font-semibold"
              style={{ borderColor: "var(--accent-border)", color: "var(--accent-primary)" }}
            >
              {syncing ? "Syncing..." : "Sync now"}
            </button>
          </div>
        </div>

        {updateBannerVisible ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-white/10 px-4 py-3 text-sm"
            style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--accent-primary) 16%, transparent), transparent)" }}
          >
            <span className="font-semibold" style={{ color: "var(--accent-primary)" }}>New:</span>
            <span className="ml-2 text-(--theme-muted)">Settings sync, active device sessions, and live theme controls are now available.</span>
          </motion.div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          <AnimatePresence>
            {(sidebarOpen || isDesktop) && (
              <motion.aside
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="lg:block"
              >
                <GlassCard className="p-2 sticky top-24">
                  <div className="flex items-center justify-between px-3 py-2 lg:hidden">
                    <p className="text-xs uppercase tracking-wider text-(--theme-muted)">Sections</p>
                    <button onClick={() => setSidebarOpen(false)} className="text-(--theme-muted)"><X size={15} /></button>
                  </div>
                  {SECTIONS.map((item) => {
                    const activeTab = active === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActive(item.id);
                          setSidebarOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-all"
                        style={{
                          color: activeTab ? "var(--accent-primary)" : "var(--theme-muted)",
                          background: activeTab ? "color-mix(in srgb, var(--accent-primary) 14%, transparent)" : "transparent",
                        }}
                      >
                        <Icon size={15} />
                        <span className="flex-1 font-semibold">{item.label}</span>
                        <ChevronRight size={14} className={activeTab ? "opacity-100" : "opacity-0 group-hover:opacity-80"} />
                      </button>
                    );
                  })}
                </GlassCard>
              </motion.aside>
            )}
          </AnimatePresence>

          <GlassCard className="p-5 sm:p-7">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </GlassCard>
        </div>

        <div className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/8 p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-red-300">Danger zone</p>
            <p className="text-xs text-red-200/75">Delete your account and remove local session data.</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              logout();
              navigate("/");
            }}
            className="rounded-xl border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/12"
          >
            <span className="inline-flex items-center gap-1.5"><Trash2 size={13} /> Delete account</span>
          </button>
        </div>

        <div className="mt-4 text-xs text-(--theme-muted)">
          Signed in as: {settings.account.username || user?.name || "User"} ({userEmail || "No email"})
        </div>
      </div>

      <AnimatePresence>
        {passwordOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-70 grid place-items-center bg-black/65 p-4" onClick={() => setPasswordOpen(false)}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-md rounded-3xl border border-white/12 bg-[color-mix(in_srgb,var(--theme-surface)_90%,transparent)] p-5 backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-(--theme-text)">Update Password</h3>
                <button onClick={() => setPasswordOpen(false)} className="text-(--theme-muted)"><X size={16} /></button>
              </div>
              <p className="text-xs text-(--theme-muted) mt-1">For security, confirm your current password first.</p>

              <div className="mt-4 space-y-3">
                {([
                  { key: "current", placeholder: "Current password" },
                  { key: "next", placeholder: "New password" },
                  { key: "confirm", placeholder: "Confirm new password" },
                ] as const).map((item) => (
                  <div key={item.key} className="relative">
                    <input
                      type={passwordVisible[item.key] ? "text" : "password"}
                      placeholder={item.placeholder}
                      value={passwordValues[item.key]}
                      onChange={(e) => setPasswordValues((prev) => ({ ...prev, [item.key]: e.target.value }))}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 pr-9 text-sm text-(--theme-text) outline-none focus:border-(--accent-border)"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-(--theme-muted)"
                    >
                      {passwordVisible[item.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                ))}
                {passwordError ? <p className="text-xs text-red-300">{passwordError}</p> : null}
                <button
                  onClick={() => void submitPassword()}
                  className="w-full rounded-xl py-2.5 text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent-primary), color-mix(in srgb, var(--accent-primary) 62%, #a855f7))" }}
                >
                  Update password
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

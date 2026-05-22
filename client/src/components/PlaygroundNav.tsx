import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserAvatar from "./common/UserAvatar";
import { resolveAvatarSrc } from "../lib/avatar";

interface Props {
  projectName: string;
  onProjectNameChange: (n: string) => void;
  autoSaved: boolean;
  onSave: () => void;
  onShare: () => void;
  onShowShortcuts: () => void;
  shareLink: string | null;
}

export default function PlaygroundNav({
  projectName,
  onProjectNameChange,
  autoSaved,
  onSave,
  onShare,
  onShowShortcuts,
  shareLink,
}: Props) {
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(projectName);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setNameVal(projectName); }, [projectName]);
  useEffect(() => { if (editingName) nameRef.current?.select(); }, [editingName]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowSharePopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const commitName = () => {
    const v = nameVal.trim() || "Untitled Project";
    setNameVal(v);
    onProjectNameChange(v);
    setEditingName(false);
  };

  const handleShareClick = () => {
    onShare();
    setShowSharePopup(v => !v);
    setShowUserMenu(false);
  };

  const copyShare = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    setShowUserMenu(false);
    navigate("/");
  };

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("offerpilot_user") || localStorage.getItem("user") || "null"); } catch { return null; }
  })();
  const profileName: string = (() => {
    try { return JSON.parse(localStorage.getItem("op-profile") ?? "null")?.name || ""; } catch { return ""; }
  })();
  const displayName: string = profileName || user?.name || user?.email || "Guest";
  const email: string = user?.email || "";
  const avatarSrc = resolveAvatarSrc(user);

  return (
    <div
      className="flex items-center gap-3 px-4"
      style={{
        height: "48px",
        backgroundColor: "#0E0E16",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
        position: "relative",
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 shrink-0"
        style={{ color: "#818CF8", fontWeight: 700, fontSize: "15px", letterSpacing: "-0.3px" }}
      >
        <svg width="26" height="26" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="pgNavGrad" x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4F46E5"/>
              <stop offset="100%" stopColor="#8B5CF6"/>
            </linearGradient>
          </defs>
          <rect width="36" height="36" rx="9" fill="url(#pgNavGrad)"/>
          <ellipse cx="18" cy="5" rx="12" ry="5" fill="white" fillOpacity="0.1"/>
          <line x1="18" y1="20" x2="18" y2="10" stroke="white" strokeWidth="2.6" strokeLinecap="round"/>
          <polyline points="15.2,13 18,10 20.8,13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="18" y1="20" x2="26.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55"/>
          <line x1="18" y1="20" x2="9.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55"/>
          <circle cx="18" cy="20" r="3" fill="white" fillOpacity="0.97"/>
          <circle cx="18" cy="20" r="1.3" fill="url(#pgNavGrad)"/>
        </svg>
        <span className="hidden sm:inline" style={{ background: "linear-gradient(135deg,#fff 60%,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          OfferPilot
        </span>
      </button>

      <span style={{ color: "rgba(255,255,255,0.12)", userSelect: "none" }}>/</span>

      {/* Project name */}
      {editingName ? (
        <input
          ref={nameRef}
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onBlur={commitName}
          onKeyDown={e => { if (e.key === "Enter") commitName(); if (e.key === "Escape") { setNameVal(projectName); setEditingName(false); } }}
          className="bg-transparent font-medium text-sm focus:outline-none border-b"
          style={{ color: "#fff", borderColor: "rgba(99,102,241,0.5)", width: "160px", minWidth: "80px" }}
          maxLength={60}
        />
      ) : (
        <button
          onClick={() => setEditingName(true)}
          className="text-sm font-medium group flex items-center gap-1"
          style={{ color: "rgba(255,255,255,0.75)" }}
          title="Click to rename"
        >
          {projectName}
          <svg className="opacity-0 group-hover:opacity-40 transition-opacity" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      )}

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1 ml-4">
        {[
          { label: "Dashboard", to: "/" },
          { label: "Practice", to: "/coding" },
          { label: "Interview Prep", to: "/new" },
          { label: "History", to: "/history" },
        ].map(l => (
          <button
            key={l.label}
            onClick={() => navigate(l.to)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Auto-save badge */}
        <span
          className="text-[10px] px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 transition-all"
          style={{
            color: autoSaved ? "#34D399" : "rgba(255,255,255,0.25)",
            border: "1px solid",
            borderColor: autoSaved ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.08)",
          }}
        >
          {autoSaved ? "✓ Saved" : "● Unsaved"}
        </span>

        {/* Save */}
        <button
          onClick={onSave}
          className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
          style={{ color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.10)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          title="Save project (Ctrl+S)"
        >
          Save
        </button>

        {/* Share */}
        <div className="relative" ref={shareRef}>
          <button
            onClick={handleShareClick}
            className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
            style={{ color: "#818CF8", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
          >
            ↗ Share
          </button>
          {showSharePopup && shareLink && (
            <div
              className="absolute right-0 top-10 rounded-xl p-3 shadow-2xl"
              style={{ width: "300px", backgroundColor: "#1A1A28", border: "1px solid rgba(99,102,241,0.25)", zIndex: 200 }}
            >
              <div className="text-xs font-semibold mb-2" style={{ color: "#818CF8" }}>Shareable Link</div>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="flex-1 bg-transparent text-[10px] font-mono focus:outline-none truncate"
                  style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", padding: "4px 8px" }}
                />
                <button
                  onClick={copyShare}
                  className="text-[10px] px-2 py-1 rounded-md shrink-0 transition-all"
                  style={{ background: copiedShare ? "rgba(52,211,153,0.15)" : "rgba(99,102,241,0.2)", color: copiedShare ? "#34D399" : "#818CF8", border: "1px solid", borderColor: copiedShare ? "rgba(52,211,153,0.3)" : "rgba(99,102,241,0.3)" }}
                >
                  {copiedShare ? "✓" : "Copy"}
                </button>
              </div>
              <button
                onClick={() => setShowSharePopup(false)}
                className="absolute top-2 right-2 text-[11px] transition-colors"
                style={{ color: "rgba(255,255,255,0.2)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.2)")}
              >✕</button>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts */}
        <button
          onClick={onShowShortcuts}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] transition-all"
          style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
          title="Keyboard shortcuts (Ctrl+/)"
        >
          ⌨
        </button>

        {/* Avatar + dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => { setShowUserMenu(v => !v); setShowSharePopup(false); }}
            className="flex items-center gap-1.5 rounded-full transition-all"
            style={{ outline: showUserMenu ? "2px solid rgba(99,102,241,0.5)" : "2px solid transparent", outlineOffset: "2px" }}
            title={displayName}
          >
            <UserAvatar src={avatarSrc} name={displayName} size={28} />
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div
              className="absolute right-0 top-10 rounded-2xl shadow-2xl overflow-hidden"
              style={{
                width: "220px",
                backgroundColor: "#13131F",
                border: "1px solid rgba(255,255,255,0.08)",
                zIndex: 200,
              }}
            >
              {/* User info header */}
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <UserAvatar src={avatarSrc} name={displayName} size={36} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: "#fff" }}>{displayName}</div>
                  {email && <div className="text-[10px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{email}</div>}
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1.5 px-1.5">
                {[
                  {
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                    ),
                    label: "Dashboard",
                    to: "/",
                  },
                  {
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ),
                    label: "Profile",
                    to: "/profile",
                  },
                  {
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
                    ),
                    label: "Settings",
                    to: "/settings",
                  },
                  {
                    icon: (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
                    ),
                    label: "History",
                    to: "/history",
                  },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => { navigate(item.to); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Divider + Sign out */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "6px" }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{ color: "rgba(239,68,68,0.7)" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#F87171"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "rgba(239,68,68,0.7)"; e.currentTarget.style.background = "transparent"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

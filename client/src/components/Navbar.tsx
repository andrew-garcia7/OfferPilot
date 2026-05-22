import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  FileText, Mic, Code2, Target, BarChart3, Map,
  ChevronDown, Menu, X, Zap, LogOut, History, LayoutDashboard, Home,
  User, Settings
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import UserAvatar from "./common/UserAvatar";
import ThemeToggle from "./common/ThemeToggle";
import { resolveAvatarSrc } from "../lib/avatar";

/* ── mega-menu items ─────────────────────────────────── */
const FEATURES_MENU = [
  { icon: FileText, label: "Resume Builder",      desc: "ATS-optimized in seconds",      to: "/resume" },
  { icon: Mic,      label: "Interview Simulator",  desc: "Practice interviews that feel real", to: "/new" },
  { icon: Target,   label: "JD Matcher",           desc: "Know your fit before you apply", to: "/new" },
  { icon: Code2,    label: "Coding Simulator",     desc: "Ace the coding round every time", to: "/coding" },
  { icon: BarChart3,label: "ATS Analyzer",         desc: "Beat the applicant filter",     to: "/resume" },
  { icon: Map,      label: "AI Career Roadmap",    desc: "Your path to L5 and beyond",    to: "/new" },
];

const NAV_LINKS = [
  { label: "Pricing",         to: "/pricing" },
  { label: "Success Stories", to: "/success-stories" },
  { label: "Blog",            to: "/blog" },
  { label: "About",           to: "/about" },
];

export default function Navbar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user: authUser, logout: ctxLogout } = useAuth();
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [megaOpen,     setMegaOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const megaRef  = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);
  let closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // close user menu on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const getDisplay = () => authUser?.name || authUser?.email || "";
  const avatarSrc = resolveAvatarSrc(authUser);

  const handleLogout = () => {
    ctxLogout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mega on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openMega  = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMegaOpen(true); };
  const closeMega = () => { closeTimer.current = setTimeout(() => setMegaOpen(false), 120); };

  const isHome = loc.pathname === "/";

  return (
    <>
      {/* ── MAIN NAV ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 lg:px-12 transition-all duration-200 ${
          scrolled
            ? "h-15 backdrop-blur-[20px] border-b shadow-xl bg-[var(--theme-nav-bg)] border-[color:var(--theme-border)] shadow-black/20"
           : "h-18 bg-[var(--theme-nav-bg)]"
        } op-navbar`}
      >
        {/* LEFT — logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          {/* Helicopter rotor logo — 3-blade top-view, up-blade has arrow */}
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="group-hover:scale-110 transition-transform duration-200"
          >
            <svg width="34" height="34" viewBox="0 0 36 36" fill="none">
              <defs>
                <linearGradient id="navLogoGrad" x1="0" y1="36" x2="36" y2="0" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4F46E5"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
                <filter id="navGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              {/* Background */}
              <rect width="36" height="36" rx="9" fill="url(#navLogoGrad)"/>
              {/* Inner top glow */}
              <ellipse cx="18" cy="5" rx="12" ry="5" fill="white" fillOpacity="0.1"/>
              {/* Blade 1 — UP (arrow blade, full opacity) */}
              <line x1="18" y1="20" x2="18" y2="10" stroke="white" strokeWidth="2.6" strokeLinecap="round" filter="url(#navGlow)"/>
              {/* Arrowhead at tip */}
              <polyline points="15.2,13 18,10 20.8,13" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              {/* Blade 2 — down-right (55% opacity) */}
              <line x1="18" y1="20" x2="26.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55"/>
              {/* Blade 3 — down-left (55% opacity) */}
              <line x1="18" y1="20" x2="9.5" y2="25.5" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeOpacity="0.55"/>
              {/* Hub */}
              <circle cx="18" cy="20" r="3" fill="white" fillOpacity="0.97"/>
              <circle cx="18" cy="20" r="1.3" fill="url(#navLogoGrad)"/>
            </svg>
          </motion.div>
          <span className="text-white font-extrabold text-[17px] tracking-[-0.02em] select-none">
            Offer<span style={{ background: "linear-gradient(135deg,#818CF8,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pilot</span>
          </span>
        </Link>

        {/* CENTER — desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {/* Home link */}
          <Link to="/"
            className="op-nav-link flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl hover:bg-white/5 transition-all text-white/80 hover:text-[color:var(--theme-text)]">
            <Home size={15} />
            Home
          </Link>

          {/* Features dropdown */}
          <div
            ref={megaRef}
            className="relative"
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
          >
            <button className="op-nav-link flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-xl hover:bg-white/5 transition-all link-sweep text-white/80 hover:text-[color:var(--theme-text)]">
              Features
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-130 border rounded-2xl shadow-2xl shadow-black/50 p-4 grid grid-cols-2 gap-1 bg-[var(--theme-surface)] border-white/10"
                >
                  {FEATURES_MENU.map(({ icon: Icon, label, desc, to }) => (
                    <Link
                      key={label}
                      to={to}
                      onClick={() => setMegaOpen(false)}
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
            <Link
              key={label}
              to={to}
              className="op-nav-link px-4 py-2 text-sm font-medium rounded-xl transition-all link-sweep text-white/80 hover:text-[color:var(--theme-text)] hover:bg-white/5"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* RIGHT — CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle variant="navbar" />
          {authUser ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="op-nav-link flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <UserAvatar src={avatarSrc} name={getDisplay() || "User"} size={32} />
                <span className="text-sm font-medium text-white/80 max-w-32.5 truncate">{getDisplay()}</span>
                <ChevronDown size={13} className={`text-white/40 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 border rounded-2xl shadow-2xl p-1.5 z-50 bg-[var(--theme-surface)] border-white/10 shadow-black/60"
                  >
                    <div className="px-3 pt-2 pb-3 border-b border-[color:var(--theme-border)] mb-1">
                      <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">Signed in as</p>
                      <p className="text-sm text-white/70 mt-0.5 truncate">{getDisplay()}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="op-nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-[color:var(--theme-text)] transition-all">
                      <LayoutDashboard size={14} className="text-[#8B5CF6]" /> Dashboard
                    </Link>
                    <Link to="/history" onClick={() => setUserMenuOpen(false)} className="op-nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-[color:var(--theme-text)] transition-all">
                      <History size={14} className="text-[#8B5CF6]" /> History
                    </Link>
                    <Link to="/resume" onClick={() => setUserMenuOpen(false)} className="op-nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-[color:var(--theme-text)] transition-all">
                      <FileText size={14} className="text-[#8B5CF6]" /> Resume
                    </Link>
                    <div className="my-1 border-t border-[color:var(--theme-border)]" />
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="op-nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-[color:var(--theme-text)] transition-all">
                      <User size={14} className="text-[#8B5CF6]" /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="op-nav-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-white/70 hover:text-[color:var(--theme-text)] transition-all">
                      <Settings size={14} className="text-[#8B5CF6]" /> Settings
                    </Link>
                    <div className="my-1 border-t border-[color:var(--theme-border)]" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-all">
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium transition-colors text-white/70 hover:text-[color:var(--theme-text)]">
                Log in
              </Link>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to="/register" className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558e8] hover:to-[#7c3aed] shadow-lg shadow-[#6366F1]/30 hover:shadow-[#6366F1]/50 transition-all glow-pulse">
                  <Zap size={14} /> Get Started →
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* MOBILE — theme + hamburger */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle variant="navbar" />
          <button
            className="p-2 text-white/80 hover:text-[color:var(--theme-text)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* ── MOBILE DRAWER ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-0 top-0 z-999 bg-[#0F0F14]/97 backdrop-blur-xl flex flex-col px-6 pt-20 pb-8 overflow-y-auto"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 text-white/60 hover:text-[color:var(--theme-text)]"
            >
              <X size={24} />
            </button>

            <div className="space-y-1 mb-6">
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest px-3 mb-3">Features</p>
              {FEATURES_MENU.map(({ icon: Icon, label, to }) => (
                <Link key={label} to={to} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/5 text-white/80 hover:text-[color:var(--theme-text)] transition-all"
                >
                  <Icon size={18} className="text-[#8B5CF6]" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>

            <div className="space-y-1 border-t border-[color:var(--theme-border)] pt-6 mb-8">
              {NAV_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-sm font-medium text-white/70 hover:text-[color:var(--theme-text)] hover:bg-white/5 rounded-xl transition-all"
                >
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              {authUser ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
                    <UserAvatar src={avatarSrc} name={getDisplay() || "User"} size={36} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{getDisplay()}</p>
                      <p className="text-[11px] text-white/40">Signed in</p>
                    </div>
                  </div>
                  <Link to="/new" onClick={() => setMobileOpen(false)} className="w-full py-3 text-center text-sm font-semibold text-white bg-linear-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-[#6366F1]/30">
                    Go to Dashboard
                  </Link>
                  <button onClick={handleLogout} className="w-full py-3 text-center text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-xl transition-all">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full py-3 text-center text-sm font-medium text-white/70 hover:text-[color:var(--theme-text)] border border-white/10 rounded-xl transition-all">
                    Log in
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full py-3.5 text-center text-sm font-bold text-white bg-linear-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl shadow-lg shadow-[#6366F1]/30">
                    Get Started Free →
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


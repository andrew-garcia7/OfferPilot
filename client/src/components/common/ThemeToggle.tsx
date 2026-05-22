import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

type ThemeToggleProps = {
  variant?: "navbar" | "auth";
  className?: string;
};

function getActiveTheme(): "light" | "dark" {
  const theme = document.documentElement.dataset.theme;
  if (theme === "light" || theme === "dark") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const variantClasses: Record<NonNullable<ThemeToggleProps["variant"]>, string> = {
  navbar:
    "h-10 w-10 rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-700 shadow-sm hover:border-violet-300/60 hover:bg-white hover:shadow-[0_8px_24px_rgba(124,58,237,0.12)] dark:border-white/10 dark:bg-white/5 dark:text-white/85 dark:shadow-none dark:hover:border-white/25 dark:hover:bg-white/10",
  auth:
    "h-10 w-10 rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-700 shadow-sm hover:border-violet-300/60 hover:bg-white hover:shadow-[0_8px_24px_rgba(124,58,237,0.12)] dark:border-white/15 dark:bg-white/8 dark:text-white/85 dark:shadow-none dark:hover:border-white/30 dark:hover:bg-white/12",
};

export default function ThemeToggle({ variant = "navbar", className = "" }: ThemeToggleProps) {
  const { updateSettings, settings } = useSettings();
  const [active, setActive] = useState<"light" | "dark">(getActiveTheme);

  useEffect(() => {
    const sync = () => setActive(getActiveTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
    };
  }, [settings.theme]);

  const toggle = useCallback(() => {
    const next = active === "dark" ? "light" : "dark";
    updateSettings({ theme: next });
    setActive(next);
  }, [active, updateSettings]);

  const isDark = active === "dark";
  const Icon = isDark ? Sun : Moon;

  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`inline-flex shrink-0 items-center justify-center transition-colors duration-300 ${variantClasses[variant]} ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={active}
          initial={{ rotate: -24, opacity: 0, scale: 0.85 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 24, opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.18 }}
          className="inline-flex"
        >
          <Icon size={18} strokeWidth={2.25} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

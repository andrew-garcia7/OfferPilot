import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { API } from "../api";
import { getStoredUser, persistUserToStorage, resolveAvatarSrc } from "../lib/avatar";

export type ThemeMode = "dark" | "light" | "system";
export type VoicePreference = "neutral" | "friendly" | "coach";
export type Difficulty = "easy" | "medium" | "hard";
export type WebcamQuality = "auto" | "720p" | "1080p";

export type AppSettings = {
  theme: ThemeMode;
  accentColor: string;
  fontSize: number;
  tabSize: number;
  editorTheme: string;
  autoSave: boolean;
  minimap: boolean;
  wordWrap: boolean;
  lineNumbers: boolean;
  notifications: {
    sessions: boolean;
    tips: boolean;
    updates: boolean;
  };
  privacy: {
    showProfile: boolean;
    shareActivity: boolean;
  };
  account: {
    username: string;
    bio: string;
    role: string;
    socialLinks: {
      github: string;
      linkedin: string;
      website: string;
      x: string;
    };
    resumeUrl: string;
    skills: string[];
    avatar: string;
  };
  advanced: {
    aiVoice: VoicePreference;
    interviewDifficulty: Difficulty;
    webcamQuality: WebcamQuality;
    noiseSuppression: boolean;
    keyboardShortcuts: boolean;
    accessibilityMode: boolean;
    biometricEnabled: boolean;
    twoFactorEnabled: boolean;
  };
};

type SettingsContextValue = {
  settings: AppSettings;
  hydrated: boolean;
  syncing: boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setSettings: (next: AppSettings) => void;
  syncNow: () => Promise<void>;
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  accentColor: "#6366F1",
  fontSize: 15,
  tabSize: 2,
  editorTheme: "dracula",
  autoSave: true,
  minimap: true,
  wordWrap: true,
  lineNumbers: true,
  notifications: {
    sessions: true,
    tips: true,
    updates: false,
  },
  privacy: {
    showProfile: true,
    shareActivity: false,
  },
  account: {
    username: "",
    bio: "",
    role: "",
    socialLinks: {
      github: "",
      linkedin: "",
      website: "",
      x: "",
    },
    resumeUrl: "",
    skills: [],
    avatar: "",
  },
  advanced: {
    aiVoice: "neutral",
    interviewDifficulty: "medium",
    webcamQuality: "auto",
    noiseSuppression: true,
    keyboardShortcuts: true,
    accessibilityMode: false,
    biometricEnabled: false,
    twoFactorEnabled: false,
  },
};

const STORAGE_KEY = "op-settings";

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  hydrated: false,
  syncing: false,
  updateSettings: () => {},
  setSettings: () => {},
  syncNow: async () => {},
});

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function deepMerge<T>(base: T, patch: Partial<T>): T {
  const out: Record<string, unknown> = { ...asObject(base) };
  const source = asObject(patch);

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const baseVal = out[key];

    if (Array.isArray(sourceVal)) {
      out[key] = sourceVal.slice();
    } else if (sourceVal && typeof sourceVal === "object") {
      out[key] = deepMerge(asObject(baseVal), asObject(sourceVal));
    } else {
      out[key] = sourceVal;
    }
  }

  return out as T;
}

function hexToRgb(hex: string) {
  const trimmed = hex.replace("#", "").trim();
  if (trimmed.length !== 6) return { r: 99, g: 102, b: 241 };
  const n = Number.parseInt(trimmed, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function resolveTheme(mode: ThemeMode) {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeAndAccent(settings: AppSettings) {
  const root = document.documentElement;
  const body = document.body;
  const activeTheme = resolveTheme(settings.theme);

  root.dataset.theme = activeTheme;
  root.classList.remove("light", "theme-dark", "theme-light");
  root.classList.add(activeTheme === "dark" ? "theme-dark" : "theme-light");

  const { r, g, b } = hexToRgb(settings.accentColor);
  root.style.setProperty("--accent-primary", settings.accentColor);
  root.style.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.35)`);
  root.style.setProperty("--accent-border", `rgba(${r}, ${g}, ${b}, 0.5)`);
  root.style.setProperty("--brand-primary", settings.accentColor);
  root.style.setProperty("--brand-secondary", settings.accentColor);

  body.style.transition = "background-color 220ms ease, color 220ms ease";
}

function applyCodingPreferences(settings: AppSettings) {
  localStorage.setItem("pg-fontSize", String(settings.fontSize));
  localStorage.setItem("pg-minimap", String(settings.minimap));
  localStorage.setItem("pg-wordWrap", String(settings.wordWrap));
  localStorage.setItem("pg-tabSize", String(settings.tabSize));
  localStorage.setItem("pg-lineNumbers", String(settings.lineNumbers));
  localStorage.setItem("op-autoSave", String(settings.autoSave));

  const themeMap: Record<string, string> = {
    dracula: "dracula",
    dark: "dark",
    light: "light",
    vsdark: "dark",
    vscode: "dark",
  };
  localStorage.setItem("pg-theme", themeMap[settings.editorTheme.toLowerCase()] || "dracula");
  window.dispatchEvent(new CustomEvent("op-settings-change", { detail: settings }));
}

function hasAuthToken() {
  return Boolean(localStorage.getItem("op-token"));
}

function loadFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacyTheme = localStorage.getItem("theme");
      if (legacyTheme === "light" || legacyTheme === "dark") {
        localStorage.removeItem("theme");
        return { ...DEFAULT_SETTINGS, theme: legacyTheme };
      }
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    const merged = deepMerge(DEFAULT_SETTINGS, parsed);
    const legacyTheme = localStorage.getItem("theme");
    if (legacyTheme === "light" || legacyTheme === "dark") {
      localStorage.removeItem("theme");
      if (!parsed?.theme) merged.theme = legacyTheme;
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(loadFromStorage);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const saveTimerRef = useRef<number | null>(null);
  const latestRef = useRef(settings);

  latestRef.current = settings;

  const persistLocal = useCallback((next: AppSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyCodingPreferences(next);
    applyThemeAndAccent(next);
  }, []);

  const pushRemote = useCallback(async (payload: AppSettings) => {
    if (!hasAuthToken()) return;
    setSyncing(true);
    try {
      await API.put("/api/settings/me", { settings: payload });
    } finally {
      setSyncing(false);
    }
  }, []);

  const scheduleRemoteSync = useCallback((payload: AppSettings) => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void pushRemote(payload);
    }, 450);
  }, [pushRemote]);

  const setSettings = useCallback((next: AppSettings) => {
    setSettingsState(next);
    persistLocal(next);
    scheduleRemoteSync(next);
  }, [persistLocal, scheduleRemoteSync]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = deepMerge(prev, patch);
      persistLocal(next);
      scheduleRemoteSync(next);
      return next;
    });
  }, [persistLocal, scheduleRemoteSync]);

  const syncNow = useCallback(async () => {
    await pushRemote(latestRef.current);
  }, [pushRemote]);

  useEffect(() => {
    const local = loadFromStorage();
    setSettingsState(local);
    persistLocal(local);

    const initialize = async () => {
      if (!hasAuthToken()) {
        setHydrated(true);
        return;
      }

      try {
        const res = await API.get("/api/settings/me");
        const remote = deepMerge(DEFAULT_SETTINGS, res.data?.settings || {});
        setSettingsState(remote);
        persistLocal(remote);
        const storedUser = getStoredUser();
        const mergedAvatar = resolveAvatarSrc({ avatar: remote.account?.avatar }) || storedUser?.avatar;
        if (storedUser && mergedAvatar) {
          persistUserToStorage({ ...storedUser, avatar: mergedAvatar, image: mergedAvatar });
        }
      } catch {
        // Keep local settings if backend is unavailable.
      } finally {
        setHydrated(true);
      }
    };

    void initialize();

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [persistLocal]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (latestRef.current.theme === "system") applyThemeAndAccent(latestRef.current);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(() => ({
    settings,
    hydrated,
    syncing,
    updateSettings,
    setSettings,
    syncNow,
  }), [settings, hydrated, syncing, updateSettings, setSettings, syncNow]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

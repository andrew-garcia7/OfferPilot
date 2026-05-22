/**
 * AuthContext — single source of truth for auth state.
 *
 * Token stored in localStorage["op-token"].
 * User profile stored in localStorage["user"].
 * Every tab/component that calls useAuth() reacts to auth-change events.
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { API } from "../api";
import { normalizeAuthUser, persistUserToStorage, type AvatarSource } from "../lib/avatar";

export interface AuthUser extends AvatarSource {
  id?:        number;
  name:       string;
  email:      string;
  avatar?:    string | null;
  image?:     string | null;
  provider?:  string;
  createdAt?: string;
  lastLogin?: string;
  isNew?:     boolean;
}

interface AuthCtx {
  user:     AuthUser | null;
  token:    string | null;
  loading:  boolean;
  login:    (token: string, user: AuthUser) => void;
  logout:   () => void;
  refresh:  () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, token: null, loading: true,
  login: () => {}, logout: () => {}, refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((tok: string, usr: AuthUser) => {
    const normalized = normalizeAuthUser(usr) ?? usr;
    localStorage.setItem("op-token", tok);
    persistUserToStorage(normalized);
    setToken(tok);
    setUser(normalized);
    window.dispatchEvent(new Event("auth-change"));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("op-token");
    localStorage.removeItem("user");
    localStorage.removeItem("offerpilot_user");
    localStorage.removeItem("op-avatar");
    localStorage.removeItem("op-profile");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("auth-change"));
  }, []);

  // Restore session from localStorage, then verify with /api/auth/me
  const refresh = useCallback(async () => {
    const storedToken = localStorage.getItem("op-token");
    if (!storedToken) { setLoading(false); return; }

    // Optimistically restore from cache
    const cached = localStorage.getItem("offerpilot_user") || localStorage.getItem("user");
    if (cached) {
      try {
        const parsed = normalizeAuthUser(JSON.parse(cached));
        if (parsed) {
          setUser(parsed);
          setToken(storedToken);
        }
      } catch { /* ignore */ }
    }

    // Verify token with backend
    try {
      const res = await API.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      const fresh = normalizeAuthUser(res.data.user);
      if (fresh) {
        setUser(fresh);
        persistUserToStorage(fresh);
      }
    } catch {
      // Token expired or invalid — log out
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    refresh();
    const sync = () => refresh();
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, [refresh]);

  return (
    <Ctx.Provider value={{ user, token, loading, login, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

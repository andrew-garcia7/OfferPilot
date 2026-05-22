import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || "http://localhost:4000";

export const API = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

function getOrCreateSessionId() {
  const key = "op-session-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const generated = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem(key, generated);
  return generated;
}

// Auto-attach JWT token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem("op-token");
  const sessionId = getOrCreateSessionId();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["x-session-id"] = sessionId;
  return config;
});

// On 401 — clear auth and redirect to login
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("op-token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("auth-change"));
    }
    return Promise.reject(err);
  }
);

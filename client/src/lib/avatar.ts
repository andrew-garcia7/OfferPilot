import type { AuthUser } from "../contexts/AuthContext";

const API_BASE = (import.meta.env.VITE_API_URL?.trim()).replace(/\/$/, "");

export type AvatarSource = {
  avatar?: string | null;
  image?: string | null;
  photoURL?: string | null;
  photo?: string | null;
  picture?: string | null;
};

/** Pick the first valid avatar URL from common user object shapes. */
export function resolveAvatarSrc(user?: AvatarSource | null): string | null {
  if (!user) return null;

  const candidates = [user.avatar, user.image, user.photoURL, user.photo, user.picture];

  for (const raw of candidates) {
    const value = (raw || "").trim();
    if (!value) continue;
    if (value === "null" || value === "undefined" || value === "avatar") continue;

    if (value.startsWith("data:image/")) {
      return value.length > 120_000 ? null : value;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
      return value;
    }

    if (value.startsWith("//")) {
      return `https:${value}`;
    }

    if (value.startsWith("/")) {
      return `${API_BASE}${value}`;
    }

    if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value) || value.includes("/uploads/")) {
      return value.includes("/") ? `${API_BASE}/${value.replace(/^\//, "")}` : `${API_BASE}/uploads/${value}`;
    }
  }

  return null;
}

/** Normalize OAuth/API user payloads into a consistent AuthUser shape. */
export function normalizeAuthUser(raw: Record<string, unknown> | AuthUser | null | undefined): AuthUser | null {
  if (!raw || typeof raw !== "object") return null;

  const name = String(raw.name || raw.displayName || raw.email || "User").trim();
  const email = String(raw.email || "").trim();
  const avatar = resolveAvatarSrc({
    avatar: (raw.avatar as string) ?? null,
    image: (raw.image as string) ?? null,
    photoURL: (raw.photoURL as string) ?? null,
    photo: (raw.photo as string) ?? null,
    picture: (raw.picture as string) ?? null,
  });

  return {
    id: typeof raw.id === "number" ? raw.id : undefined,
    name,
    email,
    avatar,
    image: avatar,
    provider: typeof raw.provider === "string" ? raw.provider : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : undefined,
    lastLogin: typeof raw.lastLogin === "string" ? raw.lastLogin : undefined,
    isNew: Boolean(raw.isNew),
  };
}

export function persistUserToStorage(user: AuthUser) {
  const normalized = normalizeAuthUser(user);
  if (!normalized) return;

  const payload = JSON.stringify(normalized);
  localStorage.setItem("user", payload);
  localStorage.setItem("offerpilot_user", payload);

  const src = resolveAvatarSrc(normalized);
  if (src) {
    localStorage.setItem("op-avatar", src);
  } else {
    localStorage.removeItem("op-avatar");
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("offerpilot_user") || localStorage.getItem("user");
    if (!raw) return null;
    return normalizeAuthUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

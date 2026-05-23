import { Router, Request } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";

type ThemeMode = "dark" | "light" | "system";

type SettingsPayload = {
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
    aiVoice: "neutral" | "friendly" | "coach";
    interviewDifficulty: "easy" | "medium" | "hard";
    webcamQuality: "auto" | "720p" | "1080p";
    noiseSuppression: boolean;
    keyboardShortcuts: boolean;
    accessibilityMode: boolean;
    biometricEnabled: boolean;
    twoFactorEnabled: boolean;
  };
};

type SessionRow = {
  id: string;
  userId: number;
  label: string;
  userAgent: string;
  platform: string;
  isCurrent: number;
  lastSeen: string;
  createdAt: string;
};

const DEFAULT_SETTINGS: SettingsPayload = {
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

const router = Router();

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

function cleanSessionId(raw: string | undefined): string {
  if (!raw) return "";
  const val = raw.trim();
  if (!val) return "";
  return val.slice(0, 80);
}

function parsePlatform(ua: string): string {
  const text = ua.toLowerCase();
  if (text.includes("android")) return "Android";
  if (text.includes("iphone") || text.includes("ipad") || text.includes("ios")) return "iOS";
  if (text.includes("windows")) return "Windows";
  if (text.includes("mac os") || text.includes("macintosh")) return "macOS";
  if (text.includes("linux")) return "Linux";
  return "Unknown";
}

async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY,
      payload TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      platform TEXT NOT NULL,
      is_current INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getStoredSettings(userId: number): Promise<SettingsPayload | null> {
  const rows = await prisma.$queryRawUnsafe<Array<{ payload: string }>>(
    "SELECT payload FROM user_settings WHERE user_id = ? LIMIT 1",
    userId
  );
  if (!rows[0]) return null;

  try {
    const parsed = JSON.parse(rows[0].payload);
    return deepMerge(DEFAULT_SETTINGS, parsed);
  } catch {
    return null;
  }
}

async function saveSettings(userId: number, payload: SettingsPayload) {
  await prisma.$executeRawUnsafe(
    `
    INSERT INTO user_settings (user_id, payload, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET
      payload = excluded.payload,
      updated_at = CURRENT_TIMESTAMP
  `,
    userId,
    JSON.stringify(payload)
  );
}

async function touchSession(req: Request, userId: number) {
  const sessionId = cleanSessionId(String(req.headers["x-session-id"] ?? ""));
  if (!sessionId) return;

  const userAgent = String(req.headers["user-agent"] ?? "Unknown").slice(0, 280);
  const platform = parsePlatform(userAgent);
  const label = `${platform} device`;

  await prisma.$executeRawUnsafe(
    `
    INSERT INTO user_sessions (id, user_id, label, user_agent, platform, is_current, created_at, last_seen)
    VALUES (?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      user_id = excluded.user_id,
      label = excluded.label,
      user_agent = excluded.user_agent,
      platform = excluded.platform,
      is_current = 1,
      last_seen = CURRENT_TIMESTAMP
  `,
    sessionId,
    userId,
    label,
    userAgent,
    platform
  );

  await prisma.$executeRawUnsafe(
    "UPDATE user_sessions SET is_current = 0 WHERE user_id = ? AND id <> ?",
    userId,
    sessionId
  );
}

router.get("/me", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    await touchSession(req, (req.user as any).userId);

    const user = await prisma.user.findUnique({
      where: { id: (req.user as any).userId },
      select: { name: true, avatar: true },
    });

  const stored =
  (await getStoredSettings((req.user as any).userId)) ??
  DEFAULT_SETTINGS;

const payload = deepMerge(stored, {
  account: {
    username: stored.account.username || user?.name || "",
    bio: stored.account.bio || "",
    role: stored.account.role || "",
    socialLinks: stored.account.socialLinks || {
      github: "",
      linkedin: "",
      website: "",
      x: "",
    },
    resumeUrl: stored.account.resumeUrl || "",
    skills: stored.account.skills || [],
    avatar: stored.account.avatar || user?.avatar || "",
  },
}); 

    await saveSettings((req.user as any).userId, payload);
    res.json({ settings: payload });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to load settings" });
  }
});

router.put("/me", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    await touchSession(req, (req.user as any).userId);

    const current = (await getStoredSettings((req.user as any).userId)) ?? DEFAULT_SETTINGS;
    const patch = asObject(req.body?.settings ?? req.body ?? {});
    const next = deepMerge(current, patch as Partial<SettingsPayload>);

    await saveSettings((req.user as any).userId, next);

    if (next.account.username || next.account.avatar) {
      await prisma.user.update({
        where: { id: (req.user as any).userId },
        data: {
          name: next.account.username || null,
          avatar: next.account.avatar || null,
        },
      });
    }

    res.json({ settings: next, ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to update settings" });
  }
});

router.post("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body ?? {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All password fields are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation do not match" });
    }

    const user = await prisma.user.findUnique({ where: { id: (req.user as any).userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.password) {
      return res.status(400).json({ error: "Password login not enabled for this account" });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to update password" });
  }
});

router.get("/sessions", requireAuth, async (req, res) => {
  try {
    await ensureTables();
    await touchSession(req, (req.user as any).userId);

    const rows = await prisma.$queryRawUnsafe<SessionRow[]>(
      `
      SELECT
        id,
        user_id as userId,
        label,
        user_agent as userAgent,
        platform,
        is_current as isCurrent,
        created_at as createdAt,
        last_seen as lastSeen
      FROM user_sessions
      WHERE user_id = ?
      ORDER BY last_seen DESC
    `,
      (req.user as any).userId
    );

    const sessions = rows.map((row) => ({
      id: row.id,
      label: row.label,
      platform: row.platform,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
      lastSeen: row.lastSeen,
      isCurrent: Boolean(row.isCurrent),
    }));

    res.json({ sessions });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to fetch sessions" });
  }
});

router.delete("/sessions/:sessionId", requireAuth, async (req, res) => {
  try {
    const targetId = cleanSessionId(String(req.params.sessionId));
    if (!targetId) return res.status(400).json({ error: "Invalid session id" });

    await ensureTables();
    const own = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
      "SELECT id FROM user_sessions WHERE id = ? AND user_id = ? LIMIT 1",
      targetId,
      (req.user as any).userId
    );
    if (!own[0]) return res.status(404).json({ error: "Session not found" });

    const currentId = cleanSessionId(String(req.headers["x-session-id"] ?? ""));
    if (currentId && targetId === currentId) {
      return res.status(400).json({ error: "Cannot remove current session here" });
    }

    await prisma.$executeRawUnsafe("DELETE FROM user_sessions WHERE id = ? AND user_id = ?", targetId, (req.user as any).userId);
    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to remove session" });
  }
});

router.post("/sessions/logout-others", requireAuth, async (req, res) => {
  try {
    const currentId = cleanSessionId(String(req.headers["x-session-id"] ?? ""));
    await ensureTables();

    if (currentId) {
      await prisma.$executeRawUnsafe(
        "DELETE FROM user_sessions WHERE user_id = ? AND id <> ?",
        (req.user as any).userId,
        currentId
      );
    } else {
      await prisma.$executeRawUnsafe("DELETE FROM user_sessions WHERE user_id = ?", (req.user as any).userId);
    }

    res.json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to logout other sessions" });
  }
});

export default router;

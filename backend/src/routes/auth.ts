import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma-client";
import passport from "../passport";
import { signToken, requireAuth } from "../middleware/auth";

const router  = Router();
const prisma  = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const googleAuthHandler = passport.authenticate("google", { scope: ["profile", "email"], session: true });
const googleCallbackHandler = passport.authenticate("google", {
  failureRedirect: `${FRONTEND_URL}/login?error=google_failed`,
  session: true,
});

/* ── Google OAuth ───────────────────────────────────── */

router.get("/google", googleAuthHandler);
router.get("/signin/google", googleAuthHandler);

const finalizeGoogleCallback =
  (req: Request, res: Response) => {
    const user = req.user as any;
    if (!user) return res.redirect(`${FRONTEND_URL}/login?error=no_user`);

    const token = signToken({
      userId: user.id,
      email:  user.email,
      name:   user.name,
      avatar: user.avatar,
    });

    const isNew   = user.isNew ? "1" : "0";
    const encoded = encodeURIComponent(token);

    // Redirect to frontend callback page with token in URL
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${encoded}&new=${isNew}`);
  };

router.get("/google/callback", googleCallbackHandler, finalizeGoogleCallback);
router.get("/callback/google", googleCallbackHandler, finalizeGoogleCallback);


/* ── GitHub OAuth ───────────────────────────────────── */

const githubAuthHandler = passport.authenticate("github", {
  scope: ["user:email"],
  session: true,
});

const githubCallbackHandler = passport.authenticate("github", {
  failureRedirect: `${FRONTEND_URL}/login?error=github_failed`,
  session: true,
});

router.get("/github", githubAuthHandler);
router.get("/signin/github", githubAuthHandler);

const finalizeGithubCallback =
  (req: Request, res: Response) => {
    const user = req.user as any;

    if (!user) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    });

    const isNew = user.isNew ? "1" : "0";
    const encoded = encodeURIComponent(token);

    res.redirect(
      `${FRONTEND_URL}/auth/callback?token=${encoded}&new=${isNew}`
    );
  };

router.get(
  "/github/callback",
  githubCallbackHandler,
  finalizeGithubCallback
);

router.get(
  "/callback/github",
  githubCallbackHandler,
  finalizeGithubCallback
);

/* ── Email / Password Register ─────────────────────── */

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash, provider: "local", lastLogin: new Date() },
  });

  const token = signToken({ userId: user.id, email: user.email, name: user.name, avatar: user.avatar });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, image: user.avatar }, isNew: true });
});

/* ── Email / Password Login ─────────────────────────── */

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "All fields required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

  const token = signToken({ userId: user.id, email: user.email, name: user.name, avatar: user.avatar });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, image: user.avatar } });
});

/* ── Session restore: GET /api/auth/me ──────────────── */

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user!.userId) },
    select: { id: true, name: true, email: true, avatar: true, provider: true, createdAt: true, lastLogin: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: { ...user, image: user.avatar } });
});

// Optional Auth.js-compatible session endpoint
router.get("/session", requireAuth, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.user!.userId) },
    select: { id: true, name: true, email: true, avatar: true, provider: true },
  });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user: { ...user, image: user.avatar }, expires: null });
});

/* ── Logout (client-side, but endpoint for completeness) */

router.post("/logout", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;

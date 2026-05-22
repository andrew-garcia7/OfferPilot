// src/server.ts
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import { Server as SocketIOServer } from "socket.io";

import "./passport"; // registers Google strategy
import passport from "./passport";

import interviewRoutes from "./routes/interview";
import resumeRoutes from "./routes/resume";
import resumeBuilderRoutes from "./routes/resumeBuilder";
import codeRoutes from "./routes/code";
import paymentRoutes from "./routes/payment";
import authRoutes from "./routes/auth";
import settingsRoutes from "./routes/settings";
import { registerInterviewRealtime } from "./realtime/interviewRoomRealtime";

dotenv.config();

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXTAUTH_URL || `http://localhost:${process.env.PORT || 4000}`;

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session — only needed for the brief OAuth handshake
app.use(session({
  secret: process.env.JWT_SECRET || "offerpilot_session_fallback",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 10 * 60 * 1000 }, // 10 min
}));

app.use(passport.initialize());
app.use(passport.session());

// Static uploads (optional)
app.use("/uploads", express.static(path.join(process.cwd(), "src/uploads")));

// Mount routes
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/resume-builder", resumeBuilderRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/payment", paymentRoutes);

const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});
registerInterviewRealtime(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running at ${BACKEND_URL}`);
});

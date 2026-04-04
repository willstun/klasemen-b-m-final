import express from "express";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import config from "./config/index.js";
import { initSocket } from "./services/socket.service.js";
import { apiGuard, rateLimiter, securityHeaders } from "./middleware/security.middleware.js";
import { optionalAuth } from "./middleware/auth.middleware.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import competitionRoutes from "./routes/competition.routes.js";
import participantRoutes from "./routes/participant.routes.js";
import prizeRoutes from "./routes/prize.routes.js";
import userRoutes from "./routes/user.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import logRoutes from "./routes/log.routes.js";
import themeRoutes from "./routes/theme.routes.js";

// ─── Setup ──────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// ─── Global Middleware ──────────────────────────────────

// Trust proxy for proper IP detection behind NGINX
if (config.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(securityHeaders);
app.use(rateLimiter);

app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Serve uploaded files with cache headers
app.use("/uploads", express.static(path.resolve(config.uploadDir), {
  maxAge: config.isDev ? 0 : "7d",
  etag: true,
  lastModified: true,
}));

// Optional auth for all routes (attach session if present)
app.use(optionalAuth);

// ─── API Routes ─────────────────────────────────────────

// Public routes (no auth needed)
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/theme", themeRoutes);

// Admin routes (protected by apiGuard + requireAuth inside each route)
app.use("/api/admin/competitions", apiGuard, competitionRoutes);
app.use("/api/admin/participants", apiGuard, participantRoutes);
app.use("/api/admin/users", apiGuard, userRoutes);
app.use("/api/admin/logs", apiGuard, logRoutes);
app.use("/api/prizes", apiGuard, prizeRoutes);   // Fix #11: prizes behind guard
app.use("/api/upload", apiGuard, uploadRoutes);

// ─── Health Check ───────────────────────────────────────

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: config.nodeEnv,
  });
});

// ─── 404 Handler ────────────────────────────────────────

app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// ─── Error Handler ──────────────────────────────────────

app.use((err, req, res, next) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ───────────────────────────────────────

httpServer.listen(config.port, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     LOMBAROG BACKEND SERVER                  ║
║──────────────────────────────────────────────║
║  Port     : ${String(config.port).padEnd(33)}║
║  Env      : ${String(config.nodeEnv).padEnd(33)}║
║  Socket   : enabled                          ║
╚══════════════════════════════════════════════╝
  `);

  // Production warnings
  if (!config.isDev) {
    if (config.apiSecretValue === "default-api-key-change-me") {
      console.warn("⚠️  WARNING: API_SECRET_VALUE masih default! Ganti di .env untuk production.");
    }
    if (config.allowedOrigins.some(o => o.includes("localhost"))) {
      console.warn("⚠️  WARNING: ALLOWED_ORIGINS masih berisi localhost. Update untuk production.");
    }
  }
});

export default app;

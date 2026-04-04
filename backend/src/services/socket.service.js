import { Server } from "socket.io";
import config from "../config/index.js";

let io = null;

// ─── Initialize Socket.io ──────────────────────────────

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: config.allowedOrigins,
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  const VALID_TYPES = ["monthly", "weekly"];

  io.on("connection", (socket) => {
    // Join room based on competition type
    socket.on("join:leaderboard", (type) => {
      if (typeof type === "string" && VALID_TYPES.includes(type)) {
        socket.join(`leaderboard:${type}`);
      }
    });

    socket.on("leave:leaderboard", (type) => {
      if (typeof type === "string" && VALID_TYPES.includes(type)) {
        socket.leave(`leaderboard:${type}`);
      }
    });

    // Suppress error events to prevent unhandled error crashes
    socket.on("error", () => {});
  });

  console.log("[Socket] Socket.io initialized");
  return io;
}

// ─── Emit Events ────────────────────────────────────────

export function getIO() {
  return io;
}

// Notify all clients watching a specific leaderboard type
export function emitLeaderboardUpdate(type, data = null) {
  if (!io) return;
  io.to(`leaderboard:${type}`).emit("leaderboard:updated", { type, data });
}

// Notify all clients about any competition change
export function emitCompetitionChange(action, competition) {
  if (!io) return;
  io.emit("competition:changed", { action, competition });
}

// Notify about participant changes
export function emitParticipantChange(competitionId, type) {
  if (!io) return;
  io.emit("participant:changed", { competitionId, type });
  emitLeaderboardUpdate(type);
}

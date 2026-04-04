"use client";
import { useEffect, useRef, useCallback } from "react";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

export function useSocket(leaderboardType, onUpdate) {
  const socketRef = useRef(null);
  const mountedRef = useRef(true);

  const handleUpdate = useCallback((data) => {
    if (mountedRef.current && onUpdate) onUpdate(data);
  }, [onUpdate]);

  useEffect(() => {
    mountedRef.current = true;
    let socket = null;

    const timer = setTimeout(async () => {
      if (!mountedRef.current) return;
      try {
        const { io } = await import("socket.io-client");
        if (!mountedRef.current) return;

        socket = io(SOCKET_URL, {
          transports: ["polling", "websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
        });
        socketRef.current = socket;

        const join = () => { if (leaderboardType && mountedRef.current) socket.emit("join:leaderboard", leaderboardType); };
        socket.on("connect", join);
        socket.on("leaderboard:updated", handleUpdate);
        socket.on("participant:changed", handleUpdate);
        socket.on("competition:changed", handleUpdate);
        socket.on("connect_error", () => {});
      } catch {}
    }, 500);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
      if (socket) {
        try { socket.emit("leave:leaderboard", leaderboardType); } catch {}
        socket.removeAllListeners();
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [leaderboardType, handleUpdate]);

  return socketRef;
}

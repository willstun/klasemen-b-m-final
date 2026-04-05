"use client";

export function usePageType() {
  if (typeof window === "undefined") return { pageKey: "bulanan", type: "monthly", isDev: true };

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  const isDev = hostname === "localhost" || hostname === "127.0.0.1";

  // Development: detect from path
  if (isDev) {
    if (pathname.startsWith("/mingguan")) {
      return { pageKey: "mingguan", type: "weekly", isDev: true };
    }
    return { pageKey: "bulanan", type: "monthly", isDev: true };
  }

  // Production: detect "week" anywhere in hostname
  if (hostname.includes("week")) {
    return { pageKey: "mingguan", type: "weekly", isDev: false };
  }

  // Default production: bulanan (month.*, lomba0001.*, dll)
  return { pageKey: "bulanan", type: "monthly", isDev: false };
}
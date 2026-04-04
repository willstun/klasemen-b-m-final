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

  // Production: detect from hostname
  if (hostname.startsWith("week.") || hostname.startsWith("week-")) {
    return { pageKey: "mingguan", type: "weekly", isDev: false };
  }

  // Default production: bulanan (termasuk domain mirror)
  return { pageKey: "bulanan", type: "monthly", isDev: false };
}
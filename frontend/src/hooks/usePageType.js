"use client";

// Detect page type: "bulanan" or "mingguan"
// Production: dari hostname (month.* = bulanan, week.* = mingguan)
// Development: dari URL path (/mingguan = mingguan, default = bulanan)

export function usePageType() {
  if (typeof window === "undefined") return { pageKey: "bulanan", type: "monthly", isDev: true };

  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Production: detect from hostname
  if (hostname.startsWith("week.") || hostname.startsWith("week-")) {
    return { pageKey: "mingguan", type: "weekly", isDev: false };
  }
  if (hostname.startsWith("month.") || hostname.startsWith("month-")) {
    return { pageKey: "bulanan", type: "monthly", isDev: false };
  }

  // Development (localhost): detect from path
  if (pathname.startsWith("/mingguan")) {
    return { pageKey: "mingguan", type: "weekly", isDev: true };
  }

  return { pageKey: "bulanan", type: "monthly", isDev: true };
}

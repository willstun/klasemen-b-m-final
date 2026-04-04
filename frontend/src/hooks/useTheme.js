"use client";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useTheme() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/theme/frontend`, { credentials: "include" });
        if (!res.ok) { setLoaded(true); return; }
        const data = await res.json();
        const colors = data.colors || {};
        const root = document.documentElement;
        for (const [key, value] of Object.entries(colors)) {
          root.style.setProperty(`--color-${key}`, value);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  return { loaded };
}

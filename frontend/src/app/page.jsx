"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import HomePage from "@/components/HomePage";
import Loading from "@/components/Loading";
import { settingsApi } from "@/lib/api";
import { setFavicon } from "@/lib/favicon";
import { usePageType } from "@/hooks/usePageType";

export default function RootPage() {
  const router = useRouter();
  const { pageKey, isDev } = usePageType();
  const [settings, setSettings] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Development: redirect to /bulanan so path-based detection works
    if (isDev && window.location.pathname === "/") {
      setRedirecting(true);
      router.replace("/bulanan");
      return;
    }

    // Production: load page directly
    settingsApi.getPage(pageKey).then((data) => {
      setSettings(data);
      setFavicon(data.faviconUrl);
    }).catch(() => setSettings({}));
  }, [pageKey, isDev, router]);

  if (redirecting) return null;
  if (!settings) return <Loading text="Memuat halaman..." />;

  return (
    <>
      <PublicHeader settings={settings} homeHref="/" />
      <div className="mt-14 md:mt-16"><HomePage settings={settings} /></div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import HomePage from "@/components/HomePage";
import Loading from "@/components/Loading";
import { settingsApi } from "@/lib/api";
import { setFavicon } from "@/lib/favicon";

export default function BulananHome() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    settingsApi.getPage("bulanan").then((data) => {
      setSettings(data);
      setFavicon(data.faviconUrl);
    }).catch(() => setSettings({}));
  }, []);

  if (!settings) return <Loading text="Memuat halaman..." />;

  return (
    <>
      <PublicHeader settings={settings} homeHref="/bulanan" />
      <div className="mt-14 md:mt-16"><HomePage settings={settings} /></div>
    </>
  );
}

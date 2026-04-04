"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/PublicHeader";
import LeaderboardLayout from "@/components/LeaderboardLayout";
import Loading from "@/components/Loading";
import { settingsApi } from "@/lib/api";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { setFavicon } from "@/lib/favicon";
import { usePageType } from "@/hooks/usePageType";

export default function TabelPage() {
  const router = useRouter();
  const { pageKey, type, isDev } = usePageType();
  const config = { type, label: type === "weekly" ? "Mingguan" : "Bulanan" };
  const leaderboard = useLeaderboard(type);
  const [settings, setSettings] = useState(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Development: redirect to /bulanan/tabel or /mingguan/tabel
    if (isDev) {
      setRedirecting(true);
      router.replace("/bulanan/tabel");
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
      <div className="mt-14 md:mt-16">
        <LeaderboardLayout config={config} settings={settings} {...leaderboard} />
      </div>
    </>
  );
}

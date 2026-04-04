"use client";
import { useEffect, useState } from "react";
import PublicHeader from "@/components/PublicHeader";
import LeaderboardLayout from "@/components/LeaderboardLayout";
import Loading from "@/components/Loading";
import { settingsApi } from "@/lib/api";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { setFavicon } from "@/lib/favicon";

const CONFIG = { type: "weekly", label: "Mingguan" };

export default function MingguanTabel() {
  const [settings, setSettings] = useState(null);
  const leaderboard = useLeaderboard("weekly");

  useEffect(() => {
    settingsApi.getPage("mingguan").then((data) => {
      setSettings(data);
      setFavicon(data.faviconUrl);
    }).catch(() => setSettings({}));
  }, []);

  if (!settings) return <Loading text="Memuat halaman..." />;

  return (
    <>
      <PublicHeader settings={settings} homeHref="/mingguan" />
      <div className="mt-14 md:mt-16">
        <LeaderboardLayout config={CONFIG} settings={settings} {...leaderboard} />
      </div>
    </>
  );
}

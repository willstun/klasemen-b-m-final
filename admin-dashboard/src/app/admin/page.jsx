"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";
import { competitionApi, logApi } from "@/lib/api";
import { IconCalendar, IconWeekly, IconUsers, IconTrophy, IconArrowUp, IconActivity, IconHome } from "@/components/Icons";

const STAT_CARDS = [
  { key: "monthly", label: "Lomba Bulanan", icon: IconCalendar, color: "text-stat-purple", bg: "bg-stat-purple-bg", ring: "ring-purple-500/20" },
  { key: "weekly", label: "Lomba Mingguan", icon: IconWeekly, color: "text-stat-blue", bg: "bg-stat-blue-bg", ring: "ring-blue-500/20" },
  { key: "participants", label: "Total Peserta", icon: IconUsers, color: "text-stat-gold", bg: "bg-stat-gold-bg", ring: "ring-yellow-500/20" },
  { key: "total", label: "Total Lomba", icon: IconTrophy, color: "text-stat-green", bg: "bg-stat-green-bg", ring: "ring-green-500/20" },
];

const QUICK_LINKS = [
  { href: "/admin/monthly", label: "Lomba Bulanan", desc: "Kelola kompetisi bulanan", icon: IconCalendar, color: "text-stat-purple", bg: "bg-stat-purple-bg" },
  { href: "/admin/weekly", label: "Lomba Mingguan", desc: "Kelola kompetisi mingguan", icon: IconWeekly, color: "text-stat-blue", bg: "bg-stat-blue-bg" },
  { href: "/admin/homepage", label: "Home Page", desc: "Edit tampilan website", icon: IconHome, color: "text-stat-gold", bg: "bg-stat-gold-bg" },
  { href: "/admin/users", label: "Kelola Akun", desc: "Manage user admin", icon: IconUsers, color: "text-stat-green", bg: "bg-stat-green-bg" },
];

export default function AdminDashboard() {
  const [comps, setComps] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      competitionApi.list().catch(() => []),
      logApi.list(8).catch(() => []),
    ]).then(([c, l]) => { setComps(c); setLogs(l); setLoading(false); });
  }, []);

  if (loading) return <Loading text="Memuat dashboard..." />;

  const mc = comps.filter((c) => c.type === "monthly");
  const wc = comps.filter((c) => c.type === "weekly");
  const tp = comps.reduce((sum, c) => sum + (c._count?.participants || 0), 0);
  const statValues = { monthly: mc.length, weekly: wc.length, participants: tp, total: comps.length };

  return (
    <div className="fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-white">Dashboard</h1>
        <p className="text-sm text-text-muted mt-1">Overview klasemen lomba</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {STAT_CARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="bg-card-bg border border-card-border rounded-2xl p-5 lg:p-6 hover:border-brand/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center ring-1 ${stat.ring}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <h3 className={`text-3xl font-bold text-text-white mb-1`}>{statValues[stat.key]}</h3>
              <p className="text-text-muted text-sm m-0">{stat.label}</p>
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-card-border">
                <div className="flex items-center gap-1 text-green-brand text-xs font-medium">
                  <IconArrowUp className="w-3 h-3" />
                  <span>Aktif</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Quick Access */}
        <div className="xl:col-span-2 bg-card-bg border border-card-border rounded-2xl p-6">
          <h2 className="text-text-white font-semibold text-base mb-5">Akses Cepat</h2>
          <div className="space-y-3">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-4 p-3.5 rounded-xl border border-card-border no-underline transition-all duration-200 hover:border-brand/20 hover:bg-white/2 group">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-white m-0 group-hover:text-brand transition-colors">{item.label}</p>
                    <p className="text-xs text-text-muted m-0 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activity Log */}
        <div className="xl:col-span-3 bg-card-bg border border-card-border rounded-2xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-text-white font-semibold text-base flex items-center gap-2 m-0">
              <IconActivity className="w-5 h-5 text-brand" /> Aktivitas Terbaru
            </h2>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12">
              <IconActivity className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-30" />
              <p className="text-text-muted text-sm">Belum ada aktivitas.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/2 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-brand-muted flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-brand font-bold">{log.username?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary m-0 leading-snug">{log.action}</p>
                    <p className="text-[0.65rem] text-text-muted m-0 mt-1">
                      {log.username} · {new Date(log.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

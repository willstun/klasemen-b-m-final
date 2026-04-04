"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { competitionApi } from "@/lib/api";
import { BULAN_NAMES } from "@/lib/config";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconTrash, IconCalendar } from "@/components/Icons";

export default function MonthlyListPage() {
  const [comps, setComps] = useState([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selMonth, setSelMonth] = useState(new Date().getMonth() + 1);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const { show: showToast, Toast } = useToast();
  const perPage = 10;

  useEffect(() => { load(); }, []);

  function load() {
    competitionApi.list("monthly").then(setComps).catch(() => {}).finally(() => setLoading(false));
  }

  async function create(e) {
    e.preventDefault();
    const days = new Date(selYear, selMonth, 0).getDate();
    try {
      await competitionApi.create({
        name: "Klasemen Lomba Turnover Rogtoto",
        type: "monthly", year: selYear, month: selMonth,
        periode: `PERIODE 01 - ${days} ${BULAN_NAMES[selMonth].toUpperCase()} ${selYear}`,
      });
      setShowForm(false);
      showToast("Bulan baru dibuat!");
      load();
    } catch (err) { showToast(err.message); }
  }

  async function del(id) {
    if (!confirm("Hapus kompetisi ini?")) return;
    try { await competitionApi.delete(id); showToast("Dihapus"); load(); } catch (err) { showToast(err.message); }
  }

  if (loading) return <Loading text="Memuat lomba bulanan..." />;

  const totalPages = Math.ceil(comps.length / perPage);
  const inputCls = "w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors";

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-white">Lomba Bulanan</h1>
          <p className="text-sm text-text-muted mt-1">Kelola kompetisi bulanan</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer border-none transition-colors">
          <IconPlus className="w-4 h-4" /> {showForm ? "Batal" : "Buat Bulan Baru"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-text-white font-semibold mb-4">Buat Tabel Bulan Baru</h2>
          <form onSubmit={create}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Bulan</label>
                <select className={inputCls} value={selMonth} onChange={(e) => setSelMonth(parseInt(e.target.value))}>
                  {BULAN_NAMES.slice(1).map((b, i) => <option key={i + 1} value={i + 1}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Tahun</label>
                <input type="number" className={inputCls} value={selYear} onChange={(e) => setSelYear(parseInt(e.target.value))} />
              </div>
            </div>
            <p className="text-xs text-text-muted mb-4">
              Periode: PERIODE 01 - {new Date(selYear, selMonth, 0).getDate()} {BULAN_NAMES[selMonth]?.toUpperCase()} {selYear}
            </p>
            <button type="submit" className="bg-green-brand hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer border-none transition-colors">
              Buat Kompetisi
            </button>
          </form>
        </div>
      )}

      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden">
        {comps.length === 0 ? (
          <div className="p-16 text-center">
            <IconCalendar className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-text-muted text-sm">Belum ada data bulanan.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-table-header">
                    {["Bulan", "Periode", "Peserta", "Status", "Aksi"].map((h) => (
                      <th key={h} className="text-left py-4 px-5 text-text-muted text-xs uppercase font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comps.slice((page - 1) * perPage, page * perPage).map((c) => (
                    <tr key={c.id} className="border-b border-card-border hover:bg-table-hover transition-colors">
                      <td className="py-4 px-5 font-medium text-text-white">{BULAN_NAMES[c.month]} {c.year}</td>
                      <td className="py-4 px-5 text-xs text-text-muted">{c.periode}</td>
                      <td className="py-4 px-5">
                        <span className="bg-badge-blue-bg text-badge-blue-text text-xs font-medium px-2.5 py-1 rounded-lg">{c._count?.participants || 0}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${c.isActive ? "bg-badge-active-bg text-badge-active-text" : "bg-badge-inactive-bg text-badge-inactive-text"}`}>
                          {c.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/monthly/${c.id}`}
                            className="px-3 py-1.5 bg-brand-muted text-brand text-xs font-medium rounded-lg no-underline hover:bg-brand/20 transition-colors">
                            Detail
                          </Link>
                          <button onClick={() => del(c.id)}
                            className="p-1.5 text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 rounded-lg transition-colors">
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
      <Toast />
    </div>
  );
}

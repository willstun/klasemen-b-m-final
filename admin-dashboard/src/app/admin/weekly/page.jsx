"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { competitionApi } from "@/lib/api";
import { BULAN_NAMES } from "@/lib/config";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconTrash, IconWeekly } from "@/components/Icons";

// Format date string "2026-03-05" → "05 Maret 2026"
function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} ${BULAN_NAMES[d.getMonth() + 1]} ${d.getFullYear()}`;
}

// Build periode label from 2 date strings
function buildPeriodeLabel(start, end) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const sDay = pad(s.getDate());
  const sMonth = s.getMonth() + 1;
  const sYear = s.getFullYear();
  const eDay = pad(e.getDate());
  const eMonth = e.getMonth() + 1;
  const eYear = e.getFullYear();

  if (sYear !== eYear) return `${sDay} ${BULAN_NAMES[sMonth]} ${sYear} - ${eDay} ${BULAN_NAMES[eMonth]} ${eYear}`;
  if (sMonth !== eMonth) return `${sDay} ${BULAN_NAMES[sMonth]} - ${eDay} ${BULAN_NAMES[eMonth]} ${sYear}`;
  return `${sDay} - ${eDay} ${BULAN_NAMES[sMonth]} ${sYear}`;
}

export default function WeeklyListPage() {
  const [comps, setComps] = useState([]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selYear, setSelYear] = useState(new Date().getFullYear());
  const [selStart, setSelStart] = useState("");
  const [selEnd, setSelEnd] = useState("");
  const [selPeriode, setSelPeriode] = useState(1);
  const [loading, setLoading] = useState(true);
  const { show: showToast, Toast } = useToast();
  const perPage = 10;

  useEffect(() => { load(); }, []);

  function load() {
    competitionApi.list("weekly").then(setComps).catch(() => {}).finally(() => setLoading(false));
  }

  // Auto-set end date to start + 6 days when start changes
  function handleStartChange(val) {
    setSelStart(val);
    if (val) {
      const d = new Date(val);
      d.setDate(d.getDate() + 6);
      const pad = (n) => String(n).padStart(2, "0");
      setSelEnd(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
    }
  }

  async function create(e) {
    e.preventDefault();
    if (!selStart || !selEnd) {
      showToast("Pilih tanggal periode");
      return;
    }
    if (!selPeriode || selPeriode < 1) {
      showToast("Nomor periode harus diisi");
      return;
    }
    try {
      await competitionApi.create({
        name: "Klasemen Mingguan",
        type: "weekly",
        year: selYear,
        week: selPeriode,
        periodeStart: selStart,
        periodeEnd: selEnd,
      });
      setShowForm(false);
      showToast("Periode baru dibuat!");
      load();
    } catch (err) { showToast(err.message); }
  }

  async function del(id) {
    if (!confirm("Hapus?")) return;
    try { await competitionApi.delete(id); showToast("Dihapus"); load(); } catch {}
  }

  if (loading) return <Loading text="Memuat lomba mingguan..." />;

  const totalPages = Math.ceil(comps.length / perPage);
  const inputCls = "w-full px-4 py-2.5 bg-input-bg border border-input-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-colors";

  const previewLabel = buildPeriodeLabel(selStart, selEnd);
  const currentYear = new Date().getFullYear();

  return (
    <div className="fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-white">Lomba Mingguan</h1>
          <p className="text-sm text-text-muted mt-1">Kelola kompetisi mingguan</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer border-none transition-colors">
          <IconPlus className="w-4 h-4" /> {showForm ? "Batal" : "Buat Periode Baru"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
          <h2 className="text-text-white font-semibold mb-4">Buat Tabel Periode Baru</h2>
          <form onSubmit={create}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Tanggal Mulai</label>
                <input type="date" className={inputCls} value={selStart} onChange={(e) => handleStartChange(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Tanggal Selesai</label>
                <input type="date" className={inputCls} value={selEnd} onChange={(e) => setSelEnd(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Tahun</label>
                <select className={inputCls} value={selYear} onChange={(e) => setSelYear(parseInt(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => currentYear + i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-primary font-medium mb-2">Periode</label>
                <input type="number" min="1" className={inputCls} value={selPeriode} onChange={(e) => setSelPeriode(parseInt(e.target.value) || 1)} placeholder="1" />
              </div>
            </div>
            {previewLabel && (
              <p className="text-xs text-text-muted mb-4">
                Preview: <span className="text-brand font-medium">PERIODE {previewLabel.toUpperCase()} (PERIODE {selPeriode})</span>
              </p>
            )}
            <button type="submit" className="bg-green-brand hover:bg-green-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer border-none transition-colors">
              Buat Kompetisi
            </button>
          </form>
        </div>
      )}

      <div className="bg-card-bg border border-card-border rounded-2xl overflow-hidden">
        {comps.length === 0 ? (
          <div className="p-16 text-center">
            <IconWeekly className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-30" />
            <p className="text-text-muted text-sm">Belum ada data mingguan.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-card-border bg-table-header">
                    {["Periode Tanggal", "Periode", "Peserta", "Status", "Aksi"].map((h) => (
                      <th key={h} className="text-left py-4 px-5 text-text-muted text-xs uppercase font-medium tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comps.slice((page - 1) * perPage, page * perPage).map((c) => (
                    <tr key={c.id} className="border-b border-card-border hover:bg-table-hover transition-colors">
                      <td className="py-4 px-5 font-medium text-text-white">{c.periode || "-"}</td>
                      <td className="py-4 px-5">
                        <span className="bg-badge-blue-bg text-badge-blue-text text-xs font-medium px-2.5 py-1 rounded-lg">Periode {c.week || "-"}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="bg-badge-purple-bg text-badge-purple-text text-xs font-medium px-2.5 py-1 rounded-lg">{c._count?.participants || 0}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${c.isActive ? "bg-badge-active-bg text-badge-active-text" : "bg-badge-inactive-bg text-badge-inactive-text"}`}>
                          {c.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/weekly/${c.id}`}
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
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { competitionApi, participantApi, prizeApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { IconChevronLeft, IconSettings, IconPlus, IconEdit, IconTrash } from "@/components/Icons";
import Loading from "@/components/Loading";

const DEFAULT_ROW_COUNT = 10;

export default function CompetitionDetail({ id, backHref }) {
  const router = useRouter();
  const [comp, setComp] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ name: "", prize: "", points: "0" });
  const [settings, setSettings] = useState({ name: "", bannerUrl: "", periode: "", claimLink: "", isActive: true });
  const [prizes, setPrizes] = useState([]);
  const [newRows, setNewRows] = useState([]);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const hasInitRows = useRef(false);
  const { show: showToast, Toast } = useToast();

  // ─── Load competition + prizes together ───────────────

  useEffect(() => {
    loadAll();
  }, [id]);

  async function loadAll() {
    try {
      const data = await competitionApi.get(id);
      setComp(data);
      setSettings({
        name: data.name,
        bannerUrl: data.bannerUrl || "",
        periode: data.periode || "",
        claimLink: data.claimLink || "",
        isActive: data.isActive,
      });

      let loadedPrizes = [];
      try {
        loadedPrizes = await prizeApi.list(data.type);
      } catch {}
      setPrizes(loadedPrizes);

      // Generate empty rows only if no participants exist yet
      if (!hasInitRows.current) {
        hasInitRows.current = true;
        if (data.participants.length === 0) {
          const rows = generateRows(DEFAULT_ROW_COUNT, 1, loadedPrizes);
          setNewRows(rows);
        }
      }

      setReady(true);
    } catch {
      router.push(backHref);
    }
  }

  // Reload after save (keep hasInitRows true so rows reset properly)
  async function reload() {
    hasInitRows.current = true;
    setNewRows([]);
    setReady(false);
    await loadAll();
  }

  // ─── Prize helpers ────────────────────────────────────

  function getPrizeForRank(rank, prizeList) {
    const list = prizeList || prizes;
    const template = list.find((p) => p.rank === rank);
    if (template) return template.name;
    if (list.length > 0) return list[list.length - 1].name;
    return "";
  }

  function generateRows(count, startRank, prizeList) {
    return Array.from({ length: count }, (_, i) => ({
      key: `new-${Date.now()}-${i}-${Math.random()}`,
      name: "",
      points: "",
      prize: getPrizeForRank(startRank + i, prizeList),
    }));
  }

  const prizeOptions = [...new Set(prizes.map((p) => p.name))];
  const isWeekly = comp?.type === "weekly";

  // ─── New Row Actions ──────────────────────────────────

  function addNewRow() {
    const nextRank = (comp?.participants.length || 0) + newRows.length + 1;
    setNewRows((prev) => [
      ...prev,
      {
        key: `new-${Date.now()}-${Math.random()}`,
        name: "",
        points: "",
        prize: getPrizeForRank(nextRank),
      },
    ]);
  }

  function updateNewRow(idx, field, value) {
    setNewRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function removeNewRow(idx) {
    setNewRows((prev) => prev.filter((_, i) => i !== idx));
  }

  // ─── Bulk Save ────────────────────────────────────────

  async function saveAllNewRows() {
    const validRows = newRows.filter((r) => r.name.trim());
    if (validRows.length === 0) {
      showToast("Masukkan minimal 1 username");
      return;
    }

    setSaving(true);
    try {
      const result = await participantApi.bulkCreate(
        parseInt(id),
        validRows.map((r) => ({
          name: r.name.trim(),
          points: parseFloat(r.points) || 0,
          prize: r.prize || null,
        }))
      );
      showToast(`${result.count} peserta berhasil disimpan!`);
      reload();
    } catch (err) {
      showToast(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  // ─── Existing Participant Actions ─────────────────────

  async function toggleStatus(pId, currentStatus) {
    const newStatus = currentStatus === "claim" ? "selesai" : "claim";
    try {
      await participantApi.toggleStatus({ id: pId, status: newStatus });
      setComp((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === pId ? { ...p, status: newStatus } : p
        ),
      }));
    } catch {}
  }

  async function changePrize(pId, prize) {
    try {
      await participantApi.update(pId, { prize });
      setComp((prev) => ({
        ...prev,
        participants: prev.participants.map((p) =>
          p.id === pId ? { ...p, prize } : p
        ),
      }));
      showToast("Hadiah diubah");
    } catch {}
  }

  function startEdit(p) {
    setEditId(p.id);
    setEditData({ name: p.name, prize: p.prize || "", points: p.points });
  }

  async function saveEdit(pId) {
    try {
      await participantApi.update(pId, {
        name: editData.name,
        prize: editData.prize || null,
        points: parseFloat(editData.points) || 0,
      });
      setEditId(null);
      showToast("Diperbarui!");
      reload();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function deleteParticipant(pId) {
    if (!confirm("Hapus peserta ini?")) return;
    try {
      await participantApi.delete(pId);
      setComp((prev) => ({
        ...prev,
        participants: prev.participants.filter((p) => p.id !== pId),
      }));
      showToast("Dihapus");
    } catch {}
  }

  async function saveSettings(e) {
    e.preventDefault();
    try {
      await competitionApi.update(id, settings);
      showToast("Disimpan!");
      reload();
    } catch (err) {
      showToast(err.message);
    }
  }

  // ─── Render ───────────────────────────────────────────

  if (!ready || !comp) return <Loading text="Memuat data kompetisi..." />;

  const ic = "w-full px-3 py-2.5 bg-detail-input-bg border border-detail-input-border rounded-xl text-sm text-white focus:outline-none focus:border-input-focus";
  const ics = "px-2 py-1.5 bg-detail-input-bg border border-detail-input-border rounded-lg text-xs text-white focus:outline-none focus:border-input-focus";
  const validNewRows = newRows.filter((r) => r.name.trim()).length;

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
        <div>
          <button onClick={() => router.push(backHref)} className="flex items-center gap-1 text-text-muted text-xs bg-transparent border-none cursor-pointer hover:text-white mb-3 p-0 transition-colors">
            <IconChevronLeft className="w-4 h-4" /> Kembali
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white/80">{comp.name}</h1>
          <p className="text-sm text-text-muted mt-1">{comp.periode}</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 text-sm rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
          <IconSettings className="w-4 h-4" /> {showSettings ? "Tutup" : "Pengaturan"}
        </button>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6 fade-in">
          <h2 className="text-white/80 font-semibold mb-4">Pengaturan Kompetisi</h2>
          <form onSubmit={saveSettings}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs text-text-muted font-medium mb-1.5">Nama</label><input className={ic} value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} /></div>
              <div><label className="block text-xs text-text-muted font-medium mb-1.5">Periode</label><input className={ic} value={settings.periode} onChange={(e) => setSettings({ ...settings, periode: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div><label className="block text-xs text-text-muted font-medium mb-1.5">Banner URL</label><input className={ic} value={settings.bannerUrl} onChange={(e) => setSettings({ ...settings, bannerUrl: e.target.value })} /></div>
              <div><label className="block text-xs text-text-muted font-medium mb-1.5">Claim Link</label><input className={ic} value={settings.claimLink} onChange={(e) => setSettings({ ...settings, claimLink: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <button type="button" className={`toggle-switch ${settings.isActive ? "active bg-green-brand" : "bg-neutral-700"}`} onClick={() => setSettings({ ...settings, isActive: !settings.isActive })} />
              <span className="text-xs text-text-muted">{settings.isActive ? "Aktif" : "Nonaktif"}</span>
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer border-none transition-colors">Simpan Pengaturan</button>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
         PARTICIPANTS TABLE
         ═══════════════════════════════════════════════════ */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white/80 font-semibold">Peserta ({comp.participants.length})</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-table-alt-border">
                <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium w-16">Rank</th>
                <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium">Username</th>
                <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium">Hadiah</th>
                {!isWeekly && (
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium">Points</th>
                )}
                <th className="text-center py-3 px-4 text-text-muted text-xs uppercase font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <span>Claim</span>
                    {comp.participants.length > 0 && (
                      <button
                        className={`toggle-switch ${comp.participants.every((p) => p.status === "claim") ? "active bg-green-brand" : "bg-neutral-700"}`}
                        onClick={async () => {
                          const allActive = comp.participants.every((p) => p.status === "claim");
                          const newStatus = allActive ? "selesai" : "claim";
                          try {
                            await participantApi.toggleStatus({ competitionId: parseInt(id), status: newStatus });
                            setComp((prev) => ({
                              ...prev,
                              participants: prev.participants.map((p) => ({ ...p, status: newStatus })),
                            }));
                            showToast(allActive ? "Semua claim dinonaktifkan" : "Semua claim diaktifkan");
                          } catch {
                            showToast("Gagal mengubah status");
                          }
                        }}
                        title={comp.participants.every((p) => p.status === "claim") ? "Nonaktifkan semua" : "Aktifkan semua"}
                        style={{ transform: "scale(0.8)" }}
                      />
                    )}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium w-20">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* ─── Saved participants ─────────────────────── */}
              {comp.participants.map((p, i) => (
                <tr key={p.id} className="border-b border-table-alt-border hover:bg-white/2 transition-colors">
                  {editId === p.id ? (
                    <>
                      <td className="py-3 px-4 font-bold text-white/80">{p.rank ?? i + 1}</td>
                      <td className="py-3 px-4"><input className={`${ics} w-32`} value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} /></td>
                      <td className="py-3 px-4">
                        <select className={`${ics} w-44`} value={editData.prize} onChange={(e) => setEditData({ ...editData, prize: e.target.value })}>
                          <option value="">-- Pilih --</option>
                          {prizeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      {!isWeekly && (
                        <td className="py-3 px-4"><input className={`${ics} w-28`} type="number" value={editData.points} onChange={(e) => setEditData({ ...editData, points: e.target.value })} /></td>
                      )}
                      <td className="py-3 px-4">—</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button onClick={() => saveEdit(p.id)} className="bg-green-600 text-white text-xs px-2.5 py-1 rounded-lg border-none cursor-pointer">OK</button>
                          <button onClick={() => setEditId(null)} className="bg-white/5 border border-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-lg cursor-pointer">X</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3 px-4 font-bold text-white/80">{p.rank ?? i + 1}</td>
                      <td className="py-3 px-4">{p.name}</td>
                      <td className="py-3 px-4">
                        <select value={p.prize || ""} onChange={(e) => changePrize(p.id, e.target.value)} className="bg-detail-input-bg border border-detail-input-border rounded-lg text-xs text-white px-2 py-1.5 focus:outline-none focus:border-input-focus cursor-pointer max-w-50">
                          <option value="">-- Pilih --</option>
                          {prizeOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </td>
                      {!isWeekly && (
                        <td className="py-3 px-4 tabular-nums">{new Intl.NumberFormat("id-ID").format(parseFloat(p.points))}</td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <button
                          className={`toggle-switch ${p.status === "claim" ? "active bg-green-brand" : "bg-neutral-700"}`}
                          onClick={() => toggleStatus(p.id, p.status)}
                          title={p.status === "claim" ? "Claim aktif" : "Claim nonaktif"}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEdit(p)} className="p-1.5 text-gray-400 bg-transparent border-none cursor-pointer hover:bg-white/5 rounded-lg"><IconEdit className="w-4 h-4" /></button>
                          <button onClick={() => deleteParticipant(p.id)} className="p-1.5 text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 rounded-lg"><IconTrash className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}

              {/* ─── New (unsaved) rows ────────────────────── */}
              {newRows.map((row, idx) => {
                const rank = comp.participants.length + idx + 1;
                return (
                  <tr key={row.key} className="border-b border-table-alt-border/50 bg-white/1">
                    <td className="py-2.5 px-4 text-text-muted text-xs font-medium">{rank}</td>
                    <td className="py-2.5 px-4">
                      <input
                        className={`${ics} w-32`}
                        value={row.name}
                        onChange={(e) => updateNewRow(idx, "name", e.target.value)}
                        placeholder="Username"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            // If last row, add new row
                            if (idx === newRows.length - 1) addNewRow();
                            // Focus next row's username input
                            setTimeout(() => {
                              const inputs = document.querySelectorAll('input[placeholder="Username"]');
                              if (inputs[idx + 1]) inputs[idx + 1].focus();
                            }, 50);
                          }
                        }}
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <select className={`${ics} w-44`} value={row.prize} onChange={(e) => updateNewRow(idx, "prize", e.target.value)}>
                        {row.prize && <option value={row.prize}>{row.prize}</option>}
                        {prizeOptions.filter((o) => o !== row.prize).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </td>
                    {!isWeekly && (
                      <td className="py-2.5 px-4">
                        <input
                          className={`${ics} w-28`}
                          type="number"
                          value={row.points}
                          onChange={(e) => updateNewRow(idx, "points", e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    )}
                    <td className="py-2.5 px-4 text-text-muted text-xs text-center">—</td>
                    <td className="py-2.5 px-4">
                      <button onClick={() => removeNewRow(idx)} className="p-1.5 text-red-400/50 bg-transparent border-none cursor-pointer hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                        <IconTrash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
          <button onClick={addNewRow} className="flex items-center gap-1.5 text-xs text-text-muted bg-transparent border border-popup-border px-4 py-2 rounded-xl cursor-pointer hover:bg-white/5 hover:text-white transition-colors">
            <IconPlus className="w-3.5 h-3.5" /> Tambah Baris
          </button>

          {validNewRows > 0 && (
            <button
              onClick={saveAllNewRows}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl cursor-pointer border-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Menyimpan..." : `Simpan ${validNewRows} Peserta`}
            </button>
          )}
        </div>

        {newRows.length > 0 && (
          <p className="text-[0.65rem] text-text-muted mt-3">
            Tekan <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[0.6rem]">Enter</kbd> untuk pindah ke baris berikutnya. Hadiah otomatis dari template. Baris kosong tidak akan disimpan.
          </p>
        )}
      </div>
      <Toast />
    </div>
  );
}

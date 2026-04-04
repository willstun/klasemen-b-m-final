"use client";
import { useEffect, useState } from "react";
import { prizeApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { IconPlus, IconEdit, IconTrash } from "@/components/Icons";

export default function PrizeManager({ type, title, placeholder }) {
  const [prizes, setPrizes] = useState([]);
  const [newName, setNewName] = useState("");
  const [editRank, setEditRank] = useState(null);
  const [editName, setEditName] = useState("");
  const { show: showToast, Toast } = useToast();

  useEffect(() => { load(); }, [type]);

  async function load() {
    try { setPrizes(await prizeApi.list(type)); } catch {}
  }

  async function addPrize(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await prizeApi.upsert({ type, rank: prizes.length + 1, name: newName.trim() });
      setNewName("");
      showToast("Hadiah ditambahkan!");
      load();
    } catch (err) { showToast(err.message); }
  }

  async function savePrize(rank) {
    if (!editName.trim()) return;
    try {
      await prizeApi.upsert({ type, rank, name: editName.trim() });
      setEditRank(null);
      showToast("Hadiah diperbarui!");
      load();
    } catch (err) { showToast(err.message); }
  }

  async function removePrize(rank) {
    if (!confirm("Hapus hadiah ini?")) return;
    try {
      await prizeApi.remove(type, rank);
      const remaining = prizes
        .filter((p) => p.rank !== rank)
        .map((p, i) => ({ rank: i + 1, name: p.name }));
      await prizeApi.bulkUpdate(type, remaining);
      showToast("Hadiah dihapus!");
      load();
    } catch (err) { showToast(err.message); }
  }

  const ic = "w-full px-3 py-2.5 bg-card-bg border border-popup-border rounded-xl text-sm text-white focus:outline-none focus:border-input-focus";
  const ics = "px-2 py-1.5 bg-card-bg border border-popup-border rounded-lg text-xs text-white focus:outline-none focus:border-input-focus";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white/80">{title}</h1>
        <p className="text-sm text-text-muted mt-1">
          Kelola daftar hadiah untuk kompetisi {type === "monthly" ? "bulanan" : "mingguan"}
        </p>
      </div>

      <div className="bg-card-bg border border-table-alt-border rounded-2xl p-6">
        <p className="text-xs text-text-muted mb-4">
          Urutan = rank. Peserta dengan rank di luar daftar akan mendapat hadiah terakhir sebagai default.
        </p>

        {prizes.length > 0 && (
          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-table-alt-border">
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium w-20">Rank</th>
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium">Nama Hadiah</th>
                  <th className="text-left py-3 px-4 text-text-muted text-xs uppercase font-medium w-28">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((p) => (
                  <tr key={p.rank} className="border-b border-table-alt-border hover:bg-white/2">
                    <td className="py-3 px-4 font-bold text-white/80">{p.rank}</td>
                    <td className="py-3 px-4">
                      {editRank === p.rank ? (
                        <input
                          className={`${ics} w-full max-w-100`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") savePrize(p.rank);
                            if (e.key === "Escape") setEditRank(null);
                          }}
                        />
                      ) : (
                        <span>{p.name}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {editRank === p.rank ? (
                          <>
                            <button onClick={() => savePrize(p.rank)} className="bg-green-600 text-white text-xs px-2.5 py-1 rounded-lg border-none cursor-pointer">OK</button>
                            <button onClick={() => setEditRank(null)} className="bg-white/5 border border-white/10 text-gray-300 text-xs px-2.5 py-1 rounded-lg cursor-pointer">Batal</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditRank(p.rank); setEditName(p.name); }} className="p-1.5 text-gray-400 bg-transparent border-none cursor-pointer hover:bg-white/5 rounded-lg">
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => removePrize(p.rank)} className="p-1.5 text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 rounded-lg">
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <form onSubmit={addPrize} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-text-muted mb-1.5">
              Tambah Hadiah (Rank {prizes.length + 1})
            </label>
            <input
              className={ic}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={placeholder}
              required
            />
          </div>
          <button type="submit" className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-2.5 rounded-xl cursor-pointer border-none transition-colors h-10.5">
            <IconPlus className="w-4 h-4" /> Tambah
          </button>
        </form>
      </div>
      <Toast />
    </div>
  );
}

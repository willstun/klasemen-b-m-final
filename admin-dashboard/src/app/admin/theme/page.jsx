"use client";
import { useEffect, useState } from "react";
import { themeApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import Loading from "@/components/Loading";

const COLOR_FIELDS = [
  { key: "primary", label: "Color Primary", desc: "Tombol, aksen kuat" },
  { key: "secondary", label: "Color Secondary", desc: "Border, highlight" },
  { key: "blur", label: "Color Blur", desc: "Efek blur/glow" },
  { key: "warning", label: "Color Warning", desc: "Teks gold, border tabel" },
  { key: "dark", label: "Color Dark", desc: "Background card, gradient" },
];

export default function ThemePage() {
  const { show: showToast, Toast } = useToast();
  const [colors, setColors] = useState({});
  const [defaults, setDefaults] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await themeApi.get("frontend");
        setColors(data.baseColors || data.colors || {});
        setDefaults(data.defaults || {});
      } catch { showToast("Gagal memuat theme"); }
      setLoading(false);
    })();
  }, []);

  function updateColor(key, value) {
    setColors((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await themeApi.updateFrontendColors(colors);
      showToast("Warna frontend berhasil disimpan!");
    } catch (err) { showToast(err.message || "Gagal menyimpan"); }
    finally { setSaving(false); }
  }

  async function resetAll() {
    if (!confirm("Reset semua warna frontend ke default?")) return;
    try {
      const result = await themeApi.resetFrontend();
      setColors(result.colors || {});
      showToast("Warna frontend direset ke default!");
    } catch (err) { showToast(err.message || "Gagal reset"); }
  }

  if (loading) return <Loading text="Memuat theme..." />;

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-white">Theme Settings</h1>
        <p className="text-sm text-text-muted mt-1">Atur warna halaman publik (klasemen bulanan & mingguan).</p>
      </div>

      {/* Info */}
      <div className="bg-brand-muted border border-brand/20 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
        <span className="text-lg mt-0.5">🎨</span>
        <div>
          <p className="text-sm text-brand-light font-medium m-0">5 Warna Utama</p>
          <p className="text-xs text-text-muted m-0 mt-1">
            Ubah 5 warna di bawah ini untuk mengatur tampilan seluruh halaman publik. Klik kotak warna untuk membuka color picker.
          </p>
        </div>
      </div>

      {/* Color Grid */}
      <div className="bg-card-bg border border-card-border rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {COLOR_FIELDS.map(({ key, label, desc }) => {
            const value = colors[key] || defaults[key] || "#000000";
            const isChanged = defaults[key] && colors[key] && colors[key] !== defaults[key];

            return (
              <div key={key} className="bg-card-alt-bg border border-card-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-text-white font-medium m-0">{label}</p>
                    <p className="text-[0.65rem] text-text-muted m-0 mt-0.5">{desc}</p>
                  </div>
                  {isChanged && (
                    <button onClick={() => updateColor(key, defaults[key])}
                      className="text-xs text-text-muted hover:text-brand bg-transparent border-none cursor-pointer p-1" title="Reset">
                      ↺
                    </button>
                  )}
                </div>

                {/* Color preview + picker */}
                <label className="relative cursor-pointer block mb-3">
                  <div className="w-full h-14 rounded-lg border-2 border-white/10 hover:border-brand/30 transition-colors"
                    style={{ backgroundColor: value }} />
                  <input type="color" value={value} onChange={(e) => updateColor(key, e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                </label>

                {/* Hex input */}
                <input type="text" value={value} onChange={(e) => updateColor(key, e.target.value)}
                  className="w-full px-3 py-2 bg-input-bg border border-input-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-brand font-mono text-center" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving}
          className="bg-brand hover:bg-brand-dark text-white text-sm font-medium px-6 py-2.5 rounded-lg cursor-pointer border-none transition-colors disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Warna"}
        </button>
        <button onClick={resetAll}
          className="bg-card-alt-bg border border-card-border text-text-muted text-sm px-5 py-2.5 rounded-lg cursor-pointer hover:text-text-primary hover:border-brand/30 transition-colors">
          Reset ke Default
        </button>
      </div>
      <Toast />
    </div>
  );
}
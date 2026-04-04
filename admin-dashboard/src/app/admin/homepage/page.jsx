"use client";
import { useEffect, useState, useRef } from "react";
import { settingsApi } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import SectionCard from "@/components/SectionCard";
import RichTextEditor from "@/components/RichTextEditor";
import ImageUpload from "@/components/ImageUpload";

// ─── Page Tabs ──────────────────────────────────────────

const PAGES = [
  { key: "mingguan", label: "Home Mingguan", route: "/mingguan" },
  { key: "bulanan", label: "Home Bulanan", route: "/bulanan" },
];

// ─── Section Definitions ────────────────────────────────
// Each section maps to fields in the database
// Order is saved and can be rearranged via drag & drop

const DEFAULT_SECTIONS = [
  {
    id: "branding",
    title: "Branding & Navigasi",
    description: "Logo, favicon, background, dan link sosial media",
    icon: "🎨",
    fields: ["logoUrl", "faviconUrl", "backgroundUrl", "whatsappLink", "telegramLink"],
  },
  {
    id: "banner",
    title: "Banner Utama",
    description: "Banner yang tampil di bagian atas halaman",
    icon: "🖼️",
    fields: ["bannerUrl"],
  },
  {
    id: "cta",
    title: "Call to Action",
    description: "Teks ajakan dan tombol menuju tabel klasemen (otomatis ke /tabel)",
    icon: "📢",
    fields: ["title1"],
  },
  {
    id: "event",
    title: "Info Event",
    description: "Judul event dan deskripsi promosi",
    icon: "🏆",
    fields: ["title2", "title3"],
  },
  {
    id: "rules",
    title: "Syarat & Ketentuan",
    description: "Header dan isi syarat ketentuan lomba",
    icon: "📋",
    fields: ["title4", "rules"],
  },
  {
    id: "prizes",
    title: "Daftar Hadiah",
    description: "Header hadiah dan banner gambar hadiah",
    icon: "🎁",
    fields: ["title5", "banner2Url"],
  },
  {
    id: "promo",
    title: "Promo Banner",
    description: "Banner promosi / GIF di bagian bawah",
    icon: "📣",
    fields: ["promoUrl"],
  },
  {
    id: "footer",
    title: "Footer",
    description: "Teks footer halaman (mendukung HTML)",
    icon: "📝",
    fields: ["footerText"],
  },
];

// ─── Field Label & Type Mapping ─────────────────────────

const FIELD_CONFIG = {
  logoUrl: { label: "Logo", type: "image", folder: "logos" },
  faviconUrl: { label: "Favicon", type: "image", folder: "icons" },
  backgroundUrl: { label: "Background", type: "image", folder: "banners" },
  bannerUrl: { label: "Banner Utama", type: "image", folder: "banners" },
  banner2Url: { label: "Banner Hadiah", type: "image", folder: "banners" },
  promoUrl: { label: "Promo / GIF", type: "image", folder: "promos" },
  whatsappLink: { label: "Link WhatsApp", type: "text", ph: "https://wa.me/628xxx" },
  telegramLink: { label: "Link Telegram", type: "text", ph: "https://t.me/xxx" },
  title1: { label: "Teks Ajakan (CTA)", type: "text", ph: "Contoh: LIHAT TABEL LOMBA TURNOVER >>" },
  title2: { label: "Judul Event", type: "text", ph: "Contoh: EVENT BULANAN TOURNAMENT ..." },
  title3: { label: "Deskripsi Event", type: "textarea", ph: "Deskripsi singkat tentang event lomba..." },
  title4: { label: "Header Syarat", type: "text", ph: "Contoh: SYARAT & KETENTUAN" },
  title5: { label: "Header Hadiah", type: "text", ph: "Contoh: BERIKUT LIST HADIAH LOMBA ..." },
  rules: { label: "Isi Syarat & Ketentuan", type: "richtext" },
  footerText: { label: "Konten Footer", type: "richtext" },
};

export default function HomepagePage() {
  const [page, setPage] = useState("mingguan");
  const [form, setForm] = useState({});
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { show: showToast, Toast } = useToast();

  // Drag state
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  useEffect(() => {
    setLoading(true);
    settingsApi.get(page)
      .then((data) => {
        setForm(data || {});
        // Restore section order if saved
        if (data?.sectionOrder) {
          try {
            const order = JSON.parse(data.sectionOrder);
            const reordered = order
              .map((id) => DEFAULT_SECTIONS.find((s) => s.id === id))
              .filter(Boolean);
            // Add any new sections not in saved order
            const remaining = DEFAULT_SECTIONS.filter(
              (s) => !order.includes(s.id)
            );
            setSections([...reordered, ...remaining]);
          } catch {
            setSections(DEFAULT_SECTIONS);
          }
        } else {
          setSections(DEFAULT_SECTIONS);
        }
      })
      .catch(() => setForm({}))
      .finally(() => setLoading(false));
  }, [page]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      // Auto-set buttonText and buttonLink
      const pageRoute = PAGES.find((p) => p.key === page)?.route || "/";
      const saveData = {
        pageKey: page,
        ...form,
        buttonText: "KLIK DISINI",
        buttonLink: `${pageRoute}/tabel`,
        sectionOrder: JSON.stringify(sections.map((s) => s.id)),
      };
      await settingsApi.update(saveData);
      showToast("Berhasil disimpan!");
    } catch (err) {
      showToast(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  // ─── Drag & Drop Handlers ─────────────────────────────

  function onDragStart(e, idx) {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e, idx) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIdx(idx);
  }

  function onDragLeave() {
    setDragOverIdx(null);
  }

  function onDrop(e, dropIdx) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }

    setSections((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(dropIdx, 0, moved);
      return updated;
    });

    setDragIdx(null);
    setDragOverIdx(null);
  }

  function onDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  // ─── Render Field ─────────────────────────────────────

  function renderField(fieldName) {
    const config = FIELD_CONFIG[fieldName];
    if (!config) return null;

    const ic = "w-full px-3 py-2.5 bg-input-bg border border-input-border rounded-xl text-sm text-white focus:outline-none focus:border-input-focus";

    switch (config.type) {
      case "image":
        return (
          <ImageUpload
            key={fieldName}
            label={config.label}
            value={form[fieldName]}
            onChange={(val) => updateField(fieldName, val)}
            folder={config.folder || "general"}
          />
        );

      case "richtext":
        return (
          <div key={fieldName}>
            <label className="block text-xs text-text-muted font-medium mb-1.5">
              {config.label}
            </label>
            <RichTextEditor
              value={form[fieldName] || ""}
              onChange={(val) => updateField(fieldName, val)}
              placeholder={config.ph || "Ketik disini..."}
              minHeight="150px"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={fieldName}>
            <label className="block text-xs text-text-muted font-medium mb-1.5">
              {config.label}
            </label>
            <textarea
              className={`${ic} min-h-20`}
              value={form[fieldName] || ""}
              onChange={(e) => updateField(fieldName, e.target.value)}
              placeholder={config.ph}
            />
          </div>
        );

      default:
        return (
          <div key={fieldName}>
            <label className="block text-xs text-text-muted font-medium mb-1.5">
              {config.label}
            </label>
            <input
              className={ic}
              value={form[fieldName] || ""}
              onChange={(e) => updateField(fieldName, e.target.value)}
              placeholder={config.ph}
            />
          </div>
        );
    }
  }

  // ─── Main Render ──────────────────────────────────────

  const tabClass = (key) =>
    `text-sm px-5 py-2.5 rounded-xl cursor-pointer border-none transition-colors font-medium ${
      page === key
        ? "bg-red-brand text-white"
        : "bg-card-bg text-gray-400 hover:text-white"
    }`;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gold">Pengaturan Home Page</h1>
        <p className="text-sm text-text-muted mt-1">
          Atur konten halaman depan. Drag section untuk mengubah urutan tampilan.
        </p>
      </div>

      {/* Page Tabs */}
      <div className="flex gap-2 mb-6">
        {PAGES.map((p) => (
          <button key={p.key} onClick={() => setPage(p.key)} className={tabClass(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-card-bg border border-card-border rounded-2xl p-12 text-center">
          <p className="text-text-muted text-sm animate-pulse">Memuat pengaturan...</p>
        </div>
      ) : (
        <>
          {/* Info Banner */}
          <div className="bg-gold/5 border border-gold/20 rounded-xl px-4 py-3 mb-5 flex items-start gap-3">
            <span className="text-lg mt-0.5">💡</span>
            <div>
              <p className="text-xs text-gold/90 font-medium m-0">
                Tombol &quot;KLIK DISINI&quot; otomatis mengarah ke halaman tabel klasemen.
              </p>
              <p className="text-[0.65rem] text-text-muted m-0 mt-0.5">
                Drag ikon ⠿ di setiap section untuk mengubah urutan tampilan di halaman publik.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className={`transition-all duration-150 ${
                  dragOverIdx === idx && dragIdx !== idx
                    ? "border-t-2 border-red-brand pt-1"
                    : ""
                }`}
                onDragOver={(e) => onDragOver(e, idx)}
                onDragLeave={onDragLeave}
                onDrop={(e) => onDrop(e, idx)}
              >
                <SectionCard
                  title={section.title}
                  description={section.description}
                  icon={section.icon}
                  isDragging={dragIdx === idx}
                  dragHandlers={{
                    draggable: true,
                    onDragStart: (e) => onDragStart(e, idx),
                    onDragEnd,
                  }}
                >
                  <div className="space-y-4">
                    {section.fields.map((fieldName) => renderField(fieldName))}
                  </div>
                </SectionCard>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 mt-6 sticky bottom-0 bg-main-bg py-4">
            <button
              onClick={save}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-8 py-2.5 rounded-xl cursor-pointer border-none transition-colors disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Semua Perubahan"}
            </button>
          </div>
        </>
      )}
      <Toast />
    </div>
  );
}

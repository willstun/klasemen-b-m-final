"use client";
import { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function getFullUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

export default function ImageUpload({ label, value, onChange, folder = "general" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Format: JPG, PNG, GIF, atau WebP");
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran maksimal 5MB");
      return;
    }

    setError("");
    setUploading(true);

    try {
      // Delete old file if it's a local upload
      if (value && value.startsWith("/uploads/")) {
        try { await uploadApi.delete(value); } catch {}
      }

      // Upload new file
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadApi.file(formData, folder);
      onChange(result.url);
    } catch (err) {
      setError(err.message || "Upload gagal");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!value) return;

    // Delete file from server if local
    if (value.startsWith("/uploads/")) {
      try { await uploadApi.delete(value); } catch {}
    }

    onChange("");
  }

  const hasImage = !!value;
  const previewUrl = getFullUrl(value);

  return (
    <div>
      <label className="block text-xs text-text-muted font-medium mb-1.5">{label}</label>

      {hasImage ? (
        /* ─── Preview + Actions ─────────────────────── */
        <div className="border border-card-border rounded-xl overflow-hidden bg-black/30">
          <div className="p-3 flex justify-center">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-40 max-w-full rounded-lg object-contain"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <div className="flex border-t border-card-border">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex-1 py-2 text-xs text-text-muted bg-transparent border-none cursor-pointer hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
            >
              {uploading ? "Mengupload..." : "Ganti Gambar"}
            </button>
            <div className="w-px bg-card-border" />
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 py-2 text-xs text-red-400 bg-transparent border-none cursor-pointer hover:bg-red-500/10 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        /* ─── Upload Area ───────────────────────────── */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full py-6 border-2 border-dashed border-card-border rounded-xl bg-transparent cursor-pointer hover:border-input-focus hover:bg-white/2 transition-colors disabled:opacity-50 flex flex-col items-center gap-1.5"
        >
          {uploading ? (
            <span className="text-xs text-text-muted animate-pulse">Mengupload...</span>
          ) : (
            <>
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-xs text-text-muted">Klik untuk upload gambar</span>
              <span className="text-[0.6rem] text-text-muted/50">JPG, PNG, GIF, WebP (max 5MB)</span>
            </>
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-[0.65rem] text-red-400 mt-1.5 m-0">{error}</p>
      )}
    </div>
  );
}

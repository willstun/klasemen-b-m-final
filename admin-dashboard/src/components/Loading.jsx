"use client";

export default function Loading({ text = "Memuat..." }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center fade-in">
      <div className="w-10 h-10 rounded-full border-2 border-brand border-t-transparent animate-spin mb-4" />
      <p className="text-sm text-text-muted">{text}</p>
    </div>
  );
}

"use client";

export default function Loading({ text = "Memuat..." }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center fade-in">
      <img src="/loading.gif" alt="" className="w-14 h-14 md:w-18 md:h-18 mb-3" />
      <p className="text-xs md:text-sm text-text-muted animate-pulse">{text}</p>
    </div>
  );
}

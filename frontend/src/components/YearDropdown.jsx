"use client";
import { useState, useRef, useEffect } from "react";

export default function YearDropdown({ years, selectedYear, onYearChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (!years || years.length === 0) return null;

  const label = selectedYear ? `Tabel Klasemen ${selectedYear}` : "Pilih Tahun Tabel Klasemen";

  return (
    <div ref={ref} className="relative w-full max-w-150 mx-auto flex justify-center">
      <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center justify-center w-full max-w-80 lg:max-w-116.5 py-1.5 lg:py-2 text-xs lg:text-base btn-solid border lg:border-2 border-red-brand rounded-full font-semibold text-center no-underline uppercase tracking-wide cursor-pointer outline-none">
        {label}
        <svg viewBox="0 0 24 24" fill="none" className={`w-4 md:w-5 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M17.9188 8.18H6.07877C5.11877 8.18 4.63877 9.34 5.31877 10.02L10.4988 15.2C11.3288 16.03 12.6788 16.03 13.5088 15.2L18.6888 10.02C19.3588 9.34 18.8788 8.18 17.9188 8.18Z" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 w-full max-w-80 lg:max-w-116.5 mx-auto bg-card-bg border border-red-brand rounded-xl shadow-2xl overflow-hidden z-20 mt-2">
          {years.map((y) => (
            <button key={y} onClick={() => { setOpen(false); onYearChange(y); }}
              className={`block w-full text-center py-2.5 md:py-3 px-5 md:px-6 text-xs md:text-sm border-none cursor-pointer transition-colors ${
                selectedYear === y ? "bg-btn-bg text-text-primary font-bold" : "bg-transparent text-text-primary hover:bg-btn-bg font-medium"
              }`}>
              Tahun {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

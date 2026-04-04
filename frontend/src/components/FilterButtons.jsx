"use client";
import { BULAN_NAMES } from "@/lib/config";

const base = "px-3 md:px-5 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold cursor-pointer border-none transition-colors uppercase";
const active = `${base} bg-filter-active-bg border border-filter-active-border text-text-primary`;
const inactive = `${base} bg-red-dark/50 text-text-muted hover:bg-filter-active-bg hover:text-text-primary`;

export function MonthButtons({ months, selectedMonth, onMonthChange }) {
  if (!months || months.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
      {months.map((m) => (
        <button key={m} onClick={() => onMonthChange(m)} className={selectedMonth === m ? active : inactive}>
          {BULAN_NAMES[m] || m}
        </button>
      ))}
    </div>
  );
}

export function WeekButtons({ weeks, selectedWeek, onWeekChange }) {
  if (!weeks || weeks.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
      {weeks.map((w) => (
        <button key={w} onClick={() => onWeekChange(w)} className={selectedWeek === w ? active : inactive}>
          Periode {w}
        </button>
      ))}
    </div>
  );
}
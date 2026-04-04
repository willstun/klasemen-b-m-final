"use client";
import Image from "next/image";
import YearDropdown from "./YearDropdown";
import { MonthButtons, WeekButtons } from "./FilterButtons";
import LeaderboardTable from "./LeaderboardTable";
import { getImageUrl } from "@/lib/config";

function strip(html) {
  return html ? html.replace(/\s*style="[^"]*"/gi, "") : "";
}

function hasContent(value) {
  return value && typeof value === "string" && value.trim().length > 0;
}

export default function LeaderboardLayout({ config, data, loading, settings, filters, selectedYear, selectedMonth, selectedWeek, onYearChange, onMonthChange, onWeekChange }) {
  const s = settings || {};

  const bg = hasContent(s.backgroundUrl)
    ? { background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${getImageUrl(s.backgroundUrl)}) center/cover no-repeat` }
    : { background: `linear-gradient(135deg, var(--color-page-gradient-start) 0%, var(--color-page-gradient-mid) 50%, var(--color-page-gradient-end) 100%)` };

  const months = selectedYear && filters?.monthsByYear ? (filters.monthsByYear[selectedYear] || []) : [];
  const weeks = selectedYear && selectedMonth && filters?.weeksByYearMonth ? (filters.weeksByYearMonth[`${selectedYear}-${selectedMonth}`] || []) : [];

  if (loading || !data) {
    return (
      <div className="min-h-80 lg:min-h-175 -mt-16 pt-20 lg:pt-24 pb-4 flex items-center justify-center" style={bg}>
        <div className="flex flex-col items-center">
          <img src="/loading.gif" alt="" className="w-14 h-14 md:w-18 md:h-18 mb-3" />
          <p className="text-xs md:text-sm text-text-primary animate-pulse">
            {loading ? "Memuat klasemen..." : "Belum ada data klasemen."}
          </p>
        </div>
      </div>
    );
  }

  const bannerSrc = data.bannerUrl || s.bannerUrl;
  const hasHadiahSection = hasContent(s.title5) || hasContent(s.banner2Url) || hasContent(s.promoUrl);

  return (
    <>
      <div className="min-h-80 lg:min-h-175 -mt-16 pt-20 lg:pt-24 pb-4" style={bg}>
        <div className="max-w-210 mx-auto px-5 lg:px-0">
          {hasContent(bannerSrc) && (
            <div className="relative w-full lg:w-210 h-52 lg:h-120 mb-4 lg:mb-6">
              <Image src={getImageUrl(bannerSrc)} alt="Banner" fill sizes="(max-width: 1024px) 100vw, 840px" loading="eager" unoptimized className="object-contain" />
            </div>
          )}
          <YearDropdown years={filters?.years || []} selectedYear={selectedYear} onYearChange={onYearChange} />
        </div>
      </div>

      <div className="bg-card-bg w-full mt-0 lg:-mt-8 border-y border-red-brand relative px-3 sm:px-5">
        <div className="max-w-248.5 w-full mx-auto py-4 md:py-8">
          {selectedYear && months.length > 0 && (
            <div className="mb-3 md:mb-4">
              <MonthButtons months={months} selectedMonth={selectedMonth} onMonthChange={onMonthChange} />
            </div>
          )}
          {config.type === "weekly" && selectedMonth && weeks.length > 0 && (
            <div className="mb-3 md:mb-4">
              <WeekButtons weeks={weeks} selectedWeek={selectedWeek} onWeekChange={onWeekChange} />
            </div>
          )}

          <div className="py-2 md:py-4 text-center rounded-t-xl bg-red-dark">
            <p className="font-semibold uppercase m-0 text-xs md:text-base tracking-wide">{data.name}</p>
            {data.periode && <p className="font-semibold uppercase m-0 text-text-primary text-xs md:text-base mt-0.5">{data.periode}</p>}
          </div>
          <LeaderboardTable config={config} data={data} />
        </div>
      </div>

      {/* Hadiah + Promo Section */}
      {hasHadiahSection && (
        <div className="w-full min-h-80 lg:min-h-147.5 flex items-center justify-center py-6 lg:py-0 px-2 lg:px-0" style={bg}>
          <div className="max-w-[95%] lg:max-w-248.5 mx-auto w-full min-h-60 lg:h-135 flex flex-col justify-center items-center gap-3 lg:gap-4 bg-blur/10 rounded-[10px] backdrop-blur-xs border lg:border-2 border-blur/50 p-4 lg:p-0">
            {hasContent(s.title5) && <p className="font-bold text-xs lg:text-base uppercase text-center">{s.title5}</p>}
            {hasContent(s.banner2Url) && (
              <div className="relative w-full lg:w-150 h-48 lg:h-90.25">
                <Image src={getImageUrl(s.banner2Url)} alt="List Hadiah" fill sizes="(max-width: 1024px) 95vw, 600px" unoptimized className="object-contain" />
              </div>
            )}
            {hasContent(s.promoUrl) && (
              <div className="relative w-full lg:w-218 h-8 lg:h-17.5">
                <Image src={getImageUrl(s.promoUrl)} alt="Promo" fill sizes="(max-width: 1024px) 95vw, 872px" unoptimized className="object-contain" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {hasContent(s.footerText) && (
        <footer className="text-center py-3 lg:py-4 pb-20 md:pb-3 border-t border-red-brand bg-card-bg">
          <p className="text-[0.55rem] lg:text-xs font-medium [&_a]:text-gold [&_a]:font-semibold [&_a]:no-underline px-3 lg:px-0"
            dangerouslySetInnerHTML={{ __html: strip(s.footerText) }}
          />
        </footer>
      )}
    </>
  );
}

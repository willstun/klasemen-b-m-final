"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getImageUrl } from "@/lib/config";
import { usePageType } from "@/hooks/usePageType";

function strip(html) {
  return html ? html.replace(/\s*style="[^"]*"/gi, "") : "";
}

function hasContent(value) {
  return value && typeof value === "string" && value.trim().length > 0;
}

export default function HomePage({ settings }) {
  const s = settings || {};
  const pathname = usePathname();
  const { isDev } = usePageType();

  // Production: /tabel, Development: /bulanan/tabel or /mingguan/tabel
  const tabelRoute = isDev
    ? (pathname.includes("mingguan") ? "/mingguan/tabel" : "/bulanan/tabel")
    : "/tabel";

  const ctaText = s.title1 || "LIHAT TABEL LOMBA TURNOVER";

  const rulesHtml = s.rules
    ? s.rules.includes("<ol>") || s.rules.includes("<li>")
      ? s.rules
      : `<ol>${s.rules.split("\n").filter(l => l.trim()).map(l => `<li>${l.trim()}</li>`).join("")}</ol>`
    : "";

  const bg = hasContent(s.backgroundUrl)
    ? { background: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${getImageUrl(s.backgroundUrl)}) center/cover no-repeat` }
    : { background: `linear-gradient(135deg, var(--color-page-gradient-start) 0%, var(--color-page-gradient-mid) 50%, var(--color-page-gradient-end) 100%)` };

  const hasHadiahSection = hasContent(s.title5) || hasContent(s.banner2Url) || hasContent(s.promoUrl);

  return (
    <>
      {/* Banner + CTA Section */}
      <div className="min-h-80 lg:min-h-175 -mt-16 pt-20 lg:pt-24 pb-4" style={bg}>
        <div className="max-w-210 mx-auto px-5 lg:px-0">
          {hasContent(s.bannerUrl) && (
            <div className="relative w-full lg:w-210 h-52 lg:h-120 mb-4 lg:mb-6">
              <Image src={getImageUrl(s.bannerUrl)} alt="Banner" fill sizes="(max-width: 1024px) 100vw, 840px" loading="eager" unoptimized className="object-contain" />
            </div>
          )}
          <div className="mb-4 lg:mb-10 text-center px-4 lg:px-0">
            <Link href={tabelRoute}
              className="inline-block w-full max-w-80 lg:max-w-116.5 py-1.5 lg:py-2 text-xs lg:text-base btn-solid border lg:border-2 border-red-brand rounded-full font-semibold text-center no-underline uppercase tracking-wide">
              {ctaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Info + Rules Section */}
      {(hasContent(s.title2) || hasContent(s.title3) || hasContent(s.title4) || rulesHtml) && (
        <div className="bg-card-bg w-full min-h-80 lg:min-h-140 flex justify-center items-center -mt-4 lg:-mt-8 border-y border-red-brand relative py-8 lg:py-0 px-3 md:px-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-brand/30 w-full lg:w-248.5 h-40 lg:h-66 rounded-[50%] blur-2xl"></div>
          <div className="max-w-[95%] lg:max-w-190 mx-auto bg-card-bg border border-red-brand rounded-[10px] p-3 lg:p-4 z-5">
            {hasContent(s.title2) && <h1 className="text-xs lg:text-base text-center font-semibold mb-3 lg:mb-5">{s.title2}</h1>}
            {hasContent(s.title3) && <p className="text-xs lg:text-base text-center font-medium text-gold italic mb-3 lg:mb-5">{s.title3}</p>}
            {hasContent(s.title4) && <p className="text-xs lg:text-base text-center font-bold text-red-brand mb-3 lg:mb-5">{s.title4}</p>}
            {rulesHtml && (
              <div
                className="text-xs lg:text-base text-justify font-medium leading-5 lg:leading-7 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:lg:ml-8 [&_ul]:list-disc [&_ul]:ml-5 [&_li]:py-0.5 [&_li]:lg:py-1"
                dangerouslySetInnerHTML={{ __html: strip(rulesHtml) }}
              />
            )}
          </div>
        </div>
      )}

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

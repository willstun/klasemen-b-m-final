"use client";
import { formatNumber } from "@/lib/config";

function ClaimButton({ status, claimLink, small }) {
  const size = small ? "px-2.5 py-0.5 text-[0.6rem]" : "px-3.5 py-1 text-xs md:text-base";
  if (status === "selesai") {
    return (
      <span className={`inline-block bg-red-dark/20 border border-red-brand/20 rounded-full ${size} text-text-muted`}>
        SELESAI
      </span>
    );
  }
  return (
    <a href={claimLink || "#"} target="_blank" rel="noopener noreferrer"
      className={`inline-block bg-red-dark border border-red-brand rounded-full ${size} no-underline text-text-primary`}>
      CLAIM
    </a>
  );
}

// ─── Mobile Card View (below sm) ────────────────────────

function MobileCardList({ participants, claimLink, type }) {
  return (
    <div className="flex flex-col gap-1.5 sm:hidden">
      {participants.map((p, i) => (
        <div
          key={p.id}
          className={`rounded-lg px-3 py-2.5 ${i % 2 === 0 ? "bg-red-dark/15" : "bg-card-bg"}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-xs font-semibold">{p.rank}.</span>
                <span className="text-gold text-xs font-semibold">{p.prize || "-"}</span>
              </div>
              <span className="text-text-primary text-xs font-semibold uppercase">USER ID : {p.maskedName}</span>
              {type === "monthly" && (
                <span className="text-text-primary text-xs font-semibold tabular-nums">
                  TURNOVER : {formatNumber(p.points)}
                </span>
              )}
            </div>
            <ClaimButton status={p.status} claimLink={claimLink} small />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Desktop Table (sm and above) ───────────────────────

const cell = "text-center text-xs md:text-base font-semibold py-3.5";
const th = "text-center text-xs md:text-base font-semibold py-2.5 uppercase tracking-wider";

function MonthlyTable({ participants, claimLink }) {
  return (
    <>
      <MobileCardList participants={participants} claimLink={claimLink} type="monthly" />
      <table className="w-full text-xs md:text-base hidden sm:table">
        <thead>
          <tr className="border-b border-red-dark">
            <th className={th}>Juara</th>
            <th className={`${th} text-left px-3`}>Hadiah</th>
            <th className={`${th} text-left px-3`}>User ID</th>
            <th className={`${th} text-left px-3`}>Turnover</th>
            <th className={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id} className="border-b border-red-dark">
              <td className={cell}>{p.rank}</td>
              <td className={`${cell} text-gold text-left px-3`}>{p.prize || "-"}</td>
              <td className={`${cell} uppercase text-left px-3`}>{p.maskedName}</td>
              <td className={`${cell} text-left px-3`}>{formatNumber(p.points)}</td>
              <td className="text-center py-3.5"><ClaimButton status={p.status} claimLink={claimLink} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function WeeklyTable({ participants, claimLink }) {
  return (
    <>
      <MobileCardList participants={participants} claimLink={claimLink} type="weekly" />
      <table className="w-full text-xs md:text-base hidden sm:table">
        <thead>
          <tr className="border-b border-red-dark">
            <th className={th}>Nomor</th>
            <th className={`${th} text-left px-3`}>Username</th>
            <th className={`${th} text-left px-3`}>Hadiah</th>
            <th className={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((p, i) => (
            <tr key={p.id} className="border-b border-red-dark">
              <td className={cell}>{p.rank}</td>
              <td className={`${cell} text-left px-3`}>{p.maskedName}</td>
              <td className={`${cell} text-left px-3 text-gold`}>{p.prize || "-"}</td>
              <td className="text-center py-3.5"><ClaimButton status={p.status} claimLink={claimLink} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default function LeaderboardTable({ config, data }) {
  if (!data?.participants?.length) {
    return <div className="text-center text-text-muted text-sm py-8">Belum ada data peserta.</div>;
  }
  return (
    <div className="overflow-x-auto overflow-hidden">
      {config.type === "monthly"
        ? <MonthlyTable participants={data.participants} claimLink={data.claimLink} />
        : <WeeklyTable participants={data.participants} claimLink={data.claimLink} />}
    </div>
  );
}
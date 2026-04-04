import { Router } from "express";
import prisma from "../config/prisma.js";
import { FALLBACK_PRIZES } from "../config/index.js";
import { maskName } from "../services/utils.js";
import { sendError, sendSuccess, parseId } from "../services/utils.js";

const router = Router();

// ─── Get Leaderboard Data ───────────────────────────────

router.get("/", async (req, res) => {
  try {
    const { type, id, year, month, week } = req.query;

    let comp;

    if (id) {
      comp = await prisma.competition.findUnique({
        where: { id: parseId(id) || 0 },
        include: { participants: { orderBy: { points: "desc" } } },
      });
    } else if (type) {
      const where = { type, isActive: true };
      if (year) { const y = parseId(year); if (y) where.year = y; }
      if (month) { const m = parseId(month); if (m) where.month = m; }
      if (week) { const w = parseId(week); if (w) where.week = w; }

      comp = await prisma.competition.findFirst({
        where,
        orderBy: { createdAt: "desc" },
        include: { participants: { orderBy: { points: "desc" } } },
      });
    } else {
      return sendError(res, 400, "Parameter 'type' atau 'id' diperlukan");
    }

    if (!comp) {
      return sendError(res, 404, "Data tidak ditemukan");
    }

    // Get prize templates for this competition type
    const prizeTemplates = await prisma.prizeTemplate.findMany({
      where: { type: comp.type },
      orderBy: { rank: "asc" },
    });

    const prizeMap = {};
    let lastPrize = FALLBACK_PRIZES[comp.type];

    for (const pt of prizeTemplates) {
      prizeMap[pt.rank] = pt.name;
      lastPrize = pt.name;
    }

    // Map participants with prizes and masked names
    const participants = comp.participants.map((p, i) => {
      const positionPrize = prizeMap[i + 1] || lastPrize;
      return {
        id: p.id,
        rank: i + 1,
        name: p.name,
        maskedName: maskName(p.name),
        prize: p.prize || positionPrize,
        points: p.points.toString(),
        status: p.status,
      };
    });

    sendSuccess(res, {
      id: comp.id,
      name: comp.name,
      type: comp.type,
      bannerUrl: comp.bannerUrl,
      periode: comp.periode,
      claimLink: comp.claimLink,
      year: comp.year,
      month: comp.month,
      week: comp.week,
      participants,
    });
  } catch (error) {
    console.error("[Leaderboard] GET error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Get Available Filters (years, months, weeks) ───────

router.get("/filters", async (req, res) => {
  try {
    const { type } = req.query;

    if (!type) {
      return sendError(res, 400, "Parameter 'type' diperlukan");
    }

    const comps = await prisma.competition.findMany({
      where: { type },
      select: { year: true, month: true, week: true },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const years = [...new Set(comps.map((c) => c.year).filter(Boolean))].sort((a, b) => b - a);

    const monthsByYear = {};
    for (const c of comps) {
      if (!c.year || !c.month) continue;
      if (!monthsByYear[c.year]) monthsByYear[c.year] = [];
      if (!monthsByYear[c.year].includes(c.month)) {
        monthsByYear[c.year].push(c.month);
      }
    }
    for (const y in monthsByYear) {
      monthsByYear[y].sort((a, b) => a - b);
    }

    const weeksByYearMonth = {};
    if (type === "weekly") {
      for (const c of comps) {
        if (!c.year || !c.month || !c.week) continue;
        const key = `${c.year}-${c.month}`;
        if (!weeksByYearMonth[key]) weeksByYearMonth[key] = [];
        if (!weeksByYearMonth[key].includes(c.week)) {
          weeksByYearMonth[key].push(c.week);
        }
      }
      for (const k in weeksByYearMonth) {
        weeksByYearMonth[k].sort((a, b) => a - b);
      }
    }

    sendSuccess(res, { years, monthsByYear, weeksByYearMonth });
  } catch (error) {
    console.error("[Leaderboard] Filters error:", error);
    sendError(res, 500, "Server error");
  }
});

export default router;
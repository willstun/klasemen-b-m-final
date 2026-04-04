import { Router } from "express";
import prisma from "../config/prisma.js";
import { BULAN_NAMES } from "../config/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logActivity } from "../services/logger.service.js";
import { emitCompetitionChange } from "../services/socket.service.js";
import { sendError, sendSuccess, parseId, formatPeriodeLabel } from "../services/utils.js";

const router = Router();

router.use(requireAuth);

// ─── List Competitions ──────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const where = type ? { type } : {};

    const competitions = await prisma.competition.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { participants: true } } },
    });

    sendSuccess(res, competitions);
  } catch (error) {
    console.error("[Competition] List error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── List All (minimal) ─────────────────────────────────

router.get("/list", async (req, res) => {
  try {
    const competitions = await prisma.competition.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true, isActive: true },
    });
    sendSuccess(res, competitions);
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

// ─── Get Competition Detail ─────────────────────────────

router.get("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, "ID tidak valid");

    const comp = await prisma.competition.findUnique({
      where: { id: id },
      include: { participants: { orderBy: { points: "desc" } } },
    });

    if (!comp) {
      return sendError(res, 404, "Kompetisi tidak ditemukan");
    }

    const prizeTemplates = await prisma.prizeTemplate.findMany({
      where: { type: comp.type },
      orderBy: { rank: "asc" },
    });

    const prizeMap = {};
    let lastPrize = comp.type === "monthly" ? "UANG TUNAI Rp.2.000.000" : "INFINIX GT 30 PRO";

    for (const pt of prizeTemplates) {
      prizeMap[pt.rank] = pt.name;
      lastPrize = pt.name;
    }

    comp.participants = comp.participants.map((p, i) => {
      const positionPrize = prizeMap[i + 1] || lastPrize;
      return {
        ...p,
        rank: i + 1,
        prize: p.prize || positionPrize,
        points: p.points.toString(),
      };
    });

    sendSuccess(res, comp);
  } catch (error) {
    console.error("[Competition] Detail error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Create Competition ─────────────────────────────────

router.post("/", async (req, res) => {
  try {
    const { name, type, bannerUrl, claimLink, year, month, week, periodeStart, periodeEnd } = req.body;

    if (!name || !type) {
      return sendError(res, 400, "Nama dan tipe wajib diisi");
    }

    const y = year || new Date().getFullYear();
    const m = month || new Date().getMonth() + 1;
    const days = new Date(y, m, 0).getDate();

    let periode;

    if (type === "weekly") {
      if (!week) {
        return sendError(res, 400, "Nomor periode wajib diisi");
      }

      // Build periode label from date range
      if (periodeStart && periodeEnd) {
        const label = formatPeriodeLabel(periodeStart, periodeEnd);
        periode = label ? `PERIODE ${label.toUpperCase()} (PERIODE ${week})` : `PERIODE ${week}`;
      } else {
        periode = `PERIODE ${week}`;
      }

      // Derive month from periodeStart if provided
      const derivedMonth = periodeStart ? new Date(periodeStart).getMonth() + 1 : m;

      const comp = await prisma.competition.create({
        data: {
          name,
          type,
          bannerUrl: bannerUrl || null,
          periode,
          year: y,
          month: derivedMonth,
          week,
          claimLink: claimLink || null,
        },
      });

      await logActivity(req.session.userId, req.session.username, `Buat kompetisi: ${name} (${type}) - Periode ${week}`);
      emitCompetitionChange("created", comp);
      return sendSuccess(res, comp, 201);
    }

    // Monthly
    periode = `PERIODE 01 - ${days} ${BULAN_NAMES[m].toUpperCase()} ${y}`;

    const comp = await prisma.competition.create({
      data: {
        name,
        type,
        bannerUrl: bannerUrl || null,
        periode,
        year: y,
        month: m,
        week: null,
        claimLink: claimLink || null,
      },
    });

    await logActivity(req.session.userId, req.session.username, `Buat kompetisi: ${name} (${type})`);
    emitCompetitionChange("created", comp);

    sendSuccess(res, comp, 201);
  } catch (error) {
    console.error("[Competition] Create error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Update Competition ─────────────────────────────────

router.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, "ID tidak valid");
    const data = {};
    const allowed = ["name", "type", "bannerUrl", "periode", "claimLink", "isActive", "year", "month", "week"];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const comp = await prisma.competition.update({
      where: { id: id },
      data,
    });

    await logActivity(req.session.userId, req.session.username, `Update kompetisi: ${comp.name}`);
    emitCompetitionChange("updated", comp);

    sendSuccess(res, comp);
  } catch (error) {
    console.error("[Competition] Update error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Delete Competition ─────────────────────────────────

router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, "ID tidak valid");

    const comp = await prisma.competition.findUnique({
      where: { id: id },
    });

    if (!comp) {
      return sendError(res, 404, "Kompetisi tidak ditemukan");
    }

    await prisma.competition.delete({ where: { id: id } });

    await logActivity(req.session.userId, req.session.username, `Hapus kompetisi: ${comp.name}`);
    emitCompetitionChange("deleted", comp);

    sendSuccess(res, { success: true });
  } catch (error) {
    console.error("[Competition] Delete error:", error);
    sendError(res, 500, "Server error");
  }
});

export default router;
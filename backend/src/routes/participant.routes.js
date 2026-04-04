import { Router } from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logActivity } from "../services/logger.service.js";
import { emitParticipantChange } from "../services/socket.service.js";
import { sendError, sendSuccess, parseId } from "../services/utils.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// ─── Add Participant ────────────────────────────────────

router.post("/", async (req, res) => {
  try {
    const { competitionId, name, prize, points, status, rank } = req.body;

    if (!competitionId || !name) {
      return sendError(res, 400, "Competition ID dan nama wajib diisi");
    }

    // Check competition exists and get its type
    const comp = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { type: true },
    });

    if (!comp) {
      return sendError(res, 404, "Kompetisi tidak ditemukan");
    }

    const participant = await prisma.participant.create({
      data: {
        competitionId,
        name,
        prize: prize || null,
        points: points || 0,
        status: status || "claim",
        rank: rank || null,
      },
    });

    await logActivity(req.session.userId, req.session.username, `Tambah peserta: ${name}`);
    emitParticipantChange(competitionId, comp.type);

    sendSuccess(res, participant, 201);
  } catch (error) {
    console.error("[Participant] Create error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Bulk Add Participants ──────────────────────────────

router.post("/bulk", async (req, res) => {
  try {
    const { competitionId, participants } = req.body;

    if (!competitionId || !Array.isArray(participants) || participants.length === 0) {
      return sendError(res, 400, "Competition ID dan data peserta diperlukan");
    }

    if (participants.length > 100) {
      return sendError(res, 400, "Maksimal 100 peserta sekaligus");
    }

    // Check competition exists
    const comp = await prisma.competition.findUnique({
      where: { id: competitionId },
      select: { type: true },
    });

    if (!comp) {
      return sendError(res, 404, "Kompetisi tidak ditemukan");
    }

    // Get prize templates for auto-assign
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

    // Get current participant count for rank offset
    const existingCount = await prisma.participant.count({
      where: { competitionId },
    });

    // Create all participants in a transaction
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.name || !p.name.trim()) continue;

        const rank = existingCount + i + 1;
        const autoAssignedPrize = prizeMap[rank] || lastPrize;

        const participant = await tx.participant.create({
          data: {
            competitionId,
            name: p.name.trim(),
            points: parseFloat(p.points) || 0,
            prize: p.prize || autoAssignedPrize,
            status: "claim",
            rank,
          },
        });
        results.push(participant);
      }
      return results;
    });

    await logActivity(
      req.session.userId,
      req.session.username,
      `Bulk tambah ${created.length} peserta`
    );
    emitParticipantChange(competitionId, comp.type);

    sendSuccess(res, { count: created.length, participants: created }, 201);
  } catch (error) {
    console.error("[Participant] Bulk create error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Update Participant ─────────────────────────────────

router.put("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, "ID tidak valid");
    const data = {};
    const allowed = ["name", "prize", "points", "status", "rank"];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = req.body[key];
      }
    }

    const participant = await prisma.participant.update({
      where: { id: id },
      data,
      include: { competition: { select: { type: true } } },
    });

    await logActivity(req.session.userId, req.session.username, `Edit peserta: ${participant.name}`);
    emitParticipantChange(participant.competitionId, participant.competition.type);

    sendSuccess(res, participant);
  } catch (error) {
    console.error("[Participant] Update error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Delete Participant ─────────────────────────────────

router.delete("/:id", async (req, res) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return sendError(res, 400, "ID tidak valid");

    const participant = await prisma.participant.findUnique({
      where: { id: id },
      include: { competition: { select: { type: true } } },
    });

    if (!participant) {
      return sendError(res, 404, "Peserta tidak ditemukan");
    }

    await prisma.participant.delete({ where: { id: id } });

    await logActivity(req.session.userId, req.session.username, `Hapus peserta: ${participant.name}`);
    emitParticipantChange(participant.competitionId, participant.competition.type);

    sendSuccess(res, { success: true });
  } catch (error) {
    console.error("[Participant] Delete error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Toggle Status (single or bulk) ────────────────────

router.post("/toggle-status", async (req, res) => {
  try {
    const { id, competitionId, status } = req.body;

    if (!["claim", "selesai"].includes(status)) {
      return sendError(res, 400, "Status tidak valid");
    }

    // Bulk: toggle all participants in a competition
    if (competitionId && !id) {
      const comp = await prisma.competition.findUnique({
        where: { id: competitionId },
        select: { type: true },
      });

      if (!comp) {
        return sendError(res, 404, "Kompetisi tidak ditemukan");
      }

      await prisma.participant.updateMany({
        where: { competitionId },
        data: { status },
      });

      await logActivity(req.session.userId, req.session.username, `Toggle semua peserta → ${status}`);
      emitParticipantChange(competitionId, comp.type);

      return sendSuccess(res, { success: true });
    }

    // Single toggle
    if (!id) {
      return sendError(res, 400, "ID peserta diperlukan");
    }

    const participant = await prisma.participant.update({
      where: { id },
      data: { status },
      include: { competition: { select: { type: true } } },
    });

    await logActivity(req.session.userId, req.session.username, `Toggle status ${participant.name} → ${status}`);
    emitParticipantChange(participant.competitionId, participant.competition.type);

    sendSuccess(res, participant);
  } catch (error) {
    console.error("[Participant] Toggle error:", error);
    sendError(res, 500, "Server error");
  }
});

export default router;

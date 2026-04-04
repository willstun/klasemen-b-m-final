import { Router } from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logActivity } from "../services/logger.service.js";
import { sendError, sendSuccess } from "../services/utils.js";

const router = Router();

// ─── List Prizes (public for dropdown, but filtered) ────

router.get("/", async (req, res) => {
  try {
    const type = req.query.type || "monthly";

    const prizes = await prisma.prizeTemplate.findMany({
      where: { type },
      orderBy: { rank: "asc" },
    });

    sendSuccess(res, prizes);
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

// ─── Create or Update Prize (upsert) ────────────────────

router.post("/", requireAuth, async (req, res) => {
  try {
    const { type, rank, name } = req.body;

    if (!type || !rank || !name) {
      return sendError(res, 400, "Type, rank, dan nama wajib diisi");
    }

    const prize = await prisma.prizeTemplate.upsert({
      where: { type_rank: { type, rank } },
      update: { name },
      create: { type, rank, name },
    });

    await logActivity(req.session.userId, req.session.username, `Update hadiah rank ${rank} (${type}): ${name}`);

    sendSuccess(res, prize);
  } catch (error) {
    console.error("[Prize] Upsert error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Bulk Update Prizes ─────────────────────────────────

router.put("/", requireAuth, async (req, res) => {
  try {
    const { type, prizes } = req.body;

    if (!type || !Array.isArray(prizes)) {
      return sendError(res, 400, "Type dan prizes array diperlukan");
    }

    // Delete all existing for this type, then recreate in transaction
    await prisma.$transaction(async (tx) => {
      await tx.prizeTemplate.deleteMany({ where: { type } });
      for (const p of prizes) {
        if (p.rank && p.name) {
          await tx.prizeTemplate.create({
            data: { type, rank: p.rank, name: p.name },
          });
        }
      }
    });

    await logActivity(req.session.userId, req.session.username, `Update semua hadiah ${type} (${prizes.length} items)`);

    sendSuccess(res, { success: true });
  } catch (error) {
    console.error("[Prize] Bulk update error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Delete Prize ───────────────────────────────────────

router.delete("/", requireAuth, async (req, res) => {
  try {
    const { type, rank } = req.body;

    if (!type || !rank) {
      return sendError(res, 400, "Type dan rank diperlukan");
    }

    try {
      await prisma.prizeTemplate.delete({
        where: { type_rank: { type, rank } },
      });
      await logActivity(req.session.userId, req.session.username, `Hapus hadiah rank ${rank} (${type})`);
    } catch {
      // Prize might not exist, that's ok
    }

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

export default router;

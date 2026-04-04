import { Router } from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendSuccess, sendError } from "../services/utils.js";

const router = Router();

router.use(requireAuth);

// ─── Get Activity Logs ──────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "50");

    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 500),
      include: {
        user: { select: { avatarUrl: true } },
      },
    });

    sendSuccess(res, logs);
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

export default router;

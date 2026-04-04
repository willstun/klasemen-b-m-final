import { Router } from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logActivity } from "../services/logger.service.js";
import { sendError, sendSuccess } from "../services/utils.js";

const router = Router();

// Whitelist of allowed fields for settings update
const ALLOWED_FIELDS = [
  "logoUrl", "faviconUrl", "backgroundUrl", "bannerUrl", "promoUrl",
  "footerText", "whatsappLink", "telegramLink",
  "title1", "buttonText", "buttonLink",
  "title2", "title3", "title4", "rules", "title5",
  "banner2Url", "sectionOrder",
];

// ─── Get Settings (public) ──────────────────────────────

router.get("/", async (req, res) => {
  try {
    const page = req.query.page || "mingguan";

    // Validate page key
    if (!["mingguan", "bulanan"].includes(page)) {
      return sendError(res, 400, "Page tidak valid");
    }

    const settings = await prisma.siteSettings.findUnique({
      where: { pageKey: page },
    });

    sendSuccess(res, settings || {});
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

// ─── Update Settings (admin only) ───────────────────────

router.put("/", requireAuth, async (req, res) => {
  try {
    const { pageKey } = req.body;

    if (!pageKey || !["mingguan", "bulanan"].includes(pageKey)) {
      return sendError(res, 400, "pageKey harus 'mingguan' atau 'bulanan'");
    }

    // Only pick allowed fields from request body
    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        const value = req.body[field];
        // Validate string type and max length
        if (value !== null && typeof value !== "string") continue;
        if (typeof value === "string" && value.length > 10000) continue;
        data[field] = value;
      }
    }

    const result = await prisma.siteSettings.upsert({
      where: { pageKey },
      update: data,
      create: { pageKey, ...data },
    });

    await logActivity(req.session.userId, req.session.username, `Update halaman: ${pageKey}`);

    sendSuccess(res, result);
  } catch (error) {
    console.error("[Settings] Update error:", error);
    sendError(res, 500, "Server error");
  }
});

export default router;

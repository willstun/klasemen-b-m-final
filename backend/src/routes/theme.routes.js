import { Router } from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { logActivity } from "../services/logger.service.js";
import { sendError, sendSuccess } from "../services/utils.js";

const router = Router();

// ─── Default Frontend 5 Colors ──────────────────────────

const DEFAULT_FRONTEND_COLORS = {
  primary: "#A80000",
  secondary: "#FF0F0F",
  blur: "#F71111",
  warning: "#FFBB00",
  dark: "#260000",
};

// Expand 5 base colors into full CSS variable set
function expandFrontendColors(c) {
  return {
    "gold": c.warning,
    "red-brand": c.secondary,
    "red-dark": c.primary,
    "green-brand": "#22c55e",
    "page-bg": "#0a0a0a",
    "page-gradient-start": "#0a0a0a",
    "page-gradient-mid": c.dark,
    "page-gradient-end": "#0a0a0a",
    "card-bg": c.dark,
    "card-shadow": "rgba(0,0,0,1)",
    "table-border": c.warning,
    "table-hover": "rgba(255,255,255,0.02)",
    "header-bg": "transparent",
    "text-primary": "#ffffff",
    "text-muted": "#aaaaaa",
    "status-done-bg": c.dark,
    "status-done-border": c.primary,
    "status-done-text": "#737373",
    "dropdown-bg": "#f3f4f6",
    "dropdown-hover": "#d1d5db",
    "dropdown-text": "#000000",
    "filter-active-bg": c.primary,
    "filter-active-border": c.warning,
    "btn-bg": c.primary,
    "btn-hover": c.dark,
  };
}

// ─── GET frontend theme colors ──────────────────────────

router.get("/frontend", async (req, res) => {
  try {
    const setting = await prisma.themeSettings.findUnique({ where: { target: "frontend" } });
    const data = setting ? JSON.parse(setting.colors) : {};
    const baseColors = data.customColors || DEFAULT_FRONTEND_COLORS;
    const expandedColors = expandFrontendColors(baseColors);
    sendSuccess(res, { target: "frontend", colors: expandedColors, baseColors, defaults: DEFAULT_FRONTEND_COLORS });
  } catch (error) {
    console.error("[Theme] GET error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── PUT update frontend colors ─────────────────────────

router.put("/frontend", requireAuth, async (req, res) => {
  try {
    const { colors } = req.body;
    if (!colors || typeof colors !== "object") {
      return sendError(res, 400, "Colors object diperlukan");
    }

    // Validate only allowed keys
    const allowed = ["primary", "secondary", "blur", "warning", "dark"];
    const cleaned = {};
    for (const key of allowed) {
      if (colors[key] && typeof colors[key] === "string" && colors[key].length <= 20) {
        cleaned[key] = colors[key];
      }
    }

    if (Object.keys(cleaned).length === 0) {
      return sendError(res, 400, "Minimal 1 warna yang valid diperlukan");
    }

    await prisma.themeSettings.upsert({
      where: { target: "frontend" },
      update: { colors: JSON.stringify({ customColors: cleaned }) },
      create: { target: "frontend", colors: JSON.stringify({ customColors: cleaned }) },
    });

    await logActivity(req.session.userId, req.session.username, "Update warna frontend");
    sendSuccess(res, { target: "frontend", colors: cleaned });
  } catch (error) {
    console.error("[Theme] PUT error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── DELETE reset frontend colors to default ────────────

router.delete("/frontend", requireAuth, async (req, res) => {
  try {
    await prisma.themeSettings.deleteMany({ where: { target: "frontend" } });
    await logActivity(req.session.userId, req.session.username, "Reset warna frontend ke default");
    sendSuccess(res, { target: "frontend", colors: DEFAULT_FRONTEND_COLORS });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

export default router;

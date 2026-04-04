import { Router } from "express";
import prisma from "../config/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { hashPassword } from "../services/auth.service.js";
import { logActivity } from "../services/logger.service.js";
import { sendError, sendSuccess } from "../services/utils.js";

const router = Router();

router.use(requireAuth);

// ─── List Users ─────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, email: true, avatarUrl: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    sendSuccess(res, users);
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

// ─── Update Own Profile (hanya diri sendiri) ────────────

router.put("/", async (req, res) => {
  try {
    const data = {};
    const { username, email, password, avatarUrl } = req.body;

    // Whitelist: hanya field yang diizinkan
    if (username && typeof username === "string" && username.length >= 3 && username.length <= 50) {
      data.username = username.trim();
    }
    if (email !== undefined) {
      data.email = typeof email === "string" ? email.trim() : null;
    }
    if (password && typeof password === "string" && password.length >= 6) {
      data.password = await hashPassword(password);
    }
    if (avatarUrl !== undefined) {
      data.avatarUrl = typeof avatarUrl === "string" ? avatarUrl.trim() : null;
    }

    if (Object.keys(data).length === 0) {
      return sendError(res, 400, "Tidak ada data yang diupdate");
    }

    // ALWAYS update own profile only - ignore any id in body
    const user = await prisma.user.update({
      where: { id: req.session.userId },
      data,
    });

    await logActivity(req.session.userId, req.session.username, `Update profil: ${user.username}`);

    sendSuccess(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 400, "Username sudah digunakan");
    }
    console.error("[User] Update error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Delete User ────────────────────────────────────────

router.delete("/", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id || typeof id !== "number") {
      return sendError(res, 400, "ID user diperlukan");
    }

    if (id === req.session.userId) {
      return sendError(res, 400, "Tidak bisa hapus akun sendiri");
    }

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return sendError(res, 404, "User tidak ditemukan");
    }

    await prisma.user.delete({ where: { id } });
    await logActivity(req.session.userId, req.session.username, `Hapus akun: ${user.username}`);

    sendSuccess(res, { success: true });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

export default router;

import { Router } from "express";
import prisma from "../config/prisma.js";
import config from "../config/index.js";
import { hashPassword, comparePassword, createToken, getSession } from "../services/auth.service.js";
import { logActivity } from "../services/logger.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendError, sendSuccess } from "../services/utils.js";

const router = Router();

// ═══════════════════════════════════════════════════════════
//  LOGIN RATE LIMITER - 5x gagal = block 15 menit
// ═══════════════════════════════════════════════════════════

const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 menit

function getLoginKey(req) {
  return req.ip || req.connection?.remoteAddress || "unknown";
}

function checkLoginBlock(req) {
  const key = getLoginKey(req);
  const record = loginAttempts.get(key);

  if (!record) return { blocked: false, remaining: MAX_ATTEMPTS };

  // Block expired, reset
  if (record.blockedUntil && Date.now() > record.blockedUntil) {
    loginAttempts.delete(key);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  // Currently blocked
  if (record.blockedUntil) {
    const minutesLeft = Math.ceil((record.blockedUntil - Date.now()) / 60000);
    return { blocked: true, minutesLeft, remaining: 0 };
  }

  return { blocked: false, remaining: MAX_ATTEMPTS - record.count };
}

function recordFailedLogin(req) {
  const key = getLoginKey(req);
  const record = loginAttempts.get(key) || { count: 0, blockedUntil: null };

  record.count++;

  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION;
  }

  loginAttempts.set(key, record);
  return MAX_ATTEMPTS - record.count;
}

function clearLoginAttempts(req) {
  const key = getLoginKey(req);
  loginAttempts.delete(key);
}

// Cleanup expired blocks every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttempts) {
    if (record.blockedUntil && now > record.blockedUntil) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ─── Check Setup (any users exist?) ─────────────────────

router.get("/check-setup", async (req, res) => {
  try {
    const count = await prisma.user.count();
    sendSuccess(res, { needsSetup: count === 0 });
  } catch (error) {
    sendError(res, 500, "Server error");
  }
});

// ─── Get Current User ───────────────────────────────────

router.get("/me", async (req, res) => {
  try {
    const session = await getSession(req);
    if (!session) {
      return sendSuccess(res, { user: null, authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, email: true, avatarUrl: true },
    });

    if (!user) {
      return sendSuccess(res, { user: null, authenticated: false });
    }

    sendSuccess(res, { user, authenticated: true });
  } catch (error) {
    sendSuccess(res, { user: null, authenticated: false });
  }
});

// ─── Register ───────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 400, "Username dan password wajib diisi");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password minimal 6 karakter");
    }

    if (username.length < 3) {
      return sendError(res, 400, "Username minimal 3 karakter");
    }

    const userCount = await prisma.user.count();

    // If users already exist, require authentication
    if (userCount > 0) {
      const session = await getSession(req);
      if (!session) {
        return sendError(res, 403, "Hanya admin yang bisa membuat akun baru");
      }
    }

    // Check duplicate username
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return sendError(res, 400, "Username sudah ada");
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    // If first user, auto-login
    if (userCount === 0) {
      const token = await createToken(user.id, user.username);

      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: !config.isDev,
        sameSite: "lax",
        maxAge: config.cookieMaxAge,
        path: "/",
      });

      await logActivity(user.id, user.username, "Akun pertama dibuat & login");
      return sendSuccess(res, { success: true });
    }

    const session = await getSession(req);
    if (session) {
      await logActivity(session.userId, session.username, `Buat akun: ${username}`);
    }

    sendSuccess(res, { success: true }, 201);
  } catch (error) {
    console.error("[Auth] Register error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Login (with rate limiting) ─────────────────────────

router.post("/login", async (req, res) => {
  try {
    // Check if IP is blocked
    const blockStatus = checkLoginBlock(req);
    if (blockStatus.blocked) {
      return sendError(res, 429, `Terlalu banyak percobaan login. Coba lagi dalam ${blockStatus.minutesLeft} menit.`);
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(res, 400, "Username dan password wajib diisi");
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }] },
    });

    if (!user) {
      const remaining = recordFailedLogin(req);
      const msg = remaining > 0
        ? `Username atau password salah. Sisa percobaan: ${remaining}x`
        : `Terlalu banyak percobaan. Coba lagi dalam 15 menit.`;
      return sendError(res, 401, msg);
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      const remaining = recordFailedLogin(req);
      const msg = remaining > 0
        ? `Username atau password salah. Sisa percobaan: ${remaining}x`
        : `Terlalu banyak percobaan. Coba lagi dalam 15 menit.`;
      return sendError(res, 401, msg);
    }

    // Login success - clear attempts
    clearLoginAttempts(req);

    const token = await createToken(user.id, user.username);

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: !config.isDev,
      sameSite: "lax",
      maxAge: config.cookieMaxAge,
      path: "/",
    });

    await logActivity(user.id, user.username, "Login");
    sendSuccess(res, { success: true });
  } catch (error) {
    console.error("[Auth] Login error:", error);
    sendError(res, 500, "Server error");
  }
});

// ─── Logout ─────────────────────────────────────────────

router.post("/logout", async (req, res) => {
  try {
    const session = await getSession(req);
    if (session) {
      await logActivity(session.userId, session.username, "Logout");
    }
  } catch {}
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: !config.isDev,
    sameSite: "lax",
    path: "/",
  });
  sendSuccess(res, { success: true });
});

export default router;

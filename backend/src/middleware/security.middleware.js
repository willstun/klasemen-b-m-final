import config from "../config/index.js";
import { sendError } from "../services/utils.js";

// ─── API Key Verification (block external access) ───────
// Only requests with valid API key header or from allowed origins can access

export function apiGuard(req, res, next) {
  const apiKey = req.headers[config.apiSecretHeader.toLowerCase()];
  const origin = req.headers.origin || "";
  const referer = req.headers.referer || "";

  // Allow if valid API key is present
  if (config.apiSecretValue && config.apiSecretValue !== "default-api-key-change-me" && apiKey === config.apiSecretValue) {
    return next();
  }

  // Allow if request comes from allowed origins
  const isAllowedOrigin = config.allowedOrigins.some(
    (allowed) => origin === allowed || referer.startsWith(allowed)
  );

  if (isAllowedOrigin) {
    return next();
  }

  // In development, allow if no origin (e.g. Postman, curl)
  if (config.isDev && !origin && !referer) {
    return next();
  }

  return sendError(res, 403, "Forbidden");
}

// ─── Rate Limiter (simple in-memory) ────────────────────

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return next();
  }

  const record = requestCounts.get(ip);

  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + WINDOW_MS;
    return next();
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return sendError(res, 429, "Too many requests");
  }

  next();
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts) {
    if (now > record.resetAt) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ─── Security Headers ───────────────────────────────────

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.removeHeader("X-Powered-By");
  next();
}

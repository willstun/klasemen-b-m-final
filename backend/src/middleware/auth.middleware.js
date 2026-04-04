import { getSession } from "../services/auth.service.js";
import { sendError } from "../services/utils.js";

// ─── Require Authentication ─────────────────────────────

export async function requireAuth(req, res, next) {
  const session = await getSession(req);

  if (!session) {
    return sendError(res, 401, "Unauthorized");
  }

  req.session = session;
  next();
}

// ─── Optional Auth (attach session if present) ──────────

export async function optionalAuth(req, res, next) {
  const session = await getSession(req);
  req.session = session;
  next();
}

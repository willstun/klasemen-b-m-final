import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import config from "../config/index.js";

const SECRET = new TextEncoder().encode(config.jwtSecret);
const SALT_ROUNDS = 12;

// ─── Password Hashing (bcrypt instead of SHA-256) ───────

export async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function comparePassword(plaintext, hashed) {
  return bcrypt.compare(plaintext, hashed);
}

// ─── JWT Token ──────────────────────────────────────────

export async function createToken(userId, username) {
  return new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwtExpiry)
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

// ─── Extract Session from Request ───────────────────────

export async function getSession(req) {
  const token = req.cookies?.auth_token;
  if (!token) return null;
  return verifyToken(token);
}

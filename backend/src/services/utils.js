import { BULAN_NAMES } from "../config/index.js";

// ─── Mask username for public display ───────────────────

export function maskName(name) {
  if (!name) return "";
  if (name.length <= 3) return name.replace(/.(?=.)/g, "*");
  return name.slice(0, 3) + "*".repeat(Math.min(name.length - 3, 7));
}

// ─── Format number to Indonesian locale ─────────────────

export function formatNumber(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

// ─── Format periode label from date strings ─────────────
// Input: "2026-03-05", "2026-03-11"
// Output: "05 Maret - 11 Maret 2026"
// Cross-month: "29 Maret - 04 April 2026"
// Cross-year: "29 Desember 2026 - 04 Januari 2027"

export function formatPeriodeLabel(startDate, endDate) {
  const s = new Date(startDate);
  const e = new Date(endDate);

  if (isNaN(s.getTime()) || isNaN(e.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const sDay = pad(s.getDate());
  const sMonth = s.getMonth() + 1;
  const sYear = s.getFullYear();
  const eDay = pad(e.getDate());
  const eMonth = e.getMonth() + 1;
  const eYear = e.getFullYear();

  if (sYear !== eYear) {
    return `${sDay} ${BULAN_NAMES[sMonth]} ${sYear} - ${eDay} ${BULAN_NAMES[eMonth]} ${eYear}`;
  }
  if (sMonth !== eMonth) {
    return `${sDay} ${BULAN_NAMES[sMonth]} - ${eDay} ${BULAN_NAMES[eMonth]} ${sYear}`;
  }
  return `${sDay} - ${eDay} ${BULAN_NAMES[sMonth]} ${sYear}`;
}

// ─── Send error response helper ─────────────────────────

export function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

// ─── Send success response helper ───────────────────────

export function sendSuccess(res, data = {}, status = 200) {
  return res.status(status).json(data);
}

// ─── Parse & validate ID param ──────────────────────────

export function parseId(value) {
  const id = parseInt(value);
  if (isNaN(id) || id <= 0) return null;
  return id;
}

// ─── Validate string length ─────────────────────────────

export function validateString(value, maxLength, fieldName = "Field") {
  if (value === null || value === undefined) return { valid: true, value: null };
  if (typeof value !== "string") return { valid: false, error: `${fieldName} harus berupa teks` };
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return { valid: false, error: `${fieldName} maksimal ${maxLength} karakter` };
  return { valid: true, value: trimmed };
}
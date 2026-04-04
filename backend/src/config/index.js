// ─── Load .env ──────────────────────────────────────────
import "dotenv/config";

// ─── Centralized Configuration ──────────────────────────

// Validate required env vars
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 20) {
  console.error("❌ JWT_SECRET harus diset di .env (minimal 20 karakter)");
  console.error("   Contoh: JWT_SECRET=\"random-string-yang-sangat-panjang-dan-aman\"");
  process.exit(1);
}

const config = {
  // Server
  port: parseInt(process.env.PORT || "4000"),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") !== "production",

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: "7d",
  cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms

  // CORS
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3001,http://localhost:3002")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // API Security
  apiSecretHeader: process.env.API_SECRET_HEADER || "X-Api-Key",
  apiSecretValue: process.env.API_SECRET_VALUE || "default-api-key-change-me",

  // Upload
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || "5242880"), // 5MB

  // Activity Log
  logRetentionDays: 90,

  // Trust proxy (set true if behind NGINX/reverse proxy)
  trustProxy: process.env.TRUST_PROXY === "true",
};

// ─── Input Validation Constants (Fix #10) ───────────────

export const LIMITS = {
  nameMax: 100,        // nama peserta, username
  titleMax: 500,       // judul kompetisi, event title
  urlMax: 2000,        // URL gambar, link
  textMax: 10000,      // rules, footer text
  prizeNameMax: 200,   // nama hadiah
};

// ─── Constants ──────────────────────────────────────────

export const BULAN_NAMES = [
  "",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const DEFAULT_PRIZES = {
  monthly: [
    "MOBIL RAIZE", "MOTOR YAMAHA NMAX TURBO", "MOTOR HONDA VARIO 125CC",
    "IPHONE 16 PRO MAX", "5 GRAM EMAS ANTAM", "LAPTOP ASUS TUF GAMING A15",
    "SAMSUNG GALAXY TAB S9 FE", "APPLE IPAD AIR 7 M3", "SMARTPHONE",
    "UANG TUNAI Rp.2.000.000",
  ],
  weekly: [
    "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO",
    "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO",
    "INFINIX GT 30 PRO", "INFINIX GT 30 PRO", "INFINIX GT 30 PRO",
    "INFINIX GT 30 PRO", "INFINIX GT 30 PRO",
  ],
};

export const FALLBACK_PRIZES = {
  monthly: "UANG TUNAI Rp.2.000.000",
  weekly: "INFINIX GT 30 PRO",
};

export default config;

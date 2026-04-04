import { Router } from "express";
import multer from "multer";
import path from "path";
import { mkdirSync, existsSync, unlinkSync } from "fs";
import config from "../config/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { sendError, sendSuccess } from "../services/utils.js";

const router = Router();

// Allowed upload folders
const ALLOWED_FOLDERS = ["avatars", "banners", "logos", "icons", "promos", "general"];

// Ensure base upload directory exists
mkdirSync(config.uploadDir, { recursive: true });

// ─── Multer Configuration ───────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.query.folder || "general";
    const safeFolderName = ALLOWED_FOLDERS.includes(folder) ? folder : "general";
    const dir = path.join(config.uploadDir, safeFolderName);
    mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WebP."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileSize },
});

// ─── Upload File ────────────────────────────────────────
// Query: ?folder=banners|logos|icons|promos|avatars|general

router.post("/", requireAuth, (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return sendError(res, 400, "File terlalu besar (max 5MB)");
      }
      return sendError(res, 400, err.message);
    }

    if (!req.file) {
      return sendError(res, 400, "File tidak ditemukan");
    }

    const folder = ALLOWED_FOLDERS.includes(req.query.folder) ? req.query.folder : "general";
    const url = `/uploads/${folder}/${req.file.filename}`;
    sendSuccess(res, { url, filename: req.file.filename, folder });
  });
});

// ─── Delete File ────────────────────────────────────────
// Body: { url: "/uploads/banners/12345.jpg" }

router.delete("/", requireAuth, (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return sendError(res, 400, "URL file diperlukan");
    }

    // Only allow deleting from /uploads/ path
    if (!url.startsWith("/uploads/")) {
      return sendError(res, 400, "URL tidak valid");
    }

    // Prevent path traversal
    const relativePath = url.replace("/uploads/", "");
    if (relativePath.includes("..") || relativePath.includes("\\") || relativePath.includes("//")) {
      return sendError(res, 400, "Path tidak valid");
    }

    // Validate folder is in allowed list
    const folderName = relativePath.split("/")[0];
    if (!ALLOWED_FOLDERS.includes(folderName)) {
      return sendError(res, 400, "Folder tidak valid");
    }

    const filePath = path.resolve(config.uploadDir, relativePath);

    // Ensure resolved path is still within upload dir
    const resolvedUploadDir = path.resolve(config.uploadDir);
    if (!filePath.startsWith(resolvedUploadDir)) {
      return sendError(res, 400, "Path tidak valid");
    }

    if (!existsSync(filePath)) {
      return sendSuccess(res, { deleted: true });
    }

    unlinkSync(filePath);
    sendSuccess(res, { deleted: true });
  } catch (error) {
    console.error("[Upload] Delete error:", error);
    sendError(res, 500, "Gagal menghapus file");
  }
});

export default router;

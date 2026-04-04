import prisma from "../config/prisma.js";
import config from "../config/index.js";

// ─── Log Activity ───────────────────────────────────────

export async function logActivity(userId, username, action) {
  try {
    await prisma.activityLog.create({
      data: { userId, username, action },
    });
  } catch (error) {
    console.error("[Logger] Failed to log activity:", error.message);
  }
}

// ─── Scheduled Cleanup (every 6 hours) ──────────────────
// Moved out of logActivity to avoid extra DB query on every request

async function cleanupOldLogs() {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - config.logRetentionDays);

    const result = await prisma.activityLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    if (result.count > 0) {
      console.log(`[Logger] Cleaned up ${result.count} old logs`);
    }
  } catch (error) {
    console.error("[Logger] Cleanup error:", error.message);
  }
}

// Run cleanup on startup and every 6 hours
cleanupOldLogs();
setInterval(cleanupOldLogs, 6 * 60 * 60 * 1000);

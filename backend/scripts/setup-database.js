import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "../.env");

  if (!fs.existsSync(envPath)) {
    console.error("❌ File .env tidak ditemukan!");
    console.log("   Salin .env.example menjadi .env dan isi konfigurasi.");
    process.exit(1);
  }

  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx < 1) continue;

    const key = trimmed.substring(0, eqIdx).trim();
    let value = trimmed.substring(eqIdx + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

async function main() {
  loadEnv();

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL kosong di .env");
    process.exit(1);
  }

  const match = url.match(/mysql:\/\/([^:]+):(.*)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    console.error("❌ Format DATABASE_URL salah");
    process.exit(1);
  }

  const [, user, password, host, port, database] = match;
  console.log(`\n🔌 Connecting MySQL (${host}:${port})...`);

  let mysql;
  try {
    mysql = await import("mysql2/promise");
  } catch {
    console.log("📥 mysql2 belum terinstall. Jalankan: npm install");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
    });

    const [rows] = await connection.execute(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME=?",
      [database]
    );

    if (rows.length > 0) {
      console.log(`✅ Database '${database}' sudah ada`);
    } else {
      await connection.execute(
        `CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
      );
      console.log(`✅ Database '${database}' berhasil dibuat!`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

main();

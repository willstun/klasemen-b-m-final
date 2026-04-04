import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BULAN = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.competition.deleteMany();
  await prisma.prizeTemplate.deleteMany();
  await prisma.siteSettings.deleteMany();

  // ─── Prize Templates ──────────────────────────────────
  const monthlyPrizes = [
    "MOBIL RAIZE", "MOTOR YAMAHA NMAX TURBO", "MOTOR HONDA VARIO 125CC",
    "IPHONE 16 PRO MAX", "5 GRAM EMAS ANTAM", "LAPTOP ASUS TUF GAMING A15",
    "SAMSUNG GALAXY TAB S9 FE", "APPLE IPAD AIR 7 M3", "SMARTPHONE",
    "UANG TUNAI Rp.2.000.000",
  ];

  const weeklyPrizes = [
    "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO",
    "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO", "POCO X7 PRO",
  ];

  for (let i = 0; i < monthlyPrizes.length; i++) {
    await prisma.prizeTemplate.create({
      data: { type: "monthly", rank: i + 1, name: monthlyPrizes[i] },
    });
  }

  for (let i = 0; i < weeklyPrizes.length; i++) {
    await prisma.prizeTemplate.create({
      data: { type: "weekly", rank: i + 1, name: weeklyPrizes[i] },
    });
  }
  console.log("✅ Prize templates seeded");

  // ─── Site Settings ────────────────────────────────────
  const defaultSettings = {
    footerText: '© 2026 Powered by <a href="/" style="color:#ffc300;text-decoration:none;font-weight:600;">ROGTOTO</a>',
    title1: "LIHAT TABEL LOMBA TURNOVER >>",
    buttonText: "KLIK DISINI",
    title2: "EVENT BULANAN TOURNAMENT LIVE CASINO, PRAGMATIC CASINO, DAN SLOT HADIAH TERBESAR SETIAP BULAN !!!",
    title3: "KABAR GEMBIRA !!! Lomba Turnover Casino, Pragmatic Casino, dan Slot dengan hadiah utama mobil Raize dan 2 motor mewah!",
    title4: "SYARAT & KETENTUAN",
    rules: [
      "Peringkat dihitung berdasarkan akumulasi TURNOVER SLOT + CASINO di periode bulan sebelumnya.",
      "Pemenangnya akan di umumkan pada tanggal 2 setiap bulan.",
      "Pemenang wajib claim konfirmasi ke LiveChat atau Whatsapp Official ROGTOTO.",
      "Segala bentuk kecurangan pihak ROGTOTO berhak membatalkan bonus.",
      "Tidak di pungut biaya apapun, terkecuali pajak di tanggung pemenang.",
    ].join("\n"),
    title5: "BERIKUT LIST HADIAH LOMBA TURNOVER CASINO, PRAGMATIC CASINO DAN SLOT :",
  };

  for (const key of ["mingguan", "bulanan"]) {
    await prisma.siteSettings.create({
      data: {
        pageKey: key,
        ...defaultSettings,
        buttonLink: `/${key}/tabel`,
      },
    });
  }
  console.log("✅ Site settings seeded");

  // ─── Competitions ─────────────────────────────────────
  const now = new Date();
  const Y = now.getFullYear();
  const M = now.getMonth() + 1;
  const days = new Date(Y, M, 0).getDate();

  // Monthly competition
  const monthly = await prisma.competition.create({
    data: {
      name: "Klasemen Lomba Turnover Rogtoto",
      type: "monthly",
      year: Y,
      month: M,
      periode: `PERIODE 01 - ${days} ${BULAN[M].toUpperCase()} ${Y}`,
      claimLink: "https://example.com/claim",
      isActive: true,
    },
  });

  const monthlyParticipants = [
    { name: "kingmax001", points: 85000000 },
    { name: "dragon77799", points: 72000000 },
    { name: "stellar8877", points: 65000000 },
    { name: "falcon202488", points: 58000000 },
    { name: "thunder9955", points: 52000000 },
    { name: "blazer202577", points: 48000000 },
    { name: "neptune5533", points: 44000000 },
    { name: "cosmic321009", points: 40000000 },
    { name: "phoenix4488", points: 37000000 },
    { name: "warrior88776", points: 34000000 },
    { name: "titan202499", points: 31000000 },
    { name: "legend77766", points: 28000000 },
    { name: "galaxy123445", points: 25000000 },
    { name: "meteor999887", points: 22000000 },
    { name: "vortex555332", points: 19000000 },
    { name: "zenith001234", points: 16000000 },
    { name: "pulse202577", points: 14000000 },
    { name: "nova88889900", points: 12000000 },
    { name: "quantum77665", points: 10000000 },
    { name: "eclipse33445", points: 8500000 },
  ];

  for (let i = 0; i < monthlyParticipants.length; i++) {
    const p = monthlyParticipants[i];
    const prize = i < monthlyPrizes.length ? monthlyPrizes[i] : "UANG TUNAI Rp.2.000.000";

    await prisma.participant.create({
      data: {
        competitionId: monthly.id,
        rank: i + 1,
        name: p.name,
        prize,
        points: p.points,
        status: i % 3 === 0 ? "claim" : "selesai",
      },
    });
  }
  console.log(`✅ Bulanan: ${monthlyParticipants.length} peserta`);

  // Weekly competition
  const weekly = await prisma.competition.create({
    data: {
      name: "Klasemen Mingguan",
      type: "weekly",
      year: Y,
      month: M,
      week: 1,
      periode: `PERIODE ${BULAN[M].toUpperCase()} ${Y} (MINGGU 1)`,
      claimLink: "https://example.com/claim",
      isActive: true,
    },
  });

  const weeklyParticipants = [
    { name: "pecinta123456", points: 250000 },
    { name: "santoso789012", points: 220000 },
    { name: "kakashi00123", points: 198000 },
    { name: "gojek20245", points: 175000 },
    { name: "sengkuni995", points: 165000 },
    { name: "susanto12377", points: 155000 },
    { name: "paletero7788", points: 148000 },
    { name: "hokage202599", points: 140000 },
    { name: "contino55667", points: 135000 },
    { name: "lunar20245", points: 128000 },
    { name: "pozitron3355", points: 120000 },
    { name: "salazar8899", points: 115000 },
    { name: "bravado4455", points: 110000 },
    { name: "awesome2233", points: 105000 },
    { name: "ardian202599", points: 100000 },
  ];

  const weeklyPrizesFull = [
    ...weeklyPrizes,
    "INFINIX GT 30 PRO", "INFINIX GT 30 PRO", "INFINIX GT 30 PRO",
    "INFINIX GT 30 PRO", "INFINIX GT 30 PRO",
  ];

  for (let i = 0; i < weeklyParticipants.length; i++) {
    const p = weeklyParticipants[i];
    await prisma.participant.create({
      data: {
        competitionId: weekly.id,
        rank: i + 1,
        name: p.name,
        prize: weeklyPrizesFull[i] || "INFINIX GT 30 PRO",
        points: p.points,
        status: i % 2 === 0 ? "selesai" : "claim",
      },
    });
  }
  console.log(`✅ Mingguan: ${weeklyParticipants.length} peserta`);

  console.log("\n🎉 Seed selesai!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

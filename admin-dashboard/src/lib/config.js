export const BULAN_NAMES = [
  "",
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatNumber(value) {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";
  return new Intl.NumberFormat("id-ID").format(num);
}

// Frontend URL untuk preview links
// Development: http://localhost:3000
// Production: sesuaikan dengan subdomain masing-masing
export const FRONTEND_URLS = {
  mingguan: process.env.NEXT_PUBLIC_WEEKLY_URL || "http://localhost:3000/mingguan",
  bulanan: process.env.NEXT_PUBLIC_MONTHLY_URL || "http://localhost:3000/bulanan",
};

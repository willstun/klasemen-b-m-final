# Klasemen Lomba - Leaderboard System

## Struktur Project

```
project/
├── backend/           # Express.js API + Socket.io (port 4000)
├── frontend/          # Next.js halaman publik (port 3000)
├── admin-dashboard/   # Next.js admin panel (port 3001)
└── nginx/             # NGINX config untuk production
```

## Tech Stack

- **Backend**: Express.js, Prisma ORM, Socket.io, JWT (jose), bcryptjs
- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Admin**: Next.js 15, React 19, Tailwind CSS 4
- **Database**: MySQL 8
- **Real-time**: Socket.io (WebSocket)

---

## Development Setup

### Prasyarat

- Node.js >= 18
- MySQL >= 8.0

### 1. Backend

```bash
cd backend
cp .env.example .env    # Edit: DATABASE_URL, JWT_SECRET
npm install
npm run init            # Setup database + seed data
npm run dev             # Start di port 4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env    # Tidak perlu diubah untuk development
npm install
npm run dev             # Start di port 3000
```

### 3. Admin Dashboard

```bash
cd admin-dashboard
cp .env.example .env    # Tidak perlu diubah untuk development
npm install
npm run dev             # Start di port 3001
```

### Development URLs

| Service | URL |
|---------|-----|
| Frontend Bulanan | http://localhost:3000/bulanan |
| Frontend Mingguan | http://localhost:3000/mingguan |
| Admin Dashboard | http://localhost:3001 |
| Backend API | http://localhost:4000 |
| Health Check | http://localhost:4000/api/health |

### Perintah Berguna

```bash
# Reset database (hapus semua data + isi ulang data contoh)
cd backend
npx prisma db push --force-reset && npm run seed

# Hapus cache Next.js (jika ada error aneh)
rm -rf .next        # Mac/Linux
rmdir /s /q .next   # Windows
```

---

## Production URLs

| Subdomain | Halaman |
|-----------|---------|
| `month.domain.com` | Klasemen bulanan |
| `month.domain.com/tabel` | Tabel klasemen bulanan |
| `week.domain.com` | Klasemen mingguan |
| `week.domain.com/tabel` | Tabel klasemen mingguan |
| `dash.domain.com` | Admin dashboard |

> Lihat **DEPLOYMENT.md** untuk panduan production lengkap.

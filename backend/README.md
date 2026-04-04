# Lombarog - Sistem Klasemen Lomba

## Struktur Project

```
lombarog/
├── backend/          # Express.js API + Socket.io
│   ├── src/
│   │   ├── config/       # Konfigurasi & Prisma client
│   │   ├── middleware/    # Auth & Security middleware
│   │   ├── routes/        # API route handlers
│   │   └── services/      # Business logic (auth, logger, socket)
│   ├── prisma/            # Schema & seed
│   └── scripts/           # Database setup
├── frontend/         # Next.js (publik: month & week) [COMING]
├── admin-dashboard/  # Next.js (dash.lombarog.com) [COMING]
└── nginx/            # NGINX reverse proxy config
```

## Subdomain Mapping

| Subdomain | Fungsi |
|-----------|--------|
| `lombarog.com` | Error 500 (tidak digunakan) |
| `month.lombarog.com` | Klasemen bulanan (publik) |
| `week.lombarog.com` | Klasemen mingguan (publik) |
| `dash.lombarog.com` | Admin dashboard |

## Quick Start (Development)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env     # Edit sesuai konfigurasi MySQL
npm install
npm run init             # Setup DB + generate Prisma + seed data
npm run dev              # Start di port 4000
```

### 2. Frontend Setup (coming soon)
### 3. Admin Dashboard Setup (coming soon)

## Tech Stack

- **Backend**: Express.js, Prisma ORM, Socket.io, JWT (jose), bcryptjs
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4
- **Database**: MySQL
- **Real-time**: Socket.io
- **Security**: API key header, CORS, rate limiting, bcrypt hashing

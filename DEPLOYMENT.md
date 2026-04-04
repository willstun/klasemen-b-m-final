# Production Deployment Guide

## Arsitektur

```
Browser → NGINX (port 443)
            ├── month.domain.com  → Frontend (port 3000)
            ├── week.domain.com   → Frontend (port 3000)
            ├── dash.domain.com   → Admin Dashboard (port 3001)
            ├── /api/*            → Backend API (port 4000)
            ├── /uploads/*        → Backend Static Files (port 4000)
            └── /socket.io/*      → Backend WebSocket (port 4000)
```

## Prasyarat

- VPS Ubuntu 22.04+ / Debian 12+
- Domain dengan akses DNS management
- Node.js >= 18, MySQL 8, NGINX, PM2, Certbot

---

## Step 1: Setup Server

```bash
sudo apt update && sudo apt upgrade -y

# Node.js via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install 20

# PM2
npm install -g pm2

# MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# NGINX
sudo apt install nginx -y

# Certbot
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2: Setup DNS

Buat A record di domain registrar:

| Type | Name | Value |
|------|------|-------|
| A | `@` | IP VPS |
| A | `month` | IP VPS |
| A | `week` | IP VPS |
| A | `dash` | IP VPS |

## Step 3: Setup MySQL

```bash
sudo mysql
```

```sql
CREATE DATABASE leaderboard CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'lombarog'@'localhost' IDENTIFIED BY 'Tukangcepu889$';
GRANT ALL PRIVILEGES ON leaderboard.* TO 'lombarog'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

> Password MySQL harus kuat: huruf besar + kecil + angka + simbol, minimal 8 karakter.

## Step 4: Upload Project

```bash
sudo mkdir -p /var/www/klasemen
sudo chown $USER:$USER /var/www/klasemen
cd /var/www/klasemen

# Via git (pakai Personal Access Token)
git clone https://<TOKEN>@github.com/user/repo.git .

# Atau via scp dari lokal
scp -r backend/ frontend/ admin-dashboard/ nginx/ README.md DEPLOYMENT.md user@IP_VPS:/var/www/klasemen/
```

## Step 5: Setup Backend

```bash
cd /var/www/klasemen/backend
npm install
cp .env.example .env
nano .env
```

Isi `.env` production:
```env
DATABASE_URL="mysql://lombarog:PASSWORD_KUAT@localhost:3306/leaderboard"
JWT_SECRET="PASTE_RANDOM_STRING_DISINI"
PORT=4000
NODE_ENV=production
ALLOWED_ORIGINS="https://month.domain.com,https://week.domain.com,https://dash.domain.com"
API_SECRET_HEADER="X-Api-Key"
API_SECRET_VALUE="PASTE_RANDOM_API_KEY_DISINI"
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880
TRUST_PROXY=true
```

Generate random strings:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

Init database:
```bash
npm run init
```

## Step 6: Setup Frontend

```bash
cd /var/www/klasemen/frontend
npm install
cp .env.example .env
```

`.env` production — **kosongkan** (NGINX yang proxy):
```env
# Kosongkan, NGINX yang handle proxy ke backend
# NEXT_PUBLIC_API_URL=
# NEXT_PUBLIC_SOCKET_URL=
```

Build:
```bash
npm run build
```

## Step 7: Setup Admin Dashboard

```bash
cd /var/www/klasemen/admin-dashboard
npm install
cp .env.example .env
nano .env
```

Isi `.env` production:
```env
NEXT_PUBLIC_WEEKLY_URL=https://week.domain.com
NEXT_PUBLIC_MONTHLY_URL=https://month.domain.com
```

> `NEXT_PUBLIC_API_URL` tidak perlu diisi — NGINX yang proxy.

Build:
```bash
npm run build
```

## Step 8: Setup SSL

```bash
sudo certbot --nginx -d domain.com -d month.domain.com -d week.domain.com -d dash.domain.com
```

## Step 9: Setup NGINX

```bash
# Edit config — ganti "domain.com" dengan domain Anda
sudo cp /var/www/klasemen/nginx/lombarog.conf /etc/nginx/sites-available/klasemen
sudo nano /etc/nginx/sites-available/klasemen
# Ganti semua "domain.com" → domain Anda

# Atau pakai sed:
sudo sed -i 's/domain\.com/yourdomain.com/g' /etc/nginx/sites-available/klasemen

# Copy error page
sudo cp /var/www/klasemen/nginx/500.html /var/www/html/500.html

# Enable
sudo ln -sf /etc/nginx/sites-available/klasemen /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test & reload
sudo nginx -t
sudo systemctl reload nginx
```

## Step 10: Setup PM2

```bash
cd /var/www/klasemen

# Start 3 services
pm2 start backend/src/server.js --name "api" --cwd /var/www/klasemen/backend
pm2 start npm --name "frontend" --cwd /var/www/klasemen/frontend -- start
pm2 start npm --name "admin" --cwd /var/www/klasemen/admin-dashboard -- start

# Auto-start on reboot
pm2 save
pm2 startup
```

Verifikasi:
```bash
pm2 status
```

Harus 3 proses online:
```
┌──────────┬────┬──────┬────────┐
│ name     │ id │ mode │ status │
├──────────┼────┼──────┼────────┤
│ api      │ 0  │ fork │ online │
│ frontend │ 1  │ fork │ online │
│ admin    │ 2  │ fork │ online │
└──────────┴────┴──────┴────────┘
```

## Step 11: Verifikasi

```bash
# Test backend
curl http://localhost:4000/api/health

# Test dari browser
# https://month.domain.com
# https://week.domain.com
# https://dash.domain.com
```

---

## Maintenance

### Update Code

```bash
cd /var/www/klasemen
git pull    # atau upload ulang via scp

# Rebuild
cd frontend && npm install && npm run build && cd ..
cd admin-dashboard && npm install && npm run build && cd ..
cd backend && npm install && cd ..

pm2 restart all
```

### Monitoring

```bash
pm2 status          # Status semua proses
pm2 logs            # Log real-time
pm2 logs api        # Log backend saja
pm2 monit           # Resource usage
```

### Backup

```bash
# Buat folder backup
mkdir -p /var/www/klasemen/backup

# Backup database
mysqldump -u lombarog -p leaderboard > /var/www/klasemen/backup/db-$(date +%Y%m%d).sql

# Backup uploads
tar -czf /var/www/klasemen/backup/uploads-$(date +%Y%m%d).tar.gz -C /var/www/klasemen/backend uploads/

# Restore database
mysql -u lombarog -p leaderboard < /var/www/klasemen/backup/db-20260331.sql
```

### SSL Renew

Certbot auto-renew sudah aktif. Verifikasi:
```bash
sudo certbot renew --dry-run
```

### Reset Database

**⚠️ HATI-HATI: Menghapus semua data!**
```bash
cd /var/www/klasemen/backend
npx prisma db push --force-reset
npm run seed    # Optional: data contoh
pm2 restart api
```

---

## Troubleshooting

### CORS Error di console browser
Cek backend `.env` → `ALLOWED_ORIGINS` harus berisi domain production lengkap dengan `https://`.

### Socket.io 308 Redirect
Pastikan NGINX config punya blok `location /socket.io/` yang proxy ke backend.

### Gambar tidak muncul (localhost:4000)
Frontend `.env` harus kosong di production. Rebuild: `npm run build && pm2 restart frontend`.

### 502 Bad Gateway
Service belum jalan. Cek: `pm2 status` → pastikan semua online. Kalau error: `pm2 logs`.

### Permission denied pada uploads
```bash
sudo chown -R $USER:$USER /var/www/klasemen/backend/uploads
chmod -R 755 /var/www/klasemen/backend/uploads
```

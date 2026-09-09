# Docker Setup Troubleshooting - Mini ERP

**Dibuat:** 2026-09-09  
**Tujuan:** Quick reference untuk menghindari error berulang saat setup Docker + Prisma + TypeScript

---

## 🎯 TL;DR - Error Summary

| # | Error | Root Cause | Fix |
|---|-------|------------|-----|
| 1 | TS syntax `{ { } }` | Invalid nested object | Use `data:` key |
| 2 | JWT type mismatch | Strict TypeScript | Cast `as any` |
| 3 | Import path wrong | Relative path salah | Count `../../` correctly |
| 4 | bcrypt exec format | Windows binary di Linux | Delete `node_modules`, rebuild |
| 5 | nodemon not found | Missing dev deps | Use `npm ci` not `npm ci --omit=dev` |
| 6 | libssl.so.1.1 missing | Alpine incompatible | Use `node:18` not `node:18-alpine` |
| 7 | JSON parse error | PowerShell escaping | Use `Invoke-WebRequest` |

---

## ✅ Working Dockerfile

```dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run prisma:generate
RUN npm run build

FROM node:18
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npm rebuild
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY . .
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Key points:**
- ✅ Use `node:18` (Debian), NOT `node:18-alpine`
- ✅ Use `npm ci` (full deps), NOT `npm ci --omit=dev`
- ✅ Run `npm rebuild` for native modules

---

## ✅ Working docker-compose.yml

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: stockflow
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: .
    depends_on:
      db:
        condition: service_healthy
    environment:
      DATABASE_URL: "postgresql://postgres:password@db:5432/stockflow?schema=public"
      JWT_SECRET: "your-secret-here"
      BCRYPT_SALT_ROUNDS: "10"
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules  # CRITICAL: isolate container node_modules
    command: npm run dev

volumes:
  pgdata:
```

**Key points:**
- ✅ Volume exclusion: `- /app/node_modules` WAJIB
- ✅ Healthcheck DB sebelum start backend

---

## 🚀 Correct Workflow

### Initial Setup
```powershell
# 1. Hapus node_modules lokal (jika ada)
Remove-Item -Recurse -Force node_modules

# 2. Build Docker
docker compose build --no-cache

# 3. Start containers
docker compose up -d

# 4. Cek logs (tunggu "Server running...")
docker compose logs -f backend

# 5. Jalankan migration
docker compose exec backend npm run prisma:migrate

# 6. Test API (gunakan PowerShell native)
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "Pass123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body -UseBasicParsing
```

### Saat Edit Code
```powershell
# 1. Test TypeScript compilation WAJIB
npm run build  # Harus 0 error

# 2. Restart container (jika perlu)
docker compose restart backend

# 3. Cek logs
docker compose logs -f backend
```

### Full Reset
```powershell
docker compose down -v
docker system prune -a --volumes
docker compose build --no-cache
docker compose up -d
docker compose exec backend npm run prisma:migrate
```

---

## 🔥 Critical Mistakes to Avoid

### ❌ JANGAN:
1. Skip `npm run build` lokal sebelum Docker build
2. Pakai `node:18-alpine` untuk project Prisma
3. Commit atau keep `node_modules` di Windows saat pakai Docker
4. Pakai curl + PowerShell backtick untuk JSON
5. Install dengan `--omit=dev` untuk dev container

### ✅ LAKUKAN:
1. Test TypeScript compilation lokal first (`npm run build`)
2. Pakai `node:18` (Debian) untuk Prisma compatibility
3. Delete `node_modules` sebelum Docker build
4. Isolate container `node_modules` dengan volume exclusion
5. Pakai `Invoke-WebRequest` untuk test API di PowerShell
6. Install all deps untuk dev container
7. Run migrations setelah container start
8. Cek server logs saat API error

---

## 🐛 Quick Troubleshooting

**Container tidak start?**
```powershell
docker compose logs backend
# Cek: Dockerfile pakai node:18, bukan node:18-alpine
# Cek: volumes exclude node_modules
```

**API return 500?**
```powershell
docker compose logs backend --tail=50
# Cek: migration sudah jalan?
# Cek: JSON format benar? (pakai Invoke-WebRequest)
```

**TypeScript build fail?**
```powershell
npm run build
# Cek: import paths benar?
# Cek: JSON response syntax valid?
```

**"nodemon not found"?**
```powershell
# Fix: Ubah Dockerfile jadi `npm ci` (bukan --omit=dev)
docker compose build --no-cache
```

---

## 📝 TypeScript Common Fixes

### JSON Response (auth.controller.ts)
```typescript
// SALAH ❌
return res.json({ success: true, { token } });

// BENAR ✅
return res.json({ success: true, data: { token } });
```

### JWT Sign (auth.service.ts)
```typescript
// Pakai cast untuk bypass strict typing
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
```

### Import Paths
```typescript
// Dari src/common/middleware/authMiddleware.ts
// SALAH ❌
import AuthService from '../modules/auth/auth.service';

// BENAR ✅
import AuthService from '../../modules/auth/auth.service';
```

---

## 🎓 Key Lessons

1. **Test lokal dulu** - `npm run build` harus sukses sebelum Docker
2. **Debian > Alpine** - Prisma butuh OpenSSL 1.1, Alpine ribet
3. **Isolate node_modules** - Volume exclusion WAJIB untuk native modules
4. **PowerShell bukan bash** - Pakai `Invoke-WebRequest`, bukan curl
5. **Dev needs dev deps** - Jangan `--omit=dev` untuk dev container

---

**Status:** ✅ Backend running, API tested, migrations applied  
**Next:** Add modules (products, inventory, transactions) atau commit progress

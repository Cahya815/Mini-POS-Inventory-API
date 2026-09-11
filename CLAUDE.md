# StockFlow - Development Guidelines

Language: JavaScript (Node.js) | Framework: Express.js | Database: PostgreSQL + Prisma
Architecture: Modular Monolith + Layered Architecture

---

## 🎯 Development Workflow

### BEFORE ANY CODE CHANGE

1. **Observe** - Read entire error message
2. **Classify** error:
   - Runtime error
   - JavaScript error (undefined, type mismatch, etc.)
   - Invalid request/input (JSON format)
   - Database error
   - Environment/configuration error
   - Docker/container error
   - Dependency/version error

3. **Diagnose** the root cause

4. **Explain**:
   - apa penyebab error
   - file dan baris yang bermasalah
   - mengapa solusi dipilih memperbaiki masalah

5. **Plan** minimal fix:
   - file yang akan diubah
   - alasan perubahan
   - jangan refactor yang tidak berkaitan dengan error

6. **Apply Minimal Fix**

7. **Verify** with build check BEFORE running app:
   ```bash
   npm run build
   ```

8. **Run app** and verify fix

9. **Do NOT** change unrelated files

---

## 🔥 Debugging Protocol

### Terpisah error berbeda jenis:
- JSON parse error → fix request format, JANGAN ubah JavaScript
- JavaScript error → fix logic, JANGAN ubah business rules
- Database error → fix migration/query, JANGAN ubah controller/service

### Rule: ONE bug one time

Setiap bug selesai dan diverifikasi SEBELUM berpindah ke bug lain atau fitur baru.

### JANGAN:
- Trial-and-error (ganti banyak file sekaligus)
- Gunakan `any`, `as any`, `@ts-ignore` kecuali benar-benar diperlukan dan dijelaskan
- Menebak penyebab tanpa inspect file
- Refactor besar tanpa persetujuan

### HARUS:
- Dapatkan diagnosis dan plan dulu
- Jalankan typecheck SEBELUM run
- Leaf fix minimal (satunya-satunya yang mengatasi error)

---

## 📋 Diagnostic Commands

### Type Safety
```bash
npm run build  # atau `npm run typecheck` jika ada
```

### Docker Logs
```bash
docker compose logs backend --tail=50
docker compose logs backend --tail=100 | grep -i "error"
```

### Database Status
```bash
docker compose exec backend npm run prisma:studio
```

---

## 🚨 Common Error Pattern

### JSON Parse Error
```
Unexpected token n in JSON at position 1
```
**Fix:** Did=format JSON request, JANGAN ubah TypeScript

### String | String[]
```
Type 'string | string[]' is not assignable to 'string'
```
**Fix:** Narrow type atau handle union, sesuikan dengan logika business

---

## 💻 File Structure

```
src/
├── app.ts
├── server.ts
├── config/
│   ├── env.ts
│   └── database.ts
├── common/
│   ├── errors/
│   │   └── AppError.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   └── roleMiddleware.ts
│   └── types/
└── modules/
    ├── auth/
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.routes.ts
    └── users/
        ├── user.controller.ts
        ├── user.service.ts
        └── user.routes.ts
```

---

## 🎓 Key Principles (Ponytail Mode)

**Lazy, not careless.** Shortest path to done is the right path.

From: `rules/common/performance.md` and Ponytail mode
- Prefer stdlib and native features
- Reuse existing code before writing new
- One line if possible
- Run before commit

---

## 🔧 Docker Workflow

### Initial Setup
```powershell
Remove-Item -Recurse -Force node_modules
docker compose build --no-cache
docker compose up -d
docker compose exec backend npm run prisma:migrate
```

### Saat Edit Code
```powershell
npm run build  # WAJIB - harus 0 error
docker compose restart backend
docker compose logs -f backend
```

---

**Last Updated:** 2026-09-10
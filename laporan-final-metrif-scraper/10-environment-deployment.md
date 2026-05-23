# Environment and Deployment

## Struktur Project

```txt
project_uts/
  frontend/
  scraper-api/
  supabase/
  shared/
  laporan-final-metrif-scraper/
```

## Frontend Setup

Masuk ke folder frontend:

```bash
cd frontend
npm install
npm run dev
```

Script tersedia:

```txt
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run typecheck
```

## Frontend Environment

File:

```txt
frontend/.env.local
```

Contoh:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SCRAPER_API_URL=http://localhost:4000
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
```

Catatan:

- Semua variable frontend memakai prefix `NEXT_PUBLIC_`.
- Jangan memasukkan service role key ke frontend.
- `NEXT_PUBLIC_SCRAPER_API_URL` harus mengarah ke base URL scraper API.

## Backend Setup

Masuk ke folder scraper API:

```bash
cd scraper-api
npm install
npm run dev
```

Script tersedia:

```txt
npm run dev
npm run start
npm run typecheck
```

## Backend Environment

File:

```txt
scraper-api/.env
```

Contoh:

```env
PORT=4000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET_KEY=change-this-secret
NODE_ENV=development
```

## Supabase Setup

Langkah:

1. Buat Supabase project.
2. Aktifkan Anonymous Auth.
3. Konfigurasi hCaptcha jika digunakan.
4. Jalankan migration secara berurutan:

```txt
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_scrape_job_review_target.sql
supabase/migrations/003_anonymous_auth_rls.sql
```

5. Ambil Project URL, anon key, dan service role key.
6. Isi env frontend dan backend.

## Deployment Target

Rekomendasi:

| Komponen | Platform |
|---|---|
| Frontend | Vercel |
| Scraper API | Render, Railway, atau Fly.io |
| Database | Supabase |

## Deployment Frontend

Checklist:

- Set root directory ke `frontend`.
- Isi env frontend di dashboard hosting.
- Jalankan build command `npm run build`.
- Pastikan `NEXT_PUBLIC_SCRAPER_API_URL` mengarah ke API production.

## Deployment Backend

Checklist:

- Set root directory ke `scraper-api`.
- Isi env backend.
- Pastikan Playwright dependency tersedia.
- Jalankan `npm run start`.
- Cek `GET /health`.
- Atur CORS jika production domain sudah tetap.

## Production Checklist

- Supabase URL valid.
- Supabase anon key valid.
- Service role key hanya di backend.
- hCaptcha site key valid.
- API production dapat diakses frontend.
- Migration database sudah lengkap.
- Health check API berhasil.
- Scrape test dengan target kecil berhasil.
- Export CSV/JSON berhasil.

## Catatan Playwright

Playwright membutuhkan browser runtime. Jika deployment gagal karena Chromium dependency, gunakan platform yang mendukung Playwright atau Docker image yang sudah menyertakan dependency browser.


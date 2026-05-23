# Supabase Setup

Ikuti langkah ini setelah project Supabase dibuat.

## 1. Buat Project

1. Buka Supabase Dashboard.
2. Create new project.
3. Simpan `Project URL`, `anon public key`, dan `service_role key`.

## 2. Jalankan Schema

1. Buka menu SQL Editor.
2. Copy isi file `migrations/001_initial_schema.sql`.
3. Paste ke SQL Editor.
4. Klik Run.

Tabel yang dibuat:

- `products`
- `reviews`
- `scrape_jobs`

## 3. Isi Environment

Frontend `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SCRAPER_API_URL=http://localhost:4000
```

Scraper API `.env` nanti:

```env
PORT=4000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_SECRET_KEY=change-this-secret
NODE_ENV=development
```

## 4. Security Rule

`SUPABASE_SERVICE_ROLE_KEY` hanya boleh dipakai di scraper backend. Jangan masukkan key itu ke frontend.

RLS sudah aktif. Frontend hanya diberi akses baca lewat anon key. Insert/update/delete nanti dilakukan scraper API memakai service role key.

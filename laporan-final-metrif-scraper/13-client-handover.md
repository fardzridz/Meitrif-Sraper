# Client Handover

## Ringkasan Serah Terima

Dokumen ini menjelaskan hal yang perlu diketahui client atau tim penerus saat menerima project Metrif Scraper.

Metrif Scraper adalah aplikasi dashboard untuk mengumpulkan review publik FemaleDaily, menyimpan data di Supabase, dan mengekspor dataset ke CSV/JSON.

## Deliverables

Deliverable project:

- Source code frontend.
- Source code scraper API.
- Supabase migration.
- Shared database types.
- Brand assets.
- Project breakdown.
- Laporan final project.

## Komponen yang Diserahkan

```txt
frontend/
scraper-api/
supabase/
shared/
femaledaily-scraper-project-breakdown/
laporan-final-metrif-scraper/
```

## Cara Menjalankan Lokal

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd scraper-api
npm install
npm run dev
```

Supabase:

1. Buat project Supabase.
2. Jalankan migration di folder `supabase/migrations`.
3. Isi env frontend dan backend.

## Environment yang Dibutuhkan

Frontend:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SCRAPER_API_URL=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
```

Backend:

```env
PORT=4000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET_KEY=
NODE_ENV=development
```

## Akun dan Akses

Client perlu memiliki:

- Akses Supabase project.
- Akses hCaptcha dashboard jika captcha digunakan.
- Akses hosting frontend.
- Akses hosting backend.
- Akses repository/source code.

## Hal Penting untuk Client

- Aplikasi tidak melakukan sentiment analysis.
- Aplikasi hanya mengambil review publik.
- Aplikasi tidak melakukan bypass proteksi website.
- Data user dipisahkan berdasarkan anonymous session.
- Jika browser storage dihapus, user bisa kehilangan akses ke data anonymous lama.
- Untuk kebutuhan produksi jangka panjang, sebaiknya ada account upgrade email/OAuth.

## Batasan Operasional

Scraper memiliki batas target maksimal 250 review per job. Batas ini dibuat agar aplikasi tetap ringan dan tidak melakukan crawling agresif.

Jika ingin volume lebih besar:

- Tambahkan queue system.
- Tambahkan rate limit.
- Gunakan hosting backend yang lebih kuat.
- Tambahkan monitoring.
- Pastikan kepatuhan terhadap aturan website sumber.

## Checklist Serah Terima

| Item | Status |
|---|---|
| Source code frontend tersedia | Pending |
| Source code backend tersedia | Pending |
| Migration database tersedia | Pending |
| Env example tersedia | Pending |
| Dokumentasi final tersedia | Pending |
| Cara run lokal terdokumentasi | Pending |
| Cara deploy terdokumentasi | Pending |
| Demo scraping berhasil | Pending |
| Export CSV/JSON berhasil | Pending |

## Rekomendasi Setelah Handover

1. Deploy frontend ke Vercel.
2. Deploy backend ke Render/Railway/Fly.io.
3. Test end-to-end dengan target 10 review.
4. Tambahkan test otomatis untuk utility function.
5. Buat akun login permanen jika aplikasi akan dipakai jangka panjang.
6. Tambahkan monitoring error untuk backend.


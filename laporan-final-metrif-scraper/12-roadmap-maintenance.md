# Roadmap and Maintenance

## Status Saat Ini

Metrif Scraper sudah memiliki fondasi MVP:

- Frontend dashboard.
- Scraper backend.
- Supabase database.
- Anonymous Auth.
- hCaptcha flow.
- RLS by owner.
- Scrape job.
- Product dan review pages.
- Export CSV/JSON.
- Documentation breakdown.

## Roadmap Jangka Pendek

Prioritas setelah MVP:

1. Validasi scraping pada beberapa variasi URL FemaleDaily.
2. Tambahkan test otomatis untuk utility function.
3. Tambahkan logging backend yang lebih rapi.
4. Tambahkan pagination metadata pada API.
5. Tambahkan halaman detail job.
6. Tambahkan retry mechanism untuk page load failure.
7. Perbaiki copywriting error agar lebih user-friendly.

## Roadmap Jangka Menengah

Pengembangan berikutnya:

1. Account upgrade dari anonymous ke email/OAuth.
2. Dataset tagging.
3. Export history.
4. Bulk URL queue terbatas.
5. Scheduler manual dengan batas aman.
6. Admin monitoring untuk environment private.
7. Dashboard chart lebih lengkap.

## Roadmap Jangka Panjang

Fitur lanjutan yang dapat dipertimbangkan:

1. Sentiment analysis module.
2. Topic extraction.
3. Data cleaning pipeline lanjutan.
4. Integrasi dengan notebook atau BI tool.
5. Multi-project workspace.
6. Role-based access control.
7. Audit log.

## Maintenance Teknis

Area yang perlu dipantau:

- Perubahan struktur DOM FemaleDaily.
- Compatibility Playwright.
- Supabase Auth policy.
- hCaptcha configuration.
- Environment variable production.
- Batas resource hosting backend.
- Keamanan service role key.

## Maintenance Scraper

Scraper bergantung pada struktur halaman sumber. Jika FemaleDaily mengubah class name atau layout HTML, selector dan parser mungkin perlu disesuaikan.

Langkah maintenance:

1. Test scrape dengan URL yang sebelumnya berhasil.
2. Cek apakah review container masih terbaca.
3. Update selector jika struktur berubah.
4. Pastikan cleaning text tidak membuang review valid.
5. Jalankan target kecil sebelum target besar.

## Maintenance Database

Aturan:

- Jangan menghapus migration lama tanpa alasan.
- Tambah migration baru untuk perubahan schema.
- Backup data sebelum perubahan besar.
- Pastikan perubahan policy RLS tidak membuka data publik.

## Maintenance Frontend

Area yang perlu dijaga:

- UI tetap responsive.
- Loading/empty/error state tetap lengkap.
- Token refresh tetap berjalan.
- Mock fallback hanya membantu development.
- Production error tidak ditutupi mock data.

## Release Checklist

Sebelum release:

- Typecheck frontend.
- Typecheck backend.
- Lint frontend.
- Test API health.
- Test auth flow.
- Test scrape kecil.
- Test export.
- Cek environment production.
- Cek RLS policy.

## Risiko Jangka Panjang

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Source website berubah | Scraper gagal | Update parser |
| Hosting free limit | Job gagal/timeout | Batasi target, upgrade hosting |
| Captcha config salah | User tidak bisa auth | Dokumentasikan env |
| Service key bocor | Risiko data | Rotate key dan cek env |
| Data terlalu besar | Query lambat | Pagination dan index |


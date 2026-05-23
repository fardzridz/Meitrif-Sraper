# Laporan Final Metrif Scraper

Folder ini berisi dokumentasi final project Metrif Scraper untuk kebutuhan tim developer, client, dan dosen pembimbing/penguji. Dokumen disusun agar pembaca non-teknis dapat memahami tujuan aplikasi, sedangkan tim teknis tetap mendapatkan detail arsitektur, API, database, keamanan, deployment, dan maintenance.

## Identitas Project

| Item | Keterangan |
|---|---|
| Nama aplikasi | Metrif Scraper |
| Domain masalah | Pengumpulan data review produk FemaleDaily |
| Jenis aplikasi | Web dashboard + scraper backend |
| Tujuan utama | Mengumpulkan review publik menjadi dataset siap analisis |
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, Playwright |
| Database | Supabase PostgreSQL |
| Auth | Supabase Anonymous Auth + hCaptcha |
| Output data | CSV dan JSON |

## Daftar Dokumen

1. `01-executive-summary.md` - Ringkasan singkat untuk client dan stakeholder.
2. `02-product-overview.md` - Gambaran produk, tujuan, scope, dan target pengguna.
3. `03-system-architecture.md` - Arsitektur sistem, flow data, dan diagram teknis.
4. `04-feature-specification.md` - Spesifikasi fitur aplikasi.
5. `05-database-design.md` - Desain database, tabel, relasi, dan RLS.
6. `06-api-design.md` - Desain API, endpoint, request, response, dan error.
7. `07-frontend-design.md` - Desain frontend, halaman, komponen, dan UI state.
8. `08-scraper-design.md` - Desain scraper, proses scraping, dan batasan etis.
9. `09-auth-security.md` - Auth, security, hCaptcha, service role, dan isolasi data.
10. `10-environment-deployment.md` - Environment variable, cara menjalankan, dan deployment.
11. `11-testing-qa.md` - Rencana pengujian dan checklist QA.
12. `12-roadmap-maintenance.md` - Roadmap, sisa pekerjaan, dan maintenance.
13. `13-client-handover.md` - Catatan serah terima ke client atau tim penerus.
14. `14-laporan-akademik-dosen.md` - Format laporan akhir tugas untuk dosen, lengkap dengan diagram dan pembagian tugas kelompok.

## Cara Membaca

Untuk client:

1. Mulai dari `01-executive-summary.md`.
2. Lanjut ke `02-product-overview.md`.
3. Baca `04-feature-specification.md`.
4. Tutup dengan `13-client-handover.md`.

Untuk developer:

1. Mulai dari `03-system-architecture.md`.
2. Lanjut ke `05-database-design.md`, `06-api-design.md`, dan `08-scraper-design.md`.
3. Gunakan `10-environment-deployment.md` untuk setup.
4. Gunakan `11-testing-qa.md` sebelum release.

Untuk dosen:

1. Mulai dari `14-laporan-akademik-dosen.md`.
2. Jika butuh detail teknis tambahan, baca dokumen `03` sampai `09`.

## Catatan Scope

Metrif Scraper hanya berfungsi sebagai alat pengumpulan data review publik dari halaman produk FemaleDaily. Aplikasi ini tidak menjalankan sentiment analysis, tidak melakukan bypass captcha/login/rate limit, dan tidak mengambil data pribadi yang tidak dibutuhkan untuk dataset analisis.

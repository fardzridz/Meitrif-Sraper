# Executive Summary

## Ringkasan

Metrif Scraper adalah aplikasi web untuk membantu pengumpulan data review produk FemaleDaily secara terstruktur. Aplikasi ini dirancang sebagai dashboard yang memungkinkan pengguna memasukkan URL produk, menjalankan proses scraping melalui backend terpisah, menyimpan data ke Supabase, melihat hasil dalam halaman dashboard, dan mengekspor data ke format CSV atau JSON.

Project ini dibuat untuk mendukung kebutuhan riset, tugas akademik, dan persiapan dataset sentiment analysis. Sistem tidak melakukan sentiment analysis secara langsung. Fokus utamanya adalah pengumpulan, penyimpanan, manajemen, filtering, dan export data review.

## Masalah yang Diselesaikan

Pengumpulan review produk secara manual memakan waktu, rawan tidak konsisten, dan sulit dikelola ketika jumlah review bertambah. Metrif Scraper menyelesaikan masalah tersebut dengan:

- Menyediakan form input URL produk FemaleDaily.
- Menjalankan scraping dari backend agar frontend tetap ringan.
- Menyimpan data ke database terpusat.
- Menampilkan produk, review, dan status job secara rapi.
- Memberikan export CSV/JSON untuk kebutuhan analisis lanjutan.
- Memisahkan data setiap pengguna melalui anonymous session.

## Nilai untuk Client atau Stakeholder

Metrif Scraper memberi nilai utama sebagai alat bantu pengumpulan dataset. Dengan aplikasi ini, pengguna tidak perlu menyalin review satu per satu. Hasil review dapat dikelola melalui UI dan diekspor dalam format yang siap dipakai oleh tools analisis lain.

Manfaat praktis:

- Proses pengumpulan data lebih cepat.
- Data lebih rapi karena masuk ke struktur database.
- Riwayat scraping dapat dilihat kembali.
- Output dataset dapat digunakan untuk analisis eksternal.
- Arsitektur lebih siap dikembangkan dibanding script lokal satu kali pakai.

## Ruang Lingkup MVP

MVP yang sudah dirancang mencakup:

- Landing page singkat dengan branding Metrif Scraper.
- Dashboard ringkasan produk, review, dan job.
- Halaman scrape URL produk.
- Target jumlah review 10 sampai 250.
- Polling status job scraping.
- Halaman daftar produk.
- Halaman daftar review dengan search dan filter.
- Export dataset ke CSV dan JSON.
- Anonymous Auth dengan hCaptcha.
- Data isolation per pengguna melalui `owner_id`.

## Batasan

Beberapa hal sengaja tidak dimasukkan ke MVP:

- Sentiment analysis engine.
- Login email/password.
- Multi-role admin.
- Large-scale crawling.
- Bypass login, captcha, rate limit, atau endpoint private.
- Pengambilan user profile atau foto pengguna.

## Kesimpulan

Metrif Scraper adalah fondasi aplikasi dataset collection yang cukup lengkap untuk kebutuhan demo, riset, dan pengembangan lanjutan. Arsitektur sudah dipisahkan antara frontend, scraper API, dan database sehingga lebih mudah dideploy, dipelihara, dan dikembangkan.


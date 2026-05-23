# Product Overview

## Nama Produk

Metrif Scraper

## Deskripsi Produk

Metrif Scraper adalah aplikasi dashboard berbasis web untuk mengumpulkan review publik dari halaman produk FemaleDaily. Pengguna memasukkan URL produk, menentukan target review, lalu sistem menjalankan scraping dari backend. Data yang berhasil dikumpulkan disimpan ke Supabase dan dapat dilihat atau diekspor dari dashboard.

## Tujuan Produk

Tujuan utama aplikasi ini adalah menyediakan alat bantu pengumpulan dataset review produk yang:

- Mudah digunakan oleh pengguna non-teknis.
- Tetap rapi untuk kebutuhan tim teknis.
- Menghasilkan dataset terstruktur.
- Mengurangi pekerjaan manual.
- Menjadi fondasi untuk sentiment analysis di tahap berikutnya.

## Target Pengguna

Target pengguna aplikasi:

- Mahasiswa yang mengerjakan tugas atau penelitian.
- Tim riset yang membutuhkan dataset review.
- Data analyst yang membutuhkan bahan analisis.
- Developer yang mengelola pipeline data sederhana.
- Client yang membutuhkan alat pengumpulan data review.

## User Problem

Masalah utama yang dihadapi pengguna:

- Review produk tersebar di halaman web dan sulit dikumpulkan manual.
- Data manual sering tidak konsisten.
- Export ke format analisis membutuhkan waktu tambahan.
- Proses scraping dengan script lokal sulit dipakai oleh orang non-teknis.
- Perlu antarmuka untuk melihat status dan hasil scraping.

## Product Solution

Solusi yang diberikan Metrif Scraper:

- Web UI untuk input URL dan target review.
- Scraper backend terpisah dengan Playwright.
- Supabase sebagai database.
- Dashboard untuk monitoring ringkasan data.
- Review table dengan search dan filter.
- Export CSV/JSON dari data yang sudah terkumpul.
- Anonymous Auth agar setiap browser session punya ruang data sendiri.

## Scope Fitur

Fitur utama:

- Landing page.
- App shell dan top navigation.
- Anonymous session dengan hCaptcha.
- Scrape form.
- Job status card.
- Recent jobs.
- Product list.
- Review list.
- Search dan filter.
- Export dataset.
- Loading, empty, error, dan success states.

## Out of Scope

Fitur yang tidak termasuk versi saat ini:

- Analisis sentimen otomatis.
- Dashboard multi-user dengan role.
- Login email/password.
- Web scraping skala besar.
- Integrasi payment.
- Scheduler scraping otomatis.
- Browser extension.

## Definisi Sukses

Project dinilai berhasil jika:

- User dapat membuka aplikasi.
- User dapat membuat anonymous session.
- User dapat memasukkan URL produk FemaleDaily.
- Backend dapat membuat scrape job.
- Scraper dapat mengambil review publik.
- Data tersimpan di Supabase.
- Dashboard menampilkan data.
- Review dapat difilter dan dicari.
- Dataset dapat diekspor ke CSV/JSON.


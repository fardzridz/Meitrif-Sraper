# System Architecture

## Ringkasan Arsitektur

Metrif Scraper menggunakan arsitektur terpisah antara frontend, backend scraper, dan database. Pemisahan ini penting karena proses scraping menggunakan Playwright membutuhkan resource lebih besar dan tidak cocok dijalankan langsung dari rendering frontend.

Komponen utama:

- Next.js frontend untuk UI.
- Express.js scraper API untuk proses backend.
- Playwright untuk membuka dan membaca halaman review.
- Supabase PostgreSQL untuk penyimpanan data.
- Supabase Anonymous Auth untuk identitas user.
- hCaptcha sebagai proteksi sebelum membuat anonymous session baru.

## Diagram Arsitektur Tingkat Tinggi

```mermaid
flowchart TD
    U[User] --> FE[Next.js Frontend]
    FE --> AUTH[Supabase Anonymous Auth + hCaptcha]
    FE --> API[Express Scraper API]
    API --> PW[Playwright Browser]
    PW --> FD[FemaleDaily Product Page]
    API --> DB[(Supabase PostgreSQL)]
    FE --> DB
    DB --> FE
```

## Alur Utama Sistem

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant SB as Supabase Auth
    participant API as Scraper API
    participant PW as Playwright
    participant FD as FemaleDaily
    participant DB as Supabase DB

    User->>FE: Membuka aplikasi
    FE->>SB: Cek session
    alt Session belum ada
        FE->>User: Tampilkan hCaptcha
        User->>FE: Selesaikan hCaptcha
        FE->>SB: Sign in anonymously
    end
    SB-->>FE: Access token
    User->>FE: Input URL dan target review
    FE->>API: POST /scrape dengan Bearer token
    API->>SB: Verifikasi token
    API->>DB: Buat scrape_job dengan owner_id
    API->>PW: Jalankan browser
    PW->>FD: Buka halaman produk
    FD-->>PW: HTML halaman review
    PW-->>API: Data produk dan review
    API->>DB: Simpan produk dan review
    API->>DB: Update status job
    FE->>API: Polling job status
    API-->>FE: Data job milik user
```

## Komponen Frontend

Frontend bertugas:

- Menampilkan halaman landing dan dashboard.
- Mengelola anonymous session di browser.
- Menampilkan hCaptcha jika session belum ada.
- Mengirim request API dengan Bearer token.
- Menampilkan loading, empty, success, dan error state.
- Menyediakan export dataset dari data review.

## Komponen Scraper API

Scraper API bertugas:

- Memverifikasi Supabase access token.
- Menentukan `owner_id` dari token.
- Memvalidasi URL FemaleDaily.
- Membuat scrape job.
- Menjalankan Playwright.
- Membersihkan data hasil scraping.
- Menyimpan data ke Supabase.
- Mengembalikan data job, produk, review, dan export.

## Komponen Database

Database menyimpan:

- `products` untuk data produk.
- `reviews` untuk data review.
- `scrape_jobs` untuk riwayat proses scraping.

Setiap row user-facing memiliki `owner_id`. Field ini dipakai untuk membatasi akses data agar user hanya melihat data miliknya sendiri.

## Data Flow

```mermaid
flowchart LR
    A[URL Produk] --> B[Frontend Validation]
    B --> C[Scraper API]
    C --> D[Playwright Scraper]
    D --> E[Parser and Cleaner]
    E --> F[Supabase Tables]
    F --> G[Dashboard]
    F --> H[Review Table]
    F --> I[CSV/JSON Export]
```

## Prinsip Desain

Prinsip arsitektur:

- Frontend tidak menjalankan Playwright.
- Backend bertanggung jawab untuk scraping dan database write.
- Semua request user-facing memakai Bearer token.
- `owner_id` tidak pernah diterima dari client.
- RLS digunakan untuk isolasi data.
- Scraping dibatasi untuk data publik yang relevan.


# API Design

## Base URL

Development:

```txt
http://localhost:4000
```

Production:

```txt
https://your-scraper-api-host.com
```

Frontend membaca base URL dari:

```txt
NEXT_PUBLIC_SCRAPER_API_URL
```

## Standard Response

Semua endpoint JSON memakai format standar:

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

## Authentication

Semua endpoint user-facing membutuhkan Supabase access token.

Header:

```txt
Authorization: Bearer <supabase_access_token>
```

API melakukan:

- Membaca token dari header.
- Verifikasi token melalui Supabase Auth.
- Mengambil `user.id`.
- Menyimpan `user.id` sebagai `owner_id` request.
- Menolak request tanpa token valid.

Endpoint publik:

- `GET /health`

Endpoint protected:

- `POST /scrape`
- `GET /jobs`
- `GET /jobs/:id`
- `GET /products`
- `GET /reviews`
- `GET /export/csv`
- `GET /export/json`

## POST /scrape

Membuat job scraping baru.

Request:

```json
{
  "sourceUrl": "https://reviews.femaledaily.com/products/...",
  "maxReviews": 50
}
```

Validasi:

- `sourceUrl` wajib HTTPS.
- Domain harus FemaleDaily/reviews FemaleDaily.
- Tidak boleh halaman profile, login, atau blocked/private path.
- `maxReviews` dinormalisasi 10 sampai 250 dalam step 10.

Response:

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "running",
    "requestedReviews": 50
  }
}
```

## GET /jobs

Mengambil daftar job milik user saat ini.

Response item:

```json
{
  "id": "uuid",
  "source_url": "https://...",
  "status": "success",
  "total_reviews": 40,
  "requested_reviews": 50,
  "stop_reason": "NO_MORE_REVIEWS",
  "started_at": "2026-05-23T10:00:00Z",
  "finished_at": "2026-05-23T10:02:00Z",
  "created_at": "2026-05-23T10:00:00Z"
}
```

## GET /jobs/:id

Mengambil detail job tertentu.

Aturan:

- Hanya boleh mengembalikan job dengan `owner_id` milik user saat ini.
- Dipakai frontend untuk polling status job.

## GET /products

Mengambil produk milik user.

Query:

```txt
search optional
page optional
limit optional
```

Data produk berisi total review per produk.

## GET /reviews

Mengambil review milik user.

Query:

```txt
search optional
product_id optional
rating optional
page optional
limit optional
```

Response item:

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "product_name": "Product Name",
  "brand_name": "Brand Name",
  "category": "Category",
  "rating": 5,
  "review_date": "12 May 2026",
  "review_text": "Isi review...",
  "source_url": "https://...",
  "scraped_at": "2026-05-23T10:00:00Z"
}
```

## GET /export/csv

Menghasilkan CSV dari review milik user.

Default filename:

```txt
femaledaily-reviews.csv
```

## GET /export/json

Menghasilkan JSON dari review milik user.

## Error Code

Kode error yang digunakan:

```txt
UNAUTHORIZED
INVALID_URL
PAGE_LOAD_TIMEOUT
NO_REVIEWS_FOUND
SCRAPER_FAILED
DATABASE_ERROR
DUPLICATE_SOURCE_URL
UNKNOWN_ERROR
```

## Prinsip API

- Jangan menerima `owner_id` dari body atau query.
- Semua query database harus filter `owner_id`.
- `GET /health` tidak perlu auth.
- Error harus jelas dan dapat ditampilkan frontend.
- Background job harus tetap membawa `owner_id` dari request awal.


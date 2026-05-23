# Feature Specification

## 1. Landing Page

Halaman `/` menjadi pintu masuk aplikasi. Halaman ini menampilkan brand Metrif Scraper, ringkasan fungsi aplikasi, dan tombol menuju dashboard.

Komponen:

- Logo Metrif Scraper.
- Wordmark/tagline.
- CTA menuju dashboard.
- Flow card singkat.

Tujuan:

- Memberi konteks aplikasi kepada user.
- Membuat aplikasi terasa siap dipakai, bukan hanya admin panel kosong.

## 2. App Shell

App shell adalah kerangka layout aplikasi setelah user masuk ke halaman utama seperti dashboard, scrape, products, reviews, dan export.

Komponen:

- Header sticky.
- Brand navigation.
- Top navigation.
- Auth state gate.
- hCaptcha verification state.
- Loading bar saat navigasi atau auth check.

State:

- `checking`
- `captcha`
- `authenticating`
- `ready`
- `failed`

## 3. Dashboard

Halaman `/dashboard` menampilkan ringkasan data milik anonymous user saat ini.

Data yang ditampilkan:

- Total produk.
- Total review.
- Scrape berhasil.
- Scrape gagal.
- Scrape terakhir.
- Riwayat job terbaru.
- Distribusi review per produk.

Behavior:

- Mengambil data dari API.
- Menampilkan skeleton saat loading.
- Menampilkan empty/error state jika request gagal.
- Memakai mock fallback hanya untuk development.

## 4. Scrape Product

Halaman `/scrape` digunakan untuk membuat job scraping baru.

Input:

- FemaleDaily product URL.
- Target review count.

Aturan target review:

- Minimum 10.
- Default 10.
- Maksimum 250.
- Step 10.
- Backend melakukan normalisasi ulang untuk keamanan.

Status job:

- `idle`
- `validating`
- `running`
- `success`
- `failed`

Output:

- Job ID.
- Status job.
- Total review terkumpul.
- Target review.
- Stop reason.
- Error message jika gagal.

## 5. Products

Halaman `/products` menampilkan produk yang pernah berhasil disimpan.

Data produk:

- Product name.
- Brand name.
- Category.
- Source URL.
- Total reviews.
- Created date.

Fitur:

- Search produk.
- Product card/table.
- Empty state.
- Skeleton loading.

## 6. Reviews

Halaman `/reviews` menampilkan data review yang sudah tersimpan.

Kolom:

- Product.
- Brand.
- Rating.
- Review date.
- Review text.
- Source URL.

Fitur:

- Search review text.
- Filter by product.
- Filter by rating.
- Pagination.
- Empty state.
- Skeleton table.

## 7. Export

Halaman `/export` digunakan untuk menyiapkan dataset sebelum download.

Fitur:

- Search filter.
- Product filter.
- Rating filter.
- Row limit.
- Field selection.
- Export CSV.
- Export JSON.

Default export fields:

```txt
product_name
brand_name
category
rating
review_date
review_text
source_url
scraped_at
```

## 8. Recent Jobs

Recent jobs menampilkan riwayat scraping terbaru.

Data:

- Source URL.
- Status.
- Total review.
- Requested review.
- Stop reason.
- Started/finished date.

Tujuan:

- User dapat memantau apakah proses scraping berhasil.
- User dapat memahami kenapa scraping berhenti.

## 9. Error Handling

Error yang perlu ditampilkan jelas:

- URL tidak valid.
- Anonymous Auth gagal.
- hCaptcha belum dikonfigurasi.
- API belum tersedia.
- Token expired.
- Scraper gagal membaca halaman.
- Review tidak ditemukan.
- Database error.


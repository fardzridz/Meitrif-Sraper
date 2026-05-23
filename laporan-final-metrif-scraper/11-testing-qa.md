# Testing and QA

## Tujuan QA

QA memastikan aplikasi dapat digunakan sesuai tujuan, tidak memiliki error utama, dan aman untuk demo atau serah terima.

## Area Pengujian

Area yang perlu diuji:

- Frontend UI.
- Authentication flow.
- Scrape form.
- Scraper backend.
- Database write/read.
- Review filter.
- Export.
- Responsive layout.
- Error handling.

## Frontend Test Checklist

| Test | Expected Result | Status |
|---|---|---|
| Buka landing page | Logo, copy, dan CTA tampil | Pending |
| Klik CTA dashboard | User masuk ke app shell | Pending |
| Session belum ada | hCaptcha tampil | Pending |
| hCaptcha sukses | Anonymous session dibuat | Pending |
| Navigasi topbar | Semua halaman dapat dibuka | Pending |
| Loading state | Skeleton/loading bar tampil | Pending |
| Empty state | Pesan kosong tampil saat data belum ada | Pending |
| Error state | Error mudah dipahami | Pending |
| Mobile viewport | Tidak ada horizontal overflow | Pending |

## Scrape Flow Test

| Test | Expected Result | Status |
|---|---|---|
| URL kosong | Validasi error tampil | Pending |
| URL non-FemaleDaily | Ditolak | Pending |
| URL valid + target 10 | Job dibuat | Pending |
| Target di bawah 10 | Dinormalisasi ke 10 | Pending |
| Target di atas 250 | Dinormalisasi ke 250 | Pending |
| Job running | Status dan progress tampil | Pending |
| Job success | Total review dan stop reason tampil | Pending |
| Job failed | Error message tampil | Pending |

## API Test Checklist

| Endpoint | Test | Expected Result |
|---|---|---|
| `GET /health` | Tanpa token | Berhasil |
| `POST /scrape` | Tanpa token | 401 |
| `POST /scrape` | Token valid | Job dibuat |
| `GET /jobs` | Token valid | Data scoped by owner |
| `GET /jobs/:id` | ID milik user | Data tampil |
| `GET /products` | Search | Produk terfilter |
| `GET /reviews` | Search/filter | Review terfilter |
| `GET /export/csv` | Token valid | CSV download |
| `GET /export/json` | Token valid | JSON response |

## Database Test Checklist

| Test | Expected Result |
|---|---|
| Insert product dengan owner_id | Berhasil |
| Product duplicate source URL pada owner sama | Upsert, bukan duplicate liar |
| Product source URL sama pada owner beda | Boleh |
| Review tanpa owner_id | Tidak digunakan oleh API |
| Query review user A | Tidak menampilkan data user B |
| RLS aktif | Policy berlaku untuk anon/authenticated client |

## Export Test

Yang diuji:

- Export semua field.
- Export sebagian field.
- Export hasil filter product.
- Export hasil filter rating.
- Export hasil search.
- Row limit bekerja.
- CSV escaping quote bekerja.
- JSON valid.

## Responsive Test

Viewport yang disarankan:

```txt
375x667
390x844
768x1024
1024x768
1366x768
1440x900
```

Yang dicek:

- Tidak ada overflow horizontal.
- Card tidak saling menumpuk.
- Teks button tidak keluar.
- Table bisa diakses di mobile.
- Navigation tetap dapat dipakai.

## Regression Risk

Area yang paling berisiko:

- Perubahan struktur HTML FemaleDaily.
- Playwright dependency saat deployment.
- Token/session expired.
- hCaptcha configuration.
- RLS owner filtering.
- Duplicate review handling.

## QA Recommendation

Sebelum demo:

1. Jalankan frontend dan backend lokal.
2. Pastikan Supabase env valid.
3. Test scraping target 10 terlebih dahulu.
4. Cek review masuk ke database.
5. Test export CSV dan JSON.
6. Cek mobile viewport.
7. Simpan screenshot hasil utama untuk dokumentasi.


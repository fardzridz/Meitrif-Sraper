# Frontend Design

## Stack Frontend

Frontend menggunakan:

- Next.js 15.
- React 19.
- TypeScript.
- Tailwind CSS.
- Framer Motion.
- Lucide React.
- Supabase JS client.
- hCaptcha React.
- Custom UI components.

## Struktur Frontend

Struktur utama:

```txt
frontend/
  app/
    dashboard/
    scrape/
    products/
    reviews/
    export/
    page.tsx
    layout.tsx
    globals.css
  components/
    ui/
    app-shell.tsx
    page-header.tsx
    recent-jobs.tsx
  lib/
    api.ts
    supabase.ts
    types.ts
    utils.ts
    mock-data.ts
  public/
    brand/
```

## Design Direction

UI memakai gaya Soft UI Evolution:

- Clean.
- Ringan.
- Modern.
- Profesional.
- Tidak terlalu ramai.
- Dominan putih dengan aksen hijau.
- Fokus pada readability dan workflow.

Primary color:

```css
#3BE6A6
```

## Layout

Layout memakai:

- Sticky top header.
- Top navigation horizontal.
- Max width container.
- Responsive padding.
- Grid layout untuk dashboard dan form.
- Horizontal scroll navigation pada mobile jika diperlukan.

## Komponen UI

Komponen utama:

- `Button`
- `Card`
- `Input`
- `Badge`
- `Skeleton`
- `EmptyState`
- `PageHeader`
- `RecentJobs`
- `AppShell`

## AppShell

`AppShell` bertugas:

- Menentukan apakah halaman saat ini landing page.
- Menampilkan brand Metrif Scraper.
- Menampilkan navigation.
- Mengecek Supabase anonymous session.
- Menampilkan hCaptcha jika session belum ada.
- Menampilkan loading indicator saat auth atau navigasi.
- Memblokir halaman aplikasi jika auth belum siap.

## API Client

File `frontend/lib/api.ts` bertugas:

- Membaca `NEXT_PUBLIC_SCRAPER_API_URL`.
- Mengambil access token.
- Mengirim request dengan `Authorization`.
- Melakukan refresh session jika response `401`.
- Menyediakan mock fallback di development.

Function utama:

- `getDashboardSummary`
- `getJobs`
- `getJob`
- `getProducts`
- `getReviews`
- `startScrape`

## Supabase Client

File `frontend/lib/supabase.ts` bertugas:

- Membuat Supabase browser client.
- Mengecek session.
- Membuat anonymous session dengan captcha token.
- Refresh session.
- Mengambil access token.

## Halaman

### /

Landing entry page untuk memperkenalkan aplikasi dan mengarahkan user ke dashboard.

### /dashboard

Menampilkan summary cards, recent jobs, dan distribusi review.

### /scrape

Form scraping URL dan target review, status job aktif, dan riwayat job.

### /products

Daftar produk yang sudah tersimpan.

### /reviews

Tabel review dengan filter dan pagination.

### /export

Filter dataset, pilih field, lalu download CSV/JSON.

## UI State

Setiap halaman penting harus menangani:

- Loading.
- Empty.
- Error.
- Success.
- Disabled state saat request berjalan.
- Responsive mobile state.

## Accessibility

Aturan accessibility:

- Input memiliki label.
- Button memakai teks yang jelas.
- Icon diberi `aria-hidden` jika dekoratif.
- Focus ring terlihat.
- Warna teks harus kontras dengan background.


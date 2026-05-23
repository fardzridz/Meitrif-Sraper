# FemaleDaily Review Scraper Frontend

Next.js dashboard frontend untuk input URL produk FemaleDaily, monitoring job, melihat produk/review, dan ekspor dataset.

## Run

```bash
npm install
npm run dev
```

Default scraper API:

```txt
NEXT_PUBLIC_SCRAPER_API_URL=http://localhost:4000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your-hcaptcha-site-key
```

Frontend meminta hCaptcha saat perlu membuat Supabase Anonymous Auth session baru, lalu mengirim access token ke Scraper API.
Jika API belum berjalan, development mode masih bisa memakai mock data agar UI tetap bisa dikembangkan.

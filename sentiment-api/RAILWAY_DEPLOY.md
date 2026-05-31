# Deploy Sentiment API ke Railway

Repo ini adalah **monorepo** (frontend + sentiment-api + supabase dalam 1 repo).
Supaya Railway hanya men-deploy folder `sentiment-api`, ikuti langkah berikut.

## Langkah 1 — Set Root Directory (PALING PENTING)

Di Railway dashboard:

1. Buka service kamu → tab **Settings**
2. Cari bagian **Source** / **Build**
3. Set **Root Directory** = `sentiment-api`
4. Save

Ini bikin Railway hanya melihat isi folder `sentiment-api/`, jadi dia akan
otomatis pakai `Dockerfile` dan `railway.json` di dalamnya. Folder `frontend/`
dan `supabase/` diabaikan total.

## Langkah 2 — Pastikan Builder = Dockerfile

`railway.json` sudah mengatur ini otomatis (builder: DOCKERFILE). Tidak perlu
setting manual. Railway akan build dari `sentiment-api/Dockerfile`.

## Langkah 3 — Set Environment Variables

Di tab **Variables**, tambahkan:

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
DEFAULT_MODEL=indobert
```

Catatan:
- **JANGAN** set `PORT` manual. Railway inject `$PORT` otomatis, dan Dockerfile
  sudah membacanya.
- `SUPABASE_SERVICE_ROLE_KEY` ada di Supabase → Project Settings → API →
  `service_role` secret. Ini key rahasia, jangan commit ke Git.
- `REDIS_URL` tidak wajib (Celery belum dipakai, processing jalan inline).

## Langkah 4 — Healthcheck

`railway.json` sudah set healthcheck ke `/health`. Setelah deploy, Railway akan
ping endpoint itu. Kalau dapat 200 OK, service dianggap healthy.

## Langkah 5 — Generate Domain

Setelah deploy sukses:
1. Tab **Settings** → **Networking** → **Generate Domain**
2. Kamu dapat URL seperti `https://sentiment-api-production-xxxx.up.railway.app`
3. Copy URL itu — nanti dipakai di frontend sebagai `NEXT_PUBLIC_SENTIMENT_API_URL`

## Langkah 6 — Test

Buka di browser:
```
https://your-railway-url.up.railway.app/health
```

Harus muncul:
```json
{ "success": true, "data": { "status": "healthy", "version": "0.1.0" } }
```

Lalu cek daftar model:
```
https://your-railway-url.up.railway.app/models
```

Dokumentasi API interaktif (Swagger):
```
https://your-railway-url.up.railway.app/docs
```

## Catatan soal Model

`Dockerfile` saat ini meng-install `requirements-ml.txt` (torch + transformers)
dan men-download IndoBERT saat build, jadi **default-nya pakai IndoBERT asli**.

Cara memastikan IndoBERT benar-benar aktif (bukan diam-diam fallback ke lexicon):
cek log startup/analisis di Railway console.
- `IndoBERT model loaded: ...` → model asli aktif. ✅
- `IndoBERT unavailable (...). Falling back to lexicon analyzer.` → yang jalan
  cuma lexicon berbasis aturan, akurasi lebih rendah. ⚠️

Selain itu, halaman hasil di frontend akan menampilkan peringatan kuning kalau
analisis ternyata dijalankan dengan lexicon fallback (`is_fallback: true` di
`summary`), jadi hasil lexicon tidak akan tersamar sebagai IndoBERT.

Kalau mau hemat resource (tanpa torch/transformers), ganti baris install di
`Dockerfile` agar hanya pakai core requirements:

```dockerfile
RUN pip install --no-cache-dir -r requirements.txt
```

Konsekuensinya analisis akan jalan dengan lexicon fallback. Torch + transformers
butuh ~1GB+, jadi pastikan plan Railway punya RAM/disk yang cukup untuk IndoBERT
asli.

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Build lama / out of memory | Pastikan pakai `requirements.txt` (core), bukan `requirements-ml.txt` |
| Healthcheck failed | Pastikan TIDAK set PORT manual di Variables |
| Railway build seluruh repo | Pastikan Root Directory = `sentiment-api` |
| 401 saat call API | Frontend belum kirim Supabase token, atau SUPABASE_URL salah |
| CORS error di browser | Tambahkan domain frontend ke `CORS_ORIGINS` |

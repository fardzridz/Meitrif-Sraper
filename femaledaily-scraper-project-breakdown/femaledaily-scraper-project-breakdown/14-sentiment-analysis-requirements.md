# Sentiment Analysis — Product Requirements

## 1. Product Name

Metrif Sentiment Analyzer

## 2. Purpose

Platform analisis sentimen profesional berbahasa Indonesia yang terintegrasi dengan Metrif Scraper. Menganalisis review produk menggunakan berbagai model NLP (lokal maupun API pihak ketiga) dan menyajikan insight visual lengkap layaknya data analyst profesional.

## 3. Target Users

- Data Analyst
- Researcher
- Marketing Team
- Student (tugas analisis sentimen)
- Product Manager

## 4. Arsitektur

```
Next.js Frontend (existing)
    ├── Landing Page → pilih Scraper atau Sentiment
    ├── /scraper/* → call Scraper API (existing)
    ├── /sentiment/* → call Sentiment API (baru, terpisah)
    └── Supabase (shared DB + Auth)
```

Sentiment API adalah backend terpisah (Python FastAPI) yang berkomunikasi dengan Supabase yang sama.

## 5. Input Data (Sumber Teks)

### 5.1 Dari Hasil Scraping
- Pilih produk/brand dari database Supabase
- Filter by rating, date range
- Ambil review_text untuk dianalisis

### 5.2 Upload File
- Format: CSV, Excel (.xlsx)
- Kolom wajib: minimal satu kolom berisi teks
- User mapping kolom saat upload
- Maksimum: 5000 baris per upload

### 5.3 Input Manual
- Textarea untuk input teks langsung
- Bisa multiple teks (pisah per baris atau per paragraf)
- Cocok untuk quick test / demo

### 5.4 Input URL
- User masukkan URL (artikel, review page)
- Backend scrape teks dari URL tersebut
- Lalu langsung analisis

## 6. Model Analisis (User Pilih Sendiri)

### 6.1 IndoBERT (Lokal — Gratis)
- Model: `indobenchmark/indobert-base-p1` atau fine-tuned variant
- Jalan di server Sentiment API
- Tidak butuh API key
- Cocok untuk Bahasa Indonesia

### 6.2 OpenAI GPT (API — Butuh API Key)
- User input API key sendiri di settings
- API key disimpan encrypted di Supabase (per user)
- Model: GPT-4o-mini atau GPT-4o
- Akurasi tinggi, tapi berbayar per request

### 6.3 Google Cloud NLP (API — Butuh API Key)
- User input service account key
- Pakai Google Natural Language API
- Support multi-bahasa

### 6.4 TextBlob / VADER (Lokal — Gratis, English-focused)
- Fallback ringan untuk teks English
- Tidak butuh GPU

## 7. Jenis Analisis

### 7.1 Sentiment Polarity
- Label: Positif / Negatif / Netral
- Confidence score: 0-100%
- Per review/teks

### 7.2 Emotion Detection
- Label: Joy, Anger, Sadness, Fear, Surprise, Disgust
- Skor per emosi
- Dominant emotion

### 7.3 Aspect-Based Sentiment Analysis (ABSA)
- Ekstrak aspek dari teks (harga, kualitas, pengiriman, dll)
- Sentiment per aspek
- Contoh: "Produknya bagus tapi harganya mahal"
  - Produk/Kualitas → Positif (92%)
  - Harga → Negatif (85%)

### 7.4 Keyword Extraction
- Top keywords/phrases dari seluruh dataset
- Frekuensi kemunculan
- TF-IDF scoring
- Word cloud generation

### 7.5 Topic Modeling
- Grupkan review ke topik-topik otomatis
- Jumlah topik bisa di-set user (3-10)
- Label topik otomatis dari top keywords

## 8. Real-Time Process Log

Setiap analisis menampilkan progress real-time (mirip scrape-terminal):

```
✅ [10:32:01] Memuat 150 review dari database...
✅ [10:32:03] 150 review berhasil dimuat
✅ [10:32:03] Model dipilih: IndoBERT
✅ [10:32:04] Memuat model IndoBERT...
✅ [10:32:08] Model siap
⏳ [10:32:08] Menganalisis sentiment... (45/150)
   ░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓ 30%
📊 Preview sementara: Positif: 23 | Negatif: 15 | Netral: 7
✅ [10:32:45] Analisis selesai! 150/150 review diproses.
✅ [10:32:46] Menyimpan hasil ke database...
✅ [10:32:47] Selesai! Redirecting ke dashboard...
```

Implementasi: WebSocket atau Server-Sent Events (SSE) dari Sentiment API ke Frontend.

## 9. Dashboard & Visualisasi

### 9.1 Overview Cards
- Total teks dianalisis
- Distribusi sentiment (% positif/negatif/netral)
- Dominant emotion
- Model yang digunakan
- Waktu analisis

### 9.2 Charts
- **Pie Chart** — Distribusi sentiment (positif/negatif/netral)
- **Bar Chart** — Emotion breakdown (joy, anger, sadness, dll)
- **Line Chart** — Tren sentiment over time (jika data punya timestamp)
- **Radar Chart** — Aspect-based sentiment per aspek
- **Word Cloud** — Visualisasi keyword
- **Heatmap** — Korelasi aspek vs sentiment

### 9.3 Tabel Detail
- Setiap review + label sentiment + confidence score
- Sortable, filterable, searchable
- Highlight warna per sentiment (hijau/merah/abu)
- Expandable row untuk lihat detail aspek

### 9.4 Auto-Generated Insight
- Summary teks otomatis, contoh:
  - "70% review positif. Keluhan utama di aspek pengiriman (45% negatif)."
  - "Emosi dominan: Joy (38%), diikuti Anger (22%) terkait harga."
  - "Keyword paling sering: 'bagus', 'lama', 'murah', 'rusak'"

## 10. Batch Processing

- Upload ratusan/ribuan teks sekaligus
- Queue system dengan progress bar
- Estimasi waktu tersisa
- Bisa cancel mid-process
- Hasil partial tetap tersimpan jika cancel

## 11. Export & Report

### 11.1 Export Data
- CSV dengan kolom: teks, sentiment, confidence, emotion, aspects
- Excel (.xlsx) dengan formatting
- JSON structured

### 11.2 PDF Report
- Auto-generated report dengan:
  - Executive summary
  - Charts (embedded)
  - Tabel top findings
  - Methodology (model yang dipakai)
  - Timestamp

## 12. History & Saved Analysis

- List semua analisis sebelumnya
- Detail per analisis (bisa dibuka ulang)
- Compare antar analisis (side-by-side)
- Delete analisis
- Re-run dengan model berbeda

## 13. Settings

- Manage API keys (OpenAI, Google)
- Default model preference
- Default jumlah topik
- Bahasa default (Indonesia)

## 14. Success Criteria

Fitur dianggap berhasil jika:

1. User bisa memilih sumber data (scraping/upload/manual/URL)
2. User bisa memilih model analisis
3. Proses analisis menampilkan progress real-time
4. Hasil ditampilkan dalam dashboard visual yang profesional
5. User bisa export hasil ke CSV/Excel/PDF
6. History analisis tersimpan dan bisa dibuka ulang
7. Aspect-based sentiment berfungsi untuk Bahasa Indonesia
8. UI responsif dan polished

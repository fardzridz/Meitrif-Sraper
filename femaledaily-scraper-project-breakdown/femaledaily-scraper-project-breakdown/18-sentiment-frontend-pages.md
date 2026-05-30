# Sentiment Analysis — Frontend Pages

## 1. Landing Page Update (/)

Landing page diubah menjadi hub untuk memilih produk:

```
┌─────────────────────────────────────────────────────┐
│              METRIF PLATFORM                         │
│                                                     │
│   "Data-driven insights dari review produk"         │
│                                                     │
│   ┌─────────────────┐  ┌─────────────────────┐    │
│   │  🔍 SCRAPER     │  │  📊 SENTIMENT       │    │
│   │                 │  │     ANALYSIS         │    │
│   │  Kumpulkan      │  │                     │    │
│   │  review dari    │  │  Analisis sentimen  │    │
│   │  FemaleDaily    │  │  profesional dengan │    │
│   │                 │  │  AI & visualisasi   │    │
│   │                 │  │                     │    │
│   │  [Mulai →]      │  │  [Mulai →]          │    │
│   └─────────────────┘  └─────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 2. /sentiment (Sentiment Home/Dashboard)

Purpose: Overview semua analisis dan quick stats.

Components:
- Summary cards (total analisis, rata-rata sentiment, model favorit)
- Recent analyses list
- Quick action buttons (New Analysis, Upload Data)
- Empty state jika belum ada analisis

Cards:
```
Total Analisis
Rata-rata Positif %
Model Paling Sering
Analisis Terakhir
```

## 3. /sentiment/new (New Analysis)

Purpose: Wizard untuk membuat analisis baru.

### Step 1: Pilih Sumber Data
```
┌─ Pilih Sumber Data ─────────────────────────────────┐
│                                                      │
│  ○ 📦 Dari Hasil Scraping                          │
│    Analisis review yang sudah di-scrape              │
│                                                      │
│  ○ 📄 Upload File (CSV/Excel)                      │
│    Upload dataset sendiri                            │
│                                                      │
│  ○ ✏️ Input Manual                                  │
│    Ketik teks langsung                              │
│                                                      │
│  ○ 🔗 Dari URL                                     │
│    Scrape & analisis dari URL                       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Step 2: Konfigurasi Sumber

**Jika Scraping:**
- Pilih produk (multi-select dari list produk user)
- Filter date range (optional)
- Filter rating (optional)
- Preview: "150 review akan dianalisis"

**Jika Upload:**
- Drag & drop area untuk file
- Setelah upload: tampilkan kolom-kolom
- User pilih kolom mana yang berisi teks
- Preview: "500 baris akan dianalisis"

**Jika Manual:**
- Textarea besar
- Instruksi: "Satu teks per baris, atau pisahkan dengan baris kosong"
- Counter: "3 teks terdeteksi"

**Jika URL:**
- Input URL
- Optional: CSS selector untuk target elemen

### Step 3: Pilih Model & Analisis
```
┌─ Konfigurasi Analisis ──────────────────────────────┐
│                                                      │
│  Model:                                             │
│  ┌──────────────────────────────────────────┐       │
│  │ ▼ IndoBERT (Lokal - Gratis)              │       │
│  │   OpenAI GPT-4o Mini (API Key required)  │       │
│  │   Google Cloud NLP (API Key required)    │       │
│  └──────────────────────────────────────────┘       │
│                                                      │
│  Jenis Analisis:                                    │
│  ☑ Sentiment Polarity                               │
│  ☑ Emotion Detection                                │
│  ☑ Aspect-Based Sentiment                           │
│  ☑ Keyword Extraction                               │
│  ☑ Topic Modeling (Jumlah topik: [5])               │
│                                                      │
│  Judul Analisis:                                    │
│  [Analisis Review Skincare Mei 2026        ]        │
│                                                      │
│  [← Kembali]              [🚀 Mulai Analisis]      │
└──────────────────────────────────────────────────────┘
```

### Step 4: Processing (Real-Time Log)
```
┌─ Analysis Progress ─────────────────────────────────┐
│                                                      │
│  ✅ [10:32:01] Memuat 150 review dari database...   │
│  ✅ [10:32:03] 150 review berhasil dimuat           │
│  ✅ [10:32:03] Model dipilih: IndoBERT              │
│  ✅ [10:32:04] Memuat model IndoBERT...             │
│  ✅ [10:32:08] Model siap                           │
│  ⏳ [10:32:08] Menganalisis sentiment... (45/150)   │
│     ░░░░░░░░░░░░░▓▓▓▓▓▓▓▓▓▓ 30%                   │
│                                                      │
│  📊 Preview sementara:                              │
│     Positif: 23 | Negatif: 15 | Netral: 7          │
│                                                      │
│  [Cancel Analysis]                                   │
└──────────────────────────────────────────────────────┘
```

Setelah selesai → auto redirect ke `/sentiment/results/{id}`

## 4. /sentiment/results/{id} (Analysis Results Dashboard)

Purpose: Tampilkan hasil analisis lengkap dengan visualisasi profesional.

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back    "Analisis Review Skincare Mei 2026"    [Export ▼]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│  │ 150     │ │ 70%     │ │ Joy     │ │ IndoBERT        │ │
│  │ Total   │ │ Positif │ │ Dominan │ │ Model           │ │
│  │ Teks    │ │         │ │ Emosi   │ │                 │ │
│  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
│                                                             │
│  ┌─── Auto Insight ───────────────────────────────────────┐│
│  │ 💡 70% review positif. Aspek kualitas mendominasi      ││
│  │ sentimen positif (89%). Keluhan utama terkait          ││
│  │ pengiriman (63% negatif) dan harga (60% negatif).      ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  [Sentiment] [Emotions] [Aspects] [Keywords] [Topics]      │
│                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐  │
│  │     PIE CHART           │ │    BAR CHART            │  │
│  │   Sentiment Dist.       │ │   Emotion Breakdown     │  │
│  │                         │ │                         │  │
│  │   🟢 70% Positif       │ │   Joy ████████ 38%     │  │
│  │   🔴 20% Negatif       │ │   Anger ████ 22%       │  │
│  │   ⚪ 10% Netral        │ │   Sadness ███ 15%      │  │
│  └─────────────────────────┘ └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐  │
│  │     RADAR CHART         │ │    WORD CLOUD           │  │
│  │   Aspect Sentiment      │ │                         │  │
│  │                         │ │   bagus  murah          │  │
│  │      Kualitas           │ │     lama   recommended  │  │
│  │    /        \           │ │   kecewa    cepat       │  │
│  │  Harga --- Pengiriman   │ │                         │  │
│  └─────────────────────────┘ └─────────────────────────┘  │
│                                                             │
│  ┌─── Detail Table ───────────────────────────────────────┐│
│  │ Search: [________] Filter: [All ▼] Sort: [Score ▼]    ││
│  │                                                        ││
│  │ # │ Teks              │ Sentiment │ Score │ Emotion   ││
│  │ 1 │ Produknya bagus.. │ 🟢 Pos   │ 95%   │ Joy      ││
│  │ 2 │ Pengiriman lama.. │ 🔴 Neg   │ 88%   │ Anger    ││
│  │ 3 │ Biasa aja sih..   │ ⚪ Net   │ 72%   │ -        ││
│  │                                                        ││
│  │ [< 1 2 3 >]                                           ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tab: Sentiment
- Pie chart distribusi
- Line chart tren (jika ada timestamp)
- Confidence score distribution histogram

### Tab: Emotions
- Bar chart per emosi
- Emotion over time (jika ada timestamp)
- Top texts per emotion

### Tab: Aspects
- Radar chart semua aspek
- Stacked bar chart (positif vs negatif per aspek)
- Tabel aspek detail

### Tab: Keywords
- Word cloud interaktif
- Top 20 keywords table dengan frekuensi
- TF-IDF scores

### Tab: Topics
- Topic cards dengan top keywords per topik
- Distribusi teks per topik (bar chart)
- Sample texts per topik

## 5. /sentiment/history (Analysis History)

Purpose: List semua analisis sebelumnya.

Components:
- Search & filter (by status, model, date)
- Analysis cards/table
- Actions: View, Re-run, Delete, Compare
- Pagination

```
┌─────────────────────────────────────────────────────────┐
│  Riwayat Analisis                    [+ New Analysis]   │
├─────────────────────────────────────────────────────────┤
│  Search: [________]  Status: [All ▼]  Model: [All ▼]   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 Analisis Review Skincare Mei 2026            │   │
│  │ IndoBERT · 150 teks · Completed                 │   │
│  │ 70% Positif · 29 Mei 2026                       │   │
│  │ [View] [Re-run] [Delete]                        │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📊 Analisis Upload Dataset Q1                   │   │
│  │ OpenAI GPT-4o · 500 teks · Completed            │   │
│  │ 55% Positif · 15 Mei 2026                       │   │
│  │ [View] [Re-run] [Delete]                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 6. /sentiment/compare (Compare Analyses)

Purpose: Bandingkan 2 analisis side-by-side.

Components:
- Pilih 2 analisis dari dropdown
- Side-by-side charts
- Diff table (perubahan sentiment distribution)
- Insight perbandingan otomatis

## 7. /sentiment/settings (Settings)

Purpose: Manage API keys dan preferences.

Components:
- API Key management (OpenAI, Google)
  - Input field (masked)
  - Test connection button
  - Status indicator (active/inactive)
- Default preferences
  - Default model
  - Default analysis types
  - Default topic count

```
┌─ API Keys ──────────────────────────────────────────┐
│                                                      │
│  OpenAI:                                            │
│  [sk-...............a3Bf]  ✅ Active  [Test] [🗑️]  │
│                                                      │
│  Google Cloud:                                      │
│  [Belum di-set]                       [+ Add Key]   │
│                                                      │
├─ Preferences ───────────────────────────────────────┤
│                                                      │
│  Default Model: [IndoBERT ▼]                        │
│  Default Topics: [5]                                │
│  Auto-include: ☑ Sentiment ☑ Emotion ☐ Aspect      │
│                                                      │
│  [Save Preferences]                                  │
└──────────────────────────────────────────────────────┘
```

## 8. Navigation Update

Existing nav (Scraper):
```
Dashboard | Scrape | Produk | Review | Ekspor
```

New nav structure — dua mode terpisah berdasarkan produk yang dipilih di landing page:

**Scraper mode** (existing, tidak berubah):
```
Dashboard | Scrape | Produk | Review | Ekspor
```

**Sentiment mode** (new):
```
Overview | New Analysis | History | Compare | Settings
```

Switching antar mode via landing page atau toggle di header.

## 9. Shared Components (Reusable)

| Component | Used In | Notes |
|-----------|---------|-------|
| ScrapeTerminal → AnalysisTerminal | /sentiment/new | Reuse pattern, rename generic |
| Card | Everywhere | Existing |
| Badge | Status indicators | Existing |
| Button | Actions | Existing |
| Input | Forms | Existing |
| Skeleton | Loading states | Existing |
| EmptyState | No data | Existing |
| PageHeader | All pages | Existing |

## 10. New Components Needed

| Component | Purpose |
|-----------|---------|
| SentimentPieChart | Pie chart distribusi sentiment |
| EmotionBarChart | Bar chart emosi |
| AspectRadarChart | Radar chart aspek |
| WordCloud | Visualisasi keyword |
| TopicCards | Cards per topik |
| TrendLineChart | Line chart over time |
| AnalysisTerminal | Real-time log (based on ScrapeTerminal) |
| InsightCard | Auto-generated insight display |
| ModelSelector | Dropdown pilih model |
| SourceWizard | Multi-step source selection |
| FileUploader | Drag & drop file upload |
| CompareView | Side-by-side comparison |
| ApiKeyManager | API key CRUD |

## 11. Chart Library

Recommended: **Recharts** (React-native, lightweight, good with Next.js)
- Sudah support: PieChart, BarChart, LineChart, RadarChart
- Responsive & animated
- Tailwind-friendly

Alternative: Chart.js via react-chartjs-2

Word Cloud: `react-wordcloud` atau custom SVG implementation.

## 12. Responsive Design

- Desktop: 2-column grid untuk charts, full-width table
- Tablet: Stack charts vertically, scrollable table
- Mobile: Single column, swipeable tabs, compact cards

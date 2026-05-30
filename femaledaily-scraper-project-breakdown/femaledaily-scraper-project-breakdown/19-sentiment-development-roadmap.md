# Sentiment Analysis — Development Roadmap

## Phase 1: Foundation (Week 1-2)

### 1.1 Backend Setup
- [ ] Inisialisasi project Python FastAPI
- [ ] Setup virtual environment & dependencies (requirements.txt)
- [ ] Konfigurasi Supabase connection (supabase-py)
- [ ] Implementasi JWT token verification (sama seperti Scraper API)
- [ ] Setup CORS untuk frontend
- [ ] Buat endpoint health check: `GET /health`
- [ ] Setup Docker untuk development

### 1.2 Database Migration
- [ ] Buat migration `004_sentiment_analysis_tables.sql`
- [ ] Buat tabel: `uploaded_datasets`
- [ ] Buat tabel: `sentiment_analyses`
- [ ] Buat tabel: `sentiment_results`
- [ ] Buat tabel: `user_api_keys`
- [ ] Setup RLS policies untuk semua tabel baru
- [ ] Test RLS policies

### 1.3 Frontend Foundation
- [ ] Update landing page (/) — hub dengan 2 pilihan produk
- [ ] Buat route group `/sentiment/*`
- [ ] Buat navigation untuk sentiment mode
- [ ] Setup environment variable `NEXT_PUBLIC_SENTIMENT_API_URL`
- [ ] Buat `lib/sentiment-api.ts` (API client untuk Sentiment API)
- [ ] Buat types di `lib/sentiment-types.ts`
- [ ] Install Recharts untuk charting

---

## Phase 2: Core Analysis Engine (Week 2-3)

### 2.1 IndoBERT Integration
- [ ] Download & setup IndoBERT model
- [ ] Implementasi sentiment classification (positif/negatif/netral)
- [ ] Implementasi confidence scoring
- [ ] Implementasi emotion detection
- [ ] Benchmark: test akurasi dengan sample data Indonesia
- [ ] Optimize batch processing (GPU jika tersedia, CPU fallback)

### 2.2 Analysis Pipeline
- [ ] Implementasi `POST /analyze` endpoint
- [ ] Implementasi source handler: scraping (query dari Supabase)
- [ ] Implementasi source handler: manual (teks langsung)
- [ ] Implementasi source handler: upload (parse CSV/Excel)
- [ ] Implementasi source handler: URL (scrape teks)
- [ ] Implementasi job queue (Celery + Redis)
- [ ] Implementasi progress tracking
- [ ] Implementasi SSE streaming (`GET /analysis/{id}/stream`)

### 2.3 Results Storage
- [ ] Simpan hasil per-teks ke `sentiment_results`
- [ ] Generate summary JSON
- [ ] Update analysis status lifecycle (queued → loading → processing → completed)
- [ ] Handle error & cancelled states

---

## Phase 3: Advanced NLP Features (Week 3-4)

### 3.1 Aspect-Based Sentiment
- [ ] Implementasi aspect extraction (spaCy / custom rules)
- [ ] Sentiment per aspek
- [ ] Mapping aspek umum (harga, kualitas, pengiriman, pelayanan, dll)
- [ ] Test dengan review Bahasa Indonesia

### 3.2 Keyword Extraction
- [ ] Implementasi KeyBERT / YAKE untuk keyword extraction
- [ ] TF-IDF scoring
- [ ] Top-N keywords per analisis
- [ ] Keyword frequency counting

### 3.3 Topic Modeling
- [ ] Implementasi BERTopic / LDA
- [ ] Auto-label topik dari top keywords
- [ ] Configurable topic count (3-10)
- [ ] Assign setiap teks ke topik

### 3.4 External Model Integration
- [ ] Implementasi OpenAI adapter (GPT-4o-mini)
- [ ] Implementasi Google Cloud NLP adapter
- [ ] API key encryption & storage
- [ ] `POST /api-keys` endpoint
- [ ] `GET /api-keys` endpoint
- [ ] `DELETE /api-keys/{provider}` endpoint
- [ ] `GET /models` endpoint

---

## Phase 4: Frontend — Analysis Flow (Week 4-5)

### 4.1 New Analysis Wizard
- [ ] `/sentiment/new` — Step 1: Source selection UI
- [ ] Step 2a: Scraping source — product picker + filters
- [ ] Step 2b: Upload source — drag & drop + column mapping
- [ ] Step 2c: Manual source — textarea + counter
- [ ] Step 2d: URL source — input + selector
- [ ] Step 3: Model & analysis type selection
- [ ] Step 4: Processing view with real-time terminal
- [ ] AnalysisTerminal component (based on ScrapeTerminal)
- [ ] Cancel analysis button
- [ ] Auto-redirect on completion

### 4.2 Results Dashboard
- [ ] `/sentiment/results/{id}` — Overview cards
- [ ] Auto-generated insight card
- [ ] Tab: Sentiment — PieChart + distribution
- [ ] Tab: Emotions — BarChart
- [ ] Tab: Aspects — RadarChart + stacked bar
- [ ] Tab: Keywords — WordCloud + table
- [ ] Tab: Topics — TopicCards + distribution
- [ ] Detail table with pagination, search, filter
- [ ] Expandable rows untuk detail aspek

### 4.3 Charts & Visualisasi
- [ ] SentimentPieChart component
- [ ] EmotionBarChart component
- [ ] AspectRadarChart component
- [ ] TrendLineChart component
- [ ] WordCloud component
- [ ] TopicCards component

---

## Phase 5: Frontend — Management (Week 5-6)

### 5.1 Sentiment Home
- [ ] `/sentiment` — Overview dashboard
- [ ] Summary cards
- [ ] Recent analyses list
- [ ] Quick action buttons

### 5.2 History
- [ ] `/sentiment/history` — List semua analisis
- [ ] Search & filter
- [ ] View, Re-run, Delete actions
- [ ] Pagination

### 5.3 Compare
- [ ] `/sentiment/compare` — Side-by-side view
- [ ] Dropdown pilih 2 analisis
- [ ] Comparative charts
- [ ] Diff insight

### 5.4 Settings
- [ ] `/sentiment/settings` — API key management
- [ ] Add/remove/test API keys
- [ ] Default preferences
- [ ] Model preference

---

## Phase 6: Export & Reports (Week 6-7)

### 6.1 Backend Export
- [ ] `GET /export/{id}/csv` — CSV export
- [ ] `GET /export/{id}/excel` — Excel export (openpyxl)
- [ ] `GET /export/{id}/pdf` — PDF report (WeasyPrint)
- [ ] PDF template dengan charts, summary, methodology

### 6.2 Frontend Export
- [ ] Export dropdown di results page
- [ ] Download CSV/Excel/PDF
- [ ] Loading state saat generate PDF
- [ ] Field selection sebelum export

---

## Phase 7: Polish & Testing (Week 7-8)

### 7.1 UI Polish
- [ ] Loading states & skeletons semua halaman
- [ ] Error states & empty states
- [ ] Responsive design (mobile/tablet)
- [ ] Animations & transitions
- [ ] Accessibility (ARIA labels, keyboard nav)

### 7.2 Performance
- [ ] Optimize model loading (lazy load, caching)
- [ ] Pagination untuk large datasets
- [ ] Debounce search inputs
- [ ] Memoize chart renders

### 7.3 Testing
- [ ] Unit tests: NLP pipeline
- [ ] Unit tests: API endpoints
- [ ] Integration tests: full analysis flow
- [ ] Frontend: manual testing semua pages
- [ ] Load testing: batch 5000 teks

### 7.4 Documentation
- [ ] API documentation (auto-generated dari FastAPI)
- [ ] README update
- [ ] Environment setup guide
- [ ] Deployment guide

---

## Tech Stack Summary

### Sentiment API (New)
| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | ^0.115 | Web framework |
| uvicorn | ^0.34 | ASGI server |
| supabase | ^2.0 | Database client |
| transformers | ^4.45 | IndoBERT model |
| torch | ^2.5 | ML runtime |
| spacy | ^3.8 | NLP pipeline |
| keybert | ^0.8 | Keyword extraction |
| bertopic | ^0.16 | Topic modeling |
| openai | ^1.50 | OpenAI API |
| google-cloud-language | ^2.14 | Google NLP |
| celery | ^5.4 | Task queue |
| redis | ^5.2 | Queue backend |
| pandas | ^2.2 | Data processing |
| openpyxl | ^3.1 | Excel export |
| weasyprint | ^62 | PDF generation |
| python-jose | ^3.3 | JWT verification |
| sse-starlette | ^2.1 | SSE streaming |

### Frontend (Additions)
| Package | Purpose |
|---------|---------|
| recharts | Charts (pie, bar, line, radar) |
| react-wordcloud | Word cloud visualization |
| papaparse | CSV parsing (client-side preview) |
| xlsx | Excel parsing (client-side preview) |

---

## Deployment Checklist

- [ ] Sentiment API deployed (Render/Railway/Fly.io)
- [ ] Redis instance provisioned
- [ ] Celery worker running
- [ ] Supabase migration applied
- [ ] Frontend env vars updated
- [ ] CORS configured
- [ ] SSL/HTTPS enabled
- [ ] Health check monitoring
- [ ] Error logging (Sentry optional)

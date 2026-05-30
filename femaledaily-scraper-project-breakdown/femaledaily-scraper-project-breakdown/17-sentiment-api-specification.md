# Sentiment Analysis — API Specification

## 1. Base URL

Development:
```
http://localhost:5000
```

Production:
```
https://your-sentiment-api-host.com
```

## 2. Standard Response Format

```python
{
  "success": bool,
  "data": Any | None,
  "error": str | None
}
```

## 3. Authentication

Same as Scraper API — Supabase Anonymous Auth token.

```
Authorization: Bearer <supabase_access_token>
```

Server verifies token, extracts `user.id` as `owner_id`.

---

## 4. Endpoints

### POST /analyze

Start a new sentiment analysis job.

**Request body:**
```json
{
  "title": "Analisis Review Skincare Mei 2026",
  "source_type": "scraping",
  "source_config": {
    "product_ids": ["uuid1", "uuid2"],
    "date_from": "2026-01-01",
    "date_to": "2026-05-29",
    "rating_filter": null
  },
  "model": "indobert",
  "analysis_types": ["sentiment", "emotion", "aspect", "keyword", "topic"],
  "topic_count": 5
}
```

**Source type variants:**

For `scraping`:
```json
{
  "source_type": "scraping",
  "source_config": {
    "product_ids": ["uuid1"],
    "date_from": null,
    "date_to": null,
    "rating_filter": null
  }
}
```

For `upload`:
```json
{
  "source_type": "upload",
  "source_config": {
    "dataset_id": "uuid"
  }
}
```

For `manual`:
```json
{
  "source_type": "manual",
  "source_config": {
    "texts": [
      "Produknya bagus banget, recommended!",
      "Pengiriman lama, packaging rusak",
      "Harga sesuai kualitas"
    ]
  }
}
```

For `url`:
```json
{
  "source_type": "url",
  "source_config": {
    "url": "https://example.com/article",
    "selector": "p"
  }
}
```

**Success response:**
```json
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "status": "queued",
    "total_texts": 150,
    "stream_url": "/analysis/uuid/stream"
  }
}
```

---

### GET /analysis/{id}

Get analysis details and summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Analisis Review Skincare Mei 2026",
    "source_type": "scraping",
    "model_used": "indobert",
    "analysis_types": ["sentiment", "emotion", "aspect", "keyword", "topic"],
    "status": "completed",
    "total_texts": 150,
    "processed_texts": 150,
    "summary": { ... },
    "started_at": "2026-05-29T10:00:00Z",
    "completed_at": "2026-05-29T10:01:30Z",
    "created_at": "2026-05-29T09:59:50Z"
  }
}
```

---

### GET /analysis/{id}/results

Get detailed per-text results with pagination.

**Query params:**
```
page=1
limit=50
sentiment=positive|negative|neutral
emotion=joy|anger|sadness|fear|surprise|disgust
search=keyword
sort_by=sentiment_score|created_at
sort_order=asc|desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "uuid",
        "original_text": "Produknya bagus banget!",
        "sentiment_label": "positive",
        "sentiment_score": 0.95,
        "emotions": {"joy": 0.88, "anger": 0.02, ...},
        "dominant_emotion": "joy",
        "aspects": [
          {"aspect": "kualitas", "sentiment": "positive", "score": 0.92}
        ],
        "keywords": ["bagus", "produk"],
        "topic_id": 0,
        "topic_label": "Kualitas Produk"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "total_pages": 3
    }
  }
}
```

---

### GET /analysis/{id}/stream

SSE endpoint for real-time progress.

**Headers:**
```
Authorization: Bearer <token>
Accept: text/event-stream
```

**Events:**
```
event: progress
data: {"step": "loading_data", "message": "Memuat 150 review dari database...", "current": 0, "total": 150}

event: progress
data: {"step": "loading_model", "message": "Memuat model IndoBERT...", "current": 0, "total": 150}

event: progress
data: {"step": "model_ready", "message": "Model siap", "current": 0, "total": 150}

event: progress
data: {"step": "analyzing", "message": "Menganalisis sentiment...", "current": 45, "total": 150}

event: preview
data: {"positive": 23, "negative": 15, "neutral": 7}

event: progress
data: {"step": "analyzing", "message": "Menganalisis sentiment...", "current": 150, "total": 150}

event: progress
data: {"step": "saving", "message": "Menyimpan hasil ke database...", "current": 150, "total": 150}

event: progress
data: {"step": "generating_summary", "message": "Membuat insight otomatis...", "current": 150, "total": 150}

event: done
data: {"analysis_id": "uuid", "status": "completed"}
```

---

### GET /analyses

List all analyses for current user.

**Query params:**
```
page=1
limit=20
status=completed|processing|failed
sort_by=created_at
sort_order=desc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [
      {
        "id": "uuid",
        "title": "Analisis Review Skincare",
        "source_type": "scraping",
        "model_used": "indobert",
        "status": "completed",
        "total_texts": 150,
        "summary": { "dominant_sentiment": "positive", "sentiment_percentage": {"positive": 70} },
        "created_at": "2026-05-29T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 5, "total_pages": 1 }
  }
}
```

---

### DELETE /analysis/{id}

Delete an analysis and all its results.

**Response:**
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

---

### POST /analysis/{id}/cancel

Cancel a running/queued analysis.

**Response:**
```json
{
  "success": true,
  "data": { "status": "cancelled" }
}
```

---

### POST /upload

Upload a CSV/Excel file for analysis.

**Request:** multipart/form-data
```
file: <binary>
text_column: "review_text"  (optional, auto-detect if not provided)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dataset_id": "uuid",
    "filename": "reviews.csv",
    "total_rows": 500,
    "columns": ["id", "review_text", "rating", "date"],
    "detected_text_column": "review_text",
    "status": "validated"
  }
}
```

---

### GET /datasets

List uploaded datasets.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "filename": "reviews.csv",
      "total_rows": 500,
      "text_column": "review_text",
      "status": "validated",
      "created_at": "2026-05-29T09:00:00Z"
    }
  ]
}
```

---

### DELETE /datasets/{id}

Delete an uploaded dataset.

---

### GET /export/{analysis_id}/csv

Export analysis results as CSV.

**Query params:**
```
include_emotions=true
include_aspects=true
include_keywords=true
```

---

### GET /export/{analysis_id}/excel

Export analysis results as Excel (.xlsx).

---

### GET /export/{analysis_id}/pdf

Export analysis report as PDF with charts and summary.

---

### POST /api-keys

Save/update user API key.

**Request:**
```json
{
  "provider": "openai",
  "api_key": "sk-..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "openai",
    "key_hint": "...a3Bf",
    "is_active": true
  }
}
```

---

### GET /api-keys

List user's saved API keys (hints only, never full key).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "provider": "openai",
      "key_hint": "...a3Bf",
      "is_active": true,
      "updated_at": "2026-05-29T08:00:00Z"
    }
  ]
}
```

---

### DELETE /api-keys/{provider}

Remove a saved API key.

---

### GET /models

List available models and their capabilities.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "indobert",
      "name": "IndoBERT",
      "provider": "local",
      "language": "id",
      "capabilities": ["sentiment", "emotion"],
      "requires_api_key": false,
      "description": "Model lokal untuk Bahasa Indonesia. Gratis, tidak butuh API key."
    },
    {
      "id": "openai-gpt4o-mini",
      "name": "OpenAI GPT-4o Mini",
      "provider": "openai",
      "language": "multi",
      "capabilities": ["sentiment", "emotion", "aspect", "keyword", "topic"],
      "requires_api_key": true,
      "description": "Model OpenAI. Akurasi tinggi, butuh API key, berbayar per request."
    },
    {
      "id": "google-nlp",
      "name": "Google Cloud NLP",
      "provider": "google",
      "language": "multi",
      "capabilities": ["sentiment", "emotion"],
      "requires_api_key": true,
      "description": "Google Natural Language API. Butuh service account key."
    }
  ]
}
```

---

## 5. Validation Rules

### Analysis Request
- `title` wajib, max 200 karakter
- `source_type` harus salah satu: `scraping`, `upload`, `manual`, `url`
- `model` harus valid (cek dari /models)
- `analysis_types` minimal berisi `sentiment`
- `topic_count` antara 3-10 (default 5)
- Jika model requires_api_key, user harus punya key tersimpan

### Upload File
- Format: CSV (.csv) atau Excel (.xlsx)
- Max size: 10MB
- Max rows: 5000
- Harus punya minimal 1 kolom teks
- Encoding: UTF-8

### Manual Input
- Minimal 1 teks
- Maksimal 100 teks per request
- Setiap teks minimal 10 karakter

## 6. Error Codes

```
UNAUTHORIZED — Token invalid/expired
INVALID_SOURCE — Source type/config tidak valid
MODEL_NOT_AVAILABLE — Model tidak tersedia
API_KEY_REQUIRED — Model butuh API key tapi belum di-set
API_KEY_INVALID — API key tidak valid
FILE_TOO_LARGE — File melebihi batas
INVALID_FILE_FORMAT — Format file tidak didukung
ANALYSIS_NOT_FOUND — Analysis ID tidak ditemukan
ANALYSIS_ALREADY_RUNNING — User sudah punya analysis yang running
RATE_LIMITED — Terlalu banyak request
PROCESSING_ERROR — Error saat analisis
TIMEOUT — Analisis timeout
```

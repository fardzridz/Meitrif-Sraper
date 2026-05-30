# Metrif Sentiment API

Backend API untuk analisis sentimen profesional berbahasa Indonesia.

## Tech Stack

- **Framework**: Python FastAPI
- **NLP**: Transformers (IndoBERT), KeyBERT, YAKE
- **Database**: Supabase (PostgreSQL)
- **Queue**: Celery + Redis
- **Auth**: Supabase JWT verification

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Development Server

```bash
python run.py
```

Server akan berjalan di `http://localhost:5000`.

API docs tersedia di `http://localhost:5000/docs`.

### 4. Run with Docker

```bash
docker build -t metrif-sentiment-api .
docker run -p 5000:5000 --env-file .env metrif-sentiment-api
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /models | List available models |
| POST | /analyze | Start new analysis |
| GET | /analyses | List user's analyses |
| GET | /analysis/{id} | Get analysis details |
| GET | /analysis/{id}/results | Get per-text results |
| GET | /analysis/{id}/stream | SSE progress stream |
| DELETE | /analysis/{id} | Delete analysis |
| POST | /analysis/{id}/cancel | Cancel analysis |
| POST | /upload | Upload CSV/Excel |
| GET | /datasets | List uploaded datasets |
| DELETE | /datasets/{id} | Delete dataset |
| GET | /export/{id}/csv | Export as CSV |
| GET | /export/{id}/excel | Export as Excel |
| POST | /api-keys | Save API key |
| GET | /api-keys | List API keys |
| DELETE | /api-keys/{provider} | Delete API key |

## Database Migration

Jalankan SQL migration di Supabase:

```
supabase/migrations/004_sentiment_analysis_tables.sql
```

Lihat file `16-sentiment-database-schema.md` untuk detail schema.

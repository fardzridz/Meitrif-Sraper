# FemaleDaily Scraper API

Express API untuk trigger scrape job, membaca data Supabase, dan export dataset.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Isi `.env` dengan credential Supabase. `SUPABASE_SERVICE_ROLE_KEY` wajib untuk insert/update data dari backend.

## Routes

- `GET /health`
- `POST /scrape`
- `GET /jobs`
- `GET /jobs/:id`
- `GET /products`
- `GET /reviews`
- `GET /export/csv`
- `GET /export/json`

Except `GET /health`, routes require:

```txt
Authorization: Bearer <supabase_access_token>
```

The API verifies the token, uses the Supabase user ID as `owner_id`, and scopes all reads/writes to that owner.

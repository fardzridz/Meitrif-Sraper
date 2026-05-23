# Metrif Scraper - Project Breakdown

## Project Overview

Metrif Scraper is a lightweight web application for collecting public product review data from FemaleDaily product pages, storing the results per anonymous user, displaying them in a clean dashboard, and exporting the data for a separate sentiment analysis system.

The application is designed for a free/low-cost hosting setup, so the scraper must be separated from the frontend to keep the user interface fast and stable.

## Core Goal

Build a simple, professional, dynamic, and visually polished web scraping dashboard with:

- Supabase Anonymous Auth session
- hCaptcha gate before creating a new anonymous session
- Product URL input
- Target review count input
- Review scraping process
- Scrape job status tracking
- Per-user data isolation with `owner_id`
- Supabase database storage
- Review table
- Search and filters
- CSV/JSON export
- Skeleton loading states
- Soft UI Evolution visual style
- Metrif Scraper branding

## Recommended Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Custom Tailwind UI components
- Lucide React
- Supabase JS client
- hCaptcha React

### Scraper Backend

- Node.js
- Express.js
- Playwright
- Supabase client

### Auth and Database

- Supabase Anonymous Auth
- Supabase PostgreSQL
- Row Level Security by `owner_id`

### Deployment

- Frontend: Vercel
- Scraper API: Render, Railway, or Fly.io
- Database: Supabase

## Main Architecture

```txt
User/Admin
  ↓
Next.js Frontend
  ↓
Supabase Anonymous Auth + hCaptcha
  ↓
Scraper API
  ↓
Playwright Browser
  ↓
FemaleDaily Product Page
  ↓
Parser & Cleaner
  ↓
Supabase Database
  ↓
Dashboard / Export
```

## Important Principle

Do not run scraping directly from the frontend page request.

The frontend should only create or restore the anonymous session, trigger a scrape job with a Bearer token, poll job status, and display results. The scraper backend handles all Playwright operations separately and scopes every row by the verified Supabase user ID.

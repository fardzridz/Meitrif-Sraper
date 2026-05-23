# Task Checklist

## Setup

- [ ] Create Git repository
- [x] Setup Next.js + TypeScript
- [x] Setup Tailwind CSS
- [x] Create custom Tailwind UI components
- [x] Setup Framer Motion
- [x] Setup Lucide React
- [x] Setup ESLint/Prettier
- [ ] Create committed `.env.example` files

## UI Foundation

- [x] Create design tokens
- [x] Create app shell
- [x] Create topbar navigation
- [x] Create button variants
- [x] Create card components
- [x] Create input components
- [x] Create badge components
- [x] Create skeleton components
- [x] Create empty state component

## Database

- [x] Create products table
- [x] Create reviews table
- [x] Create scrape_jobs table
- [x] Add indexes
- [x] Test Supabase connection
- [x] Create database types
- [x] Add owner_id columns
- [x] Add anonymous-user RLS policies
- [x] Add per-user product uniqueness

## Scraper API

- [x] Setup Express app
- [x] Setup Playwright
- [x] Create health route
- [x] Create POST /scrape
- [x] Create GET /jobs
- [x] Create GET /products
- [x] Create GET /reviews
- [x] Create export routes
- [x] Add Supabase Bearer token auth middleware
- [x] Add error handling

## Scraper Logic

- [x] Validate product URL
- [x] Create scrape job
- [x] Normalize requested review target
- [x] Open page with Playwright
- [x] Extract product name
- [x] Extract brand name
- [x] Extract category if available
- [x] Extract rating
- [x] Extract review date
- [x] Extract review text
- [x] Clean data
- [x] Save product
- [x] Save reviews
- [x] Update job status
- [x] Save stop reason
- [x] Close browser safely

## Frontend Pages

- [x] / landing page
- [x] /dashboard page
- [x] /scrape page
- [x] /products page
- [x] /reviews page
- [x] /export page

## Frontend Features

- [x] URL input validation
- [x] hCaptcha-gated anonymous session
- [x] API token retry after session refresh
- [x] Start scraping action
- [x] Job status display
- [x] Dashboard summary cards
- [x] Review search
- [x] Product filter
- [x] Rating filter
- [x] Pagination
- [x] CSV export
- [x] JSON export

## Deployment

- [ ] Deploy frontend to Vercel
- [ ] Deploy scraper API to Render/Railway/Fly.io
- [ ] Add production environment variables
- [ ] Test API from frontend
- [ ] Test scraping from production
- [ ] Test export from production

## Final QA

- [x] Mobile responsive
- [x] Tablet responsive
- [x] Desktop responsive
- [x] No horizontal overflow
- [x] Loading states complete
- [x] Empty states complete
- [x] Error states complete
- [x] Focus states visible
- [x] No emoji icons
- [x] No hardcoded secrets
- [x] No blocked scraping behavior

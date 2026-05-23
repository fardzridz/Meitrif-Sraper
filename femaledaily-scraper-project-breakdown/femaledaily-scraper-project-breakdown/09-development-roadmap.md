# Development Roadmap

## Phase 1 — Project Setup

Tasks:

- Setup Next.js project
- Setup TypeScript
- Setup Tailwind CSS
- Create custom Tailwind UI components
- Setup Framer Motion
- Setup Lucide React
- Setup ESLint and Prettier
- Create base layout
- Create design tokens

Output:

- Running frontend app
- Basic layout ready

## Phase 2 — Supabase Setup

Tasks:

- Create Supabase project
- Create database tables
- Add indexes
- Configure environment variables
- Create Supabase client
- Configure Anonymous Auth
- Configure hCaptcha for anonymous sign-in
- Add `owner_id` RLS policies
- Test database connection

Output:

- Database ready
- App can read/write data

## Phase 3 — Scraper API Setup

Tasks:

- Setup Node.js Express app
- Setup TypeScript
- Install Playwright
- Create health check route
- Create /scrape route
- Create auth middleware for Supabase access tokens
- Setup Supabase service
- Setup URL validation

Output:

- Scraper API running locally

## Phase 4 — Scraper Logic

Tasks:

- Launch Playwright browser
- Open FemaleDaily product page
- Wait for product/review content
- Extract product information
- Extract review list
- Clean data
- Respect requested review target
- Save stop reason
- Save data to Supabase
- Update scrape job status
- Handle errors

Output:

- One product URL can be scraped and saved

## Phase 5 — Frontend Integration

Tasks:

- Build /scrape page
- Build landing entry page `/`
- Add hCaptcha-gated anonymous session flow
- Connect scrape form to API
- Show running/success/failed status
- Build /dashboard page
- Build /products page
- Build /reviews page
- Add skeleton loading
- Add empty states

Output:

- User can scrape and view data in UI

## Phase 6 — Export

Tasks:

- Build export API/service
- Add CSV export
- Add JSON export
- Add export page
- Add frontend CSV/JSON download from selected fields
- Validate export fields

Output:

- User can export dataset

## Phase 7 — Deployment

Tasks:

- Deploy frontend to Vercel
- Deploy scraper API to Render/Railway/Fly.io
- Add environment variables
- Test production API connection
- Test scraping in production
- Check Playwright browser support

Output:

- MVP live

## Phase 8 — Polish

Tasks:

- Improve animations
- Improve responsive layout
- Add better error messages
- Add loading skeletons everywhere needed
- Add dashboard summary polish
- Add documentation

Output:

- Professional MVP ready for demo

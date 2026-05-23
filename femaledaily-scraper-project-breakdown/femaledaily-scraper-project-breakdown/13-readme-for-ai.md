# README for AI Developer

## Your Role

You are building a professional MVP named Metrif Scraper for a FemaleDaily review scraping dashboard.

The user wants a lightweight, dynamic, visually polished web app with a clean Soft UI Evolution style and the custom primary color `#3BE6A6`.

## Build Priority

Follow this order:

1. Database schema
2. Scraper API
3. Anonymous Auth + hCaptcha flow
4. Frontend shell
5. Scrape page
6. Review table
7. Dashboard
8. Export
9. Polish

## Do Not Build Yet

Do not build these unless explicitly requested:

- Sentiment analysis engine
- Login/auth system
- Email/password auth UI
- Payment/pricing system
- Public landing page
- Multi-user roles
- Browser extension

## Important Architecture Rule

Do not run Playwright inside frontend page rendering.

Playwright must run inside a separate scraper backend service.

## UI Rule

The UI must look like a modern app dashboard, not a default admin template.

Use:

- Soft shadows
- White cards
- Light green primary accent
- Smooth hover states
- Skeleton loading
- Clear spacing
- Lucide icons

## Scraping Rule

Only scrape public product review data needed for sentiment analysis.

Do not scrape:

- user profiles
- user photos
- backend/private endpoints
- captcha/login-protected data

## MVP Completion Definition

The MVP is done when:

- User can input one product URL.
- User can choose target review count.
- Scraper saves product and reviews to Supabase.
- Dashboard shows summary data scoped to the anonymous user.
- Reviews page shows review table.
- User can export CSV.
- UI is responsive and clean.

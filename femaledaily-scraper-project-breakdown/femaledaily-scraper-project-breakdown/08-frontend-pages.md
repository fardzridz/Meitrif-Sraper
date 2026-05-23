# Frontend Pages Breakdown

## 1. /

Purpose:

Show the Metrif Scraper entry page with brand assets, product value summary, and links to start the scraper or view the flow.

Components:

- Brand logo and wordmark
- Short intro copy
- Primary CTA to `/dashboard`
- Flow cards

## 2. /dashboard

Purpose:

Show project summary and recent scraping activity for the current anonymous user.

Components:

- App shell
- Summary cards
- Recent scrape jobs
- Review count chart or simple stat list
- Skeleton loading state

Cards:

```txt
Total Products
Total Reviews
Successful Jobs
Failed Jobs
Last Scrape
```

## 3. /scrape

Purpose:

Input FemaleDaily product URL and start scraping under the current anonymous user.

Components:

- URL input form
- Target review count input
- Start Scraping button
- Validation message
- Current job status card
- Recent job result
- Error state

States:

```txt
idle
captcha
authenticating
validating
running
success
failed
```

Target review rules:

```txt
minimum 10
default 10
maximum 250
step 10
stop early when no more reviews are available
```

Stop reason labels:

```txt
TARGET_REACHED = Target review tercapai
NO_MORE_REVIEWS = Review sudah habis
PAGE_FAILED = Halaman review gagal dibaca
MAX_LIMIT_REACHED = Batas maksimum tercapai
```

## 4. /products

Purpose:

Display scraped product list owned by the current anonymous user.

Components:

- Search input
- Product cards or table
- Total review count per product
- View reviews button
- Empty state
- Skeleton loading

## 5. /reviews

Purpose:

Display all scraped reviews owned by the current anonymous user.

Components:

- Search review text
- Product filter
- Rating filter
- Review table
- Pagination
- Empty state
- Skeleton table

Columns:

```txt
Product
Brand
Rating
Review Date
Review Text
Source URL
```

## 6. /export

Purpose:

Export the current anonymous user's dataset for sentiment analysis.

Components:

- Export CSV button
- Export JSON button
- Dataset summary
- Export field preview
- Search, product, rating, and row limit filters
- Field checkbox selection

Export columns:

```txt
product_name
brand_name
category
rating
review_date
review_text
source_url
scraped_at
```

Current frontend behavior:

- Fetch filtered review data with `getReviews`.
- Generate CSV/JSON downloads in the browser from selected fields.
- API export routes still exist for backend-level CSV/JSON export.

## 7. App Shell

Authentication responsibilities:

- Restore existing Supabase session on app load.
- If no session exists, show hCaptcha verification first.
- After hCaptcha succeeds, call anonymous sign-in with the captcha token.
- Keep the access token available for API calls.
- Show loading/skeleton UI while anonymous session is being prepared.
- Do not show email/password/OAuth UI in the initial implementation.
- Do not expose or accept `owner_id` in the UI.

API request rules:

- Every request to the Scraper API must include `Authorization: Bearer <access_token>`.
- If the token expires, refresh the Supabase session and retry once.
- If anonymous auth fails, show an error state and block scraping/export actions.
- Mock data fallback should not mask authentication failures in production.

Desktop:

- Top navigation
- Main content area
- Page header

Mobile:

- Top navigation
- Horizontally scrollable compact navigation
- Full-width content

Navigation items:

```txt
Dashboard
Scrape
Products
Reviews
Export
```

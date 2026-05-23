# Product Requirements Document

## 1. Product Name

Metrif Scraper

## 2. Purpose

The application helps collect public product review data from FemaleDaily product pages for later sentiment analysis.

This app does not perform sentiment analysis directly. It only collects, stores, displays, filters, and exports review data.

## 3. Target Users

- Admin
- Researcher
- Student
- Data analyst
- Developer managing review datasets

## 4. Main User Goals

Users should be able to:

1. Input a FemaleDaily product URL.
2. Choose a target review count from 10 to 250.
3. Complete hCaptcha when a new anonymous session is required.
4. Start a scraping job.
5. Track scraping status and stop reason.
6. View scraped products.
7. View scraped reviews.
8. Search and filter reviews.
9. Export review data as CSV or JSON.

## 5. Core Features

### 5.1 Scrape Product URL

User inputs a valid FemaleDaily product URL and starts scraping.

Required behavior:

- Validate the URL format.
- Reject empty or invalid URLs.
- Normalize target review count to 10-250 in steps of 10.
- Require Supabase Anonymous Auth access token.
- Create a scrape job.
- Set job status to `running`.
- Run scraper in backend.
- Save product and review data.
- Update job status to `success` or `failed`.
- Stop early when review data is exhausted.
- Store `requested_reviews` and `stop_reason`.

### 5.2 Dashboard

Dashboard should show:

- Total products
- Total reviews
- Successful scrapes
- Failed scrapes
- Last scrape date
- Recent scrape jobs

### 5.3 Product List

Product list should show:

- Product name
- Brand name
- Category
- Total reviews
- Source URL
- Created date

### 5.4 Review Table

Review table should show:

- Product name
- Brand name
- Rating
- Review date
- Review text
- Source URL

Required features:

- Search review text
- Filter by product
- Filter by rating
- Pagination
- Empty state
- Skeleton loading

### 5.5 Export

The app should export review data in:

- CSV
- JSON

The current frontend export page allows:

- Search text filter
- Product filter
- Rating filter
- Row limit selection
- Field selection before download

Minimum export fields:

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

## 6. Out of Scope

The following are not included in this MVP:

- Sentiment analysis engine
- Visible email/password authentication system
- Email/password login UI
- Multi-role access control
- Large-scale crawling
- Bypassing login, captcha, rate limits, or private endpoints
- Scraping user profiles or user photos

## 7. Success Criteria

MVP is successful when:

- User can input one FemaleDaily product URL.
- User can set target review count.
- Scraper can collect review data.
- Data is saved to Supabase.
- Dashboard displays only the current anonymous user's saved data.
- User can export reviews as CSV.
- UI is responsive and polished.

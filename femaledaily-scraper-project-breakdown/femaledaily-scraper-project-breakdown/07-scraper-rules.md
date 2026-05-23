# Scraper Rules

## 1. Scraper Purpose

The scraper collects public product review data from FemaleDaily product pages.

It must only collect data needed for sentiment analysis.

## 2. Allowed Data

Allowed fields:

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

## 3. Data Not Allowed

Do not scrape:

```txt
user profile pages
user photos
private endpoints
backend endpoints
personal data not needed for analysis
```

## 4. Rate Limit Rule

Use respectful scraping:

```txt
Delay: 3-5 seconds between heavy actions
Small sample first
Do not run parallel aggressive scraping in MVP
```

## 5. Playwright Rules

Recommended settings:

- Headless mode enabled in production
- Timeout handling required
- Wait for review container selector
- Close browser/page after scraping
- Catch all errors

## 6. Scraper Process

```txt
1. Validate URL
2. Create scrape job
3. Launch Playwright
4. Open page
5. Wait for content
6. Extract product data
7. Extract review data
8. Clean review text
9. Save product
10. Save reviews
11. Stop when requested review target is reached or no more reviews are available
12. Save `requested_reviews`, `total_reviews`, and `stop_reason`
13. Update job success
14. Close browser
```

## 7. Failure Handling

If scraping fails:

```txt
1. Capture error message
2. Update scrape_jobs.status = failed
3. Save error_message
4. Close browser
5. Return clear API response
```

## 8. Data Cleaning Rules

Clean review text by:

- Trimming whitespace
- Removing duplicate spaces
- Keeping original wording
- Not translating text
- Not changing sentiment meaning

## 9. Duplicate Handling

Avoid duplicate reviews by checking:

- product_id
- review_text
- review_date
- rating

For MVP, exact duplicate text for the same product can be skipped.

## 10. Review Target Rules

The scraper accepts a target review count from the API:

```txt
minimum 10
default 10
maximum 250
step 10
```

The backend normalizes the target and stores it in `scrape_jobs.requested_reviews`.

Valid stop reasons:

```txt
TARGET_REACHED
NO_MORE_REVIEWS
PAGE_FAILED
MAX_LIMIT_REACHED
```

## 11. Production Notes

Free hosting may have RAM/CPU limits.

If Playwright crashes:

- Reduce concurrent jobs to 1
- Use Docker image with Playwright dependencies
- Increase timeout carefully
- Use scheduled/local scraping as fallback

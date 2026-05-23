# API Specification

## 1. Base URL

Development:

```txt
http://localhost:4000
```

Production:

```txt
https://your-scraper-api-host.com
```

## 2. Standard Response Format

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

## 3. Authentication

All user-facing endpoints require a Supabase access token from Anonymous Auth.

Request header:

```txt
Authorization: Bearer <supabase_access_token>
```

Server rules:

- Verify the token before processing the request.
- Use the verified `user.id` as the current `owner_id`.
- Never accept `owner_id` from request body, query string, or client-controlled payload.
- Return `401` when the token is missing, invalid, or expired.
- Every database query must be scoped to the current `owner_id`.

Anonymous user limitations:

- Browser storage deletion can remove access to previous anonymous data.
- Account upgrade is deferred and not part of the initial implementation.

## 4. Endpoints

### POST /scrape

Start a new scraping job.

Required header:

```txt
Authorization: Bearer <supabase_access_token>
```

Request body:

```json
{
  "sourceUrl": "https://reviews.femaledaily.com/...",
  "maxReviews": 50
}
```

`maxReviews` rules:

```txt
minimum 10
default 10
maximum 250
rounded up to nearest 10
```

Success response:

```json
{
  "success": true,
  "data": {
    "jobId": "uuid",
    "status": "running",
    "requestedReviews": 50
  }
}
```

Error response:

```json
{
  "success": false,
  "error": "Invalid FemaleDaily product URL"
}
```

### GET /jobs

Get scrape job history for the current anonymous user.

Required header:

```txt
Authorization: Bearer <supabase_access_token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "source_url": "https://...",
      "status": "success",
      "total_reviews": 120,
      "requested_reviews": 200,
      "stop_reason": "NO_MORE_REVIEWS",
      "started_at": "2026-05-22T10:00:00Z",
      "finished_at": "2026-05-22T10:02:00Z"
    }
  ]
}
```

### GET /jobs/:id

Get a specific scrape job owned by the current anonymous user.

### GET /products

Get product list owned by the current anonymous user.

Query params:

```txt
search optional
page optional
limit optional
```

### GET /reviews

Get review list owned by the current anonymous user.

Query params:

```txt
search optional
product_id optional
rating optional
page optional
limit optional
```

### GET /export/csv

Export current user's reviews as CSV.

### GET /export/json

Export current user's reviews as JSON.

## 5. Validation Rules

### URL Validation

A valid scrape URL must:

- Be a valid HTTPS URL
- Belong to FemaleDaily/reviews FemaleDaily domain
- Not point to user profile pages
- Not point to blocked paths such as backend or user image paths

### Review Validation

A valid review must have:

- review_text
- product_id
- scrape_job_id
- owner_id from verified access token

Rating and review_date can be nullable.

### Ownership Validation

The API must ensure:

- `GET /jobs/:id` only returns a job where `owner_id` matches the current user.
- Product search only returns products where `owner_id` matches the current user.
- Review filters only return reviews where `owner_id` matches the current user.
- Export endpoints only export rows where `owner_id` matches the current user.
- Background scrape updates must keep the original job owner's `owner_id`.

## 6. Error Codes

Use clear error messages:

```txt
UNAUTHORIZED
INVALID_URL
PAGE_LOAD_TIMEOUT
NO_REVIEWS_FOUND
SCRAPER_FAILED
DATABASE_ERROR
DUPLICATE_SOURCE_URL
UNKNOWN_ERROR
```

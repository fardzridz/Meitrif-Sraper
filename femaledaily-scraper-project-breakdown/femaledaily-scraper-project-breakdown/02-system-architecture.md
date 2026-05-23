# System Architecture

## 1. Architecture Summary

The system uses a separated architecture:

- Frontend handles UI only.
- Frontend starts or restores a Supabase Anonymous Auth session for every visitor.
- hCaptcha is required before creating a new anonymous session when no session exists.
- Scraper API handles scraping logic.
- Supabase stores products, reviews, and scrape jobs.
- Supabase Row Level Security protects rows by anonymous user ID.

This separation prevents the frontend hosting from being overloaded by Playwright browser execution.
Anonymous Auth keeps the app usable without email/password while still giving every browser session a unique `auth.uid()`.

## 2. System Flow

```mermaid
flowchart TD
    A[User opens app] --> B[Frontend checks Supabase session]
    B --> C{Session exists?}
    C -- No --> D[Show hCaptcha]
    C -- Yes --> E[Use existing anonymous session]
    D --> D2[Sign in anonymously with captcha token]
    D2 --> F[Get access token]
    E --> F
    F --> G[Input FemaleDaily Product URL]
    G --> H[Click Start Scraping]
    H --> I[Frontend sends URL and Bearer token to Scraper API]
    I --> J[API verifies token and reads user ID]
    J --> K[API creates scrape job with owner_id]
    K --> L[Job status: running]
    L --> M[Playwright opens product page]
    M --> N[Scraper extracts product and reviews]
    N --> O[Parser cleans and validates data]
    O --> P[API saves data to Supabase with owner_id]
    P --> Q[Job status: success]
    Q --> R[Frontend fetches updated data with token]
    R --> S[Dashboard displays only current user's data]
```

## 3. Failure Flow

```mermaid
flowchart TD
    A[Scraping started] --> B[Open product page]
    B --> C{Page loaded?}
    C -- Yes --> D[Extract reviews]
    C -- No --> E[Set job failed]
    D --> F{Reviews found?}
    F -- Yes --> G[Save data]
    F -- No --> H[Set error: no reviews found]
    G --> I[Set job success]
    E --> J[Show error]
    H --> J
```

## 4. Data Flow

```mermaid
flowchart LR
    A[FemaleDaily Product Page] --> B[Playwright Scraper]
    B --> C[Data Parser]
    C --> D[Scraper API adds owner_id]
    D --> E[Supabase Database with RLS]
    E --> F[Next.js Frontend]
    F --> G[Dashboard]
    F --> H[CSV/JSON Export]
```

## 5. Auth and Data Isolation

The app uses Supabase Anonymous Auth instead of a visible login form.

- On first visit, the frontend calls anonymous sign-in.
- If no session exists, the frontend asks for hCaptcha before calling anonymous sign-in.
- Supabase creates a unique user ID and access token.
- The frontend sends the access token to the Scraper API in the `Authorization` header.
- The Scraper API verifies the token and uses the verified user ID as `owner_id`.
- Database rows are scoped by `owner_id`.
- RLS policies only allow access when `owner_id = auth.uid()`.

Anonymous session limitations:

- If the browser storage is cleared, the user may lose access to previous data.
- A different browser, incognito session, or device becomes a different anonymous user.
- Email/OAuth account upgrade is intentionally deferred for a later feature.

## 6. Deployment Architecture

```txt
Vercel
  └── Next.js frontend

Render / Railway / Fly.io
  └── Node.js Express Scraper API
      └── Playwright Chromium

Supabase
  └── PostgreSQL database
```

## 7. API Responsibilities

The scraper API is responsible for:

- Verifying Supabase access tokens
- Reading the anonymous user ID
- URL validation
- Creating scrape jobs
- Running Playwright
- Parsing review data
- Cleaning text
- Saving data to database with `owner_id`
- Updating job status
- Returning job result
- Filtering every user-facing query by `owner_id`

## 8. Frontend Responsibilities

The frontend is responsible for:

- Starting or restoring the anonymous Supabase session
- Showing hCaptcha when a new anonymous session needs captcha verification
- Sending Bearer access tokens to the Scraper API
- Form input
- UI validation
- Triggering scraping request
- Showing loading states
- Showing job status
- Displaying database records
- Exporting data

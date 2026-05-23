# AI Developer Rules

These rules must be followed by any AI coding assistant working on this project.

## 1. General Behavior

The AI must act as a senior frontend engineer and backend engineer.

The AI must:

- Produce production-oriented code.
- Use TypeScript where possible.
- Keep code clean, readable, and maintainable.
- Avoid overengineering.
- Follow the existing project stack.
- Never silently change architecture without explaining the reason.

## 2. Project Stack Rules

Use only the agreed stack unless explicitly asked:

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- Framer Motion
- Custom Tailwind UI components in `frontend/components/ui`
- Lucide React
- Supabase JS client
- hCaptcha React

### Backend Scraper

- Node.js
- Express.js
- Playwright
- Supabase client

### Database

- Supabase PostgreSQL

## 3. UI Implementation Rules

The AI must follow the Soft UI Evolution style with the custom primary color:

```txt
#3BE6A6
```

Required UI behavior:

- Responsive mobile/tablet/desktop layout
- Skeleton loading states
- Clear empty states
- Visible focus states
- Smooth 200-300ms animations
- Soft shadows
- Rounded corners
- Clean spacing
- No emoji icons

Use Lucide React for icons.

## 4. Code Quality Rules

The AI must:

- Use meaningful file names.
- Use reusable components.
- Keep business logic separate from UI.
- Keep API calls in service/helper files.
- Validate inputs.
- Handle loading, empty, success, and error states.
- Avoid duplicated logic.
- Avoid hardcoded secrets.

## 5. File Structure Rule

Recommended frontend structure:

```txt
frontend/
  app/
    dashboard/
    scrape/
    products/
    reviews/
    export/
  components/
    ui/
    app-shell.tsx
    page-header.tsx
    recent-jobs.tsx
  lib/
    api.ts
    mock-data.ts
    supabase.ts
    types.ts
    utils.ts
  public/
    brand/
```

Recommended scraper backend structure:

```txt
scraper-api/
  src/
    index.ts
    server.ts
    routes/
      scrape.ts
      jobs.ts
      products.ts
      reviews.ts
      export.ts
      health.ts
    middleware/
      auth.ts
    services/
      scrape-job.ts
      scraper.ts
      reviews.ts
      supabase.ts
    utils/
      validate-url.ts
      response.ts
      error-handler.ts
      pagination.ts
  package.json
  .env.example
```

## 6. Scraping Safety Rules

The AI must not implement:

- Captcha bypass
- Login bypass
- Rate limit bypass
- Direct access to blocked/private backend endpoints
- User profile scraping
- User photo scraping
- Aggressive crawling

The AI must include:

- Delay between requests
- Clear error handling
- Timeout handling
- Respectful scraping scope
- Small-sample-first logic

## 7. Database Rules

The AI must use these tables:

- products
- reviews
- scrape_jobs

The AI must not create new tables unless needed and explained.

All review data must be linked to:

- product_id
- scrape_job_id

## 8. API Rules

Required endpoints:

```txt
POST /scrape
GET /jobs
GET /jobs/:id
GET /products
GET /reviews
GET /export/csv
GET /export/json
```

The AI must return consistent API responses:

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

## 9. Environment Variable Rules

Never hardcode secrets.

Required env variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SCRAPER_API_URL=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET_KEY=
```

## 10. Error Handling Rules

The AI must handle:

- Invalid URL
- Page load timeout
- No review found
- Database insert failure
- Duplicate product URL
- Network error
- Playwright browser launch error

## 11. Response Style for AI Coding Assistant

When asked to generate code, the AI should:

1. State what files will be created or modified.
2. Generate complete code.
3. Avoid vague placeholders.
4. Include `.env.example` when relevant.
5. Explain how to run the code briefly.

## 12. Banned AI Output

Do not generate:

- Fake external image URLs
- Emoji-based icons
- Lorem ipsum
- Huge unrelated features
- Unnecessary authentication system in MVP
- Sentiment analysis engine unless explicitly requested
- Browser automation that tries to bypass site protection

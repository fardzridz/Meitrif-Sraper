# Environment Variables

Create `.env.local` for the frontend and `.env` for the scraper API.

## Frontend `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SCRAPER_API_URL=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
```

## Scraper API `.env`

```env
PORT=4000
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_SECRET_KEY=
NODE_ENV=development
```

## Rules

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend.
- Only use service role key in the scraper backend.
- Do not commit real `.env` files.
- Commit `.env.example` only.
- `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` is required when Supabase Anonymous Auth has captcha protection enabled.
- `NEXT_PUBLIC_SCRAPER_API_URL` should point to the Express API base URL, for example `http://localhost:4000`.

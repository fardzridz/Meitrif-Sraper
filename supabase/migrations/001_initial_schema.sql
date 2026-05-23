create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  brand_name text not null,
  category text,
  source_url text not null unique,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.scrape_jobs (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  status text not null check (status in ('pending', 'running', 'success', 'failed')),
  total_reviews integer not null default 0,
  error_message text,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  scrape_job_id uuid not null references public.scrape_jobs(id) on delete cascade,
  rating integer check (rating is null or rating between 1 and 5),
  review_text text not null,
  review_date text,
  source_url text not null,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_reviews_product_id on public.reviews(product_id);
create index if not exists idx_reviews_scrape_job_id on public.reviews(scrape_job_id);
create index if not exists idx_reviews_rating on public.reviews(rating);
create index if not exists idx_scrape_jobs_status on public.scrape_jobs(status);
create index if not exists idx_scrape_jobs_created_at on public.scrape_jobs(created_at desc);
create index if not exists idx_products_brand_name on public.products(brand_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.scrape_jobs enable row level security;
alter table public.reviews enable row level security;

create policy "Allow public read products"
on public.products
for select
to anon, authenticated
using (true);

create policy "Allow public read scrape jobs"
on public.scrape_jobs
for select
to anon, authenticated
using (true);

create policy "Allow public read reviews"
on public.reviews
for select
to anon, authenticated
using (true);

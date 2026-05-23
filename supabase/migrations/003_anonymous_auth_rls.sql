alter table public.products
add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table public.scrape_jobs
add column if not exists owner_id uuid references auth.users(id) on delete cascade;

alter table public.reviews
add column if not exists owner_id uuid references auth.users(id) on delete cascade;

drop policy if exists "Allow public read products" on public.products;
drop policy if exists "Allow public read scrape jobs" on public.scrape_jobs;
drop policy if exists "Allow public read reviews" on public.reviews;

drop policy if exists "Users can read own products" on public.products;
drop policy if exists "Users can insert own products" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;

drop policy if exists "Users can read own scrape jobs" on public.scrape_jobs;
drop policy if exists "Users can insert own scrape jobs" on public.scrape_jobs;
drop policy if exists "Users can update own scrape jobs" on public.scrape_jobs;
drop policy if exists "Users can delete own scrape jobs" on public.scrape_jobs;

drop policy if exists "Users can read own reviews" on public.reviews;
drop policy if exists "Users can insert own reviews" on public.reviews;
drop policy if exists "Users can update own reviews" on public.reviews;
drop policy if exists "Users can delete own reviews" on public.reviews;

alter table public.products drop constraint if exists products_source_url_key;

create unique index if not exists idx_products_owner_source_url
on public.products(owner_id, source_url);

create index if not exists idx_products_owner_id on public.products(owner_id);
create index if not exists idx_scrape_jobs_owner_id on public.scrape_jobs(owner_id);
create index if not exists idx_reviews_owner_id on public.reviews(owner_id);

alter table public.products enable row level security;
alter table public.scrape_jobs enable row level security;
alter table public.reviews enable row level security;

create policy "Users can read own products"
on public.products
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can insert own products"
on public.products
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update own products"
on public.products
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete own products"
on public.products
for delete
to authenticated
using (owner_id = auth.uid());

create policy "Users can read own scrape jobs"
on public.scrape_jobs
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can insert own scrape jobs"
on public.scrape_jobs
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update own scrape jobs"
on public.scrape_jobs
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete own scrape jobs"
on public.scrape_jobs
for delete
to authenticated
using (owner_id = auth.uid());

create policy "Users can read own reviews"
on public.reviews
for select
to authenticated
using (owner_id = auth.uid());

create policy "Users can insert own reviews"
on public.reviews
for insert
to authenticated
with check (owner_id = auth.uid());

create policy "Users can update own reviews"
on public.reviews
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Users can delete own reviews"
on public.reviews
for delete
to authenticated
using (owner_id = auth.uid());

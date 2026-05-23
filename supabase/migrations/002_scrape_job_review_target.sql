alter table public.scrape_jobs
add column if not exists requested_reviews integer not null default 10,
add column if not exists stop_reason text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'scrape_jobs_requested_reviews_range'
  ) then
    alter table public.scrape_jobs
    add constraint scrape_jobs_requested_reviews_range
    check (requested_reviews between 10 and 250)
    not valid;
  end if;
end;
$$;

alter table public.scrape_jobs
validate constraint scrape_jobs_requested_reviews_range;

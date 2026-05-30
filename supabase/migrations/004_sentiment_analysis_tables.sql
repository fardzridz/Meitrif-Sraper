-- Migration: 004_sentiment_analysis_tables.sql
-- Adds tables for the Sentiment Analysis feature.

-- Uploaded datasets
create table if not exists uploaded_datasets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  file_path text not null,
  file_size integer not null default 0,
  total_rows integer not null default 0,
  text_column text not null,
  columns text[] not null default '{}',
  status text not null default 'uploaded' check (status in ('uploaded', 'validated', 'error')),
  error_message text,
  created_at timestamptz default now()
);

-- Sentiment analyses (job/session)
create table if not exists sentiment_analyses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('scraping', 'upload', 'manual', 'url')),
  dataset_id uuid references uploaded_datasets(id) on delete set null,
  source_filter jsonb,
  model_used text not null,
  analysis_types text[] not null default '{sentiment}',
  status text not null default 'queued' check (status in ('queued', 'loading', 'processing', 'completed', 'failed', 'cancelled')),
  total_texts integer not null default 0,
  processed_texts integer not null default 0,
  summary jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Sentiment results (per text)
create table if not exists sentiment_results (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid not null references sentiment_analyses(id) on delete cascade,
  review_id uuid references reviews(id) on delete set null,
  original_text text not null,
  sentiment_label text not null check (sentiment_label in ('positive', 'negative', 'neutral')),
  sentiment_score float not null default 0.0,
  emotions jsonb,
  dominant_emotion text,
  aspects jsonb,
  keywords text[],
  topic_id integer,
  topic_label text,
  created_at timestamptz default now()
);

-- User API keys
create table if not exists user_api_keys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('openai', 'google')),
  encrypted_key text not null,
  key_hint text not null default '',
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (owner_id, provider)
);

-- Indexes
create index if not exists idx_sentiment_analyses_owner on sentiment_analyses(owner_id);
create index if not exists idx_sentiment_analyses_status on sentiment_analyses(status);
create index if not exists idx_sentiment_results_analysis on sentiment_results(analysis_id);
create index if not exists idx_sentiment_results_owner on sentiment_results(owner_id);
create index if not exists idx_sentiment_results_sentiment on sentiment_results(sentiment_label);
create index if not exists idx_uploaded_datasets_owner on uploaded_datasets(owner_id);
create index if not exists idx_user_api_keys_owner on user_api_keys(owner_id);

-- RLS
alter table uploaded_datasets enable row level security;
alter table sentiment_analyses enable row level security;
alter table sentiment_results enable row level security;
alter table user_api_keys enable row level security;

-- Policies: uploaded_datasets
create policy "Users can read own datasets"
on uploaded_datasets for select using (owner_id = auth.uid());

create policy "Users can insert own datasets"
on uploaded_datasets for insert with check (owner_id = auth.uid());

create policy "Users can delete own datasets"
on uploaded_datasets for delete using (owner_id = auth.uid());

-- Policies: sentiment_analyses
create policy "Users can read own analyses"
on sentiment_analyses for select using (owner_id = auth.uid());

create policy "Users can insert own analyses"
on sentiment_analyses for insert with check (owner_id = auth.uid());

create policy "Users can update own analyses"
on sentiment_analyses for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users can delete own analyses"
on sentiment_analyses for delete using (owner_id = auth.uid());

-- Policies: sentiment_results
create policy "Users can read own results"
on sentiment_results for select using (owner_id = auth.uid());

create policy "Users can insert own results"
on sentiment_results for insert with check (owner_id = auth.uid());

create policy "Users can delete own results"
on sentiment_results for delete using (owner_id = auth.uid());

-- Policies: user_api_keys
create policy "Users can read own keys"
on user_api_keys for select using (owner_id = auth.uid());

create policy "Users can insert own keys"
on user_api_keys for insert with check (owner_id = auth.uid());

create policy "Users can update own keys"
on user_api_keys for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Users can delete own keys"
on user_api_keys for delete using (owner_id = auth.uid());

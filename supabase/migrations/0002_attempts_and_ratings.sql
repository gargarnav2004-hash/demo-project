-- Saves every scored answer, and each user's thumbs up/down on its feedback.
-- Run once in the Supabase SQL editor.

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  -- Set to null if the question is later deleted; question_text keeps the wording.
  question_id uuid references questions (id) on delete set null,
  question_text text not null,
  category text not null,
  difficulty text not null,
  answer text not null,
  score integer not null check (score between 1 and 5),
  bullets jsonb not null,
  model text not null,
  created_at timestamptz not null default now()
);

create index if not exists attempts_user_created_idx on attempts (user_id, created_at desc);

create table if not exists feedback_ratings (
  attempt_id uuid primary key references attempts (id) on delete cascade,
  user_id text not null,
  rating text not null check (rating in ('up', 'down')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists feedback_ratings_set_updated_at on feedback_ratings;
create trigger feedback_ratings_set_updated_at
  before update on feedback_ratings
  for each row execute function set_updated_at();

-- RLS with no policies, like the other tables: only the service_role key has access.
alter table attempts enable row level security;
alter table feedback_ratings enable row level security;

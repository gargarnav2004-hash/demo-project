-- Fixed five-part rubric scores, scored follow-ups, and hand grading for /admin/eval.
-- Run once in the Supabase SQL editor. Answers saved before this keep null rubric
-- columns, and their whole-number score still works as the overall score.

-- The overall score is now the average of five scores, such as 3.4.
alter table attempts alter column score type numeric(2, 1);

alter table attempts
  add column if not exists structure_score smallint check (structure_score between 1 and 5),
  add column if not exists user_focus_score smallint check (user_focus_score between 1 and 5),
  add column if not exists metrics_score smallint check (metrics_score between 1 and 5),
  add column if not exists tradeoffs_score smallint check (tradeoffs_score between 1 and 5),
  add column if not exists communication_score smallint check (communication_score between 1 and 5),
  add column if not exists rubric_comments jsonb,
  add column if not exists followup_question text,
  add column if not exists prompt_version text;

create table if not exists followups (
  attempt_id uuid primary key references attempts (id) on delete cascade,
  user_id text not null,
  question text not null,
  answer text not null,
  score numeric(2, 1) not null check (score between 1 and 5),
  structure_score smallint not null check (structure_score between 1 and 5),
  user_focus_score smallint not null check (user_focus_score between 1 and 5),
  metrics_score smallint not null check (metrics_score between 1 and 5),
  tradeoffs_score smallint not null check (tradeoffs_score between 1 and 5),
  communication_score smallint not null check (communication_score between 1 and 5),
  rubric_comments jsonb not null,
  bullets jsonb not null,
  rating text check (rating in ('up', 'down')),
  model text not null,
  prompt_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists human_scores (
  attempt_id uuid primary key references attempts (id) on delete cascade,
  structure_score smallint not null check (structure_score between 1 and 5),
  user_focus_score smallint not null check (user_focus_score between 1 and 5),
  metrics_score smallint not null check (metrics_score between 1 and 5),
  tradeoffs_score smallint not null check (tradeoffs_score between 1 and 5),
  communication_score smallint not null check (communication_score between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists human_scores_set_updated_at on human_scores;
create trigger human_scores_set_updated_at
  before update on human_scores
  for each row execute function set_updated_at();

-- RLS with no policies, like the other tables: only the service_role key has access.
alter table followups enable row level security;
alter table human_scores enable row level security;

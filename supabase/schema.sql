-- PMPrep AI — Supabase schema
-- Run this once in the Supabase SQL editor (Project -> SQL Editor -> New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT where it matters.

create extension if not exists pgcrypto;

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in (
    'Product Sense', 'Metrics', 'Estimation', 'Strategy', 'Behavioural', 'AI PM'
  )),
  prompt text not null,
  difficulty text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists rubrics (
  category text primary key check (category in (
    'Product Sense', 'Metrics', 'Estimation', 'Strategy', 'Behavioural', 'AI PM'
  )),
  criteria text not null,
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists questions_set_updated_at on questions;
create trigger questions_set_updated_at
  before update on questions
  for each row execute function set_updated_at();

drop trigger if exists rubrics_set_updated_at on rubrics;
create trigger rubrics_set_updated_at
  before update on rubrics
  for each row execute function set_updated_at();

-- RLS is enabled with no policies: only the service_role key (used server-side
-- by this app's API routes) can read/write. The anon/public key has no access.
alter table questions enable row level security;
alter table rubrics enable row level security;

-- Seed data ------------------------------------------------------------

insert into questions (category, prompt, difficulty) values
  ('Product Sense', 'Design a birthday reminder feature for a messaging app.', 'Medium'),
  ('Product Sense', 'What''s your favorite product, and how would you improve it?', 'Easy'),
  ('Product Sense', 'How would you improve the experience of ordering food through a delivery app?', 'Medium'),
  ('Product Sense', 'Design a product to help elderly users stay connected with their families.', 'Medium'),
  ('Product Sense', 'A ride-sharing app wants to increase driver retention. What would you build?', 'Hard'),

  ('Metrics', 'What metrics would you track to measure the success of a new email client''s inbox search feature?', 'Medium'),
  ('Metrics', 'Daily active users for a fitness app dropped 15% last month. How would you investigate?', 'Medium'),
  ('Metrics', 'How would you define and measure ''success'' for a checkout redesign on an e-commerce site?', 'Medium'),
  ('Metrics', 'What''s the North Star metric you''d choose for a B2B project management tool, and why?', 'Hard'),
  ('Metrics', 'Engagement is up but revenue is flat for a social app. What might be going on?', 'Hard'),

  ('Estimation', 'How many coffee cups are sold in New York City on a given day?', 'Easy'),
  ('Estimation', 'Estimate the number of photos uploaded to a photo-sharing app worldwide every day.', 'Medium'),
  ('Estimation', 'How many gas stations are there in the United States?', 'Easy'),
  ('Estimation', 'Estimate the total revenue of all food trucks in a mid-sized city over a year.', 'Medium'),
  ('Estimation', 'How many searches happen on a major search engine per second, globally?', 'Medium'),

  ('Strategy', 'A streaming service is losing subscribers to a cheaper competitor. What''s your strategy?', 'Hard'),
  ('Strategy', 'Should a note-taking app expand into team collaboration features? Walk through your reasoning.', 'Medium'),
  ('Strategy', 'How should a mature ad-supported app think about entering a new international market?', 'Hard'),
  ('Strategy', 'Your company''s core product is being commoditized by free alternatives. What do you do?', 'Hard'),
  ('Strategy', 'How would you decide whether to build, buy, or partner for a new capability?', 'Medium'),

  ('Behavioural', 'Tell me about a time you disagreed with an engineering lead on prioritization. How did you handle it?', 'Easy'),
  ('Behavioural', 'Describe a product decision you made that turned out to be wrong. What did you learn?', 'Medium'),
  ('Behavioural', 'Tell me about a time you had to influence a decision without direct authority.', 'Medium'),
  ('Behavioural', 'Describe a time you had to say no to a stakeholder''s request. How did you approach it?', 'Easy'),
  ('Behavioural', 'Tell me about a project that failed. What was your role, and what would you do differently?', 'Medium'),

  ('AI PM', 'How would you decide whether a feature should use an LLM versus a simpler rules-based system?', 'Medium'),
  ('AI PM', 'Design an AI-powered writing assistant for a note-taking app. What''s your v1 scope?', 'Medium'),
  ('AI PM', 'How would you evaluate whether an AI feature is actually ready to ship to users?', 'Hard'),
  ('AI PM', 'Your AI support chatbot has a 20% hallucination rate on niche queries. How do you prioritize fixing it?', 'Hard'),
  ('AI PM', 'How would you think about pricing an AI feature that has variable per-query inference costs?', 'Hard')
on conflict do nothing;

insert into rubrics (category, criteria) values
  ('Product Sense', '1. Clarifies the user and their goal before jumping to solutions. 2. Identifies a real, specific user pain point. 3. Proposes a focused solution with clear tradeoffs, not a laundry list of features. 4. Considers how success would be measured.'),
  ('Metrics', '1. Picks metrics that are specific and measurable, not vague. 2. Distinguishes leading vs. lagging indicators and names a primary metric. 3. Considers counter-metrics or risks of gaming the metric. 4. Ties metrics back to user or business value.'),
  ('Estimation', '1. States assumptions explicitly before calculating. 2. Breaks the problem into a clear, logical chain of steps. 3. Uses reasonable, defensible numbers (order-of-magnitude sanity). 4. Sanity-checks the final answer.'),
  ('Strategy', '1. Frames the problem in terms of market, user, and business context. 2. Weighs multiple options with real tradeoffs rather than picking one path immediately. 3. Makes a clear recommendation with reasoning. 4. Anticipates risks or how the strategy could fail.'),
  ('Behavioural', '1. Uses a concrete, specific story (situation, action, result) rather than a generic answer. 2. Clearly explains their own role and actions, not just the team''s. 3. Reflects honestly on the outcome and what they learned. 4. Keeps the answer focused and relevant to the question asked.'),
  ('AI PM', '1. Shows judgment about when AI is (or isn''t) the right tool for the problem. 2. Considers data, evaluation, and failure modes specific to AI systems (e.g. hallucination, latency, cost). 3. Thinks about how to measure quality and iterate post-launch. 4. Balances user trust and experience against model limitations.')
on conflict (category) do nothing;

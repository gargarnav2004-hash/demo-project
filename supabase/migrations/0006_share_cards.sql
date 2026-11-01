-- Lets a user share one answer's score through a public link. The link only
-- exposes the score, category and company, never the answer.
-- Run once in the Supabase SQL editor.

alter table attempts add column if not exists share_id uuid unique;

-- Adds Root Cause Analysis as a seventh category, with a rubric and questions.
-- Run once in the Supabase SQL editor.

alter table questions drop constraint if exists questions_category_check;
alter table questions add constraint questions_category_check check (category in (
  'Product Sense', 'Metrics', 'Root Cause Analysis', 'Estimation', 'Strategy', 'Behavioural', 'AI PM'
));

alter table rubrics drop constraint if exists rubrics_category_check;
alter table rubrics add constraint rubrics_category_check check (category in (
  'Product Sense', 'Metrics', 'Root Cause Analysis', 'Estimation', 'Strategy', 'Behavioural', 'AI PM'
));

insert into rubrics (category, criteria) values
  ('Root Cause Analysis', '1. Clarifies the metric and the problem first: how it is defined, how large the change is, and over what period. 2. Rules out data, tracking, and seasonal explanations before assuming a real change. 3. Investigates in a structured way by breaking the problem down by segment, platform, geography, and funnel step, considering both internal and external causes. 4. Prioritises the most likely hypotheses, says what evidence would confirm each one, and proposes a next step.')
on conflict (category) do nothing;

insert into questions (category, prompt, difficulty)
select seed.category, seed.prompt, seed.difficulty
from (values
  ('Root Cause Analysis', 'Orders on a food delivery app fell 10% this week compared with last week. How would you find out why?', 'Easy'),
  ('Root Cause Analysis', 'Payment success rate on an e-commerce checkout dropped from 92% to 85% overnight. Walk through your investigation.', 'Medium'),
  ('Root Cause Analysis', 'New user sign-ups for a mobile app are flat, but seven-day retention has fallen sharply. What could be causing this?', 'Medium'),
  ('Root Cause Analysis', 'Average delivery time in one city has risen by 8 minutes while other cities are unchanged. How would you diagnose it?', 'Medium'),
  ('Root Cause Analysis', 'Customer support tickets doubled after a release, but no error rates changed. How would you work out what happened?', 'Hard')
) as seed (category, prompt, difficulty)
where not exists (select 1 from questions where category = 'Root Cause Analysis');

-- Adds a company to questions, with sample questions you can replace in /admin.
-- Questions with no company stay general. Run once in the Supabase SQL editor.

alter table questions add column if not exists company text;
alter table attempts add column if not exists company text;

create index if not exists questions_company_category_idx on questions (company, category);

insert into questions (company, category, prompt, difficulty)
select seed.company, seed.category, seed.prompt, seed.difficulty
from (values
  ('Swiggy', 'Product Sense', 'How would you make reordering a favourite meal easier for repeat Swiggy customers?', 'Easy'),
  ('Swiggy', 'Metrics', 'What would you choose as the North Star metric for Swiggy Instamart, and why?', 'Medium'),
  ('Swiggy', 'Root Cause Analysis', 'Order cancellations on Swiggy rose sharply in one city last weekend. How would you find out why?', 'Medium'),

  ('Zomato', 'Product Sense', 'Design a feature that helps people choose a restaurant faster on Zomato.', 'Easy'),
  ('Zomato', 'Metrics', 'How would you measure whether restaurant reviews on Zomato are actually helping people decide?', 'Medium'),
  ('Zomato', 'Strategy', 'Should Zomato put its next big investment into food delivery or dining out? Walk through your reasoning.', 'Hard'),

  ('Flipkart', 'Product Sense', 'How would you improve the returns experience for Flipkart shoppers in smaller towns?', 'Medium'),
  ('Flipkart', 'Root Cause Analysis', 'Checkout conversion on Flipkart''s mobile app dropped on the first day of a big sale. How would you diagnose it?', 'Hard'),
  ('Flipkart', 'Estimation', 'Estimate how many parcels Flipkart delivers on the biggest day of a festive sale.', 'Medium'),

  ('Razorpay', 'Product Sense', 'Design a better onboarding experience for small businesses that start accepting payments with Razorpay.', 'Medium'),
  ('Razorpay', 'Metrics', 'What metrics would you use to judge the health of Razorpay''s payment links product?', 'Medium'),
  ('Razorpay', 'Strategy', 'Should Razorpay build more banking features for small businesses or stay focused on payments?', 'Hard'),

  ('CRED', 'Product Sense', 'How would you get more CRED members to use the app for more than paying credit card bills?', 'Medium'),
  ('CRED', 'Metrics', 'How would you measure whether CRED''s rewards create lasting engagement rather than one-time visits?', 'Medium'),
  ('CRED', 'Strategy', 'CRED is known for focusing on members with strong credit scores. Should it open up to a wider audience?', 'Hard'),

  ('PhonePe', 'Product Sense', 'How would you help first-time UPI users feel confident making a payment on PhonePe?', 'Easy'),
  ('PhonePe', 'Root Cause Analysis', 'Failed UPI payments on PhonePe spiked for one hour this morning. How would you investigate?', 'Medium'),
  ('PhonePe', 'Strategy', 'How should PhonePe decide which financial product to add next beyond payments?', 'Hard')
) as seed (company, category, prompt, difficulty)
where not exists (select 1 from questions where company is not null);

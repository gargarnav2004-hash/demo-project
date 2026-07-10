import type { Category, Question } from "@/types";

export const QUESTION_BANK: Record<Category, Question[]> = {
  "Product Sense": [
    {
      id: "ps-1",
      category: "Product Sense",
      prompt: "Design a birthday reminder feature for a messaging app.",
    },
    {
      id: "ps-2",
      category: "Product Sense",
      prompt: "What's your favorite product, and how would you improve it?",
    },
    {
      id: "ps-3",
      category: "Product Sense",
      prompt: "How would you improve the experience of ordering food through a delivery app?",
    },
    {
      id: "ps-4",
      category: "Product Sense",
      prompt: "Design a product to help elderly users stay connected with their families.",
    },
    {
      id: "ps-5",
      category: "Product Sense",
      prompt: "A ride-sharing app wants to increase driver retention. What would you build?",
    },
  ],
  Metrics: [
    {
      id: "met-1",
      category: "Metrics",
      prompt: "What metrics would you track to measure the success of a new email client's inbox search feature?",
    },
    {
      id: "met-2",
      category: "Metrics",
      prompt: "Daily active users for a fitness app dropped 15% last month. How would you investigate?",
    },
    {
      id: "met-3",
      category: "Metrics",
      prompt: "How would you define and measure 'success' for a checkout redesign on an e-commerce site?",
    },
    {
      id: "met-4",
      category: "Metrics",
      prompt: "What's the North Star metric you'd choose for a B2B project management tool, and why?",
    },
    {
      id: "met-5",
      category: "Metrics",
      prompt: "Engagement is up but revenue is flat for a social app. What might be going on?",
    },
  ],
  Estimation: [
    {
      id: "est-1",
      category: "Estimation",
      prompt: "How many coffee cups are sold in New York City on a given day?",
    },
    {
      id: "est-2",
      category: "Estimation",
      prompt: "Estimate the number of photos uploaded to a photo-sharing app worldwide every day.",
    },
    {
      id: "est-3",
      category: "Estimation",
      prompt: "How many gas stations are there in the United States?",
    },
    {
      id: "est-4",
      category: "Estimation",
      prompt: "Estimate the total revenue of all food trucks in a mid-sized city over a year.",
    },
    {
      id: "est-5",
      category: "Estimation",
      prompt: "How many searches happen on a major search engine per second, globally?",
    },
  ],
  Strategy: [
    {
      id: "str-1",
      category: "Strategy",
      prompt: "A streaming service is losing subscribers to a cheaper competitor. What's your strategy?",
    },
    {
      id: "str-2",
      category: "Strategy",
      prompt: "Should a note-taking app expand into team collaboration features? Walk through your reasoning.",
    },
    {
      id: "str-3",
      category: "Strategy",
      prompt: "How should a mature ad-supported app think about entering a new international market?",
    },
    {
      id: "str-4",
      category: "Strategy",
      prompt: "Your company's core product is being commoditized by free alternatives. What do you do?",
    },
    {
      id: "str-5",
      category: "Strategy",
      prompt: "How would you decide whether to build, buy, or partner for a new capability?",
    },
  ],
  Behavioural: [
    {
      id: "beh-1",
      category: "Behavioural",
      prompt: "Tell me about a time you disagreed with an engineering lead on prioritization. How did you handle it?",
    },
    {
      id: "beh-2",
      category: "Behavioural",
      prompt: "Describe a product decision you made that turned out to be wrong. What did you learn?",
    },
    {
      id: "beh-3",
      category: "Behavioural",
      prompt: "Tell me about a time you had to influence a decision without direct authority.",
    },
    {
      id: "beh-4",
      category: "Behavioural",
      prompt: "Describe a time you had to say no to a stakeholder's request. How did you approach it?",
    },
    {
      id: "beh-5",
      category: "Behavioural",
      prompt: "Tell me about a project that failed. What was your role, and what would you do differently?",
    },
  ],
  "AI PM": [
    {
      id: "ai-1",
      category: "AI PM",
      prompt: "How would you decide whether a feature should use an LLM versus a simpler rules-based system?",
    },
    {
      id: "ai-2",
      category: "AI PM",
      prompt: "Design an AI-powered writing assistant for a note-taking app. What's your v1 scope?",
    },
    {
      id: "ai-3",
      category: "AI PM",
      prompt: "How would you evaluate whether an AI feature is actually ready to ship to users?",
    },
    {
      id: "ai-4",
      category: "AI PM",
      prompt: "Your AI support chatbot has a 20% hallucination rate on niche queries. How do you prioritize fixing it?",
    },
    {
      id: "ai-5",
      category: "AI PM",
      prompt: "How would you think about pricing an AI feature that has variable per-query inference costs?",
    },
  ],
};

export const ALL_QUESTIONS: Question[] = Object.values(QUESTION_BANK).flat();

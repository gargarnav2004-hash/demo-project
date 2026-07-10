import type { Category } from "@/types";

export const RUBRICS: Record<Category, string> = {
  "Product Sense":
    "1. Clarifies the user and their goal before jumping to solutions. 2. Identifies a real, specific user pain point. 3. Proposes a focused solution with clear tradeoffs, not a laundry list of features. 4. Considers how success would be measured.",
  Metrics:
    "1. Picks metrics that are specific and measurable, not vague. 2. Distinguishes leading vs. lagging indicators and names a primary metric. 3. Considers counter-metrics or risks of gaming the metric. 4. Ties metrics back to user or business value.",
  Estimation:
    "1. States assumptions explicitly before calculating. 2. Breaks the problem into a clear, logical chain of steps. 3. Uses reasonable, defensible numbers (order-of-magnitude sanity). 4. Sanity-checks the final answer.",
  Strategy:
    "1. Frames the problem in terms of market, user, and business context. 2. Weighs multiple options with real tradeoffs rather than picking one path immediately. 3. Makes a clear recommendation with reasoning. 4. Anticipates risks or how the strategy could fail.",
  Behavioural:
    "1. Uses a concrete, specific story (situation, action, result) rather than a generic answer. 2. Clearly explains their own role and actions, not just the team's. 3. Reflects honestly on the outcome and what they learned. 4. Keeps the answer focused and relevant to the question asked.",
  "AI PM":
    "1. Shows judgment about when AI is (or isn't) the right tool for the problem. 2. Considers data, evaluation, and failure modes specific to AI systems (e.g. hallucination, latency, cost). 3. Thinks about how to measure quality and iterate post-launch. 4. Balances user trust and experience against model limitations.",
};

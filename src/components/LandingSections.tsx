import { CATEGORY_DESCRIPTIONS, CATEGORY_LABELS } from "@/lib/categories";
import { CATEGORIES } from "@/types";
import ScoreRow from "./ScoreRow";

const CONTACT_EMAIL = "garg.arnav2004@gmail.com";

const STEPS = [
  {
    title: "Pick a category",
    body: "Choose the kind of PM interview question you want to work on.",
  },
  {
    title: "Answer one question",
    body: "Type your answer the way you'd say it in the interview.",
  },
  {
    title: "Get specific feedback",
    body: "See a score out of 5 and notes based on what you actually wrote.",
  },
];

const SAMPLE_BULLETS = [
  "You chose office workers ordering lunch and named their pain point clearly, but you didn't say how often it happens. Add a rough number to show it's worth solving.",
  "Scheduled lunch slots is a focused idea. Say what you'd give up to build it, such as fewer impulse orders, so the tradeoff is clear.",
  "\"More orders\" is too broad a goal. Pick one main metric, like weekly orders per active user, and one guardrail, like on-time delivery rate.",
];

const FAQS = [
  {
    question: "How does the scoring work?",
    answer:
      "AI grades your answer against the criteria for that category, then gives you a score and specific notes. It can make mistakes, so use it as a practice partner and double-check any facts it mentions.",
  },
  {
    question: "Is it free?",
    answer: "Yes, it's free right now. You can get up to 20 pieces of feedback a day.",
  },
  {
    question: "Do I need an account?",
    answer: "Yes. A free account keeps your practice private to you and helps us prevent misuse.",
  },
  {
    question: "Are these real interview questions?",
    answer:
      "They're written in the style of common PM interviews. They aren't leaked questions from any company.",
  },
  {
    question: "How long should my answer be?",
    answer:
      "As long as it takes to make your point, up to 5,000 characters. A few clear paragraphs usually work best.",
  },
];

function SectionHeading({ title, intro }: { title: string; intro?: string }) {
  return (
    <>
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {intro && <p className="mt-2 text-muted">{intro}</p>}
    </>
  );
}

export default function LandingSections() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-16 px-6 pb-20">
      <section>
        <SectionHeading title="How it works" />
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-medium">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHeading title="What you can practice" />
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORIES.map((category) => (
            <li key={category} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-base font-medium">{CATEGORY_LABELS[category] ?? category}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {CATEGORY_DESCRIPTIONS[category]}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading
          title="What feedback looks like"
          intro="An example of what you'll get after answering."
        />
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Product Sense
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              Example
            </span>
          </div>
          <p className="mt-4 font-medium leading-relaxed">
            How would you improve the experience of ordering food through a delivery app?
          </p>
          <div className="mt-5 border-t border-border pt-5">
            <ScoreRow score={3} />
            <ul className="mt-4 space-y-2">
              {SAMPLE_BULLETS.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading title="Questions" />
        <div className="mt-6 space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-border bg-surface">
              <summary className="cursor-pointer px-5 py-4 text-sm font-medium">{faq.question}</summary>
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="privacy">
        <SectionHeading title="Your privacy" />
        <div className="mt-6 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            <strong className="font-medium text-foreground">What we store:</strong>{" "}
            your account details (handled by Clerk), plus your answers, scores, feedback, and ratings, linked to
            your account. We keep these so you can see your progress and so we can improve the
            feedback.
          </p>
          <p>
            <strong className="font-medium text-foreground">Who sees your answers:</strong>{" "}
            they&apos;re sent to Anthropic&apos;s AI to generate your feedback. PMPrep AI&apos;s owner may also read
            answers to check scoring quality, so please leave out confidential or personal details.
          </p>
          <p>
            <strong className="font-medium text-foreground">Analytics:</strong>{" "}
            we use PostHog and Vercel Analytics to see how the app is used, such as pages visited and questions
            started. Your answer text is never sent to them. We don&apos;t sell your data.
          </p>
          <p>
            To ask a question or have your data deleted, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

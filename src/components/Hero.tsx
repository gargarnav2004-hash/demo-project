interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">PMPrep AI</h1>
      <p className="mt-4 max-w-md text-balance text-lg text-muted">
        Practice real PM interview questions and get instant, focused feedback.
      </p>
      <button
        onClick={onStart}
        className="mt-10 rounded-full bg-primary px-8 py-3 text-base font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Start practicing
      </button>
    </section>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-24 sm:px-8 sm:pb-28 sm:pt-32">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          Open Source &middot; Privacy First
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
          Your private AI assistant.{" "}
          <span className="text-coral">Your server.</span>{" "}
          <span className="text-text-secondary">5 minutes.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
          Stop trusting third parties with your AI conversations. Get a Claw
          sets up OpenClaw on your own VPS — fully automated, completely
          private, and open source.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/setup"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-coral px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-coral-hover active:bg-coral-active"
          >
            Get Started
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
          </a>
          <a
            href="https://github.com/getaclaw/getaclaw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-sand/50 dark:hover:bg-dark-elevated"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

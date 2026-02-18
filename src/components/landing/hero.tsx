import { HeroDeployAnimation } from "./hero-deploy-animation";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-32">
      {/* Decorative gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-sea-green/6 to-transparent blur-3xl dark:from-sea-green/12" />
      </div>

      <div className="mx-auto max-w-[1200px] lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
        {/* Left column: text content */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-coral/20 bg-coral-50 px-3.5 py-1.5 dark:border-coral/30 dark:bg-coral-900/20">
            <span className="h-1.5 w-1.5 rounded-full bg-coral animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-coral">
              Free &amp; Open Source &middot; Privacy First
            </span>
          </div>

          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Your private AI assistant.{" "}
            <span className="text-coral">Your server.</span>{" "}
            <span className="text-text-secondary">5 minutes.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary">
            Stop trusting third parties with your AI conversations. GetaClaw
            sets up OpenClaw on your own VPS - fully automated, completely
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
              href="https://github.com/hristo2612/getaclaw"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-border px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-surface hover:border-border-hover"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Right column: deploy animation */}
        <HeroDeployAnimation />
      </div>
    </section>
  );
}

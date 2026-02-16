import { ShieldCheck, Eye, DollarSign } from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Total privacy",
    hosted: "Provider can read your messages, API keys, and personal data at any time",
    selfHosted: "Everything stays on YOUR server. Nobody else has access. Period.",
  },
  {
    icon: Eye,
    title: "Full transparency",
    hosted: "Closed source. You can't verify what they do with your data.",
    selfHosted: "100% open source. Inspect every line. Fork and modify freely.",
  },
  {
    icon: DollarSign,
    title: "Lower cost",
    hosted: "Monthly subscription + markup on AI model usage",
    selfHosted: "VPS from ~$4/month + pay only for the AI models you actually use",
  },
];

export function WhySelfHost() {
  return (
    <section className="border-t border-border bg-surface px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          Why self-host?
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Your data should stay yours
        </h2>
        <p className="mt-4 max-w-2xl text-text-secondary">
          Hosted AI services have access to your conversations, files, and API
          keys. Self-hosting puts you in full control.
        </p>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-[var(--radius-lg)] border border-border bg-background p-6 transition-shadow hover:shadow-md dark:hover:shadow-none"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-coral-light text-coral dark:bg-coral-900/30">
                <reason.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                {reason.title}
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-soft-red/10 text-soft-red">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium text-text-muted">Hosted: </span>
                    {reason.hosted}
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sea-green/10 text-sea-green">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-sm text-text-secondary">
                    <span className="font-medium text-sea-green">Self-hosted: </span>
                    {reason.selfHosted}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

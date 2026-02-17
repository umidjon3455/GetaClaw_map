import { Server, Settings, Zap, Smartphone } from "lucide-react";

const steps = [
  {
    icon: Server,
    number: "01",
    title: "Choose your server",
    description:
      "Pick a VPS provider -Hetzner, DigitalOcean, or more. Paste your API key and select a region.",
  },
  {
    icon: Settings,
    number: "02",
    title: "Configure your AI",
    description:
      "Choose your AI models via OpenRouter and pick which messaging apps you want -WhatsApp, Telegram, Discord, and more.",
  },
  {
    icon: Zap,
    number: "03",
    title: "We set it all up",
    description:
      "Watch in real-time as we provision your server, install OpenClaw, and configure everything automatically.",
  },
  {
    icon: Smartphone,
    number: "04",
    title: "Access from any device",
    description:
      "Your private AI is live. Open it from your phone, laptop, or any device -securely, via Tailscale or password.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-border px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Four steps. Five minutes. Done.
        </h2>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="group relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-coral-light text-coral transition-all group-hover:bg-coral group-hover:text-white group-hover:shadow-lg group-hover:shadow-coral/20 dark:bg-coral-900/30 dark:group-hover:bg-coral">
                <step.icon className="h-5 w-5" />
              </div>
              <p className="mt-4 font-mono text-xs font-semibold text-text-muted">
                {step.number}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

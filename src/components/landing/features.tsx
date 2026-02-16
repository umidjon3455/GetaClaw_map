import {
  MessageCircle,
  Bot,
  Globe,
  Lock,
  RefreshCw,
  Layers,
} from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "All your messaging apps",
    description:
      "WhatsApp, Telegram, Discord, Slack, Signal, iMessage — connect them all to one AI assistant.",
  },
  {
    icon: Bot,
    title: "Any AI model",
    description:
      "Use Claude, GPT-4, Gemini, Llama, Mistral, or any model available through OpenRouter.",
  },
  {
    icon: Globe,
    title: "Web Control UI",
    description:
      "Full browser-based dashboard to chat, manage channels, configure settings, and view logs.",
  },
  {
    icon: Lock,
    title: "Secure access",
    description:
      "Access via Tailscale private network or password-protected HTTPS. Your choice.",
  },
  {
    icon: RefreshCw,
    title: "One-click updates",
    description:
      "Come back to Get a Claw to update your OpenClaw instance with a single click. No SSH needed.",
  },
  {
    icon: Layers,
    title: "Multiple instances",
    description:
      "Run separate instances for personal, work, or family use — each on their own server.",
  },
];

export function Features() {
  return (
    <section className="border-t border-border px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <p className="text-sm font-semibold uppercase tracking-widest text-coral">
          What you get
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          Everything you need, nothing you don&apos;t
        </h2>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-[var(--radius-lg)] border border-border p-6 transition-shadow hover:shadow-sm dark:hover:border-dark-border"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-coral-light text-coral transition-colors group-hover:bg-coral group-hover:text-white dark:bg-coral-900/30 dark:group-hover:bg-coral">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

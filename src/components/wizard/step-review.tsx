"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { Check, Pencil } from "lucide-react";

export function StepReview() {
  const store = useWizardStore();
  const {
    vpsProvider,
    serverRegion,
    serverSize,
    serverName,
    securityMode,
    openrouterApiKey,
    selectedModels,
    channelConfigs,
    nextStep,
    prevStep,
    goToStep,
  } = store;

  const enabledChannels = Object.entries(channelConfigs)
    .filter(([, config]) => config?.enabled)
    .map(([id]) => id);

  const sections = [
    {
      title: "VPS Provider",
      step: "vps-provider" as const,
      items: [
        { label: "Provider", value: vpsProvider === "hetzner" ? "Hetzner" : "DigitalOcean" },
        { label: "API Key", value: "••••••••" + (store.vpsApiKey?.slice(-4) || "") },
      ],
    },
    {
      title: "Server",
      step: "server-config" as const,
      items: [
        { label: "Name", value: serverName },
        { label: "Region", value: serverRegion },
        { label: "Size", value: serverSize },
      ],
    },
    {
      title: "Security",
      step: "security" as const,
      items: [
        {
          label: "Mode",
          value: securityMode === "tailscale" ? "Tailscale VPN" : "Password",
        },
      ],
    },
    {
      title: "AI Models",
      step: "models" as const,
      items: [
        { label: "OpenRouter Key", value: "••••••••" + (openrouterApiKey?.slice(-4) || "") },
        { label: "Models", value: `${selectedModels.length} selected` },
      ],
    },
    {
      title: "Channels",
      step: "channels" as const,
      items: [
        {
          label: "Enabled",
          value:
            enabledChannels.length > 0
              ? enabledChannels.map((c) => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")
              : "None (can add later)",
        },
      ],
    },
  ];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        Review your setup
      </h1>
      <p className="mt-3 text-text-secondary">
        Double-check everything before we deploy. Click the edit button on any
        section to make changes.
      </p>

      <div className="mt-8 space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-[var(--radius-lg)] border border-border p-4 dark:border-dark-border"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sea-green text-white">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {section.title}
                </h3>
              </div>
              <button
                onClick={() => goToStep(section.step)}
                className="flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-sand/40 hover:text-text-primary dark:hover:bg-dark-elevated"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            </div>
            <div className="mt-3 space-y-1.5">
              {section.items.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-text-muted">{item.label}</span>
                  <span className="font-medium text-text-primary">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[var(--radius-md)] bg-coral-light/50 p-3 text-xs text-text-secondary dark:bg-coral-900/10">
        <strong className="text-text-primary">Privacy reminder:</strong> Your
        API keys and credentials are processed only in your browser. Nothing is
        stored on our servers.
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="rounded-[var(--radius-md)] border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-sand/40 dark:hover:bg-dark-elevated"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          className="rounded-[var(--radius-md)] bg-coral px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-coral-hover"
        >
          Deploy
        </button>
      </div>
    </div>
  );
}

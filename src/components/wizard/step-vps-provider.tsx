"use client";

import { useWizardStore, type VpsProvider } from "@/lib/store/wizard-store";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { useState } from "react";

const providers: {
  id: VpsProvider;
  name: string;
  price: string;
  description: string;
  recommended?: boolean;
  comingSoon?: boolean;
  apiKeyUrl: string;
  apiKeyHelp: string;
}[] = [
  {
    id: "hetzner",
    name: "Hetzner",
    price: "from ~€3.79/mo",
    description:
      "Best value. European data centers with excellent performance. Cheapest option.",
    recommended: true,
    apiKeyUrl: "https://console.hetzner.cloud/projects",
    apiKeyHelp:
      "Go to your Hetzner project → Security → API Tokens → Generate API Token (Read & Write)",
  },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    price: "from $6/mo",
    description:
      "Simple and popular. Global data centers. Great documentation.",
    comingSoon: true,
    apiKeyUrl: "https://cloud.digitalocean.com/account/api/tokens",
    apiKeyHelp:
      "Go to API → Personal Access Tokens → Generate New Token (Full Access)",
  },
];

export function StepVpsProvider() {
  const {
    vpsProvider,
    setVpsProvider,
    vpsApiKey,
    setVpsApiKey,
    nextStep,
    prevStep,
    skillLevel,
  } = useWizardStore();
  const [showKey, setShowKey] = useState(false);

  const selectedProvider = providers.find((p) => p.id === vpsProvider);
  const canContinue = vpsProvider && vpsApiKey.trim().length > 10;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        Choose your VPS provider
      </h1>
      <p className="mt-3 text-text-secondary">
        This is the server where your AI assistant will live. Pick a provider
        and enter your API key.
      </p>

      {skillLevel === "beginner" && (
        <div className="mt-4 rounded-[var(--radius-md)] bg-coral-light/50 p-3 text-sm text-text-secondary dark:bg-coral-900/10">
          <p>
            <strong className="text-text-primary">What&apos;s a VPS?</strong> A
            Virtual Private Server is a computer in the cloud that&apos;s always
            on. It costs a few dollars per month and runs your AI assistant 24/7.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            onClick={() => !provider.comingSoon && setVpsProvider(provider.id)}
            disabled={provider.comingSoon}
            className={`flex w-full items-start gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              provider.comingSoon
                ? "border-border opacity-50 cursor-not-allowed"
                : vpsProvider === provider.id
                  ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                  : "border-border hover:border-border-hover dark:hover:border-dark-border"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-text-primary">
                  {provider.name}
                </p>
                {provider.recommended && (
                  <span className="rounded-full bg-sea-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sea-green">
                    Recommended
                  </span>
                )}
                {provider.comingSoon && (
                  <span className="rounded-full bg-text-muted/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Coming Soon
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs font-medium text-coral">
                {provider.price}
              </p>
              <p className="mt-1 text-sm text-text-secondary">
                {provider.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* API Key input */}
      {vpsProvider && (
        <div className="mt-8">
          <label className="block text-sm font-medium text-text-primary">
            {selectedProvider?.name} API Key
          </label>
          {skillLevel !== "advanced" && (
            <p className="mt-1 text-sm text-text-secondary">
              {selectedProvider?.apiKeyHelp}{" "}
              <a
                href={selectedProvider?.apiKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-coral hover:underline"
              >
                Open {selectedProvider?.name}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          )}
          <div className="relative mt-2">
            <input
              type={showKey ? "text" : "password"}
              value={vpsApiKey}
              onChange={(e) => setVpsApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 pr-10 font-mono text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20 dark:bg-dark-surface"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-text-muted">
            Your key is used only in your browser to create the server. It is
            never sent to or stored on our servers.
          </p>
        </div>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="rounded-[var(--radius-md)] border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-sand/40 dark:hover:bg-dark-elevated"
        >
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!canContinue}
          className="rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

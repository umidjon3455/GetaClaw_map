"use client";

import { useWizardStore, type SecurityMode } from "@/lib/store/wizard-store";
import { Lock, Shield, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useState } from "react";


const securityOptions: {
  id: SecurityMode;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  description: string;
  securityLevel: string;
  securityColor: string;
}[] = [
  {
    id: "password",
    icon: Lock,
    title: "Token URL",
    subtitle: "Simpler setup",
    description:
      "Access your AI via a secure, unique URL. A private access token is generated automatically during deployment.",
    securityLevel: "Good",
    securityColor: "text-amber",
  },
  {
    id: "tailscale",
    icon: Shield,
    title: "Tailscale VPN",
    subtitle: "More secure",
    description:
      "Access your AI through a private Tailscale network. Your server is invisible to the public internet.",
    securityLevel: "Excellent",
    securityColor: "text-sea-green",
  },
];

export function StepSecurity() {
  const {
    securityMode,
    setSecurityMode,
    tailscaleAuthKey,
    setTailscaleAuthKey,
    nextStep,
    prevStep,
  } = useWizardStore();
  const [showTsKey, setShowTsKey] = useState(false);

  const canContinue =
    securityMode === "password" ||
    (securityMode === "tailscale" && tailscaleAuthKey.trim().length > 10);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        How will you access your AI?
      </h1>
      <p className="mt-3 text-text-secondary">
        Choose how you want to securely connect to your OpenClaw instance from
        your devices.
      </p>

      <div className="mt-6 space-y-3">
        {securityOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSecurityMode(option.id)}
            className={`flex w-full items-start gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-colors ${
              securityMode === option.id
                ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                : "border-border hover:border-border-hover dark:hover:border-dark-border"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
                securityMode === option.id
                  ? "bg-coral text-white"
                  : "bg-sand/60 text-text-secondary dark:bg-dark-elevated"
              }`}
            >
              <option.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-text-primary">
                  {option.title}
                </p>
                <span className={`text-xs font-semibold ${option.securityColor}`}>
                  {option.securityLevel}
                </span>
              </div>
              <p className="text-xs text-text-muted">{option.subtitle}</p>
              <p className="mt-1 text-sm text-text-secondary">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Tailscale config */}
      {securityMode === "tailscale" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-[var(--radius-md)] bg-surface border border-border p-4 dark:bg-dark-surface">
            <p className="text-sm font-medium text-text-primary">
              Before continuing, you&apos;ll need:
            </p>
            <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm text-text-secondary">
              <li>
                A Tailscale account —{" "}
                <a
                  href="https://login.tailscale.com/start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-coral hover:underline"
                >
                  Sign up free <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                Tailscale installed on your phone/device —{" "}
                <a
                  href="https://tailscale.com/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-coral hover:underline"
                >
                  Download <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                An auth key —{" "}
                <a
                  href="https://login.tailscale.com/admin/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-coral hover:underline"
                >
                  Generate key <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary">
              Tailscale Auth Key
            </label>
            <div className="relative mt-2">
              <input
                type={showTsKey ? "text" : "password"}
                value={tailscaleAuthKey}
                onChange={(e) => setTailscaleAuthKey(e.target.value)}
                placeholder="tskey-auth-..."
                className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 pr-10 font-mono text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20 dark:bg-dark-surface"
              />
              <button
                type="button"
                onClick={() => setShowTsKey(!showTsKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
              >
                {showTsKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
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

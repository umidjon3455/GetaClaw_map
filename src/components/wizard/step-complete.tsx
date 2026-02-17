"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { ExternalLink, Copy, Eye, EyeOff, Check } from "lucide-react";
import { useState } from "react";

export function StepComplete() {
  const { securityMode, serverName, deployResult } =
    useWizardStore();
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const serverIp = deployResult?.serverIp ?? "-";
  const gatewayToken = deployResult?.gatewayToken ?? "";
  const controlUiUrl =
    deployResult?.controlUiUrl ??
    (securityMode === "tailscale"
      ? `https://${serverName}.tail1234.ts.net/`
      : `https://${serverIp}/#token=${gatewayToken}`);
  const tailscaleHostname =
    deployResult?.tailscaleIp ?? `${serverName}.tail1234.ts.net`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sea-green text-white">
          <Check className="h-5 w-5" strokeWidth={3} />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
            Your OpenClaw instance is live!
          </h1>
        </div>
      </div>
      <p className="mt-4 text-text-secondary">
        Everything is set up and running on your server. Here are your connection
        details.
      </p>

      {/* Control UI link */}
      <div className="mt-8 rounded-[var(--radius-lg)] border border-sea-green/30 bg-sea-green/5 p-5">
        <p className="text-sm font-medium text-text-primary">Control UI</p>
        <p className="mt-1 truncate font-mono text-sm text-sea-green" title={controlUiUrl}>
          {controlUiUrl}
        </p>
        <a
          href={controlUiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 rounded-[var(--radius-md)] bg-sea-green px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sea-green-dark"
        >
          Open Control UI
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Credentials */}
      <div className="mt-4 rounded-[var(--radius-lg)] border border-border p-5 dark:border-dark-border">
        <p className="text-sm font-semibold text-text-primary">
          Your credentials
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-text-muted">Server IP</p>
              <p className="font-mono text-sm text-text-primary">{serverIp}</p>
            </div>
            <button
              onClick={() => copyToClipboard(serverIp, "ip")}
              className="flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted hover:bg-sand/40 hover:text-text-secondary dark:hover:bg-dark-elevated"
            >
              {copied === "ip" ? <Check className="h-3 w-3 text-sea-green" /> : <Copy className="h-3 w-3" />}
              {copied === "ip" ? "Copied" : "Copy"}
            </button>
          </div>

          {securityMode === "tailscale" && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Tailscale hostname</p>
                <p className="font-mono text-sm text-text-primary">{tailscaleHostname}</p>
              </div>
              <button
                onClick={() => copyToClipboard(tailscaleHostname, "ts")}
                className="flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted hover:bg-sand/40 hover:text-text-secondary dark:hover:bg-dark-elevated"
              >
                {copied === "ts" ? <Check className="h-3 w-3 text-sea-green" /> : <Copy className="h-3 w-3" />}
                {copied === "ts" ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {gatewayToken && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">Access token</p>
                <p className="font-mono text-sm text-text-primary">
                  {showToken ? gatewayToken : "••••••••••••••••"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="rounded-[var(--radius-sm)] px-2 py-1 text-text-muted hover:bg-sand/40 hover:text-text-secondary dark:hover:bg-dark-elevated"
                >
                  {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
                <button
                  onClick={() => copyToClipboard(gatewayToken, "token")}
                  className="flex items-center gap-1 rounded-[var(--radius-sm)] px-2 py-1 text-xs text-text-muted hover:bg-sand/40 hover:text-text-secondary dark:hover:bg-dark-elevated"
                >
                  {copied === "token" ? <Check className="h-3 w-3 text-sea-green" /> : <Copy className="h-3 w-3" />}
                  {copied === "token" ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next steps checklist */}
      <div className="mt-4 rounded-[var(--radius-lg)] border border-border p-5 dark:border-dark-border">
        <p className="text-sm font-semibold text-text-primary">Next steps</p>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3 text-sm text-text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded accent-coral" />
            Open the Control UI and explore your dashboard
          </label>
          <label className="flex items-center gap-3 text-sm text-text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded accent-coral" />
            Connect WhatsApp by scanning the QR code in Channels
          </label>
          {securityMode === "tailscale" && (
            <label className="flex items-center gap-3 text-sm text-text-secondary">
              <input type="checkbox" className="h-4 w-4 rounded accent-coral" />
              Install Tailscale on your phone and sign in
            </label>
          )}
          <label className="flex items-center gap-3 text-sm text-text-secondary">
            <input type="checkbox" className="h-4 w-4 rounded accent-coral" />
            Send your first message to your AI assistant
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href={controlUiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover"
        >
          Go to Dashboard
        </a>
        <button className="rounded-[var(--radius-md)] border border-border px-5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-sand/40 dark:hover:bg-dark-elevated">
          Set Up Another Instance
        </button>
      </div>
    </div>
  );
}

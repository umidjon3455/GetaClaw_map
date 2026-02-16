"use client";

import { useWizardStore, type Channel } from "@/lib/store/wizard-store";
import { MessageCircle, Send, Hash, Slack, Radio, Apple, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const CHANNELS: {
  id: Channel;
  name: string;
  icon: React.ElementType;
  description: string;
  setupFields?: { key: string; label: string; placeholder: string; helpUrl?: string; helpText?: string }[];
  note?: string;
}[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageCircle,
    description: "Connect via QR code after server is live. No setup needed now.",
    note: "You'll scan a QR code in the OpenClaw Control UI after deployment.",
  },
  {
    id: "telegram",
    name: "Telegram",
    icon: Send,
    description: "Create a Telegram bot and paste the token.",
    setupFields: [
      {
        key: "botToken",
        label: "Bot Token",
        placeholder: "123456:ABC-DEF...",
        helpUrl: "https://t.me/BotFather",
        helpText: "Message @BotFather on Telegram → /newbot → copy the token",
      },
    ],
  },
  {
    id: "discord",
    name: "Discord",
    icon: Hash,
    description: "Create a Discord bot application and paste the token.",
    setupFields: [
      {
        key: "botToken",
        label: "Bot Token",
        placeholder: "MTk...",
        helpUrl: "https://discord.com/developers/applications",
        helpText: "Create application → Bot → Reset Token → copy it",
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    icon: Slack,
    description: "Create a Slack app and configure the tokens.",
    setupFields: [
      {
        key: "appToken",
        label: "App Token",
        placeholder: "xapp-...",
        helpUrl: "https://api.slack.com/apps",
        helpText: "Create app → Socket Mode → generate app-level token",
      },
      {
        key: "botToken",
        label: "Bot Token",
        placeholder: "xoxb-...",
        helpText: "OAuth & Permissions → Bot User OAuth Token",
      },
    ],
  },
  {
    id: "signal",
    name: "Signal",
    icon: Radio,
    description: "Connect via Signal CLI after server is live.",
    note: "Signal setup requires linking via the OpenClaw CLI after deployment.",
  },
  {
    id: "imessage",
    name: "iMessage",
    icon: Apple,
    description: "Requires a macOS node paired with your server.",
    note: "iMessage requires a Mac running as a node. This is configured after deployment.",
  },
];

export function StepChannels() {
  const {
    channelConfigs,
    setChannelConfig,
    nextStep,
    prevStep,
    skillLevel,
  } = useWizardStore();
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});

  const toggleChannel = (channelId: Channel) => {
    const current = channelConfigs[channelId];
    if (current?.enabled) {
      setChannelConfig(channelId, { ...current, enabled: false });
    } else {
      setChannelConfig(channelId, { ...current, enabled: true });
    }
  };

  const updateField = (channelId: Channel, key: string, value: string) => {
    const current = channelConfigs[channelId] || { enabled: true };
    setChannelConfig(channelId, { ...current, [key]: value });
  };

  const toggleShow = (key: string) => {
    setShowTokens((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const enabledChannels = Object.entries(channelConfigs).filter(
    ([, config]) => config?.enabled
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        Messaging channels
      </h1>
      <p className="mt-3 text-text-secondary">
        Choose which messaging apps to connect. You can skip this and add
        channels later.
      </p>

      <div className="mt-6 space-y-3">
        {CHANNELS.map((channel) => {
          const config = channelConfigs[channel.id];
          const isEnabled = config?.enabled ?? false;
          const Icon = channel.icon;

          return (
            <div
              key={channel.id}
              className={`rounded-[var(--radius-lg)] border transition-colors ${
                isEnabled
                  ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                  : "border-border"
              }`}
            >
              <button
                onClick={() => toggleChannel(channel.id)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
                    isEnabled
                      ? "bg-coral text-white"
                      : "bg-sand/60 text-text-secondary dark:bg-dark-elevated"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {channel.name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {channel.description}
                  </p>
                </div>
                <div
                  className={`h-5 w-9 shrink-0 rounded-full transition-colors ${
                    isEnabled ? "bg-coral" : "bg-sand dark:bg-dark-elevated"
                  } relative`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                      isEnabled ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </button>

              {/* Expanded config */}
              {isEnabled && channel.setupFields && (
                <div className="border-t border-coral/20 px-4 pb-4 pt-3 dark:border-coral/10">
                  <div className="space-y-3">
                    {channel.setupFields.map((field) => {
                      const fieldKey = `${channel.id}-${field.key}`;
                      return (
                        <div key={field.key}>
                          <label className="block text-xs font-medium text-text-primary">
                            {field.label}
                          </label>
                          {field.helpText && skillLevel !== "advanced" && (
                            <p className="mt-0.5 text-xs text-text-secondary">
                              {field.helpText}{" "}
                              {field.helpUrl && (
                                <a
                                  href={field.helpUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-0.5 font-medium text-coral hover:underline"
                                >
                                  Open <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </p>
                          )}
                          <div className="relative mt-1">
                            <input
                              type={showTokens[fieldKey] ? "text" : "password"}
                              value={(config as unknown as Record<string, string>)?.[field.key] || ""}
                              onChange={(e) =>
                                updateField(channel.id, field.key, e.target.value)
                              }
                              placeholder={field.placeholder}
                              className="w-full rounded-[var(--radius-sm)] border border-border bg-background px-3 py-2 pr-9 font-mono text-xs text-text-primary placeholder:text-text-muted transition-colors focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20 dark:bg-dark-surface"
                            />
                            <button
                              type="button"
                              onClick={() => toggleShow(fieldKey)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
                            >
                              {showTokens[fieldKey] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Note for channels configured post-deployment */}
              {isEnabled && channel.note && (
                <div className="border-t border-coral/20 px-4 pb-3 pt-2 dark:border-coral/10">
                  <p className="text-xs text-text-secondary">{channel.note}</p>
                </div>
              )}
            </div>
          );
        })}
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
          className="rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover"
        >
          {enabledChannels.length === 0 ? "Skip for now" : "Continue"}
        </button>
      </div>
    </div>
  );
}

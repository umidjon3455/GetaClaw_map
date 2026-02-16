"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { Eye, EyeOff, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

const MODELS = [
  {
    id: "anthropic/claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    provider: "Anthropic",
    tier: "Premium",
    description: "Excellent all-rounder. Great at coding, analysis, and conversation.",
  },
  {
    id: "anthropic/claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    tier: "Fast & Cheap",
    description: "Fast and affordable. Great for quick tasks and casual chat.",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    tier: "Premium",
    description: "OpenAI's flagship model. Strong at reasoning and creative tasks.",
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    tier: "Fast & Cheap",
    description: "Lightweight and fast. Good balance of quality and speed.",
  },
  {
    id: "google/gemini-2.5-pro-preview",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    tier: "Premium",
    description: "Google's most capable model. Excellent context window.",
  },
  {
    id: "google/gemini-2.5-flash-preview",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    tier: "Fast & Cheap",
    description: "Extremely fast with great quality. Very cost-effective.",
  },
  {
    id: "meta-llama/llama-4-maverick",
    name: "Llama 4 Maverick",
    provider: "Meta",
    tier: "Open Source",
    description: "Meta's open-source model. Great performance, fully open.",
  },
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    tier: "Reasoning",
    description: "Specialized reasoning model. Excellent at complex problem solving.",
  },
];

const tierColors: Record<string, string> = {
  Premium: "bg-coral-100 text-coral-700 dark:bg-coral-900/30 dark:text-coral-400",
  "Fast & Cheap": "bg-sea-green/10 text-sea-green",
  "Open Source": "bg-amber/10 text-amber",
  Reasoning: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export function StepModels() {
  const {
    openrouterApiKey,
    setOpenrouterApiKey,
    selectedModels,
    setSelectedModels,
    nextStep,
    prevStep,
    skillLevel,
  } = useWizardStore();
  const [showKey, setShowKey] = useState(false);

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((m) => m !== modelId));
    } else {
      setSelectedModels([...selectedModels, modelId]);
    }
  };

  const canContinue =
    openrouterApiKey.trim().length > 10 && selectedModels.length > 0;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        Set up your AI models
      </h1>
      <p className="mt-3 text-text-secondary">
        Connect to OpenRouter to access all major AI models through a single API
        key.
      </p>

      {/* OpenRouter API Key */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-text-primary">
          OpenRouter API Key
        </label>
        {skillLevel !== "advanced" && (
          <p className="mt-1 text-sm text-text-secondary">
            OpenRouter gives you access to Claude, GPT-4, Gemini, Llama, and
            more.{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-coral hover:underline"
            >
              Get your API key <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        )}
        <div className="relative mt-2">
          <input
            type={showKey ? "text" : "password"}
            value={openrouterApiKey}
            onChange={(e) => setOpenrouterApiKey(e.target.value)}
            placeholder="sk-or-..."
            className="w-full rounded-[var(--radius-md)] border border-border bg-background px-3 py-2.5 pr-10 font-mono text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/20 dark:bg-dark-surface"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Model selection */}
      <div className="mt-8">
        <label className="block text-sm font-medium text-text-primary">
          Choose your models{" "}
          <span className="font-normal text-text-muted">
            ({selectedModels.length} selected)
          </span>
        </label>
        <p className="mt-1 text-sm text-text-secondary">
          Select which models you want available. You can always change this later.
        </p>

        <div className="mt-4 space-y-2">
          {MODELS.map((model) => {
            const isSelected = selectedModels.includes(model.id);
            return (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "border-coral bg-coral-light dark:border-coral dark:bg-coral-900/20"
                    : "border-border hover:border-border-hover dark:hover:border-dark-border"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? "border-coral bg-coral text-white"
                      : "border-border"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">
                      {model.name}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        tierColors[model.tier] || ""
                      }`}
                    >
                      {model.tier}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {model.description}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-text-muted">
                  {model.provider}
                </span>
              </button>
            );
          })}
        </div>
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
          disabled={!canContinue}
          className="rounded-[var(--radius-md)] bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

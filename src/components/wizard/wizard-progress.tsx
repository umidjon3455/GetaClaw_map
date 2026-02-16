"use client";

import { useWizardStore, STEP_ORDER } from "@/lib/store/wizard-store";

const STEP_SHORT_LABELS: Record<string, string> = {
  welcome: "Welcome",
  "vps-provider": "VPS",
  "server-config": "Server",
  security: "Security",
  models: "Models",
  channels: "Channels",
  review: "Review",
  deploy: "Deploy",
  complete: "Done",
};

export function WizardProgress({ className = "" }: { className?: string }) {
  const currentStep = useWizardStore((s) => s.currentStep);
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const total = STEP_ORDER.length;
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <div
      className={`border-b border-border bg-surface px-5 py-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-primary">
          Step {currentIndex + 1} of {total}
        </span>
        <span className="text-sm text-text-secondary">
          {STEP_SHORT_LABELS[currentStep]}
        </span>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-sand dark:bg-dark-elevated">
        <div
          className="h-full rounded-full bg-coral transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

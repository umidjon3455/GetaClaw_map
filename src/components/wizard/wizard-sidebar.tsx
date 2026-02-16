"use client";

import { Check } from "lucide-react";
import {
  useWizardStore,
  STEP_ORDER,
  type WizardStep,
} from "@/lib/store/wizard-store";

const STEP_LABELS: Record<WizardStep, string> = {
  welcome: "Welcome",
  "vps-provider": "VPS Provider",
  "server-config": "Server Config",
  security: "Security",
  models: "AI Models",
  channels: "Channels",
  review: "Review",
  deploy: "Deploy",
  complete: "Complete",
};

export function WizardSidebar({ className = "" }: { className?: string }) {
  const currentStep = useWizardStore((s) => s.currentStep);
  const completedSteps = useWizardStore((s) => s.completedSteps);
  const goToStep = useWizardStore((s) => s.goToStep);
  const canProceed = useWizardStore((s) => s.canProceedToStep);

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <aside
      className={`w-64 shrink-0 border-r border-border bg-surface p-6 ${className} flex-col`}
    >
      <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-text-muted">
        Setup wizard
      </h2>
      <nav className="mt-6 flex flex-col gap-0.5">
        {STEP_ORDER.map((step, i) => {
          const isCompleted = completedSteps.has(step);
          const isCurrent = step === currentStep;
          const isAccessible = canProceed(step);

          return (
            <button
              key={step}
              onClick={() => isAccessible && goToStep(step)}
              disabled={!isAccessible}
              className={`group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left text-sm transition-colors ${
                isCurrent
                  ? "bg-coral-light text-coral font-semibold dark:bg-coral-900/20"
                  : isCompleted
                    ? "text-text-primary hover:bg-sand/40 dark:hover:bg-dark-elevated cursor-pointer"
                    : isAccessible
                      ? "text-text-secondary hover:bg-sand/40 dark:hover:bg-dark-elevated cursor-pointer"
                      : "text-text-muted cursor-not-allowed opacity-50"
              }`}
            >
              {/* Step indicator */}
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isCompleted
                    ? "bg-sea-green text-white"
                    : isCurrent
                      ? "bg-coral text-white"
                      : "border border-border text-text-muted"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  i + 1
                )}
              </span>
              {STEP_LABELS[step]}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

"use client";

import { Check } from "lucide-react";
import {
  useWizardStore,
  STEP_ORDER,
  type WizardStep,
} from "@/lib/store/wizard-store";

const STEP_LABELS: Record<WizardStep, string> = {
  welcome: "Welcome",
  "vps-provider": "Provider",
  "server-config": "Server",
  security: "Security",
  models: "Models",
  channels: "Channels",
  review: "Review",
  deploy: "Deploy",
  complete: "Complete",
};

export function WizardStepBar({ className = "" }: { className?: string }) {
  const currentStep = useWizardStore((s) => s.currentStep);
  const completedSteps = useWizardStore((s) => s.completedSteps);
  const goToStep = useWizardStore((s) => s.goToStep);
  const canProceed = useWizardStore((s) => s.canProceedToStep);

  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const total = STEP_ORDER.length;

  return (
    <div
      className={`border-b border-border bg-background ${className}`}
    >
      <div className="mx-auto max-w-5xl px-8 py-4">
        <div className="flex items-start">
          {STEP_ORDER.map((step, i) => {
            const isCompleted = completedSteps.has(step);
            const isCurrent = step === currentStep;
            const isAccessible = canProceed(step);

            return (
              <div key={step} className="contents">
                {/* Step dot + label */}
                <button
                  onClick={() => isAccessible && goToStep(step)}
                  disabled={!isAccessible}
                  className={`group relative z-10 flex shrink-0 flex-col items-center gap-1.5 ${
                    isAccessible && !isCurrent ? "cursor-pointer" : ""
                  } ${!isAccessible && !isCurrent ? "cursor-not-allowed" : ""}`}
                >
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-sea-green text-white"
                        : isCurrent
                          ? "bg-coral text-white ring-4 ring-coral/15"
                          : isAccessible
                            ? "border-2 border-border-hover bg-background text-text-secondary group-hover:border-coral/40"
                            : "border-2 border-border bg-background text-text-muted opacity-50"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap transition-colors ${
                      isCurrent
                        ? "text-coral font-semibold"
                        : isCompleted
                          ? "text-text-primary"
                          : isAccessible
                            ? "text-text-secondary"
                            : "text-text-muted opacity-50"
                    }`}
                  >
                    {STEP_LABELS[step]}
                  </span>
                </button>

                {/* Connector line between steps */}
                {i < total - 1 && (
                  <div
                    className={`mt-[13px] h-[2px] flex-1 transition-colors duration-300 ${
                      i < currentIndex ? "bg-sea-green" : "bg-border"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWizardStore, STEP_ORDER, type WizardStep } from "@/lib/store/wizard-store";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardProgress } from "./wizard-progress";
import { StepWelcome } from "./step-welcome";
import { StepVpsProvider } from "./step-vps-provider";
import { StepServerConfig } from "./step-server-config";
import { StepSecurity } from "./step-security";
import { StepModels } from "./step-models";
import { StepChannels } from "./step-channels";
import { StepReview } from "./step-review";
import { StepDeploy } from "./step-deploy";
import { StepComplete } from "./step-complete";

const STEP_COMPONENTS: Record<WizardStep, React.ComponentType> = {
  welcome: StepWelcome,
  "vps-provider": StepVpsProvider,
  "server-config": StepServerConfig,
  security: StepSecurity,
  models: StepModels,
  channels: StepChannels,
  review: StepReview,
  deploy: StepDeploy,
  complete: StepComplete,
};

export function WizardShell() {
  const currentStep = useWizardStore((s) => s.currentStep);
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Desktop sidebar */}
      <WizardSidebar className="hidden lg:flex" />

      <div className="flex flex-1 flex-col">
        {/* Mobile progress bar */}
        <WizardProgress className="lg:hidden" />

        {/* Step content */}
        <div className="flex flex-1 items-start justify-center px-5 py-8 sm:px-8 sm:py-12">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <StepComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Server, Package, Settings, CheckCircle, Loader2, Check } from "lucide-react";

type StepStatus = "pending" | "running" | "success";

interface DeployStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Server;
  status: StepStatus;
  progress: number;
}

const initialSteps: Omit<DeployStep, "status" | "progress">[] = [
  { id: "provision", title: "Provisioning server", description: "Spinning up your VPS", icon: Server },
  { id: "install", title: "Installing OpenClaw", description: "Installing dependencies", icon: Package },
  { id: "configure", title: "Configuring channels", description: "Setting up WhatsApp, Telegram", icon: Settings },
  { id: "health", title: "Health check passed", description: "Everything is working", icon: CheckCircle },
];

export function HeroDeployAnimation() {
  const [steps, setSteps] = useState<DeployStep[]>(() =>
    initialSteps.map((s) => ({ ...s, status: "pending" as StepStatus, progress: 0 }))
  );
  const [showBanner, setShowBanner] = useState(false);
  const [visible, setVisible] = useState(true);

  const reset = useCallback(() => {
    setSteps(initialSteps.map((s) => ({ ...s, status: "pending", progress: 0 })));
    setShowBanner(false);
    setVisible(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(() => { if (!cancelled) resolve(); }, ms));
      });

    const runCycle = async () => {
      // Advance each step: pending → running (with progress) → success
      for (let i = 0; i < 4; i++) {
        if (cancelled) return;

        // Start running
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "running", progress: 0 } : s))
        );
        await wait(400);

        // Progress to ~50%
        if (cancelled) return;
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, progress: 55 } : s))
        );
        await wait(600);

        // Progress to ~90%
        if (cancelled) return;
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, progress: 90 } : s))
        );
        await wait(500);

        // Complete
        if (cancelled) return;
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, status: "success", progress: 100 } : s))
        );
        await wait(300);
      }

      // Show completion banner
      if (cancelled) return;
      setShowBanner(true);
      await wait(2500);

      // Fade out
      if (cancelled) return;
      setVisible(false);
      await wait(600);

      // Reset and restart
      if (cancelled) return;
      reset();
      await wait(400);
      if (!cancelled) runCycle();
    };

    runCycle();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reset]);

  return (
    <div className="mt-10 lg:mt-0">
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative lg:[transform:perspective(1200px)_rotateY(-3deg)_rotateX(2deg)]"
      >
        {/* Coral glow shadow */}
        <div className="absolute -inset-4 -z-10 rounded-[var(--radius-xl)] bg-coral/8 blur-2xl dark:bg-coral/15" />

        {/* Card */}
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-charcoal-light/20 bg-charcoal shadow-2xl dark:border-dark-border dark:bg-dark-surface">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
            <span className="ml-3 font-mono text-xs text-sand/50">getaclaw deploy</span>
          </div>

          {/* Steps timeline */}
          <div className="relative px-4 py-4 lg:px-5 lg:py-5">
            {/* Timeline connector */}
            <div className="absolute bottom-5 left-[29px] top-5 w-px bg-white/[0.08]" />

            <div className="space-y-4">
              {steps.map((step, i) => (
                <StepRow key={step.id} step={step} index={i} />
              ))}
            </div>
          </div>

          {/* Completion banner */}
          <AnimatePresence>
            {showBanner && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden"
              >
                <div className="mx-4 mb-4 flex items-center gap-2.5 rounded-[var(--radius-md)] border border-sea-green/20 bg-sea-green/10 px-4 py-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-sea-green">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-semibold text-sea-green-light">
                    Your private AI is live
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function StepRow({ step, index }: { step: DeployStep; index: number }) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      className="relative flex items-start gap-3"
    >
      {/* Status dot */}
      <div className="relative z-10 mt-0.5 flex-shrink-0">
        {step.status === "pending" && (
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-charcoal-light/50">
            <Icon className="h-2.5 w-2.5 text-sand/30" strokeWidth={2} />
          </div>
        )}
        {step.status === "running" && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-coral"
          >
            <Loader2 className="h-2.5 w-2.5 animate-spin text-white" strokeWidth={3} />
          </motion.div>
        )}
        {step.status === "success" && (
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            className="flex h-5 w-5 items-center justify-center rounded-full bg-sea-green"
          >
            <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
          </motion.div>
        )}
      </div>

      {/* Content -min-h reserves space for progress bar so it doesn't cause layout shift */}
      <div className="min-w-0 flex-1 min-h-[3rem]">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              step.status === "pending"
                ? "text-sand/40"
                : step.status === "running"
                  ? "text-coral-300"
                  : "text-sand/80"
            }`}
          >
            {step.title}
          </span>
        </div>
        <p
          className={`text-xs transition-colors duration-300 ${
            step.status === "pending"
              ? "text-sand/20"
              : step.status === "running"
                ? "text-sand/40"
                : "text-sand/30"
          }`}
        >
          {step.description}
        </p>

        {/* Progress bar -only visible while running */}
        {step.status === "running" && (
          <motion.div
            className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="h-full rounded-full bg-coral"
              initial={{ width: 0 }}
              animate={{ width: `${step.progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

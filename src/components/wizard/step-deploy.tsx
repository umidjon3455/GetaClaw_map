"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { ActionFeed, type ActionStep } from "@/components/deploy/action-feed";
import { useState, useEffect } from "react";

const DEPLOY_STEPS: ActionStep[] = [
  {
    id: "create-server",
    title: "Creating server",
    description: "Provisioning VPS with your chosen provider",
    status: "pending",
  },
  {
    id: "wait-boot",
    title: "Waiting for server to boot",
    description: "Server is starting up and running cloud-init",
    status: "pending",
  },
  {
    id: "connect-agent",
    title: "Connecting to agent",
    description: "Establishing secure connection to @getaclaw/agent",
    status: "pending",
  },
  {
    id: "install-system",
    title: "Preparing system",
    description: "Installing system dependencies and Node.js",
    status: "pending",
  },
  {
    id: "install-openclaw",
    title: "Installing OpenClaw",
    description: "Installing OpenClaw gateway via npm",
    status: "pending",
  },
  {
    id: "configure",
    title: "Configuring OpenClaw",
    description: "Writing configuration and setting up channels",
    status: "pending",
  },
  {
    id: "tailscale",
    title: "Setting up Tailscale",
    description: "Installing and authenticating Tailscale VPN",
    status: "pending",
  },
  {
    id: "start-service",
    title: "Starting services",
    description: "Enabling and starting the OpenClaw gateway",
    status: "pending",
  },
  {
    id: "health-check",
    title: "Running health check",
    description: "Verifying everything is working correctly",
    status: "pending",
  },
];

export function StepDeploy() {
  const { securityMode, nextStep } = useWizardStore();
  const [steps, setSteps] = useState<ActionStep[]>(() => {
    // Filter out Tailscale step if not selected
    if (securityMode !== "tailscale") {
      return DEPLOY_STEPS.filter((s) => s.id !== "tailscale");
    }
    return DEPLOY_STEPS;
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Simulated deployment for now — will be replaced with real WebSocket connection
  const startDeploy = () => {
    setIsDeploying(true);

    let currentIndex = 0;
    const runNext = () => {
      if (currentIndex >= steps.length) {
        setIsComplete(true);
        setIsDeploying(false);
        return;
      }

      setSteps((prev) =>
        prev.map((s, i) =>
          i === currentIndex ? { ...s, status: "running" as const, progress: 0 } : s
        )
      );

      // Simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);

          setSteps((prev) =>
            prev.map((s, i) =>
              i === currentIndex
                ? { ...s, status: "success" as const, progress: 100, duration: Math.floor(Math.random() * 30 + 5) }
                : s
            )
          );
          currentIndex++;
          setTimeout(runNext, 500);
        } else {
          setSteps((prev) =>
            prev.map((s, i) =>
              i === currentIndex ? { ...s, progress: Math.min(progress, 95) } : s
            )
          );
        }
      }, 800);
    };

    runNext();
  };

  useEffect(() => {
    // Auto-start deployment
    if (!isDeploying && !isComplete) {
      const timer = setTimeout(startDeploy, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        {isComplete ? "Deployment complete!" : "Deploying your OpenClaw instance"}
      </h1>
      <p className="mt-3 text-text-secondary">
        {isComplete
          ? "Everything is set up and running. Let's get you connected."
          : "Sit back and watch. This usually takes 3-5 minutes."}
      </p>

      <div className="mt-8">
        <ActionFeed steps={steps} />
      </div>

      {isComplete && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={nextStep}
            className="rounded-[var(--radius-md)] bg-coral px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-coral-hover"
          >
            View your setup details
          </button>
        </div>
      )}
    </div>
  );
}

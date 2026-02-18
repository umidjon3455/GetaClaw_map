"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { useInstancesStore } from "@/lib/store/instances-store";
import { ActionFeed, type ActionStep } from "@/components/deploy/action-feed";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  runDeployment,
  resumeDeployment,
  type DeployConfig,
  type DeployProgress,
  type ResumeConfig,
} from "@/lib/deploy/orchestrator";
import { RotateCw, ArrowLeft } from "lucide-react";

const DEPLOY_STEPS: ActionStep[] = [
  {
    id: "create-server",
    title: "Creating server",
    description: "Provisioning VPS with your chosen provider",
    status: "pending",
    estimatedDuration: 5,
  },
  {
    id: "wait-boot",
    title: "Waiting for server to boot",
    description: "Server is starting up and running cloud-init",
    status: "pending",
    estimatedDuration: 30,
  },
  {
    id: "connect-agent",
    title: "Connecting to agent",
    description: "Establishing secure connection to @getaclaw/agent",
    status: "pending",
    estimatedDuration: 120,
  },
  {
    id: "install-system",
    title: "Preparing system",
    description:
      "Installing system dependencies and Node.js -this step can take a couple of minutes",
    status: "pending",
    estimatedDuration: 120,
  },
  {
    id: "install-openclaw",
    title: "Verifying OpenClaw",
    description: "Confirming OpenClaw gateway installation",
    status: "pending",
    estimatedDuration: 60,
  },
  {
    id: "configure",
    title: "Configuring OpenClaw",
    description: "Writing configuration and setting up channels",
    status: "pending",
    estimatedDuration: 30,
  },
  {
    id: "tailscale",
    title: "Setting up Tailscale",
    description: "Installing and authenticating Tailscale VPN",
    status: "pending",
    estimatedDuration: 20,
  },
  {
    id: "start-service",
    title: "Starting services",
    description: "Enabling and starting the OpenClaw gateway",
    status: "pending",
    estimatedDuration: 10,
  },
  {
    id: "health-check",
    title: "Running health check",
    description: "Verifying everything is working correctly",
    status: "pending",
    estimatedDuration: 90,
  },
];

function getInitialSteps(securityMode: string | null): ActionStep[] {
  return securityMode !== "tailscale"
    ? DEPLOY_STEPS.filter((s) => s.id !== "tailscale")
    : [...DEPLOY_STEPS];
}

type DeployPhase = "idle" | "deploying" | "resuming" | "complete" | "error" | "interrupted";

function getInitialPhase(
  deployStarted: boolean,
  deployComplete: boolean,
  deployError: string | null
): DeployPhase {
  if (deployComplete) return "complete";
  if (deployError) return "error";
  if (deployStarted) return "interrupted";
  return "idle";
}

export function StepDeploy() {
  const wizard = useWizardStore();
  const { addInstance } = useInstancesStore();

  const [phase, setPhase] = useState<DeployPhase>(() =>
    getInitialPhase(
      wizard.deployStarted,
      wizard.deployComplete,
      wizard.deployError
    )
  );
  const [steps, setSteps] = useState<ActionStep[]>(() =>
    getInitialSteps(wizard.securityMode)
  );
  const [error, setError] = useState<string | null>(wizard.deployError);
  const deployingRef = useRef(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateStep = useCallback(
    (stepId: string, updates: Partial<ActionStep>) => {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, ...updates } : s))
      );
    },
    []
  );

  // Persist intermediate deploy data as it becomes available.
  // Uses getState() to read fresh store state inside the callback,
  // since useCallback([]) would capture a stale closure.
  const handleProgress = useCallback(
    (data: DeployProgress) => {
      const current = useWizardStore.getState().deployIntermediate;
      if (!current) {
        if (
          data.agentPort == null ||
          data.gatewayPort == null ||
          data.pairingToken == null ||
          data.gatewayToken == null
        ) {
          return;
        }
        useWizardStore.getState().setDeployIntermediate({
          agentPort: data.agentPort,
          gatewayPort: data.gatewayPort,
          pairingToken: data.pairingToken,
          gatewayToken: data.gatewayToken,
          serverId: data.serverId,
          serverIp: data.serverIp,
        });
      } else {
        useWizardStore.getState().updateDeployIntermediate(data);
      }
    },
    []
  );

  const handleDeploySuccess = useCallback(
    (result: import("@/lib/deploy/orchestrator").DeployResult) => {
      wizard.setDeployResult(result);
      wizard.setDeployComplete(true);
      wizard.setDeployIntermediate(null);

      const enabledChannels = Object.entries(wizard.channelConfigs)
        .filter(([, cfg]) => cfg?.enabled)
        .map(([type]) => type as import("@/lib/store/wizard-store").Channel);

      addInstance({
        id: crypto.randomUUID(),
        name: wizard.serverName,
        createdAt: new Date().toISOString(),
        vpsProvider: wizard.vpsProvider!,
        vpsId: result.serverId,
        serverIp: result.serverIp,
        serverRegion: wizard.serverRegion,
        agentPort: result.agentPort,
        gatewayPort: result.gatewayPort,
        agentToken: result.pairingToken,
        gatewayToken: result.gatewayToken ?? "",
        securityMode: wizard.securityMode!,
        tailscaleHostname: result.tailscaleIp,
        openclawVersion: result.openclawVersion,
        status: "online",
        channels: enabledChannels,
      });

      setPhase("complete");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDeployError = useCallback(
    (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Deployment failed";
      setError(message);
      wizard.setDeployError(message);
      setPhase("error");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const startDeploy = useCallback(() => {
    if (deployingRef.current) return;
    deployingRef.current = true;

    setSteps(getInitialSteps(wizard.securityMode));
    setError(null);
    setPhase("deploying");
    setTotalElapsed(0);

    wizard.setDeployStarted(true);
    wizard.setDeployComplete(false);
    wizard.setDeployResult(null);
    wizard.setDeployError(null);
    wizard.setDeployIntermediate(null);

    const deployConfig: DeployConfig = {
      vpsProvider: wizard.vpsProvider!,
      vpsApiKey: wizard.vpsApiKey,
      serverName: wizard.serverName,
      serverRegion: wizard.serverRegion,
      serverSize: wizard.serverSize,
      openrouterApiKey: wizard.openrouterApiKey,
      selectedModels: wizard.selectedModels,
      securityMode: wizard.securityMode as "password" | "tailscale",
      tailscaleAuthKey: wizard.tailscaleAuthKey,
      channels: wizard.channelConfigs,
      agentInstallUrl: wizard.agentInstallUrl || undefined,
    };

    runDeployment(deployConfig, updateStep, handleProgress)
      .then(handleDeploySuccess)
      .catch(handleDeployError)
      .finally(() => {
        deployingRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startResume = useCallback(() => {
    const intermediate = wizard.deployIntermediate;
    if (deployingRef.current || !intermediate?.serverId) return;
    deployingRef.current = true;

    setSteps(getInitialSteps(wizard.securityMode));
    setError(null);
    setPhase("resuming");
    setTotalElapsed(0);

    wizard.setDeployError(null);

    const resumeConfig: ResumeConfig = {
      vpsProvider: wizard.vpsProvider!,
      vpsApiKey: wizard.vpsApiKey,
      securityMode: wizard.securityMode as "password" | "tailscale",
      serverId: intermediate.serverId,
      serverIp: intermediate.serverIp,
      agentPort: intermediate.agentPort,
      gatewayPort: intermediate.gatewayPort ?? 18789,
      pairingToken: intermediate.pairingToken,
      gatewayToken: intermediate.gatewayToken,
    };

    resumeDeployment(resumeConfig, updateStep, handleProgress)
      .then(handleDeploySuccess)
      .catch(handleDeployError)
      .finally(() => {
        deployingRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Total deployment timer
  const isActive = phase === "deploying" || phase === "resuming";
  useEffect(() => {
    if (isActive && !totalTimerRef.current) {
      totalTimerRef.current = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
      }, 1000);
    }
    if (!isActive && totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
      totalTimerRef.current = null;
    }
    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
    };
  }, [isActive]);

  const canResume = !!wizard.deployIntermediate?.serverId;

  // Auto-start or auto-resume on first mount
  useEffect(() => {
    if (phase === "idle") {
      const timer = setTimeout(startDeploy, 600);
      return () => clearTimeout(timer);
    }
    if (phase === "interrupted" && canResume) {
      // Auto-resume if we have enough intermediate data
      const timer = setTimeout(startResume, 600);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    deployingRef.current = false;
    setTimeout(startDeploy, 100);
  };

  const handleGoBack = () => {
    wizard.setDeployStarted(false);
    wizard.setDeployError(null);
    wizard.setDeployIntermediate(null);
    wizard.prevStep();
  };

  const headingText = (() => {
    switch (phase) {
      case "complete":
        return "Deployment complete!";
      case "error":
        return "Deployment failed";
      case "interrupted":
        return canResume
          ? "Deployment interrupted"
          : "Deployment interrupted";
      case "resuming":
        return "Resuming deployment...";
      default:
        return "Deploying your OpenClaw instance";
    }
  })();

  const subtitleText = (() => {
    switch (phase) {
      case "complete":
        return "Everything is set up and running. Let's get you connected.";
      case "error":
        return "Something went wrong during deployment.";
      case "interrupted":
        return canResume
          ? "Reconnecting to your server to pick up where we left off..."
          : "The page was refreshed while a deployment was in progress. The server may still be setting up on your VPS provider.";
      case "resuming":
        return "Reconnecting to your server -the setup continued while you were away.";
      default:
        return "Sit back and watch. This usually takes 5-7 minutes.";
    }
  })();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-text-primary sm:text-3xl">
        {headingText}
      </h1>
      <p className="mt-3 text-text-secondary">{subtitleText}</p>

      {totalElapsed > 0 && (
        <p className="mt-2 font-mono text-sm text-text-muted">
          Total time: {Math.floor(totalElapsed / 60)}m{" "}
          {String(totalElapsed % 60).padStart(2, "0")}s
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {phase === "interrupted" && !canResume && (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
          Check your VPS provider dashboard -if a server was created, you may
          want to delete it before retrying.
        </div>
      )}

      {(phase === "deploying" || phase === "resuming") && (
        <div className="mt-8">
          <ActionFeed steps={steps} />
        </div>
      )}

      {(phase === "error" || phase === "interrupted") && (
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 rounded-md border border-border px-6 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-sand dark:hover:bg-dark-elevated"
          >
            <ArrowLeft className="h-4 w-4" />
            Review settings
          </button>
          <button
            onClick={canResume ? startResume : handleRetry}
            className="flex items-center gap-2 rounded-md bg-coral px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-coral-hover"
          >
            <RotateCw className="h-4 w-4" />
            {canResume ? "Resume deployment" : "Retry deployment"}
          </button>
        </div>
      )}

      {phase === "complete" && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={wizard.nextStep}
            className="rounded-md bg-coral px-8 py-2.5 text-sm font-bold text-white transition-colors hover:bg-coral-hover"
          >
            View your setup details
          </button>
        </div>
      )}
    </div>
  );
}

import type { VpsProvider } from "@/lib/store/wizard-store";
import type { ActionStep } from "@/components/deploy/action-feed";
import {
  generateCloudInit,
  generatePairingToken,
  generateAgentPort,
  generateGatewayPort,
  type CloudInitConfig,
} from "@/lib/cloud-init/generator";
import { createHetznerServer, getHetznerServer } from "@/lib/vps/hetzner";
import {
  createDigitalOceanDroplet,
  getDigitalOceanDroplet,
} from "@/lib/vps/digitalocean";

export interface DeployConfig {
  vpsProvider: VpsProvider;
  vpsApiKey: string;
  serverName: string;
  serverRegion: string;
  serverSize: string;
  openrouterApiKey: string;
  selectedModels: string[];
  securityMode: "password" | "tailscale";
  tailscaleAuthKey?: string;
  channels: CloudInitConfig["channels"];
  agentInstallUrl?: string;
}

export interface DeployResult {
  serverId: string;
  serverIp: string;
  agentPort: number;
  gatewayPort: number;
  pairingToken: string;
  gatewayToken?: string;
  controlUiUrl?: string;
  openclawVersion?: string;
  tailscaleIp?: string;
}

export interface DeployProgress {
  agentPort?: number;
  gatewayPort?: number;
  pairingToken?: string;
  gatewayToken?: string;
  serverId?: string;
  serverIp?: string;
}

type StepUpdater = (
  stepId: string,
  updates: Partial<ActionStep>
) => void;

type ProgressCallback = (data: DeployProgress) => void;

// Agent step name → UI step ID
const AGENT_STEP_MAP: Record<string, string> = {
  system: "install-system",
  openclaw: "install-openclaw",
  configure: "configure",
  channels: "configure",
  tailscale: "tailscale",
  service: "start-service",
  health: "health-check",
};

const BOOT_TIMEOUT_MS = 5 * 60 * 1000;
const AGENT_TIMEOUT_MS = 8 * 60 * 1000;
const SETUP_TIMEOUT_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 5000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runDeployment(
  config: DeployConfig,
  updateStep: StepUpdater,
  onProgress?: ProgressCallback
): Promise<DeployResult> {
  const pairingToken = generatePairingToken();
  const gatewayToken = generatePairingToken();
  const agentPort = generateAgentPort();
  let gatewayPort = generateGatewayPort();
  while (gatewayPort === agentPort) {
    gatewayPort = generateGatewayPort();
  }

  // Report initial tokens so they're persisted before anything can fail
  onProgress?.({ agentPort, gatewayPort, pairingToken, gatewayToken });

  // --- Step 1: Create server ---
  updateStep("create-server", { status: "running" });

  const cloudInitConfig: CloudInitConfig = {
    pairingToken,
    agentPort,
    gatewayPort,
    openrouterApiKey: config.openrouterApiKey,
    selectedModels: config.selectedModels,
    securityMode: config.securityMode,
    gatewayToken,
    tailscaleAuthKey: config.tailscaleAuthKey,
    serverName: config.serverName,
    channels: config.channels,
    agentInstallUrl: config.agentInstallUrl,
  };

  const userData = generateCloudInit(cloudInitConfig);

  let serverId: string;
  try {
    const serverConfig = {
      name: config.serverName,
      region: config.serverRegion,
      size: config.serverSize,
      image: "ubuntu-24.04",
      userData,
      apiKey: config.vpsApiKey,
      agentPort,
      gatewayPort,
    };

    const result =
      config.vpsProvider === "hetzner"
        ? await createHetznerServer(serverConfig)
        : await createDigitalOceanDroplet(serverConfig);

    serverId = result.id;
    onProgress?.({ serverId });
    updateStep("create-server", { status: "success", duration: 3 });
  } catch (err) {
    updateStep("create-server", {
      status: "error",
      error: err instanceof Error ? err.message : "Failed to create server",
    });
    throw err;
  }

  // --- Step 2: Wait for boot ---
  updateStep("wait-boot", { status: "running" });

  let serverIp: string;
  try {
    serverIp = await pollForBoot(
      config.vpsProvider,
      serverId,
      config.vpsApiKey
    );
    onProgress?.({ serverIp });
    updateStep("wait-boot", { status: "success", duration: 30 });
  } catch (err) {
    updateStep("wait-boot", {
      status: "error",
      error:
        err instanceof Error
          ? err.message
          : "Server did not become ready in time. Check your VPS dashboard.",
    });
    throw err;
  }

  // --- Steps 3+: Agent connection + setup ---
  return await connectAndSetup({
    serverIp,
    agentPort,
    gatewayPort,
    serverId,
    pairingToken,
    gatewayToken,
    securityMode: config.securityMode,
    updateStep,
  });
}

export interface ResumeConfig {
  vpsProvider: VpsProvider;
  vpsApiKey: string;
  securityMode: "password" | "tailscale";
  serverId: string;
  serverIp?: string;
  agentPort: number;
  gatewayPort: number;
  pairingToken: string;
  gatewayToken: string;
}

export async function resumeDeployment(
  resume: ResumeConfig,
  updateStep: StepUpdater,
  onProgress?: ProgressCallback
): Promise<DeployResult> {
  // Mark server creation as already done
  updateStep("create-server", { status: "success" });

  let serverIp = resume.serverIp;

  if (!serverIp) {
    // Server was created but we don't have the IP yet -poll for boot
    updateStep("wait-boot", { status: "running" });
    try {
      serverIp = await pollForBoot(
        resume.vpsProvider,
        resume.serverId,
        resume.vpsApiKey
      );
      onProgress?.({ serverIp });
      updateStep("wait-boot", { status: "success" });
    } catch (err) {
      updateStep("wait-boot", {
        status: "error",
        error:
          err instanceof Error
            ? err.message
            : "Server did not become ready in time.",
      });
      throw err;
    }
  } else {
    // Already have IP -mark boot as done
    updateStep("wait-boot", { status: "success" });
  }

  return await connectAndSetup({
    serverIp,
    agentPort: resume.agentPort,
    gatewayPort: resume.gatewayPort,
    serverId: resume.serverId,
    pairingToken: resume.pairingToken,
    gatewayToken: resume.gatewayToken,
    securityMode: resume.securityMode,
    updateStep,
  });
}

// Shared tail: connect to agent then poll setup status
interface ConnectAndSetupArgs {
  serverIp: string;
  agentPort: number;
  gatewayPort: number;
  serverId: string;
  pairingToken: string;
  gatewayToken: string;
  securityMode: string;
  updateStep: StepUpdater;
}

async function connectAndSetup(args: ConnectAndSetupArgs): Promise<DeployResult> {
  const {
    serverIp,
    agentPort,
    gatewayPort,
    serverId,
    pairingToken,
    gatewayToken,
    securityMode,
    updateStep,
  } = args;

  // --- Wait for agent ---
  updateStep("connect-agent", { status: "running" });

  try {
    await pollForAgent(serverIp, agentPort);
    updateStep("connect-agent", { status: "success", duration: 60 });
  } catch (err) {
    updateStep("connect-agent", {
      status: "error",
      error:
        err instanceof Error
          ? err.message
          : "Agent did not come online. Cloud-init may have failed.",
    });
    throw err;
  }

  // --- Poll setup status ---
  try {
    const setupResults = await pollSetupStatus(
      serverIp,
      agentPort,
      updateStep,
      securityMode
    );

    const controlUiUrl =
      (setupResults?.controlUiUrl as string | undefined) ??
      `https://${serverIp}/#token=${gatewayToken}`;
    const resolvedGatewayPort =
      (setupResults?.gatewayPort as number | undefined) ?? gatewayPort;

    return {
      serverId,
      serverIp,
      agentPort,
      gatewayPort: resolvedGatewayPort,
      pairingToken,
      gatewayToken,
      controlUiUrl,
      openclawVersion: setupResults?.openclawVersion as string | undefined,
      tailscaleIp: setupResults?.tailscaleIp as string | undefined,
    };
  } catch (err) {
    throw err;
  }
}

async function pollForBoot(
  provider: VpsProvider,
  serverId: string,
  apiKey: string
): Promise<string> {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  const getServer =
    provider === "hetzner" ? getHetznerServer : getDigitalOceanDroplet;

  while (Date.now() < deadline) {
    try {
      const status = await getServer(serverId, apiKey);
      if (
        status.ip &&
        (status.status === "running" || status.status === "active")
      ) {
        return status.ip;
      }
    } catch {
      // Network glitch, continue polling
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    "Server did not boot within 5 minutes. Check your VPS provider dashboard."
  );
}

async function pollForAgent(
  host: string,
  port: number
): Promise<void> {
  const deadline = Date.now() + AGENT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    try {
      const res = await fetch("/api/agent/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, port }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.status === "ok") {
          return;
        }
      }
    } catch {
      // Agent not ready yet, continue polling
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    "Agent did not come online within 5 minutes. Cloud-init may have failed -try SSH into the server to check /var/log/cloud-init-output.log."
  );
}

interface AgentStepStatus {
  name: string;
  state: "pending" | "running" | "completed" | "error" | "skipped";
  error?: string;
  duration?: number;
}

interface AgentSetupStatus {
  state: "idle" | "running" | "completed" | "error";
  steps: AgentStepStatus[];
  results?: Record<string, unknown>;
}

async function pollSetupStatus(
  host: string,
  port: number,
  updateStep: StepUpdater,
  securityMode: string
): Promise<Record<string, unknown> | undefined> {
  const deadline = Date.now() + SETUP_TIMEOUT_MS;
  const completedUiSteps = new Set<string>();

  while (Date.now() < deadline) {
    try {
      const res = await fetch("/api/agent/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, port }),
      });

      if (res.ok) {
        const status: AgentSetupStatus = await res.json();

        // Map agent steps to UI steps
        for (const agentStep of status.steps) {
          const uiStepId = AGENT_STEP_MAP[agentStep.name];
          if (!uiStepId) continue;

          // Skip tailscale UI step if not using tailscale
          if (uiStepId === "tailscale" && securityMode !== "tailscale") continue;

          // Don't downgrade completed steps
          if (completedUiSteps.has(uiStepId)) continue;

          switch (agentStep.state) {
            case "running":
              updateStep(uiStepId, { status: "running" });
              break;
            case "completed":
              updateStep(uiStepId, {
                status: "success",
                duration: agentStep.duration
                  ? Math.round(agentStep.duration / 1000)
                  : undefined,
              });
              completedUiSteps.add(uiStepId);
              break;
            case "error":
              updateStep(uiStepId, {
                status: "error",
                error: agentStep.error || "Step failed",
              });
              break;
            case "skipped":
              updateStep(uiStepId, { status: "success", duration: 0 });
              completedUiSteps.add(uiStepId);
              break;
          }
        }

        // Check terminal states
        if (status.state === "completed") {
          return status.results;
        }
        if (status.state === "error") {
          const failedStep = status.steps.find((s) => s.state === "error");
          throw new Error(
            failedStep
              ? `Setup failed at step "${failedStep.name}": ${failedStep.error}`
              : "Setup failed"
          );
        }
      }
    } catch (err) {
      // If it's our own thrown error (from terminal state), re-throw
      if (err instanceof Error && err.message.startsWith("Setup failed")) {
        throw err;
      }
      // Otherwise it's a network glitch, continue polling
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Setup did not complete within 10 minutes.");
}

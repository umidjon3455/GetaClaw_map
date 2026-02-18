import { create } from "zustand";
import { persist, type StorageValue } from "zustand/middleware";
import type { DeployResult } from "@/lib/deploy/orchestrator";

export type WizardStep =
  | "welcome"
  | "vps-provider"
  | "server-config"
  | "security"
  | "models"
  | "channels"
  | "review"
  | "deploy"
  | "complete";

export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type VpsProvider = "hetzner" | "digitalocean";
export type SecurityMode = "password" | "tailscale";
export type Channel =
  | "whatsapp"
  | "telegram"
  | "discord"
  | "slack"
  | "signal"
  | "imessage";

export interface ChannelConfig {
  enabled: boolean;
  // Channel-specific fields
  botToken?: string; // Telegram, Discord
  appToken?: string; // Slack
  configured?: boolean;
}

const STEP_ORDER: WizardStep[] = [
  "welcome",
  "vps-provider",
  "server-config",
  "security",
  "models",
  "channels",
  "review",
  "deploy",
  "complete",
];

export interface DeployIntermediate {
  agentPort: number;
  gatewayPort?: number;
  pairingToken: string;
  gatewayToken: string;
  serverId?: string;
  serverIp?: string;
}

interface WizardState {
  // Navigation
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;

  // Step 1: Welcome
  skillLevel: SkillLevel | null;

  // Step 2: VPS Provider
  vpsProvider: VpsProvider | null;
  vpsApiKey: string;

  // Step 3: Server Config
  serverRegion: string;
  serverSize: string;
  serverName: string;

  // Step 4: Security
  securityMode: SecurityMode | null;
  tailscaleAuthKey: string;

  // Step 5: Models
  openrouterApiKey: string;
  selectedModels: string[];

  // Step 6: Channels
  channelConfigs: Partial<Record<Channel, ChannelConfig>>;

  // Deploy state
  deployStarted: boolean;
  deployComplete: boolean;
  deployResult: DeployResult | null;
  deployError: string | null;
  deployIntermediate: DeployIntermediate | null;
  agentInstallUrl: string;

  // Actions
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  markStepCompleted: (step: WizardStep) => void;
  canProceedToStep: (step: WizardStep) => boolean;
  currentStepIndex: () => number;
  totalSteps: () => number;

  // Setters
  setSkillLevel: (level: SkillLevel) => void;
  setVpsProvider: (provider: VpsProvider) => void;
  setVpsApiKey: (key: string) => void;
  setServerRegion: (region: string) => void;
  setServerSize: (size: string) => void;
  setServerName: (name: string) => void;
  setSecurityMode: (mode: SecurityMode) => void;
  setTailscaleAuthKey: (key: string) => void;
  setOpenrouterApiKey: (key: string) => void;
  setSelectedModels: (models: string[]) => void;
  setChannelConfig: (channel: Channel, config: ChannelConfig) => void;
  setDeployStarted: (started: boolean) => void;
  setDeployComplete: (complete: boolean) => void;
  setDeployResult: (result: DeployResult | null) => void;
  setDeployError: (error: string | null) => void;
  setDeployIntermediate: (data: DeployIntermediate | null) => void;
  updateDeployIntermediate: (updates: Partial<DeployIntermediate>) => void;
  setAgentInstallUrl: (url: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentStep: "welcome" as WizardStep,
  completedSteps: new Set<WizardStep>(),
  skillLevel: null as SkillLevel | null,
  vpsProvider: null as VpsProvider | null,
  vpsApiKey: "",
  serverRegion: "",
  serverSize: "",
  serverName: "",
  securityMode: null as SecurityMode | null,
  tailscaleAuthKey: "",
  openrouterApiKey: "",
  selectedModels: [] as string[],
  channelConfigs: {} as Partial<Record<Channel, ChannelConfig>>,
  deployStarted: false,
  deployComplete: false,
  deployResult: null as DeployResult | null,
  deployError: null as string | null,
  deployIntermediate: null as DeployIntermediate | null,
  agentInstallUrl: "",
};

// Custom localStorage adapter that converts Set<WizardStep> ↔ WizardStep[]
const wizardStorage = {
  getItem: (name: string): StorageValue<WizardState> | null => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    try {
      const { state, version } = JSON.parse(str);
      return {
        state: {
          ...state,
          completedSteps: new Set(state.completedSteps || []),
        },
        version,
      };
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<WizardState>) => {
    const serializable = {
      state: {
        ...value.state,
        completedSteps: [...(value.state.completedSteps || [])],
      },
      version: value.version,
    };
    localStorage.setItem(name, JSON.stringify(serializable));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      goToStep: (step) => {
        if (get().canProceedToStep(step)) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex < STEP_ORDER.length - 1) {
          const state = get();
          const completed = new Set(state.completedSteps);
          completed.add(state.currentStep);
          set({
            currentStep: STEP_ORDER[currentIndex + 1],
            completedSteps: completed,
          });
        }
      },

      prevStep: () => {
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: STEP_ORDER[currentIndex - 1] });
        }
      },

      markStepCompleted: (step) => {
        const completed = new Set(get().completedSteps);
        completed.add(step);
        set({ completedSteps: completed });
      },

      canProceedToStep: (step) => {
        const targetIndex = STEP_ORDER.indexOf(step);
        if (targetIndex === 0) return true;

        // Can always go back to completed steps
        if (get().completedSteps.has(step)) return true;

        // Can go to the next uncompleted step if current is at targetIndex - 1
        const currentIndex = STEP_ORDER.indexOf(get().currentStep);
        return targetIndex <= currentIndex + 1;
      },

      currentStepIndex: () => STEP_ORDER.indexOf(get().currentStep),
      totalSteps: () => STEP_ORDER.length,

      setSkillLevel: (skillLevel) => set({ skillLevel }),
      setVpsProvider: (vpsProvider) => set({ vpsProvider }),
      setVpsApiKey: (vpsApiKey) => set({ vpsApiKey }),
      setServerRegion: (serverRegion) => set({ serverRegion }),
      setServerSize: (serverSize) => set({ serverSize }),
      setServerName: (serverName) => set({ serverName }),
      setSecurityMode: (securityMode) => set({ securityMode }),
      setTailscaleAuthKey: (tailscaleAuthKey) => set({ tailscaleAuthKey }),
      setOpenrouterApiKey: (openrouterApiKey) => set({ openrouterApiKey }),
      setSelectedModels: (selectedModels) => set({ selectedModels }),
      setChannelConfig: (channel, config) =>
        set((state) => ({
          channelConfigs: { ...state.channelConfigs, [channel]: config },
        })),
      setDeployStarted: (deployStarted) => set({ deployStarted }),
      setDeployComplete: (deployComplete) => set({ deployComplete }),
      setDeployResult: (deployResult) => set({ deployResult }),
      setDeployError: (deployError) => set({ deployError }),
      setDeployIntermediate: (deployIntermediate) => set({ deployIntermediate }),
      updateDeployIntermediate: (updates) =>
        set((state) => ({
          deployIntermediate: state.deployIntermediate
            ? { ...state.deployIntermediate, ...updates }
            : null,
        })),
      setAgentInstallUrl: (agentInstallUrl) => set({ agentInstallUrl }),

      reset: () =>
        set({ ...initialState, completedSteps: new Set(), deployIntermediate: null }),
    }),
    {
      name: "getaclaw-wizard",
      storage: wizardStorage,
      partialize: (state) => {
        // Persist all data fields, exclude action functions
        const {
          goToStep: _1,
          nextStep: _2,
          prevStep: _3,
          markStepCompleted: _4,
          canProceedToStep: _5,
          currentStepIndex: _6,
          totalSteps: _7,
          setSkillLevel: _8,
          setVpsProvider: _9,
          setVpsApiKey: _10,
          setServerRegion: _11,
          setServerSize: _12,
          setServerName: _13,
          setSecurityMode: _14,
          setTailscaleAuthKey: _15,
          setOpenrouterApiKey: _16,
          setSelectedModels: _17,
          setChannelConfig: _18,
          setDeployStarted: _19,
          setDeployComplete: _20,
          setDeployResult: _21,
          setDeployError: _22,
          setDeployIntermediate: _23,
          updateDeployIntermediate: _24,
          setAgentInstallUrl: _25,
          reset: _26,
          ...data
        } = state;
        return data as WizardState;
      },
    }
  )
);

export { STEP_ORDER };

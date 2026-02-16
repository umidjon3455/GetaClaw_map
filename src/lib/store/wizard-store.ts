import { create } from "zustand";

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
  gatewayPassword: string;
  tailscaleAuthKey: string;

  // Step 5: Models
  openrouterApiKey: string;
  selectedModels: string[];

  // Step 6: Channels
  channelConfigs: Partial<Record<Channel, ChannelConfig>>;

  // Deploy state
  deployStarted: boolean;
  deployComplete: boolean;

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
  setGatewayPassword: (password: string) => void;
  setTailscaleAuthKey: (key: string) => void;
  setOpenrouterApiKey: (key: string) => void;
  setSelectedModels: (models: string[]) => void;
  setChannelConfig: (channel: Channel, config: ChannelConfig) => void;
  setDeployStarted: (started: boolean) => void;
  setDeployComplete: (complete: boolean) => void;

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
  gatewayPassword: "",
  tailscaleAuthKey: "",
  openrouterApiKey: "",
  selectedModels: [] as string[],
  channelConfigs: {} as Partial<Record<Channel, ChannelConfig>>,
  deployStarted: false,
  deployComplete: false,
};

export const useWizardStore = create<WizardState>((set, get) => ({
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
  setGatewayPassword: (gatewayPassword) => set({ gatewayPassword }),
  setTailscaleAuthKey: (tailscaleAuthKey) => set({ tailscaleAuthKey }),
  setOpenrouterApiKey: (openrouterApiKey) => set({ openrouterApiKey }),
  setSelectedModels: (selectedModels) => set({ selectedModels }),
  setChannelConfig: (channel, config) =>
    set((state) => ({
      channelConfigs: { ...state.channelConfigs, [channel]: config },
    })),
  setDeployStarted: (deployStarted) => set({ deployStarted }),
  setDeployComplete: (deployComplete) => set({ deployComplete }),

  reset: () => set({ ...initialState, completedSteps: new Set() }),
}));

export { STEP_ORDER };

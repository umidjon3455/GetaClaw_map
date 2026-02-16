export type StepName =
  | 'system'
  | 'openclaw'
  | 'configure'
  | 'tailscale'
  | 'channels'
  | 'service'
  | 'health';

export type StepState = 'pending' | 'running' | 'completed' | 'error' | 'skipped';

export interface StepStatus {
  name: StepName;
  state: StepState;
  error?: string;
  duration?: number;
  retries: number;
}

export interface SetupConfig {
  openrouterApiKey: string;
  selectedModels: string[];
  securityMode: 'password' | 'tailscale';
  gatewayToken?: string;
  tailscaleAuthKey?: string;
  channels: ChannelConfig[];
}

export interface ChannelConfig {
  type: string;
  name: string;
  config: Record<string, unknown>;
}

export interface StepContext {
  config: SetupConfig;
  configDir: string;
  emit: (event: string, ...args: unknown[]) => void;
  results: Map<string, unknown>;
}

export interface SetupStep {
  name: StepName;
  description: string;
  required: boolean;
  shouldRun: (config: SetupConfig, results: Map<string, unknown>) => boolean;
  execute: (ctx: StepContext) => Promise<void>;
}

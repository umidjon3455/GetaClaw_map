import { EventEmitter } from 'node:events';
import { logger } from '../utils/logger.js';
import type { SetupConfig, StepContext, StepName, StepStatus, SetupStep } from './types.js';
import { systemStep } from './steps/system.js';
import { openclawStep } from './steps/openclaw.js';
import { configureStep } from './steps/configure.js';
import { tailscaleStep } from './steps/tailscale.js';
import { channelsStep } from './steps/channels.js';
import { serviceStep } from './steps/service.js';
import { healthStep } from './steps/health.js';

export type OrchestratorState = 'idle' | 'running' | 'completed' | 'error';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;

const ALL_STEPS: SetupStep[] = [
  systemStep,
  openclawStep,
  configureStep,
  tailscaleStep,
  channelsStep,
  serviceStep,
  healthStep,
];

export class SetupOrchestrator extends EventEmitter {
  private state: OrchestratorState = 'idle';
  private stepStatuses = new Map<StepName, StepStatus>();
  private config: SetupConfig | null = null;
  private configDir: string;
  private results = new Map<string, unknown>();

  constructor(configDir: string) {
    super();
    this.configDir = configDir;

    for (const step of ALL_STEPS) {
      this.stepStatuses.set(step.name, {
        name: step.name,
        state: 'pending',
        retries: 0,
      });
    }
  }

  getStatus(): { state: OrchestratorState; steps: StepStatus[] } {
    return {
      state: this.state,
      steps: Array.from(this.stepStatuses.values()),
    };
  }

  async run(rawConfig: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (this.state === 'running') {
      throw new Error('Setup is already running');
    }

    this.config = rawConfig as unknown as SetupConfig;
    this.state = 'running';
    logger.info('Starting setup orchestration');

    const ctx: StepContext = {
      config: this.config,
      configDir: this.configDir,
      emit: this.emit.bind(this),
      results: this.results,
    };

    for (const step of ALL_STEPS) {
      if (!step.shouldRun(this.config)) {
        this.updateStepStatus(step.name, 'skipped');
        logger.info(`Skipping step: ${step.name}`);
        continue;
      }

      const success = await this.executeStep(step, ctx);
      if (!success && step.required) {
        this.state = 'error';
        logger.error(`Required step failed: ${step.name}. Aborting setup.`);
        return { success: false, failedStep: step.name, steps: this.getStatus().steps };
      }
    }

    this.state = 'completed';
    logger.info('Setup orchestration completed successfully');

    return {
      success: true,
      steps: this.getStatus().steps,
      results: Object.fromEntries(this.results),
    };
  }

  async retryStep(stepName: string): Promise<void> {
    const step = ALL_STEPS.find((s) => s.name === stepName);
    if (!step) throw new Error(`Unknown step: ${stepName}`);
    if (!this.config) throw new Error('No setup configuration loaded');

    const ctx: StepContext = {
      config: this.config,
      configDir: this.configDir,
      emit: this.emit.bind(this),
      results: this.results,
    };

    await this.executeStep(step, ctx);
  }

  private async executeStep(step: SetupStep, ctx: StepContext): Promise<boolean> {
    const status = this.stepStatuses.get(step.name)!;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        logger.info(`Retrying step ${step.name} (attempt ${attempt + 1}) after ${backoff}ms`);
        await sleep(backoff);
        status.retries = attempt;
      }

      this.updateStepStatus(step.name, 'running');
      this.emit('step.started', step.name);
      const startTime = Date.now();

      try {
        await step.execute(ctx);
        const duration = Date.now() - startTime;
        status.duration = duration;
        this.updateStepStatus(step.name, 'completed');
        this.emit('step.completed', step.name, duration);
        logger.info(`Step ${step.name} completed in ${duration}ms`);
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        status.error = errorMessage;
        logger.error(`Step ${step.name} failed (attempt ${attempt + 1})`, { error: errorMessage });
        this.emit('step.error', step.name, errorMessage);

        if (attempt === MAX_RETRIES) {
          this.updateStepStatus(step.name, 'error');
          return false;
        }
      }
    }

    return false;
  }

  private updateStepStatus(name: StepName, state: StepStatus['state']): void {
    const status = this.stepStatuses.get(name);
    if (status) {
      status.state = state;
      if (state !== 'error') {
        status.error = undefined;
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

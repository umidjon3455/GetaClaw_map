import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { SetupStep, StepContext } from '../types.js';
import { logger } from '../../utils/logger.js';

export const configureStep: SetupStep = {
  name: 'configure',
  description: 'Generate OpenClaw configuration files',
  required: true,
  shouldRun: () => true,

  async execute(ctx: StepContext): Promise<void> {
    const openclawDir = path.join(os.homedir(), '.openclaw');
    const configPath = path.join(openclawDir, 'openclaw.json');
    const envPath = path.join(openclawDir, '.env');

    ctx.emit('log', 'configure', 'Creating OpenClaw configuration directory...');
    ctx.emit('step.progress', 'configure', 10);

    await fs.mkdir(openclawDir, { recursive: true });

    // Build the OpenClaw configuration
    const openclawConfig = {
      gateway: {
        port: 18789,
        bind: ctx.config.securityMode === 'tailscale' ? '0.0.0.0' : '127.0.0.1',
        auth: {
          enabled: true,
          password: ctx.config.gatewayPassword ?? undefined,
        },
      },
      models: {
        provider: 'openrouter',
        selected: ctx.config.selectedModels,
      },
      channels: ctx.config.channels.map((ch) => ({
        type: ch.type,
        name: ch.name,
        enabled: true,
        config: ch.config,
      })),
      session: {
        maxHistory: 100,
        timeout: 3600,
      },
    };

    ctx.emit('step.progress', 'configure', 50);
    ctx.emit('log', 'configure', 'Writing openclaw.json...');

    await fs.writeFile(configPath, JSON.stringify(openclawConfig, null, 2), 'utf-8');
    await fs.chmod(configPath, 0o600);

    // Write .env file with API keys
    ctx.emit('log', 'configure', 'Writing environment file...');
    const envContent = [
      `OPENROUTER_API_KEY=${ctx.config.openrouterApiKey}`,
      '',
    ].join('\n');

    await fs.writeFile(envPath, envContent, 'utf-8');
    await fs.chmod(envPath, 0o600);

    ctx.emit('step.progress', 'configure', 100);
    ctx.emit('log', 'configure', 'OpenClaw configuration written successfully');
    logger.info('OpenClaw configuration written', { configPath, envPath });
  },
};

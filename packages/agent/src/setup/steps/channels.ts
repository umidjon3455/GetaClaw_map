import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { SetupStep, StepContext } from '../types.js';
import { logger } from '../../utils/logger.js';

export const channelsStep: SetupStep = {
  name: 'channels',
  description: 'Configure messaging channels',
  required: false,
  shouldRun: (config, results) => config.channels.length > 0 && !!results.get('openclawVersion'),

  async execute(ctx: StepContext): Promise<void> {
    const channels = ctx.config.channels;
    ctx.emit('log', 'channels', `Configuring ${channels.length} channel(s)...`);
    ctx.emit('step.progress', 'channels', 10);

    const openclawDir = path.join(os.homedir(), '.openclaw');
    const configPath = path.join(openclawDir, 'openclaw.json');

    // Read existing config
    const rawConfig = await fs.readFile(configPath, 'utf-8');
    const openclawConfig = JSON.parse(rawConfig);

    // Update channels section
    openclawConfig.channels = channels.map((ch, idx) => {
      ctx.emit('log', 'channels', `Configuring channel: ${ch.type} (${ch.name})`);
      const progress = 10 + Math.round(((idx + 1) / channels.length) * 80);
      ctx.emit('step.progress', 'channels', progress);

      return {
        type: ch.type,
        name: ch.name,
        enabled: true,
        config: ch.config,
      };
    });

    // Write updated config
    await fs.writeFile(configPath, JSON.stringify(openclawConfig, null, 2), 'utf-8');

    ctx.emit('step.progress', 'channels', 100);
    ctx.emit('log', 'channels', `${channels.length} channel(s) configured successfully`);
    logger.info(`Configured ${channels.length} channels`);
  },
};

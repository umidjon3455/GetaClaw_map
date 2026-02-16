import type { SetupStep, StepContext } from '../types.js';
import { safeExec } from '../../utils/exec.js';
import { logger } from '../../utils/logger.js';

export const serviceStep: SetupStep = {
  name: 'service',
  description: 'Set up OpenClaw as a systemd service',
  required: true,
  shouldRun: () => true,

  async execute(ctx: StepContext): Promise<void> {
    ctx.emit('log', 'service', 'Installing OpenClaw gateway service...');
    ctx.emit('step.progress', 'service', 10);

    // Use OpenClaw's built-in service installer
    await safeExec('openclaw', ['gateway', 'install']);
    ctx.emit('step.progress', 'service', 40);

    // Enable the service
    ctx.emit('log', 'service', 'Enabling openclaw gateway service...');
    await safeExec('systemctl', ['enable', 'openclaw-gateway']);
    ctx.emit('step.progress', 'service', 60);

    // Start the service
    ctx.emit('log', 'service', 'Starting openclaw gateway service...');
    await safeExec('systemctl', ['start', 'openclaw-gateway']);
    ctx.emit('step.progress', 'service', 80);

    // Verify it's running
    ctx.emit('log', 'service', 'Verifying service is running...');
    const result = await safeExec('systemctl', ['is-active', 'openclaw-gateway']);
    const status = result.stdout.trim();

    if (status !== 'active') {
      throw new Error(`OpenClaw gateway service is not active (status: ${status})`);
    }

    ctx.emit('step.progress', 'service', 100);
    ctx.emit('log', 'service', 'OpenClaw gateway service installed and running');
    logger.info('OpenClaw gateway systemd service is active');
  },
};

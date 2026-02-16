import fs from 'node:fs/promises';
import type { SetupStep, StepContext } from '../types.js';
import { safeExec } from '../../utils/exec.js';
import { logger } from '../../utils/logger.js';

export const serviceStep: SetupStep = {
  name: 'service',
  description: 'Set up OpenClaw as a systemd service',
  required: true,
  shouldRun: (_config, results) => !!results.get('openclawVersion'),

  async execute(ctx: StepContext): Promise<void> {
    ctx.emit('log', 'service', 'Installing OpenClaw gateway service...');
    ctx.emit('step.progress', 'service', 10);

    // Find openclaw binary path for the ExecStart directive
    const whichResult = await safeExec('bash', ['-c', 'which openclaw']);
    const openclawBin = whichResult.stdout.trim() || '/usr/bin/openclaw';
    ctx.emit('log', 'service', `OpenClaw binary: ${openclawBin}`);

    // Create a system-level systemd service (not user-level).
    // `openclaw gateway install` creates a user-level service that requires
    // lingering + XDG_RUNTIME_DIR — unreliable when running headless as root.
    // A system unit is the recommended approach for always-on servers.
    const serviceContent = `[Unit]
Description=OpenClaw AI Gateway
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=${openclawBin} gateway --port 18789
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=HOME=/root
EnvironmentFile=-/root/.openclaw/.env

[Install]
WantedBy=multi-user.target
`;

    const servicePath = '/etc/systemd/system/openclaw-gateway.service';
    await fs.writeFile(servicePath, serviceContent, 'utf-8');
    ctx.emit('step.progress', 'service', 30);

    // Enable and start
    ctx.emit('log', 'service', 'Enabling and starting OpenClaw gateway...');
    await safeExec('systemctl', ['daemon-reload']);
    await safeExec('systemctl', ['enable', 'openclaw-gateway']);
    await safeExec('systemctl', ['start', 'openclaw-gateway']);
    ctx.emit('step.progress', 'service', 60);

    // Give the gateway a moment to initialize
    ctx.emit('log', 'service', 'Waiting for gateway to start...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Verify the service is active
    ctx.emit('log', 'service', 'Verifying service is running...');
    const statusResult = await safeExec('systemctl', ['is-active', 'openclaw-gateway']);
    const state = statusResult.stdout.trim();

    if (state !== 'active') {
      const journal = await safeExec('bash', ['-c', 'journalctl -u openclaw-gateway -n 30 --no-pager 2>&1']);
      ctx.emit('log', 'service', `Service journal:\n${journal.stdout}`);
      throw new Error(`OpenClaw gateway service is not active (state: ${state})`);
    }

    ctx.emit('step.progress', 'service', 100);
    ctx.emit('log', 'service', 'OpenClaw gateway service installed and running');
    logger.info('OpenClaw gateway service is active');
  },
};

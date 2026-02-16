import type { SetupStep, StepContext } from '../types.js';
import { safeExec, safeExecPipe } from '../../utils/exec.js';

export const tailscaleStep: SetupStep = {
  name: 'tailscale',
  description: 'Install and configure Tailscale VPN',
  required: false,
  shouldRun: (config) => config.securityMode === 'tailscale',

  async execute(ctx: StepContext): Promise<void> {
    if (!ctx.config.tailscaleAuthKey) {
      throw new Error('Tailscale auth key is required when security mode is tailscale');
    }

    // Install Tailscale
    ctx.emit('log', 'tailscale', 'Downloading Tailscale installer...');
    ctx.emit('step.progress', 'tailscale', 10);

    await safeExecPipe(
      'curl',
      ['-fsSL', 'https://tailscale.com/install.sh', '-o', '/tmp/tailscale-install.sh'],
      {},
      (output: string) => ctx.emit('log', 'tailscale', output),
    );

    ctx.emit('step.progress', 'tailscale', 30);
    ctx.emit('log', 'tailscale', 'Running Tailscale installer...');

    await safeExecPipe(
      'sh',
      ['/tmp/tailscale-install.sh'],
      {},
      (output: string) => ctx.emit('log', 'tailscale', output),
      (output: string) => ctx.emit('log', 'tailscale', output),
    );

    ctx.emit('step.progress', 'tailscale', 60);

    // Authenticate with auth key
    ctx.emit('log', 'tailscale', 'Authenticating with Tailscale...');
    await safeExec('tailscale', [
      'up',
      `--authkey=${ctx.config.tailscaleAuthKey}`,
      '--hostname=openclaw-vps',
    ]);

    ctx.emit('step.progress', 'tailscale', 80);

    // Get Tailscale IP
    ctx.emit('log', 'tailscale', 'Retrieving Tailscale IP...');
    const ipResult = await safeExec('tailscale', ['ip', '-4']);
    const tailscaleIp = ipResult.stdout.trim();
    ctx.emit('log', 'tailscale', `Tailscale IP: ${tailscaleIp}`);

    ctx.results.set('tailscaleIp', tailscaleIp);

    // Update firewall: restrict agent port to Tailscale subnet
    ctx.emit('log', 'tailscale', 'Updating firewall rules for Tailscale...');
    await safeExec('ufw', ['allow', 'in', 'on', 'tailscale0']);

    ctx.emit('step.progress', 'tailscale', 100);
    ctx.emit('log', 'tailscale', 'Tailscale configured successfully');
  },
};

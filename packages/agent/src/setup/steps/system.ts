import os from 'node:os';
import type { SetupStep, StepContext } from '../types.js';
import { safeExec, safeExecPipe } from '../../utils/exec.js';
import { logger } from '../../utils/logger.js';

const MIN_RAM_FOR_SWAP = 2 * 1024 * 1024 * 1024; // 2GB in bytes

export const systemStep: SetupStep = {
  name: 'system',
  description: 'System preparation: update packages, configure swap, verify Node.js',
  required: true,
  shouldRun: () => true,

  async execute(ctx: StepContext): Promise<void> {
    // Step 1: apt update & upgrade
    ctx.emit('log', 'system', 'Running apt update...');
    ctx.emit('step.progress', 'system', 10);

    await safeExecPipe(
      'apt-get',
      ['update', '-y'],
      { env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' } },
      (output: string) => ctx.emit('log', 'system', output),
    );

    ctx.emit('step.progress', 'system', 30);
    ctx.emit('log', 'system', 'Running apt upgrade...');

    await safeExecPipe(
      'apt-get',
      ['upgrade', '-y'],
      { env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' } },
      (output: string) => ctx.emit('log', 'system', output),
    );

    ctx.emit('step.progress', 'system', 50);

    // Step 2: Install essential packages
    ctx.emit('log', 'system', 'Installing essential packages...');
    await safeExec('apt-get', ['install', '-y', 'curl', 'ca-certificates', 'gnupg', 'build-essential'], {
      env: { ...process.env, DEBIAN_FRONTEND: 'noninteractive' },
    });

    ctx.emit('step.progress', 'system', 65);

    // Step 3: Setup swap if RAM < 2GB
    const totalMem = os.totalmem();
    if (totalMem < MIN_RAM_FOR_SWAP) {
      ctx.emit('log', 'system', `RAM is ${Math.round(totalMem / 1024 / 1024)}MB, setting up 2GB swap...`);

      try {
        await safeExec('fallocate', ['-l', '2G', '/swapfile']);
        await safeExec('chmod', ['600', '/swapfile']);
        await safeExec('mkswap', ['/swapfile']);
        await safeExec('swapon', ['/swapfile']);
        ctx.emit('log', 'system', 'Swap configured successfully');
      } catch (err) {
        logger.warn('Failed to set up swap, continuing anyway', {
          error: err instanceof Error ? err.message : String(err),
        });
        ctx.emit('log', 'system', 'Warning: Failed to set up swap, continuing...');
      }
    } else {
      ctx.emit('log', 'system', `RAM is ${Math.round(totalMem / 1024 / 1024)}MB, swap not needed`);
    }

    ctx.emit('step.progress', 'system', 80);

    // Step 4: Verify Node.js 22
    ctx.emit('log', 'system', 'Verifying Node.js version...');
    const nodeResult = await safeExec('node', ['--version']);
    const nodeVersion = nodeResult.stdout.trim();
    ctx.emit('log', 'system', `Node.js version: ${nodeVersion}`);

    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0], 10);
    if (majorVersion < 22) {
      throw new Error(`Node.js 22+ is required, found ${nodeVersion}`);
    }

    ctx.emit('step.progress', 'system', 100);
    ctx.emit('log', 'system', 'System preparation complete');
  },
};

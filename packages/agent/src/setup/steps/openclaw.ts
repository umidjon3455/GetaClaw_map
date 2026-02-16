import type { SetupStep, StepContext } from '../types.js';
import { safeExec, safeExecPipe } from '../../utils/exec.js';

export const openclawStep: SetupStep = {
  name: 'openclaw',
  description: 'Install OpenClaw globally via npm',
  required: true,
  shouldRun: () => true,

  async execute(ctx: StepContext): Promise<void> {
    // Check if already installed (e.g. by cloud-init)
    const check = await safeExec('openclaw', ['--version']);
    if (check.exitCode === 0 && check.stdout.trim()) {
      const version = check.stdout.trim();
      ctx.emit('log', 'openclaw', `OpenClaw already installed: ${version}`);
      ctx.results.set('openclawVersion', version);
      ctx.emit('step.progress', 'openclaw', 100);
      return;
    }

    ctx.emit('log', 'openclaw', 'Installing openclaw@latest globally...');
    ctx.emit('step.progress', 'openclaw', 10);

    await safeExecPipe(
      'npm',
      ['install', '-g', 'openclaw@latest'],
      {},
      (output: string) => ctx.emit('log', 'openclaw', output),
      (output: string) => ctx.emit('log', 'openclaw', output),
    );

    ctx.emit('step.progress', 'openclaw', 80);

    // Verify installation
    ctx.emit('log', 'openclaw', 'Verifying openclaw installation...');
    const result = await safeExec('openclaw', ['--version']);
    if (result.exitCode !== 0) {
      throw new Error('OpenClaw installation failed — openclaw binary not found after npm install');
    }
    const version = result.stdout.trim();
    ctx.emit('log', 'openclaw', `OpenClaw version: ${version}`);

    ctx.results.set('openclawVersion', version);
    ctx.emit('step.progress', 'openclaw', 100);
    ctx.emit('log', 'openclaw', 'OpenClaw installed successfully');
  },
};

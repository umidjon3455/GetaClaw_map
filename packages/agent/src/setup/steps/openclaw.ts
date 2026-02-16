import type { SetupStep, StepContext } from '../types.js';
import { safeExec, safeExecPipe } from '../../utils/exec.js';

export const openclawStep: SetupStep = {
  name: 'openclaw',
  description: 'Install OpenClaw globally via npm',
  required: true,
  shouldRun: () => true,

  async execute(ctx: StepContext): Promise<void> {
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
    const version = result.stdout.trim();
    ctx.emit('log', 'openclaw', `OpenClaw version: ${version}`);

    ctx.results.set('openclawVersion', version);
    ctx.emit('step.progress', 'openclaw', 100);
    ctx.emit('log', 'openclaw', 'OpenClaw installed successfully');
  },
};

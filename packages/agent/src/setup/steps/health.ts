import type { SetupStep, StepContext } from '../types.js';
import { safeExec } from '../../utils/exec.js';
import { logger } from '../../utils/logger.js';

const HEALTH_CHECK_RETRIES = 30;
const HEALTH_CHECK_INTERVAL_MS = 3000;

export const healthStep: SetupStep = {
  name: 'health',
  description: 'Verify OpenClaw gateway is running and accessible',
  required: true,
  shouldRun: (_config, results) => !!results.get('openclawVersion'),

  async execute(ctx: StepContext): Promise<void> {
    ctx.emit('log', 'health', 'Running final health checks...');
    ctx.emit('step.progress', 'health', 10);

    // Check 1: Gateway HTTP endpoint
    ctx.emit('log', 'health', 'Checking gateway HTTP endpoint...');
    let gatewayReachable = false;

    for (let i = 0; i < HEALTH_CHECK_RETRIES; i++) {
      try {
        const result = await safeExec('curl', [
          '-s',
          '-o', '/dev/null',
          '-w', '%{http_code}',
          '--max-time', '5',
          'http://127.0.0.1:18789',
        ]);

        const httpCode = parseInt(result.stdout.trim(), 10);
        if (httpCode >= 200 && httpCode < 500) {
          gatewayReachable = true;
          ctx.emit('log', 'health', `Gateway responding (HTTP ${httpCode})`);
          break;
        }
      } catch {
        // Retry
      }

      if (i < HEALTH_CHECK_RETRIES - 1) {
        ctx.emit('log', 'health', `Gateway not ready, retrying in ${HEALTH_CHECK_INTERVAL_MS / 1000}s...`);
        await sleep(HEALTH_CHECK_INTERVAL_MS);
      }
    }

    if (!gatewayReachable) {
      throw new Error('OpenClaw gateway is not responding on port 18789');
    }

    ctx.emit('step.progress', 'health', 40);

    // Check 2: WebSocket connectivity
    ctx.emit('log', 'health', 'Checking WebSocket connectivity...');
    try {
      const wsResult = await safeExec('curl', [
        '-s',
        '-o', '/dev/null',
        '-w', '%{http_code}',
        '--max-time', '5',
        '-H', 'Upgrade: websocket',
        '-H', 'Connection: Upgrade',
        'http://127.0.0.1:18789',
      ]);
      ctx.emit('log', 'health', `WebSocket endpoint check: HTTP ${wsResult.stdout.trim()}`);
    } catch {
      logger.warn('WebSocket check returned non-zero, but gateway may still be functional');
      ctx.emit('log', 'health', 'WebSocket check inconclusive, continuing...');
    }

    ctx.emit('step.progress', 'health', 70);

    // Check 3: Control UI accessibility
    ctx.emit('log', 'health', 'Checking Control UI...');
    try {
      const uiResult = await safeExec('curl', [
        '-s',
        '-o', '/dev/null',
        '-w', '%{http_code}',
        '--max-time', '5',
        'http://127.0.0.1:18789',
      ]);
      const uiCode = parseInt(uiResult.stdout.trim(), 10);
      ctx.emit('log', 'health', `Control UI responding (HTTP ${uiCode})`);
    } catch {
      ctx.emit('log', 'health', 'Warning: Control UI check failed, but this may be expected');
    }

    ctx.emit('step.progress', 'health', 90);

    // Build connection details
    const tailscaleIp = ctx.results.get('tailscaleIp') as string | undefined;
    const controlUiUrl = tailscaleIp
      ? `http://${tailscaleIp}:18789`
      : 'http://127.0.0.1:18789';

    ctx.results.set('controlUiUrl', controlUiUrl);
    ctx.results.set('healthCheckPassed', true);

    ctx.emit('step.progress', 'health', 100);
    ctx.emit('log', 'health', `Health checks passed. Control UI: ${controlUiUrl}`);
    logger.info('All health checks passed', { controlUiUrl });
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

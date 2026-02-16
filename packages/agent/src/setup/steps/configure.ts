import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { SetupStep, StepContext } from '../types.js';
import { safeExec } from '../../utils/exec.js';
import { logger } from '../../utils/logger.js';

/** Run openclaw config set and throw on failure. */
async function configSet(key: string, value: string): Promise<void> {
  const result = await safeExec('openclaw', ['config', 'set', key, value]);
  if (result.exitCode !== 0) {
    throw new Error(`openclaw config set ${key} failed (exit ${result.exitCode}): ${result.stderr.trim()}`);
  }
}

export const configureStep: SetupStep = {
  name: 'configure',
  description: 'Generate OpenClaw configuration files',
  required: true,
  shouldRun: (_config, results) => !!results.get('openclawVersion'),

  async execute(ctx: StepContext): Promise<void> {
    const openclawDir = path.join(os.homedir(), '.openclaw');
    const envPath = path.join(openclawDir, '.env');

    ctx.emit('log', 'configure', 'Configuring OpenClaw via CLI...');
    ctx.emit('step.progress', 'configure', 10);

    await fs.mkdir(openclawDir, { recursive: true });

    // Configure gateway settings via openclaw config set
    // Both password and tailscale modes bind to lan — password auth or tailnet is the security layer
    const bindMode = 'lan';
    await configSet('gateway.mode', 'local');
    await configSet('gateway.port', '18789');
    await configSet('gateway.bind', bindMode);
    // Trust Caddy reverse proxy on localhost so connections are treated as local
    await configSet('gateway.trustedProxies', '["127.0.0.1"]');
    ctx.emit('step.progress', 'configure', 30);

    // Configure gateway auth
    if (ctx.config.securityMode === 'password' && ctx.config.gatewayToken) {
      await configSet('gateway.auth.mode', 'token');
      await configSet('gateway.auth.token', ctx.config.gatewayToken);
      // Allow Control UI over plain HTTP as fallback
      await configSet('gateway.controlUi.allowInsecureAuth', 'true');
    } else if (ctx.config.securityMode === 'tailscale') {
      await configSet('gateway.auth.mode', 'token');
    }
    ctx.emit('step.progress', 'configure', 50);

    // Set the default model — prefix with openrouter/ since all models are
    // routed through OpenRouter (the user provides an OpenRouter API key)
    ctx.emit('log', 'configure', 'Setting default model...');
    const rawModel = ctx.config.selectedModels?.[0];
    if (rawModel) {
      const model = rawModel.startsWith('openrouter/') ? rawModel : `openrouter/${rawModel}`;
      ctx.emit('log', 'configure', `Model: ${model}`);
      const result = await safeExec('openclaw', ['models', 'set', model]);
      if (result.exitCode !== 0) {
        throw new Error(`openclaw models set failed (exit ${result.exitCode}): ${result.stderr.trim()}`);
      }
    }
    ctx.emit('step.progress', 'configure', 70);

    // Write .env file with API keys for the gateway environment
    ctx.emit('log', 'configure', 'Writing environment file...');
    const envContent = [
      `OPENROUTER_API_KEY=${ctx.config.openrouterApiKey}`,
      '',
    ].join('\n');

    await fs.writeFile(envPath, envContent, 'utf-8');
    await fs.chmod(envPath, 0o600);

    ctx.emit('step.progress', 'configure', 100);
    ctx.emit('log', 'configure', 'OpenClaw configuration complete');
    logger.info('OpenClaw configuration written via CLI', { envPath });
  },
};

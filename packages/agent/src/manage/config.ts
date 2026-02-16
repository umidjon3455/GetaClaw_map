import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { logger } from '../utils/logger.js';

const OPENCLAW_CONFIG_PATH = path.join(os.homedir(), '.openclaw', 'openclaw.json');

export async function getConfig(): Promise<Record<string, unknown>> {
  const raw = await fs.readFile(OPENCLAW_CONFIG_PATH, 'utf-8');
  return JSON.parse(raw) as Record<string, unknown>;
}

export async function setConfig(updates: Record<string, unknown>): Promise<void> {
  const current = await getConfig();

  // Deep merge updates into current config
  const merged = deepMerge(current, updates);

  await fs.writeFile(OPENCLAW_CONFIG_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  logger.info('OpenClaw config updated', { keys: Object.keys(updates) });
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = target[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>,
      );
    } else {
      result[key] = sourceVal;
    }
  }

  return result;
}

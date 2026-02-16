import { execFile, spawn, type ExecFileOptions, type SpawnOptions } from 'node:child_process';
import { logger } from './logger.js';

const ALLOWED_COMMANDS = new Set([
  'apt',
  'apt-get',
  'npm',
  'systemctl',
  'tailscale',
  'openclaw',
  'ufw',
  'curl',
  'fallocate',
  'mkswap',
  'swapon',
  'chmod',
  'chown',
  'mkdir',
  'cat',
  'tee',
  'node',
  'bash',
  'sh',
  'free',
  'uptime',
  'whoami',
  'id',
  'hostname',
  'useradd',
  'getent',
]);

export interface ExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class CommandNotAllowedError extends Error {
  constructor(command: string) {
    super(`Command not allowed: ${command}`);
    this.name = 'CommandNotAllowedError';
  }
}

export async function safeExec(
  command: string,
  args: string[],
  options: ExecFileOptions = {},
): Promise<ExecResult> {
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new CommandNotAllowedError(command);
  }

  const defaults: ExecFileOptions = {
    timeout: 300_000,
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  };

  logger.debug(`Executing: ${command} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    execFile(command, args, defaults, (error, stdout, stderr) => {
      const result: ExecResult = {
        stdout: typeof stdout === 'string' ? stdout : stdout?.toString() ?? '',
        stderr: typeof stderr === 'string' ? stderr : stderr?.toString() ?? '',
        exitCode: error && 'code' in error && typeof error.code === 'number' ? error.code : error ? 1 : 0,
      };

      if (error && !('code' in error && typeof error.code === 'number')) {
        logger.error(`Command failed: ${command} ${args.join(' ')}`, {
          stderr: result.stderr,
          error: error.message,
        });
        reject(Object.assign(error, { result }));
        return;
      }

      if (result.exitCode !== 0) {
        logger.warn(`Command exited with code ${result.exitCode}: ${command} ${args.join(' ')}`);
      }

      resolve(result);
    });
  });
}

export async function safeExecPipe(
  command: string,
  args: string[],
  options: ExecFileOptions = {},
  onStdout?: (data: string) => void,
  onStderr?: (data: string) => void,
): Promise<ExecResult> {
  if (!ALLOWED_COMMANDS.has(command)) {
    throw new CommandNotAllowedError(command);
  }

  const spawnOpts: SpawnOptions = {
    timeout: 600_000,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  };

  logger.debug(`Executing (piped): ${command} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, spawnOpts);
    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data: Buffer | string) => {
      const chunk = data.toString();
      stdout += chunk;
      onStdout?.(chunk);
    });

    proc.stderr?.on('data', (data: Buffer | string) => {
      const chunk = data.toString();
      stderr += chunk;
      onStderr?.(chunk);
    });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, exitCode: code ?? 0 });
    });

    proc.on('error', (error) => {
      reject(Object.assign(error, { result: { stdout, stderr, exitCode: 1 } }));
    });
  });
}

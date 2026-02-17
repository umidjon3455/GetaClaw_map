#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';
import { logger, enableFileLogging } from './utils/logger.js';
import { generateToken, generateTlsCert, hashToken } from './utils/crypto.js';
import { AgentServer } from './server.js';
import { safeExec } from './utils/exec.js';

const DEFAULT_CONFIG_DIR = '/etc/getaclaw';
const DEFAULT_PORT = 34567;

const program = new Command();

program
  .name('getaclaw-agent')
  .description('GetaClaw Agent — manages OpenClaw setup and ongoing maintenance')
  .version('0.1.0');

// --- init ---

program
  .command('init')
  .description('Initialize the agent: generate TLS cert, save config')
  .option('--token <token>', 'Pairing token (generated if not provided)')
  .option('--port <port>', 'Agent port', String(DEFAULT_PORT))
  .option('--config-dir <dir>', 'Configuration directory', DEFAULT_CONFIG_DIR)
  .action(async (opts) => {
    const configDir = opts.configDir as string;
    const port = parseInt(opts.port, 10);
    const pairingToken = (opts.token as string) || generateToken();

    logger.info('Initializing getaclaw-agent', { configDir, port });

    // Create config directory
    fs.mkdirSync(configDir, { recursive: true });
    fs.mkdirSync(path.join(configDir, 'tls'), { recursive: true });

    // Generate TLS certificate
    logger.info('Generating self-signed TLS certificate...');
    const tls = generateTlsCert(pairingToken);

    const certPath = path.join(configDir, 'tls', 'cert.pem');
    const keyPath = path.join(configDir, 'tls', 'key.pem');

    fs.writeFileSync(certPath, tls.cert, 'utf-8');
    fs.writeFileSync(keyPath, tls.key, 'utf-8');
    fs.chmodSync(certPath, 0o644);
    fs.chmodSync(keyPath, 0o600);

    // Save agent config
    const config = {
      port,
      pairingTokenHash: hashToken(pairingToken),
      certPath,
      keyPath,
      configDir,
      fingerprint: tls.fingerprint,
      createdAt: new Date().toISOString(),
    };

    const configPath = path.join(configDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    fs.chmodSync(configPath, 0o600);

    logger.info('Agent initialized successfully');
    logger.info(`Port: ${port}`);
    logger.info(`Config: ${configPath}`);
    logger.info(`TLS fingerprint: ${tls.fingerprint}`);

    if (!opts.token) {
      logger.info(`Pairing token: ${pairingToken}`);
      logger.info('Save this token — it will not be shown again.');
    }
  });

// --- serve ---

program
  .command('serve')
  .description('Start the agent HTTPS/WebSocket server')
  .option('--config-dir <dir>', 'Configuration directory', DEFAULT_CONFIG_DIR)
  .action(async (opts) => {
    const configDir = opts.configDir as string;
    const configPath = path.join(configDir, 'config.json');

    if (!fs.existsSync(configPath)) {
      logger.error(`Config not found at ${configPath}. Run "getaclaw-agent init" first.`);
      process.exit(1);
    }

    enableFileLogging();

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    const server = new AgentServer({
      port: config.port,
      certPath: config.certPath,
      keyPath: config.keyPath,
      pairingTokenHash: config.pairingTokenHash,
      configDir,
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down agent server...');
      await server.stop();
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    await server.start();
    logger.info(`Agent server running on port ${config.port}`);

    // Auto-detect init-config and start setup if present
    const initConfigPath = path.join(configDir, 'init-config.json');
    if (fs.existsSync(initConfigPath)) {
      try {
        const initConfig = JSON.parse(fs.readFileSync(initConfigPath, 'utf-8'));
        const setupConfig = initConfig.setup;
        if (setupConfig) {
          logger.info('Found init-config.json, auto-starting setup');
          server.autoStartSetup(setupConfig).then((result) => {
            // Only rename to .done if setup succeeded
            const donePath = path.join(configDir, 'init-config.done.json');
            if (result.success) {
              fs.renameSync(initConfigPath, donePath);
              logger.info('Setup succeeded, renamed init-config.json to init-config.done.json');
            } else {
              logger.warn('Setup finished with errors, keeping init-config.json for retry');
            }
          }).catch((err) => {
            logger.error('Auto-setup error', {
              error: err instanceof Error ? err.message : String(err),
            });
          });
        }
      } catch (err) {
        logger.error('Failed to read init-config.json', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  });

// --- service ---

const serviceCmd = program
  .command('service')
  .description('Manage the getaclaw-agent systemd service');

serviceCmd
  .command('install')
  .description('Install the systemd service')
  .action(async () => {
    const serviceContent = `[Unit]
Description=GetaClaw Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/getaclaw-agent serve
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=GETACLAW_CONFIG=${DEFAULT_CONFIG_DIR}/config.json

[Install]
WantedBy=multi-user.target
`;

    const servicePath = '/etc/systemd/system/getaclaw-agent.service';

    logger.info('Installing systemd service...');

    // Ensure log directory exists
    await safeExec('mkdir', ['-p', '/var/log/getaclaw']);

    fs.writeFileSync(servicePath, serviceContent, 'utf-8');

    await safeExec('systemctl', ['daemon-reload']);
    await safeExec('systemctl', ['enable', 'getaclaw-agent']);

    logger.info('Service installed and enabled');
    logger.info('Start with: systemctl start getaclaw-agent');
  });

serviceCmd
  .command('uninstall')
  .description('Remove the systemd service')
  .action(async () => {
    logger.info('Stopping and disabling service...');

    try {
      await safeExec('systemctl', ['stop', 'getaclaw-agent']);
    } catch {
      // May not be running
    }

    try {
      await safeExec('systemctl', ['disable', 'getaclaw-agent']);
    } catch {
      // May not be enabled
    }

    const servicePath = '/etc/systemd/system/getaclaw-agent.service';
    if (fs.existsSync(servicePath)) {
      fs.unlinkSync(servicePath);
    }

    await safeExec('systemctl', ['daemon-reload']);
    logger.info('Service uninstalled');
  });

serviceCmd
  .command('status')
  .description('Check the service status')
  .action(async () => {
    try {
      const result = await safeExec('systemctl', ['status', 'getaclaw-agent']);
      console.log(result.stdout);
    } catch (err: unknown) {
      const execErr = err as { result?: { stdout: string } };
      if (execErr.result?.stdout) {
        console.log(execErr.result.stdout);
      } else {
        logger.error('Failed to get service status', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }
  });

program.parse();

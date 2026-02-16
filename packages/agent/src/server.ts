import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, ServerResponse } from 'node:http';
import { logger } from './utils/logger.js';
import { computeCertFingerprint, generateSessionToken, hashToken } from './utils/crypto.js';
import { isValidClientMessage, type AgentMessage, type ClientMessage } from './protocol.js';
import { SetupOrchestrator } from './setup/orchestrator.js';
import { handleManageAction } from './manage/update.js';
import { handleHealthAction } from './manage/health.js';

export interface AgentServerConfig {
  port: number;
  certPath: string;
  keyPath: string;
  pairingTokenHash: string;
  configDir: string;
}

interface RateLimitEntry {
  failures: number;
  lockedUntil: number;
}

const MAX_AUTH_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export class AgentServer {
  private httpsServer: https.Server;
  private wss: WebSocketServer;
  private config: AgentServerConfig;
  private orchestrator: SetupOrchestrator;
  private rateLimits = new Map<string, RateLimitEntry>();
  private sessionTokens = new Set<string>();
  private authenticatedClients = new WeakMap<WebSocket, boolean>();

  constructor(config: AgentServerConfig) {
    this.config = config;

    const tlsOptions = {
      cert: fs.readFileSync(config.certPath, 'utf-8'),
      key: fs.readFileSync(config.keyPath, 'utf-8'),
    };

    this.httpsServer = https.createServer(tlsOptions, this.handleHttpRequest.bind(this));
    this.wss = new WebSocketServer({ server: this.httpsServer, path: '/ws' });
    this.orchestrator = new SetupOrchestrator(config.configDir);

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpsServer.listen(this.config.port, '0.0.0.0', () => {
        logger.info(`Agent server listening on port ${this.config.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    this.wss.clients.forEach((client) => client.close());
    return new Promise((resolve, reject) => {
      this.httpsServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleHttpRequest(req: IncomingMessage, res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (req.method === 'GET' && req.url === '/health') {
      const setupStatus = this.orchestrator.getStatus();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'ok',
        version: process.env.npm_package_version ?? '0.1.0',
        setup: setupStatus.state,
        uptime: process.uptime(),
      }));
      return;
    }

    if (req.method === 'GET' && req.url === '/setup-status') {
      const status = this.orchestrator.getStatus();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(status));
      return;
    }

    if (req.method === 'GET' && req.url === '/fingerprint') {
      const cert = fs.readFileSync(this.config.certPath, 'utf-8');
      const fingerprint = computeCertFingerprint(cert);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ fingerprint }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const ip = req.socket.remoteAddress ?? 'unknown';
    logger.info(`WebSocket connection from ${ip}`);

    // Check rate limit
    if (this.isRateLimited(ip)) {
      logger.warn(`Rate-limited connection attempt from ${ip}`);
      this.send(ws, {
        type: 'error',
        status: 'error',
        data: { message: 'Too many failed authentication attempts. Try again later.' },
      });
      ws.close(4029, 'Rate limited');
      return;
    }

    // Set authentication timeout - must authenticate within 10 seconds
    const authTimeout = setTimeout(() => {
      if (!this.authenticatedClients.get(ws)) {
        logger.warn(`Authentication timeout for ${ip}`);
        ws.close(4001, 'Authentication timeout');
      }
    }, 10_000);

    ws.on('message', (data) => {
      this.handleMessage(ws, data, ip).catch((err) => {
        logger.error('Error handling message', { error: err });
        this.send(ws, {
          type: 'error',
          status: 'error',
          data: { message: 'Internal server error' },
        });
      });
    });

    ws.on('close', () => {
      clearTimeout(authTimeout);
      this.authenticatedClients.delete(ws);
      logger.info(`WebSocket disconnected: ${ip}`);
    });

    ws.on('error', (err) => {
      logger.error(`WebSocket error from ${ip}`, { error: err.message });
    });
  }

  private async handleMessage(ws: WebSocket, raw: unknown, ip: string): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(raw));
    } catch {
      this.send(ws, { type: 'error', status: 'error', data: { message: 'Invalid JSON' } });
      return;
    }

    if (!isValidClientMessage(parsed)) {
      this.send(ws, {
        type: 'error',
        status: 'error',
        data: { message: 'Invalid message format' },
      });
      return;
    }

    const msg = parsed as ClientMessage;

    // Authenticate
    if (!this.authenticatedClients.get(ws)) {
      const tokenHash = hashToken(msg.token);
      const isValidPairing = tokenHash === this.config.pairingTokenHash;
      const isValidSession = this.sessionTokens.has(msg.token);

      if (!isValidPairing && !isValidSession) {
        this.recordAuthFailure(ip);
        this.send(ws, {
          id: msg.id,
          type: 'error',
          status: 'error',
          data: { message: 'Authentication failed' },
        });
        if (this.isRateLimited(ip)) {
          ws.close(4029, 'Rate limited');
        }
        return;
      }

      this.authenticatedClients.set(ws, true);

      // Issue a session token if they used the pairing token
      if (isValidPairing) {
        const sessionToken = generateSessionToken();
        this.sessionTokens.add(sessionToken);
        this.send(ws, {
          id: msg.id,
          type: 'response',
          action: 'auth',
          status: 'ok',
          data: { sessionToken, message: 'Authenticated' },
        });
        return;
      }
    }

    // Route the message
    await this.routeMessage(ws, msg);
  }

  private async routeMessage(ws: WebSocket, msg: ClientMessage): Promise<void> {
    const sendEvent = (event: AgentMessage) => this.send(ws, event);

    try {
      switch (msg.type) {
        case 'setup':
          await this.handleSetupAction(ws, msg, sendEvent);
          break;
        case 'manage':
          await handleManageAction(msg, sendEvent, this.config.configDir);
          break;
        case 'health':
          await handleHealthAction(msg, sendEvent);
          break;
        default:
          this.send(ws, {
            id: msg.id,
            type: 'error',
            status: 'error',
            data: { message: `Unknown message type: ${msg.type}` },
          });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.send(ws, {
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message },
      });
    }
  }

  private async handleSetupAction(
    ws: WebSocket,
    msg: ClientMessage,
    sendEvent: (event: AgentMessage) => void,
  ): Promise<void> {
    switch (msg.action) {
      case 'setup.start': {
        const config = msg.params as Record<string, unknown> | undefined;
        if (!config) {
          sendEvent({
            id: msg.id,
            type: 'error',
            status: 'error',
            data: { message: 'Missing setup configuration in params' },
          });
          return;
        }

        this.orchestrator.on('step.started', (step) => {
          sendEvent({ type: 'event', event: 'step.started', payload: { step } });
        });
        this.orchestrator.on('step.progress', (step, progress) => {
          sendEvent({ type: 'event', event: 'step.progress', payload: { step, progress } });
        });
        this.orchestrator.on('step.completed', (step, duration) => {
          sendEvent({ type: 'event', event: 'step.completed', payload: { step, duration } });
        });
        this.orchestrator.on('step.error', (step, error) => {
          sendEvent({ type: 'event', event: 'step.error', payload: { step, error } });
        });
        this.orchestrator.on('log', (step, output) => {
          sendEvent({ type: 'event', event: 'log', payload: { step, output } });
        });

        const result = await this.orchestrator.run(config);
        sendEvent({
          id: msg.id,
          type: 'event',
          event: 'setup.completed',
          payload: { message: 'Setup completed' },
          data: result,
          status: 'ok',
        });
        break;
      }

      case 'setup.status': {
        const status = this.orchestrator.getStatus();
        sendEvent({
          id: msg.id,
          type: 'response',
          action: msg.action,
          status: 'ok',
          data: status,
        });
        break;
      }

      case 'setup.retry': {
        const stepName = msg.params?.step as string | undefined;
        if (!stepName) {
          sendEvent({
            id: msg.id,
            type: 'error',
            status: 'error',
            data: { message: 'Missing step name for retry' },
          });
          return;
        }
        await this.orchestrator.retryStep(stepName);
        sendEvent({
          id: msg.id,
          type: 'response',
          action: msg.action,
          status: 'ok',
          data: { message: `Step ${stepName} retried` },
        });
        break;
      }

      default:
        sendEvent({
          id: msg.id,
          type: 'error',
          status: 'error',
          data: { message: `Unknown setup action: ${msg.action}` },
        });
    }
  }

  async autoStartSetup(config: Record<string, unknown>): Promise<Record<string, unknown>> {
    logger.info('Auto-starting setup from init-config');
    try {
      const result = await this.orchestrator.run(config);
      logger.info('Auto-setup finished', { success: result.success });
      return result;
    } catch (err) {
      logger.error('Auto-setup failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  private send(ws: WebSocket, message: AgentMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private isRateLimited(ip: string): boolean {
    const entry = this.rateLimits.get(ip);
    if (!entry) return false;
    if (entry.lockedUntil > Date.now()) return true;
    if (entry.lockedUntil > 0 && entry.lockedUntil <= Date.now()) {
      this.rateLimits.delete(ip);
      return false;
    }
    return false;
  }

  private recordAuthFailure(ip: string): void {
    const now = Date.now();
    let entry = this.rateLimits.get(ip);

    if (!entry) {
      entry = { failures: 0, lockedUntil: 0 };
      this.rateLimits.set(ip, entry);
    }

    entry.failures++;

    if (entry.failures >= MAX_AUTH_FAILURES) {
      entry.lockedUntil = now + LOCKOUT_DURATION_MS;
      logger.warn(`IP ${ip} locked out for 15 minutes after ${entry.failures} failed attempts`);
    }

    // Reset failures after the rate limit window
    setTimeout(() => {
      const current = this.rateLimits.get(ip);
      if (current && current.lockedUntil === 0) {
        current.failures = Math.max(0, current.failures - 1);
      }
    }, RATE_LIMIT_WINDOW_MS);
  }
}

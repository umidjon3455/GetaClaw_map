import type { AgentMessage, ClientMessage } from '../protocol.js';
import { safeExec } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

export async function handleHealthAction(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  switch (msg.action) {
    case 'health.check':
      await handleHealthCheck(msg, sendEvent);
      break;

    case 'health.logs':
      await handleHealthLogs(msg, sendEvent);
      break;

    default:
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: `Unknown health action: ${msg.action}` },
      });
  }
}

async function handleHealthCheck(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    // Check gateway service status
    const serviceResult = await safeExec('systemctl', ['is-active', 'openclaw-gateway']);
    const serviceStatus = serviceResult.stdout.trim();

    // Get uptime
    const uptimeResult = await safeExec('uptime', ['-s']);
    const uptimeSince = uptimeResult.stdout.trim();

    // Get openclaw version
    let version = 'unknown';
    try {
      const versionResult = await safeExec('openclaw', ['--version']);
      version = versionResult.stdout.trim();
    } catch {
      // openclaw may not be installed yet
    }

    // Check gateway HTTP endpoint
    let gatewayReachable = false;
    try {
      const curlResult = await safeExec('curl', [
        '-s',
        '-o', '/dev/null',
        '-w', '%{http_code}',
        '--max-time', '3',
        'http://127.0.0.1:18789',
      ]);
      const httpCode = parseInt(curlResult.stdout.trim(), 10);
      gatewayReachable = httpCode >= 200 && httpCode < 500;
    } catch {
      // not reachable
    }

    // System resource info
    const freeResult = await safeExec('free', ['-m']);
    const memLines = freeResult.stdout.split('\n');
    let memTotal = 0;
    let memUsed = 0;
    if (memLines.length > 1) {
      const parts = memLines[1].split(/\s+/);
      memTotal = parseInt(parts[1], 10) || 0;
      memUsed = parseInt(parts[2], 10) || 0;
    }

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: {
        gateway: {
          service: serviceStatus,
          reachable: gatewayReachable,
          version,
        },
        system: {
          uptimeSince,
          memoryMB: { total: memTotal, used: memUsed },
          agentUptime: Math.round(process.uptime()),
        },
      },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Health check failed', { error: errorMessage });
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Health check failed: ${errorMessage}` },
    });
  }
}

async function handleHealthLogs(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const lines = (msg.params?.lines as number) ?? 100;
    const result = await safeExec('systemctl', ['status', 'openclaw-gateway']);

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { logs: result.stdout },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Failed to get logs: ${errorMessage}` },
    });
  }
}

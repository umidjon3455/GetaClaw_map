import type { AgentMessage, ClientMessage } from '../protocol.js';
import { safeExec } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

export async function handleDevicesList(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const result = await safeExec('openclaw', ['devices', 'list', '--json']);
    const devices = JSON.parse(result.stdout);
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { devices },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Failed to list devices', { error: errorMessage });
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Failed to list devices: ${errorMessage}` },
    });
  }
}

export async function handleDevicesApprove(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const deviceId = (msg.params as Record<string, unknown> | undefined)?.deviceId as string | undefined;
    if (!deviceId) {
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: 'Missing deviceId in params' },
      });
      return;
    }

    await safeExec('openclaw', ['devices', 'approve', deviceId]);
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: `Device ${deviceId} approved` },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Failed to approve device', { error: errorMessage });
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Failed to approve device: ${errorMessage}` },
    });
  }
}

export async function handleDevicesReject(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const deviceId = (msg.params as Record<string, unknown> | undefined)?.deviceId as string | undefined;
    if (!deviceId) {
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: 'Missing deviceId in params' },
      });
      return;
    }

    await safeExec('openclaw', ['devices', 'reject', deviceId]);
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: `Device ${deviceId} rejected` },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Failed to reject device', { error: errorMessage });
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Failed to reject device: ${errorMessage}` },
    });
  }
}

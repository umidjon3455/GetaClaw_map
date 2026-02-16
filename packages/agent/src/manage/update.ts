import type { AgentMessage, ClientMessage } from '../protocol.js';
import { safeExec, safeExecPipe } from '../utils/exec.js';
import { logger } from '../utils/logger.js';
import { handleHealthAction } from './health.js';
import { getConfig, setConfig } from './config.js';
import { listChannels, addChannel, removeChannel } from './channels.js';

export async function handleManageAction(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
  configDir: string,
): Promise<void> {
  switch (msg.action) {
    case 'manage.update':
      await handleUpdate(msg, sendEvent);
      break;

    case 'manage.agent.update':
      await handleAgentUpdate(msg, sendEvent);
      break;

    case 'manage.config.get':
      await handleConfigGet(msg, sendEvent);
      break;

    case 'manage.config.set':
      await handleConfigSet(msg, sendEvent);
      break;

    case 'manage.restart':
      await handleRestart(msg, sendEvent);
      break;

    case 'manage.channels.list':
      await handleChannelsList(msg, sendEvent);
      break;

    case 'manage.channels.add':
      await handleChannelsAdd(msg, sendEvent);
      break;

    case 'manage.channels.remove':
      await handleChannelsRemove(msg, sendEvent);
      break;

    case 'manage.tailscale.status':
      await handleTailscaleStatus(msg, sendEvent);
      break;

    default:
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: `Unknown manage action: ${msg.action}` },
      });
  }
}

async function handleUpdate(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  sendEvent({ type: 'event', event: 'step.started', payload: { step: 'update', message: 'Updating OpenClaw...' } });

  try {
    await safeExecPipe(
      'npm',
      ['update', '-g', 'openclaw'],
      {},
      (output: string) => sendEvent({ type: 'event', event: 'log', payload: { step: 'update', output } }),
    );

    // Get new version
    const versionResult = await safeExec('openclaw', ['--version']);
    const version = versionResult.stdout.trim();

    // Restart the gateway service
    await safeExec('systemctl', ['restart', 'openclaw-gateway']);

    sendEvent({
      type: 'event',
      event: 'step.completed',
      payload: { step: 'update', message: `Updated to ${version}` },
    });

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { version },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('OpenClaw update failed', { error: errorMessage });
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Update failed: ${errorMessage}` },
    });
  }
}

async function handleAgentUpdate(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  sendEvent({ type: 'event', event: 'step.started', payload: { step: 'agent-update', message: 'Updating agent...' } });

  try {
    await safeExecPipe(
      'npm',
      ['update', '-g', '@getaclaw/agent'],
      {},
      (output: string) => sendEvent({ type: 'event', event: 'log', payload: { step: 'agent-update', output } }),
    );

    // Restart the agent service
    await safeExec('systemctl', ['restart', 'getaclaw-agent']);

    sendEvent({
      type: 'event',
      event: 'step.completed',
      payload: { step: 'agent-update', message: 'Agent updated, restarting...' },
    });

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: 'Agent updated and restarting' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error('Agent update failed', { error: errorMessage });
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Agent update failed: ${errorMessage}` },
    });
  }
}

async function handleConfigGet(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const config = await getConfig();
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { config },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Failed to read config: ${errorMessage}` },
    });
  }
}

async function handleConfigSet(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const updates = msg.params as Record<string, unknown> | undefined;
    if (!updates) {
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: 'Missing config updates in params' },
      });
      return;
    }

    await setConfig(updates);

    // Restart gateway to pick up changes
    await safeExec('systemctl', ['restart', 'openclaw-gateway']);

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: 'Configuration updated and gateway restarted' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Failed to update config: ${errorMessage}` },
    });
  }
}

async function handleRestart(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    await safeExec('systemctl', ['restart', 'openclaw-gateway']);
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: 'Gateway restarted' },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: `Restart failed: ${errorMessage}` },
    });
  }
}

async function handleChannelsList(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const channels = await listChannels();
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { channels },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: errorMessage },
    });
  }
}

async function handleChannelsAdd(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const channel = msg.params as { type: string; name: string; config: Record<string, unknown> } | undefined;
    if (!channel?.type || !channel?.name) {
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: 'Missing channel type and name in params' },
      });
      return;
    }

    await addChannel(channel);

    // Restart gateway
    await safeExec('systemctl', ['restart', 'openclaw-gateway']);

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: `Channel ${channel.name} added` },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: errorMessage },
    });
  }
}

async function handleChannelsRemove(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const channelName = msg.params?.name as string | undefined;
    if (!channelName) {
      sendEvent({
        id: msg.id,
        type: 'error',
        status: 'error',
        data: { message: 'Missing channel name in params' },
      });
      return;
    }

    await removeChannel(channelName);

    // Restart gateway
    await safeExec('systemctl', ['restart', 'openclaw-gateway']);

    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { message: `Channel ${channelName} removed` },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'error',
      status: 'error',
      data: { message: errorMessage },
    });
  }
}

async function handleTailscaleStatus(
  msg: ClientMessage,
  sendEvent: (event: AgentMessage) => void,
): Promise<void> {
  try {
    const result = await safeExec('tailscale', ['status', '--json']);
    const status = JSON.parse(result.stdout);
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: { tailscale: status },
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    sendEvent({
      id: msg.id,
      type: 'response',
      action: msg.action,
      status: 'ok',
      data: {
        tailscale: { installed: false, error: errorMessage },
      },
    });
  }
}

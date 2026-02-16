import { getConfig, setConfig } from './config.js';
import { logger } from '../utils/logger.js';

interface ChannelEntry {
  type: string;
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export async function listChannels(): Promise<ChannelEntry[]> {
  const config = await getConfig();
  return (config.channels as ChannelEntry[]) ?? [];
}

export async function addChannel(channel: {
  type: string;
  name: string;
  config: Record<string, unknown>;
}): Promise<void> {
  const config = await getConfig();
  const channels = (config.channels as ChannelEntry[]) ?? [];

  // Check for duplicate name
  if (channels.some((ch) => ch.name === channel.name)) {
    throw new Error(`Channel with name "${channel.name}" already exists`);
  }

  channels.push({
    type: channel.type,
    name: channel.name,
    enabled: true,
    config: channel.config,
  });

  await setConfig({ channels });
  logger.info(`Channel added: ${channel.name} (${channel.type})`);
}

export async function removeChannel(name: string): Promise<void> {
  const config = await getConfig();
  const channels = (config.channels as ChannelEntry[]) ?? [];

  const idx = channels.findIndex((ch) => ch.name === name);
  if (idx === -1) {
    throw new Error(`Channel "${name}" not found`);
  }

  channels.splice(idx, 1);
  await setConfig({ channels });
  logger.info(`Channel removed: ${name}`);
}

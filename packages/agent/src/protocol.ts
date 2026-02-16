// Client -> Agent
export interface ClientMessage {
  id: string;
  type: 'setup' | 'manage' | 'health';
  action: string;
  params?: Record<string, unknown>;
  token: string;
}

// Agent -> Client
export interface AgentMessage {
  id?: string;
  type: 'response' | 'event' | 'error';
  action?: string;

  // For responses
  status?: 'ok' | 'error';
  data?: unknown;

  // For events (streaming)
  event?: string;
  payload?: AgentEventPayload;
}

export interface AgentEventPayload {
  step?: string;
  progress?: number;
  message?: string;
  output?: string;
  error?: string;
  duration?: number;
}

// Valid action strings
export type SetupAction = 'setup.start' | 'setup.status' | 'setup.retry';

export type ManageAction =
  | 'manage.update'
  | 'manage.agent.update'
  | 'manage.config.get'
  | 'manage.config.set'
  | 'manage.restart'
  | 'manage.channels.list'
  | 'manage.channels.add'
  | 'manage.channels.remove'
  | 'manage.tailscale.status';

export type HealthAction = 'health.check' | 'health.logs';

export type Action = SetupAction | ManageAction | HealthAction;

// Event types emitted during setup
export type SetupEvent =
  | 'step.started'
  | 'step.progress'
  | 'step.completed'
  | 'step.error'
  | 'setup.completed'
  | 'log';

export function isValidClientMessage(data: unknown): data is ClientMessage {
  if (typeof data !== 'object' || data === null) return false;
  const msg = data as Record<string, unknown>;
  return (
    typeof msg.id === 'string' &&
    typeof msg.type === 'string' &&
    ['setup', 'manage', 'health'].includes(msg.type as string) &&
    typeof msg.action === 'string' &&
    typeof msg.token === 'string'
  );
}

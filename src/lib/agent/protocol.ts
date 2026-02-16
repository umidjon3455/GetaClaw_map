// Shared protocol types between browser client and @getaclaw/agent server

export interface ClientMessage {
  id: string;
  type: "setup" | "manage" | "health";
  action: string;
  params?: Record<string, unknown>;
  token: string;
}

export interface AgentMessage {
  id?: string;
  type: "response" | "event" | "error";
  action?: string;
  status?: "ok" | "error";
  data?: unknown;
  event?: string;
  payload?: {
    step?: string;
    progress?: number;
    message?: string;
    output?: string;
    error?: string;
    duration?: number;
  };
}

export type SetupStep =
  | "system"
  | "openclaw"
  | "configure"
  | "tailscale"
  | "channels"
  | "service"
  | "health";

export type SetupStepStatus =
  | "pending"
  | "running"
  | "success"
  | "error"
  | "skipped";

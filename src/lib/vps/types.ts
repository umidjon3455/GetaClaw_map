export interface VpsProvider {
  id: string;
  name: string;
  createServer: (config: ServerConfig) => Promise<ServerCreateResult>;
  getServer: (id: string) => Promise<ServerStatus>;
  deleteServer: (id: string) => Promise<void>;
  listRegions: () => Promise<Region[]>;
  listSizes: () => Promise<ServerSize[]>;
}

export interface ServerConfig {
  name: string;
  region: string;
  size: string;
  image: string;
  userData: string; // cloud-init script
  apiKey: string;
  agentPort?: number; // for cloud firewall rules
  gatewayPort?: number; // for cloud firewall rules
}

export interface ServerCreateResult {
  id: string;
  name: string;
  ip: string | null; // null while still provisioning
  status: string;
}

export interface ServerStatus {
  id: string;
  name: string;
  ip: string | null;
  status: "new" | "active" | "off" | "archive" | "initializing" | "running" | "starting" | "stopping" | "rebuilding" | "migrating" | "deleting" | "unknown";
  createdAt: string;
}

export interface Region {
  id: string;
  name: string;
  location: string;
  available: boolean;
}

export interface ServerSize {
  id: string;
  name: string;
  vcpus: number;
  memory: number; // MB
  disk: number; // GB
  priceMonthly: number;
  currency: string;
}

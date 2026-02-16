import type { ServerConfig, ServerCreateResult, ServerStatus } from "./types";

const API_BASE = "/api/vps/hetzner";

export async function createHetznerServer(
  config: ServerConfig
): Promise<ServerCreateResult> {
  const res = await fetch(`${API_BASE}/servers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": config.apiKey,
    },
    body: JSON.stringify({
      name: config.name,
      server_type: config.size,
      location: config.region,
      image: "ubuntu-24.04",
      user_data: config.userData,
      start_after_create: true,
      labels: { "managed-by": "getaclaw" },
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(
      error.error?.message || `Hetzner API error: ${res.status}`
    );
  }

  const data = await res.json();
  const server = data.server;

  return {
    id: String(server.id),
    name: server.name,
    ip: server.public_net?.ipv4?.ip || null,
    status: server.status,
  };
}

export async function getHetznerServer(
  id: string,
  apiKey: string
): Promise<ServerStatus> {
  const res = await fetch(`${API_BASE}/servers/${id}`, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Hetzner API error: ${res.status}`);
  }

  const data = await res.json();
  const server = data.server;

  return {
    id: String(server.id),
    name: server.name,
    ip: server.public_net?.ipv4?.ip || null,
    status: server.status,
    createdAt: server.created,
  };
}

export async function deleteHetznerServer(
  id: string,
  apiKey: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/servers/${id}`, {
    method: "DELETE",
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`Hetzner API error: ${res.status}`);
  }
}

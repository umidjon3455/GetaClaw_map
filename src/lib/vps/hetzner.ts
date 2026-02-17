import type { ServerConfig, ServerCreateResult, ServerStatus } from "./types";

const API_BASE = "/api/vps/hetzner";

const FIREWALL_NAME = "getaclaw-firewall";
const FIREWALL_LABEL = { "managed-by": "getaclaw" };

export async function createHetznerServer(
  config: ServerConfig
): Promise<ServerCreateResult> {
  // Ensure a cloud firewall exists with the required ports
  const firewallId = config.agentPort
    ? await ensureFirewall(config.apiKey, config.agentPort)
    : undefined;

  // Try up to 5 names: original, then -2, -3, -4, -5
  const nameCandidates = [config.name];
  for (let i = 2; i <= 5; i++) nameCandidates.push(`${config.name}-${i}`);

  for (const name of nameCandidates) {
    const serverBody: Record<string, unknown> = {
      name,
      server_type: config.size,
      location: config.region,
      image: "ubuntu-24.04",
      user_data: config.userData,
      start_after_create: true,
      labels: { "managed-by": "getaclaw" },
    };

    if (firewallId) {
      serverBody.firewalls = [{ firewall: firewallId }];
    }

    const res = await fetch(`${API_BASE}/servers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": config.apiKey,
      },
      body: JSON.stringify(serverBody),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const message: string = error.error?.message || "";

      // Name conflict -try next candidate
      if (message.toLowerCase().includes("name is already used")) {
        continue;
      }

      throw new Error(message || `Hetzner API error: ${res.status}`);
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

  throw new Error(
    `Server name "${config.name}" (and suffixes -2 through -5) are all taken. Delete old servers on your Hetzner dashboard or choose a different name.`
  );
}

/**
 * Find the existing getaclaw-firewall or create one.
 * Ensures ports 22, agentPort, and 18789 (gateway) are all open.
 */
async function ensureFirewall(
  apiKey: string,
  agentPort: number
): Promise<number | undefined> {
  try {
    // Look for our existing firewall by label
    const existing = await findFirewall(apiKey);
    if (existing) {
      // Make sure it has the right rules for this agent port
      await updateFirewallRules(apiKey, existing.id, agentPort);
      return existing.id;
    }

    // No existing firewall -create one
    return await createFirewall(apiKey, agentPort);
  } catch {
    // Non-fatal: server still works without cloud firewall (UFW handles it)
    console.warn("Failed to ensure Hetzner firewall, continuing without it");
    return undefined;
  }
}

async function findFirewall(
  apiKey: string
): Promise<{ id: number; rules: FirewallRule[] } | null> {
  const res = await fetch(
    `${API_BASE}/firewalls?label_selector=managed-by%3Dgetaclaw`,
    { headers: { "X-Api-Key": apiKey } }
  );
  if (!res.ok) return null;

  const data = await res.json();
  const fw = data.firewalls?.[0];
  if (!fw) return null;

  return { id: fw.id, rules: fw.rules ?? [] };
}

interface FirewallRule {
  direction: string;
  protocol: string;
  port: string;
  source_ips: string[];
}

function buildRules(agentPort: number): FirewallRule[] {
  return [22, agentPort, 443, 18789].map((port) => ({
    direction: "in",
    protocol: "tcp",
    port: String(port),
    source_ips: ["0.0.0.0/0", "::/0"],
  }));
}

async function updateFirewallRules(
  apiKey: string,
  firewallId: number,
  agentPort: number
): Promise<void> {
  const rules = buildRules(agentPort);

  await fetch(`${API_BASE}/firewalls/${firewallId}/actions/set_rules`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ rules }),
  });
}

async function createFirewall(
  apiKey: string,
  agentPort: number
): Promise<number | undefined> {
  const rules = buildRules(agentPort);

  const res = await fetch(`${API_BASE}/firewalls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({
      name: FIREWALL_NAME,
      labels: FIREWALL_LABEL,
      rules,
    }),
  });

  if (!res.ok) return undefined;

  const data = await res.json();
  return data.firewall?.id;
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

import type { ServerConfig, ServerCreateResult, ServerStatus } from "./types";

const API_BASE = "/api/vps/digitalocean";

export async function createDigitalOceanDroplet(
  config: ServerConfig
): Promise<ServerCreateResult> {
  const res = await fetch(`${API_BASE}/droplets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": config.apiKey,
    },
    body: JSON.stringify({
      name: config.name,
      region: config.region,
      size: config.size,
      image: "ubuntu-24-04-x64",
      user_data: config.userData,
      tags: ["getaclaw"],
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `DigitalOcean API error: ${res.status}`);
  }

  const data = await res.json();
  const droplet = data.droplet;

  const ipv4 = droplet.networks?.v4?.find(
    (n: { type: string; ip_address: string }) => n.type === "public"
  );

  return {
    id: String(droplet.id),
    name: droplet.name,
    ip: ipv4?.ip_address || null,
    status: droplet.status,
  };
}

export async function getDigitalOceanDroplet(
  id: string,
  apiKey: string
): Promise<ServerStatus> {
  const res = await fetch(`${API_BASE}/droplets/${id}`, {
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`DigitalOcean API error: ${res.status}`);
  }

  const data = await res.json();
  const droplet = data.droplet;

  const ipv4 = droplet.networks?.v4?.find(
    (n: { type: string; ip_address: string }) => n.type === "public"
  );

  return {
    id: String(droplet.id),
    name: droplet.name,
    ip: ipv4?.ip_address || null,
    status: droplet.status === "active" ? "running" : droplet.status,
    createdAt: droplet.created_at,
  };
}

export async function deleteDigitalOceanDroplet(
  id: string,
  apiKey: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/droplets/${id}`, {
    method: "DELETE",
    headers: { "X-Api-Key": apiKey },
  });

  if (!res.ok) {
    throw new Error(`DigitalOcean API error: ${res.status}`);
  }
}

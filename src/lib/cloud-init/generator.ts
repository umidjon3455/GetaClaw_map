import type { SecurityMode, Channel, ChannelConfig } from "@/lib/store/wizard-store";

export interface CloudInitConfig {
  pairingToken: string;
  agentPort: number;
  openrouterApiKey: string;
  selectedModels: string[];
  securityMode: SecurityMode;
  gatewayPassword?: string;
  tailscaleAuthKey?: string;
  serverName: string;
  channels: Partial<Record<Channel, ChannelConfig>>;
}

export function generateAgentPort(): number {
  return Math.floor(Math.random() * 30000) + 30000; // 30000-60000
}

export function generatePairingToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateCloudInit(config: CloudInitConfig): string {
  const initConfig = JSON.stringify(
    {
      pairingToken: config.pairingToken,
      agentPort: config.agentPort,
      setup: {
        openrouterApiKey: config.openrouterApiKey,
        selectedModels: config.selectedModels,
        securityMode: config.securityMode,
        gatewayPassword: config.gatewayPassword || "",
        serverName: config.serverName,
        channels: config.channels,
      },
    },
    null,
    2
  );

  const tailscaleCommands = config.securityMode === "tailscale"
    ? `
  # Install Tailscale
  - curl -fsSL https://tailscale.com/install.sh | sh
  - tailscale up --authkey=${config.tailscaleAuthKey} --hostname=${config.serverName}`
    : "";

  return `#cloud-config
package_update: true
package_upgrade: true

packages:
  - curl
  - ca-certificates
  - gnupg
  - ufw

runcmd:
  # Configure firewall
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow 22/tcp
  - ufw allow ${config.agentPort}/tcp
  - ufw --force enable

  # Install Node.js 22
  - curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  - apt-get install -y nodejs

  # Add swap if RAM < 2GB
  - |
    TOTAL_MEM=$(free -m | awk '/^Mem:/{print $2}')
    if [ "$TOTAL_MEM" -lt 2048 ]; then
      fallocate -l 2G /swapfile
      chmod 600 /swapfile
      mkswap /swapfile
      swapon /swapfile
      echo '/swapfile none swap sw 0 0' >> /etc/fstab
    fi

  # Install @getaclaw/agent
  - npm install -g @getaclaw/agent@latest

  # Initialize the agent
  - getaclaw-agent init --token ${config.pairingToken} --port ${config.agentPort}

  # Start agent service
  - getaclaw-agent service install
  - systemctl start getaclaw-agent
${tailscaleCommands}

write_files:
  - path: /etc/getaclaw/init-config.json
    content: |
      ${initConfig.split("\n").join("\n      ")}
    permissions: '0600'
`;
}

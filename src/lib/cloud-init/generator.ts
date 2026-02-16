import type { SecurityMode, Channel, ChannelConfig } from "@/lib/store/wizard-store";

export interface CloudInitConfig {
  pairingToken: string;
  agentPort: number;
  openrouterApiKey: string;
  selectedModels: string[];
  securityMode: SecurityMode;
  gatewayToken?: string;
  tailscaleAuthKey?: string;
  serverName: string;
  channels: Partial<Record<Channel, ChannelConfig>>;
  agentInstallUrl?: string;
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
  // Transform channel map to array format expected by the agent
  const channelArray = Object.entries(config.channels)
    .filter(([, cfg]) => cfg?.enabled)
    .map(([type, cfg]) => ({
      type,
      name: type,
      config: {
        botToken: cfg?.botToken,
        appToken: cfg?.appToken,
      },
    }));

  const initConfig = JSON.stringify(
    {
      pairingToken: config.pairingToken,
      agentPort: config.agentPort,
      serverName: config.serverName,
      setup: {
        openrouterApiKey: config.openrouterApiKey,
        selectedModels: config.selectedModels,
        securityMode: config.securityMode,
        gatewayToken: config.gatewayToken || "",
        tailscaleAuthKey:
          config.securityMode === "tailscale"
            ? config.tailscaleAuthKey
            : undefined,
        channels: channelArray,
      },
    },
    null,
    2
  );

  const installCmd = config.agentInstallUrl
    ? `npm install -g "${config.agentInstallUrl}"`
    : "npm install -g @getaclaw/agent@latest";

  return `#cloud-config
package_update: true

packages:
  - curl
  - ca-certificates
  - gnupg
  - ufw
  - debian-keyring
  - debian-archive-keyring
  - apt-transport-https

runcmd:
  # Configure firewall
  - ufw default deny incoming
  - ufw default allow outgoing
  - ufw allow 22/tcp
  - ufw allow ${config.agentPort}/tcp
  - ufw allow 443/tcp
  - ufw allow 18789/tcp
  - ufw --force enable

  # Install Node.js 22
  - curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  - apt-get install -y nodejs

  # Install Caddy (noninteractive to avoid conffile prompt)
  - curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  - curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
  - apt-get update
  - DEBIAN_FRONTEND=noninteractive apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" caddy

  # Generate self-signed TLS certificate for the server IP
  - mkdir -p /etc/caddy/certs
  - |
    SERVER_IP=$(curl -s http://169.254.169.254/hetzner/v1/metadata/public-ipv4 2>/dev/null || curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address 2>/dev/null || hostname -I | awk '{print $1}')
    openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 \\
      -days 3650 -nodes \\
      -keyout /etc/caddy/certs/key.pem \\
      -out /etc/caddy/certs/cert.pem \\
      -subj "/CN=$SERVER_IP" \\
      -addext "subjectAltName=IP:$SERVER_IP"
    chown caddy:caddy /etc/caddy/certs/key.pem /etc/caddy/certs/cert.pem
    chmod 600 /etc/caddy/certs/key.pem

  # Write our Caddyfile (after package install to avoid conffile conflict)
  - |
    cat > /etc/caddy/Caddyfile << 'CADDYEOF'
    :443 {
      tls /etc/caddy/certs/cert.pem /etc/caddy/certs/key.pem
      reverse_proxy localhost:18789
    }
    CADDYEOF

  # Start Caddy with reverse proxy config
  - systemctl enable caddy
  - systemctl restart caddy

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

  # Install OpenClaw gateway
  - npm install -g openclaw@latest

  # Install @getaclaw/agent
  - ${installCmd}

  # Initialize the agent
  - getaclaw-agent init --token ${config.pairingToken} --port ${config.agentPort}

  # Start agent service
  - getaclaw-agent service install
  - systemctl start getaclaw-agent

write_files:
  - path: /etc/getaclaw/init-config.json
    content: |
      ${initConfig.split("\n").join("\n      ")}
    permissions: '0600'

`;
}

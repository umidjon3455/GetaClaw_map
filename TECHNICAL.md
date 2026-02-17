# GetaClaw — Technical Specification

## Architecture Overview

GetaClaw is composed of two main packages:

1. **Web Application** (`/`) — A Next.js 16 app that serves the landing page, setup wizard, and dashboard. Runs in the browser. All sensitive operations (VPS creation, agent communication) happen client-side.

2. **Agent** (`/packages/agent`) — A lightweight Node.js daemon (`@getaclaw/agent`) that runs on the user's VPS. It orchestrates OpenClaw setup, handles ongoing management commands, and communicates with the browser via a secure WebSocket connection.

```
┌─────────────────────────────────────────────────┐
│                  User's Browser                  │
│  ┌─────────────────────────────────────────────┐ │
│  │           Next.js Web Application            │ │
│  │  - Landing page (SSR)                       │ │
│  │  - Setup wizard (CSR)                       │ │
│  │  - Dashboard (CSR)                          │ │
│  │  - Zustand stores (wizard, theme, instances)│ │
│  └──────┬──────────────────────┬───────────────┘ │
│         │                      │                  │
│    VPS API proxy          WebSocket (WSS)         │
│    (Next.js API routes)        │                  │
└─────────┼──────────────────────┼──────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐   ┌──────────────────────────┐
│  Hetzner /       │   │    User's VPS             │
│  DigitalOcean    │   │  ┌────────────────────┐   │
│  Cloud API       │   │  │  @getaclaw/agent    │   │
│                  │   │  │  (HTTPS + WSS)      │   │
│                  │   │  └────────┬───────────┘   │
│                  │   │           │               │
│                  │   │  ┌────────▼───────────┐   │
│                  │   │  │  OpenClaw Gateway    │   │
│                  │   │  │  (port 18789)        │   │
│                  │   │  └────────────────────┘   │
│                  │   │                           │
│                  │   │  [Tailscale VPN]           │
│                  │   │  (optional)                │
└──────────────────┘   └───────────────────────────┘
```

## Tech Stack

### Web Application
| Concern | Technology | Version |
|---------|------------|---------|
| Framework | Next.js | 16.1.6 |
| Runtime | React | 19.2.3 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| State management | Zustand | 5.0.11 |
| Animation | Framer Motion | 12.34.0 |
| Forms | React Hook Form + Zod | 7.71.1 / 4.3.6 |
| Icons | Lucide React | 0.564.0 |
| Offline storage | idb (IndexedDB) | 8.0.3 |
| Linting | ESLint (next config) | 9.x |

### Agent (`@getaclaw/agent`)
| Concern | Technology | Version |
|---------|------------|---------|
| Runtime | Node.js | >= 22.0.0 |
| Language | TypeScript (ESM) | 5.7.x |
| WebSocket server | ws | 8.18.0 |
| CLI framework | Commander | 13.1.0 |
| TLS certificates | selfsigned | 2.4.1 |
| Logging | Winston | 3.17.0 |
| HTTPS | Node.js built-in `https` | - |

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, theme, navbar)
│   │   ├── page.tsx                # Landing page
│   │   ├── globals.css             # Coral Claw design tokens + base styles
│   │   ├── setup/
│   │   │   ├── layout.tsx          # Setup layout wrapper
│   │   │   └── page.tsx            # Setup wizard entry point
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Instance management dashboard
│   │   └── api/vps/
│   │       ├── hetzner/route.ts    # Hetzner API proxy
│   │       └── digitalocean/route.ts # DigitalOcean API proxy
│   ├── components/
│   │   ├── shared/
│   │   │   ├── navbar.tsx          # Sticky nav with mobile menu
│   │   │   ├── theme-provider.tsx  # Theme initialization component
│   │   │   └── theme-toggle.tsx    # Light/dark/system toggle
│   │   ├── landing/
│   │   │   ├── hero.tsx
│   │   │   ├── how-it-works.tsx
│   │   │   ├── why-self-host.tsx
│   │   │   ├── features.tsx
│   │   │   ├── faq.tsx             # Client component (accordion state)
│   │   │   ├── troubleshooting.tsx
│   │   │   └── footer.tsx
│   │   ├── wizard/
│   │   │   ├── wizard-shell.tsx    # Wizard container with sidebar + step routing
│   │   │   ├── wizard-sidebar.tsx  # Desktop step navigation
│   │   │   ├── wizard-progress.tsx # Mobile progress bar
│   │   │   ├── step-welcome.tsx
│   │   │   ├── step-vps-provider.tsx
│   │   │   ├── step-server-config.tsx
│   │   │   ├── step-security.tsx
│   │   │   ├── step-models.tsx
│   │   │   ├── step-channels.tsx
│   │   │   ├── step-review.tsx
│   │   │   ├── step-deploy.tsx
│   │   │   └── step-complete.tsx
│   │   └── deploy/
│   │       ├── action-feed.tsx     # Timeline container for deploy steps
│   │       └── action-card.tsx     # Individual deploy step card
│   └── lib/
│       ├── store/
│       │   ├── wizard-store.ts     # Zustand store for wizard state
│       │   ├── theme-store.ts      # Zustand store for theme
│       │   └── instances-store.ts  # Zustand store for saved instances
│       ├── vps/
│       │   ├── types.ts            # VPS provider interfaces
│       │   ├── hetzner.ts          # Hetzner API client
│       │   └── digitalocean.ts     # DigitalOcean API client
│       ├── cloud-init/
│       │   └── generator.ts        # Cloud-init YAML generation
│       └── agent/
│           ├── protocol.ts         # Shared WebSocket protocol types
│           └── connection.ts       # AgentConnection WebSocket client
├── packages/
│   └── agent/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts            # Public API exports
│           ├── cli.ts              # CLI entry point (init, serve, service)
│           ├── server.ts           # HTTPS + WebSocket server
│           ├── protocol.ts         # Protocol types + validation
│           ├── setup/
│           │   ├── types.ts        # Setup types (StepName, SetupConfig, etc.)
│           │   ├── orchestrator.ts # Step execution engine
│           │   └── steps/
│           │       ├── configure.ts
│           │       ├── channels.ts
│           │       ├── service.ts
│           │       └── health.ts
│           ├── manage/
│           │   ├── config.ts       # OpenClaw config read/write with deep merge
│           │   ├── health.ts       # Health check + log retrieval
│           │   └── channels.ts     # Channel CRUD operations
│           └── utils/
│               ├── logger.ts       # Winston logger
│               ├── crypto.ts       # Token generation, TLS cert, hashing
│               └── exec.ts         # Safe child process execution
├── public/                         # Static assets (SVGs, favicon)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── .gitignore
```

## State Management

### Wizard Store (`wizard-store.ts`)
Central Zustand store managing the entire wizard flow:

**Types:**
- `WizardStep`: Union of 9 step identifiers (`welcome` | `vps-provider` | `server-config` | `security` | `models` | `channels` | `review` | `deploy` | `complete`)
- `SkillLevel`: `beginner` | `intermediate` | `advanced`
- `VpsProvider`: `hetzner` | `digitalocean`
- `SecurityMode`: `password` | `tailscale`
- `Channel`: `whatsapp` | `telegram` | `discord` | `slack` | `signal` | `imessage`

**State fields:**
- Navigation: `currentStep`, `completedSteps` (Set)
- Welcome: `skillLevel`
- VPS: `vpsProvider`, `vpsApiKey`
- Server: `serverRegion`, `serverSize`, `serverName`
- Security: `securityMode`, `gatewayPassword`, `tailscaleAuthKey`
- Models: `openrouterApiKey`, `selectedModels[]`
- Channels: `channelConfigs` (partial record of Channel -> ChannelConfig)
- Deploy: `deployStarted`, `deployComplete`

**Navigation logic:**
- `STEP_ORDER` array defines linear progression
- `canProceedToStep()`: allows forward to current+1 or back to any completed step
- `nextStep()`: advances and marks current step as completed
- `prevStep()`: goes back without changing completion state

### Theme Store (`theme-store.ts`)
- Supports `light`, `dark`, `system` modes
- Persisted to `localStorage` key `getaclaw-theme`
- Applied via `html.dark` class toggle
- Defaults to `light`

### Instances Store (`instances-store.ts`)
- Persisted to `localStorage` key `getaclaw-instances`
- Each `Instance` record stores: id, name, createdAt, vpsProvider, vpsId, serverIp, serverRegion, agentPort, agentToken, gatewayToken, securityMode, tailscaleHostname, openclawVersion, status, lastHealthCheck, channels
- CRUD operations: `addInstance`, `updateInstance`, `removeInstance`
- Instance statuses: `provisioning` | `setting_up` | `online` | `offline` | `error`

## VPS API Proxy

The web app includes two Next.js API routes that act as stateless CORS-bypassing proxies:

### `/api/vps/hetzner` -> `https://api.hetzner.cloud/v1`
### `/api/vps/digitalocean` -> `https://api.digitalocean.com/v2`

**Security measures:**
- API key passed via `X-Api-Key` header (never stored server-side)
- Path allowlisting via regex patterns (only `/servers`, `/droplets`, `/server_types`, `/sizes`, `/regions`, etc.)
- Method allowlisting: `GET`, `POST`, `DELETE` only
- No logging of request bodies or API keys
- Returns 401 if no API key, 403 if path not allowed, 502 if upstream unreachable

**Why a proxy?** Browser CORS restrictions prevent direct calls to Hetzner/DigitalOcean APIs. The proxy passes the user's API key through without storing it.

## Cloud-Init Generation

The `generateCloudInit()` function produces a cloud-init YAML script that bootstraps the VPS on first boot:

1. System updates (`package_update`, `package_upgrade`)
2. Essential packages (`curl`, `ca-certificates`, `gnupg`, `ufw`)
3. Firewall configuration (deny incoming, allow SSH + agent port)
4. Node.js 22 installation (NodeSource)
5. Swap space (2GB) if RAM < 2GB
6. `@getaclaw/agent` installation via npm global
7. Agent initialization with pairing token and port
8. Agent systemd service installation and start
9. (Optional) Tailscale installation and authentication
10. Configuration file written to `/etc/getaclaw/init-config.json` with `0600` permissions

**Token generation:**
- `generatePairingToken()`: 32 random bytes -> 64-char hex string via `crypto.getRandomValues()`
- `generateAgentPort()`: Random port in range 30000-60000

## Agent Architecture (`@getaclaw/agent`)

### CLI Commands

```
getaclaw-agent init [--token <token>] [--port <port>] [--config-dir <dir>]
getaclaw-agent serve [--config-dir <dir>]
getaclaw-agent service install | uninstall | status
```

**`init`**: Generates self-signed TLS certificate, hashes pairing token, writes config to `/etc/getaclaw/config.json`.

**`serve`**: Starts HTTPS + WebSocket server. Reads config from disk.

**`service`**: Manages systemd unit file (`getaclaw-agent.service`). Runs as `getaclaw-agent` user, auto-restarts on failure with 5s delay.

### Server (`server.ts`)

The agent runs a single HTTPS server with:

**HTTP endpoints:**
- `GET /health` — Returns agent status, version, setup state, uptime
- `GET /fingerprint` — Returns TLS certificate fingerprint for pin verification

**WebSocket endpoint (`/ws`):**
- TLS-encrypted (self-signed certificate)
- Authentication via pairing token or session token
- 10-second authentication timeout
- Rate limiting: 5 failed auth attempts -> 15-minute IP lockout
- Message routing to setup, manage, or health handlers

### Authentication Flow

1. Client connects to WSS
2. First message must include `token` field
3. Token is verified against stored pairing token hash OR existing session tokens
4. On successful pairing token auth, server issues a session token for subsequent connections
5. All subsequent messages on the WebSocket are authenticated

### WebSocket Protocol

**Client -> Agent (`ClientMessage`):**
```typescript
{
  id: string;          // Request correlation ID (UUID)
  type: 'setup' | 'manage' | 'health';
  action: string;      // e.g., 'setup.start', 'health.check'
  params?: Record<string, unknown>;
  token: string;       // Auth token
}
```

**Agent -> Client (`AgentMessage`):**
```typescript
{
  id?: string;         // Correlation ID (for responses)
  type: 'response' | 'event' | 'error';
  action?: string;
  status?: 'ok' | 'error';
  data?: unknown;
  event?: string;      // For streaming events
  payload?: {
    step?: string;
    progress?: number;
    message?: string;
    output?: string;
    error?: string;
    duration?: number;
  };
}
```

**Actions:**
- Setup: `setup.start`, `setup.status`, `setup.retry`
- Manage: `manage.update`, `manage.agent.update`, `manage.config.get`, `manage.config.set`, `manage.restart`, `manage.channels.list`, `manage.channels.add`, `manage.channels.remove`, `manage.tailscale.status`
- Health: `health.check`, `health.logs`

**Events (streamed during setup):**
- `step.started` — Step begins execution
- `step.progress` — Progress update (0-100)
- `step.completed` — Step finished with duration
- `step.error` — Step failed with error message
- `setup.completed` — All steps finished
- `log` — Output log line from a step

### Setup Orchestrator

The `SetupOrchestrator` executes setup steps sequentially with built-in retry logic:

**Steps (in order):**
1. `system` — Install system dependencies and Node.js
2. `openclaw` — Install OpenClaw gateway via npm
3. `configure` — Generate `openclaw.json` and `.env` files
4. `tailscale` — Install and authenticate Tailscale (skipped if security mode is password)
5. `channels` — Configure messaging channels (skipped if no channels enabled)
6. `service` — Install, enable, and start OpenClaw systemd service
7. `health` — Verify gateway is responding on port 18789

**Retry behavior:**
- Max 3 retries per step
- Exponential backoff: 1s, 2s, 4s
- Required steps abort the entire setup on final failure
- Optional steps (channels) continue on failure
- Individual steps can be retried via `setup.retry` action

**Step states:** `pending` | `running` | `completed` | `error` | `skipped`

### OpenClaw Configuration

Generated config file (`~/.openclaw/openclaw.json`):
```json
{
  "gateway": {
    "port": 18789,
    "bind": "0.0.0.0",
    "auth": {
      "enabled": true,
      "password": "..."
    }
  },
  "models": {
    "provider": "openrouter",
    "selected": ["anthropic/claude-sonnet-4-5-20250929", ...]
  },
  "channels": [
    { "type": "telegram", "name": "telegram", "enabled": true, "config": { ... } }
  ],
  "session": {
    "maxHistory": 100,
    "timeout": 3600
  }
}
```

The `bind` address is `0.0.0.0` for Tailscale mode (accessible via private network) or `127.0.0.1` for password mode (access through agent proxy or direct IP).

### Health Check System

The `health.check` action returns:
- Gateway service status (systemd `is-active`)
- Gateway HTTP reachability (curl to `127.0.0.1:18789`)
- OpenClaw version
- System uptime
- Memory usage (total/used in MB)
- Agent uptime

Health endpoint on the agent (`GET /health`) returns a lightweight status for monitoring.

### Management Operations

**Config management (`manage/config.ts`):**
- `getConfig()` — Read OpenClaw config from disk
- `setConfig(updates)` — Deep merge updates into existing config and write back
- Deep merge: recursively merges objects, replaces arrays and primitives

**Channel management (`manage/channels.ts`):**
- `listChannels()` — Returns all configured channels
- `addChannel()` — Adds a new channel (duplicate name check)
- `removeChannel()` — Removes by name

## Browser-Side Agent Connection

The `AgentConnection` class (`src/lib/agent/connection.ts`) provides:
- WebSocket connection to agent via `wss://<host>:<port>/ws`
- Request-response pattern with 60-second timeout
- Event subscription system (`on`/`off`)
- Automatic reconnection support (max 5 attempts)
- Pending request tracking with promise-based resolution

## Security Model

1. **No server-side secret storage**: API keys are passed from browser -> proxy -> cloud API in a single request. The proxy stores nothing.
2. **Agent authentication**: Pairing tokens are hashed (never stored in plaintext). Session tokens are generated server-side and held in memory only.
3. **TLS encryption**: Agent uses self-signed certificates for all WebSocket communication.
4. **Rate limiting**: 5 failed auth attempts trigger a 15-minute IP lockout on the agent.
5. **Firewall**: UFW configured to deny all incoming except SSH (22) and agent port.
6. **File permissions**: Config files and TLS keys are `0600` (owner read/write only).
7. **Path allowlisting**: API proxy only forwards requests to known-safe API paths.
8. **Auth timeout**: WebSocket connections must authenticate within 10 seconds.

## Deployment Flow (End-to-End)

1. **Browser**: User completes wizard -> `generateCloudInit()` produces bootstrap script
2. **Browser -> Proxy -> Cloud API**: VPS created with cloud-init user data
3. **VPS boots**: Cloud-init runs, installs Node.js, installs `@getaclaw/agent`, initializes agent
4. **Browser**: Polls VPS provider API for server IP address
5. **Browser -> Agent (WSS)**: Connects to agent, authenticates with pairing token
6. **Agent**: Receives `setup.start` with configuration, runs orchestrator
7. **Agent -> Browser**: Streams `step.started`, `step.progress`, `step.completed` events
8. **Agent**: Installs OpenClaw, writes config, starts gateway service, runs health checks
9. **Browser**: Displays completion screen with Control UI URL and credentials
10. **Browser**: Saves instance to localStorage for dashboard management

## Build & Development

```bash
# Web app
npm run dev          # Next.js dev server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint

# Agent
cd packages/agent
npm run build        # TypeScript compilation
npm run dev          # TypeScript watch mode
npm run start        # Run CLI
```

The agent is published as `@getaclaw/agent` on npm and installed globally on VPS instances via `npm install -g @getaclaw/agent@latest`.

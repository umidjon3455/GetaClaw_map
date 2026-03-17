# GetaClaw
.
**Deploy your own OpenClaw AI assistant in 5 minutes.** No terminal, no SSH, no config files.

GetaClaw is an open-source web wizard that sets up [OpenClaw](https://openclaw.ai) — a self-hosted AI gateway — on your own VPS. All your conversations, API keys, and server credentials stay entirely under your control. Nothing is stored on our servers.

**[getaclaw.io](https://getaclaw.io)**

## How it works

1. **Pick a server** — Choose Hetzner (~EUR 3.79/mo) or DigitalOcean (~$6/mo) and paste your API key
2. **Configure** — Select AI models (via OpenRouter), security mode, and messaging channels
3. **Deploy** — The wizard provisions your VPS, installs OpenClaw, and configures everything automatically
4. **Use it** — Access your AI assistant from WhatsApp, Telegram, Discord, Slack, Signal, iMessage, or the web UI

## Why self-host?

|                   | Hosted AI services      | GetaClaw                 |
| ----------------- | ----------------------- | -------------------------- |
| **Your data**     | Stored on their servers | Stays on your VPS          |
| **API keys**      | Shared with provider    | Only you have access       |
| **Conversations** | Can be read/trained on  | Private by default         |
| **Cost**          | $20/mo subscriptions    | ~$4/mo VPS + pay-per-token |

## Architecture

```
Browser (getaclaw.io)          Your VPS
┌─────────────────────┐       ┌──────────────────────┐
│  Next.js Web App    │       │  @getaclaw/agent     │
│  - Setup wizard     │──WSS──│  (HTTPS + WebSocket) │
│  - Dashboard        │       │         │            │
│  - Zustand stores   │       │  OpenClaw Gateway    │
│  (localStorage)     │       │  (port 443 via Caddy)│
└─────────────────────┘       └──────────────────────┘
```

- **Web app** runs on Vercel. Stateless — no database, no user accounts, no storage
- **VPS API calls** go through thin Next.js proxy routes (CORS bypass) that forward your API key without storing it
- **@getaclaw/agent** runs on your VPS, orchestrates setup, and provides ongoing management via authenticated WebSocket
- **All user data** lives in your browser (localStorage) and on your VPS. Nothing in between.

## Tech stack

| Layer      | Stack                                                                   |
| ---------- | ----------------------------------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS 4                        |
| State      | Zustand (persisted to localStorage)                                     |
| Animation  | Framer Motion                                                           |
| Agent      | Node.js 22, ws, Commander, Winston                                      |
| VPS        | Ubuntu 24.04, Caddy (TLS), UFW, systemd                                 |
| AI Gateway | [OpenClaw](https://openclaw.ai) via [OpenRouter](https://openrouter.ai) |

## Development

```bash
# Install dependencies
npm install

# Run the web app
npm run dev

# Build the agent package
cd packages/agent
npm install
npm run build
```

The web app runs at `http://localhost:3000`. The agent package at `packages/agent/` is published separately to npm as `@getaclaw/agent`.

## Project structure

```
src/
├── app/                    # Next.js App Router pages + API routes
├── components/
│   ├── landing/            # Landing page sections
│   ├── wizard/             # Setup wizard steps (9 steps)
│   └── deploy/             # Deploy action feed + cards
├── lib/
│   ├── store/              # Zustand stores (wizard, instances, theme)
│   ├── vps/                # Hetzner + DigitalOcean API clients
│   ├── cloud-init/         # Cloud-init script generator
│   ├── deploy/             # Deploy orchestrator (browser-side)
│   └── agent/              # Agent WebSocket + HTTP client
packages/
└── agent/                  # @getaclaw/agent NPM package (runs on VPS)
```

## Security model

- **No server-side storage** — Vercel deployment is stateless. API keys pass through proxy routes and are never logged or stored
- **Token auth** — Agent WebSocket requires a 256-bit pairing token (SHA-256 hashed at rest). 5 failed attempts = 15 min lockout
- **TLS everywhere** — Agent runs HTTPS with self-signed cert. Caddy terminates TLS for the gateway on port 443
- **Firewall** — UFW + Hetzner cloud firewall. Only SSH, agent port, and 443 are open
- **Randomized agent port** — 30000-60000 range, not discoverable without scanning

## Supported channels

| Channel  | Setup method                  |
| -------- | ----------------------------- |
| WhatsApp | QR code scan after deployment |
| Telegram | Bot token during wizard       |
| Discord  | Bot token during wizard       |
| Slack    | App token during wizard       |
| Signal   | CLI linking after deployment  |
| iMessage | Requires paired macOS node    |

## License

MIT

# GetaClaw — Roadmap

## What's Done

### Foundation
- [x] Next.js 16 project with TypeScript, Tailwind CSS 4, App Router
- [x] Core dependencies installed (Zustand, Framer Motion, Lucide, React Hook Form, Zod, idb)
- [x] Coral Claw design system in globals.css (color palette, typography tokens, spacing, scrollbar, selection)
- [x] Font loading (Space Grotesk, Inter, JetBrains Mono via Google Fonts)
- [x] Root layout with SEO metadata (OpenGraph, Twitter cards, keywords)
- [x] Project directory structure matching TECHNICAL.md

### Theme System
- [x] Theme store (Zustand) with light/dark/system modes
- [x] Theme persisted to localStorage
- [x] Theme toggle component (sun/moon icon)
- [x] `.dark` class toggle on `<html>`
- [x] Fix: dark mode now properly applies to sidebar, navbar, and all component backgrounds
- [x] Fix: system preference listener uses proper static import (was dynamic `require()`)
- [x] Default theme set to dark

### Navbar
- [x] Sticky header with backdrop blur
- [x] Desktop nav links (How it Works, FAQ, GitHub)
- [x] Mobile hamburger menu
- [x] "Get Started" CTA button with coral shadow glow
- [x] Theme toggle in nav
- [x] Fix: dark mode background/text renders correctly

### Landing Page
- [x] Hero section with tagline, CTAs, gradient blobs, and badge
- [x] How It Works — 4-step visual grid with hover glow on icons
- [x] Why Self-Host — 3-column comparison (hosted vs self-hosted)
- [x] Features — 3x2 grid with icons, card hover shadows
- [x] FAQ — accordion with chevron animation
- [x] Troubleshooting — alert cards
- [x] Footer with links
- [x] Fix: text/background color contrast issues in dark mode resolved
- [ ] Polish: animations on scroll (fade-in sections)
- [ ] Polish: illustrations or visual assets for hero/how-it-works

### Setup Wizard — Navigation
- [x] Wizard shell with Framer Motion step transitions
- [x] Desktop sidebar with step indicators (pending/current/completed)
- [x] Mobile progress bar with step counter
- [x] Zustand wizard store with all step data and navigation logic
- [x] Step completion tracking and jump-back navigation
- [x] Fix: sidebar background switches correctly in dark mode

### Setup Wizard — Step: Welcome
- [x] Skill level selection (beginner/intermediate/advanced)
- [x] Selection cards with icon + description
- [x] Continue button with validation (must pick a level)

### Setup Wizard — Step: VPS Provider
- [x] Provider selection cards (Hetzner + DigitalOcean) with pricing
- [x] Recommended badge on Hetzner
- [x] API key input with show/hide toggle
- [x] Beginner-friendly "What's a VPS?" explainer
- [x] External links to get API keys
- [x] Privacy notice about client-side processing
- [x] Fix: input field background/text color contrast works in dark mode

### Setup Wizard — Step: Server Config
- [x] Server name input (sanitized to alphanumeric + hyphens)
- [x] Region grid (6 regions per provider)
- [x] Server size selection with specs and pricing
- [x] Recommended badges
- [x] Beginner-friendly explanations

### Setup Wizard — Step: Security
- [x] Password vs Tailscale selection cards with security level labels
- [x] Password input with min-length validation
- [x] Tailscale setup guide (account signup, phone install, auth key links)
- [x] Tailscale auth key input

### Setup Wizard — Step: AI Models
- [x] OpenRouter API key input with help link
- [x] Model multi-select (8 curated models)
- [x] Tier badges (Premium, Fast & Cheap, Open Source, Reasoning)
- [x] Provider labels
- [x] Selected count display
- [x] Fix: Reasoning tier badge uses violet design tokens (was undefined purple)

### Setup Wizard — Step: Channels
- [x] 6 channels (WhatsApp, Telegram, Discord, Slack, Signal, iMessage)
- [x] Toggle switches per channel
- [x] Expandable config fields for channels that need tokens (Telegram, Discord, Slack)
- [x] Notes for post-deployment channels (WhatsApp QR, Signal CLI, iMessage node)
- [x] "Skip for now" option

### Setup Wizard — Step: Review
- [x] Summary of all choices with masked API keys
- [x] Edit buttons to jump back to any section
- [x] Privacy reminder
- [x] Deploy button

### Setup Wizard — Step: Deploy
- [x] Action feed vertical timeline with animated cards
- [x] Step status indicators (pending/running/success/error)
- [x] Progress bars per step
- [x] Expandable log sections
- [x] Framer Motion staggered entry animations
- [x] Wire up: call VPS API (via proxy) to create server
- [x] Wire up: submit cloud-init user data script
- [x] Wire up: poll for server IP
- [x] Wire up: connect to @getaclaw/agent via HTTPS polling (health + status)
- [x] Wire up: listen to real step events from agent
- [x] Wire up: handle errors and retries from real deployment
- [x] Wire up: surface real logs from agent to action feed

### Setup Wizard — Step: Complete
- [x] Success UI with Control UI link, credentials, next steps checklist
- [x] Copy-to-clipboard for IP, hostname, token
- [x] Show/hide toggle for gateway token
- [x] Navigation buttons (Dashboard, Set Up Another)
- [x] Wire up: receive actual deployment results (IP, token, Tailscale hostname)
- [ ] Wire up: save instance to instances store

### API Proxy Routes
- [x] `/api/vps/hetzner/[...path]` — catch-all proxy to Hetzner Cloud API
- [x] `/api/vps/digitalocean/[...path]` — catch-all proxy to DigitalOcean API
- [x] `/api/agent/health` — proxies agent health checks (HTTPS with self-signed cert)
- [x] `/api/agent/status` — proxies agent setup status polling
- [x] API key forwarded via header, never stored
- [ ] Add rate limiting middleware
- [ ] Add CORS origin restriction (lock to getaclaw.io in production)

### VPS Client Libraries
- [x] `src/lib/vps/hetzner.ts` — create, get, delete server + firewall management
- [x] `src/lib/vps/digitalocean.ts` — create, get, delete droplet functions
- [x] `src/lib/vps/types.ts` — shared interfaces
- [x] Connected to deploy orchestrator — called during real deployments

### Cloud-Init Generator
- [x] `src/lib/cloud-init/generator.ts` — generates full cloud-init YAML
- [x] Token and port generation utilities
- [x] Conditional Tailscale installation
- [x] Swap space for low-RAM servers
- [x] Node.js 22, Caddy reverse proxy (self-signed TLS on :443), UFW firewall
- [x] Installs openclaw + @getaclaw/agent, initializes agent, starts service
- [x] Connected to deploy orchestrator — generates user_data for server creation

### Agent Connection (Browser Side)
- [x] `src/lib/agent/connection.ts` — WebSocket client class
- [x] `src/lib/agent/protocol.ts` — shared message types
- [x] Token auth, request-response pattern, event subscription, timeout handling
- [x] `src/lib/agent/fetch.ts` — HTTPS health/status polling via API proxy routes
- [x] `src/lib/deploy/orchestrator.ts` — full deploy orchestrator (create server → poll boot → poll agent → poll setup)

### Instance Storage
- [x] `src/lib/store/instances-store.ts` — Zustand store with localStorage persistence
- [x] CRUD operations (add, update, remove)
- [x] Instance interface with all fields
- [ ] **NOT CONNECTED** — never called from deploy or dashboard

### Dashboard
- [x] `/dashboard` route exists
- [x] Basic "no instances" placeholder
- [ ] Load instances from store on mount
- [ ] Instance cards with status, provider, region, version
- [ ] Health check button (connect to agent, call `health.check`)
- [ ] Update button (connect to agent, call `manage.update`)
- [ ] Channel management
- [ ] Delete instance (with confirmation)
- [ ] "Set Up New Instance" link

### @getaclaw/agent NPM Package
- [x] Package scaffolding (package.json, tsconfig.json, builds cleanly)
- [x] CLI entry point with `init`, `serve`, `service install/uninstall/status` commands
- [x] HTTPS server with self-signed TLS + WebSocket endpoint
- [x] Authentication (pairing token hash, session tokens, rate limiting, 10s auth timeout)
- [x] Setup orchestrator with sequential step execution, retry (3x exponential backoff), event emission
- [x] Setup steps: system, openclaw, configure, tailscale, channels, service, health
- [x] Configure step: `openrouter/` model prefix, `.env` with API key, gateway auth, trusted proxies
- [x] Service step: creates system-level systemd unit for openclaw-gateway (not user-level)
- [x] Management: config read/write with deep merge, channel CRUD, health check, log retrieval
- [x] Utilities: safe exec (command allowlist), Winston logger, crypto (token gen, TLS cert gen)
- [x] WebSocket protocol types matching TECHNICAL.md spec
- [x] Tested on actual VPS (Ubuntu 24.04, Hetzner cx23)
- [x] Published to npm as `@getaclaw/agent` (v0.1.10)
- [x] Systemd service works correctly (agent runs as root)
- [x] Cloud-init bootstrap sequence verified end-to-end
- [x] OpenClaw gateway starts, responds to messages via OpenRouter

### UI Refresh
- [x] Fixed Tailwind v4 dark mode architecture (`@custom-variant dark` + split `@theme`/`@theme inline`)
- [x] All semantic tokens (background, surface, border, text) switch correctly in dark mode
- [x] Added violet color scale to design system for Reasoning tier badge
- [x] Hero: decorative gradient blobs, pill badge with pulse, CTA coral shadow glow
- [x] Navbar: upgraded backdrop blur, coral shadow on CTA
- [x] Feature/How-It-Works cards: hover shadow + icon glow effects
- [x] Replaced raw color hover states with semantic tokens across components

---

## What Needs to Be Done

### P0 — Critical (Must-have for MVP)

1. ~~**Fix dark mode**~~ ✅ Done — fixed via `@custom-variant dark` + split `@theme`/`@theme inline` architecture

2. ~~**Fix color contrast**~~ ✅ Done — input fields, tier badges, all components now render correctly in both themes

3. ~~**Wire up real deployment**~~ ✅ Done — deploy orchestrator creates server, polls boot, connects to agent, streams real step events, shows real logs

4. ~~**Wire up completion step**~~ ✅ Done — receives real IP, token, Control UI URL from deployment. Instance store save still TODO.

5. **Build dashboard** — load instances from store, display cards with status, add health check / update / delete actions.

6. ~~**End-to-end test**~~ ✅ Done — full flow verified on Hetzner cx23, Ubuntu 24.04. OpenClaw gateway responds to messages via OpenRouter.

### P1 — Important (Should-have for launch)

7. **Rate limiting on API proxy** — prevent abuse of the Vercel proxy routes.

8. **CORS restriction** — lock proxy to getaclaw.io origin in production.

9. **Error states** — proper error UI when VPS creation fails, agent connection fails, steps fail.

10. **Loading/skeleton states** — show skeletons while loading regions/sizes from VPS API.

11. **Agent self-signed cert verification** — browser should verify agent TLS fingerprint.

12. ~~**Publish @getaclaw/agent to npm**~~ ✅ Done — published as `@getaclaw/agent@0.1.10`.

13. **Harden agent HTTP endpoints** — `/health` and `/setup-status` are currently unauthenticated. Anyone who discovers the port can read server info, setup state, and potentially sensitive results. Add token-based auth (query param or header) to these endpoints.

14. **Fix SSRF in agent proxy routes** — `/api/agent/health` and `/api/agent/status` accept arbitrary `host`/`port` from the request body, allowing attackers to use the Vercel deployment as an HTTPS proxy. Validate that host/port matches a known instance or add request signing.

15. **Close direct gateway port** — UFW opens port 18789 (OpenClaw gateway) directly in addition to 443 (Caddy TLS). If gateway access should go through Caddy only, remove the 18789 UFW rule from cloud-init.

### P2 — Nice to Have (Post-launch)

13. **Scroll animations** — fade-in sections on the landing page.

14. **Hero illustrations** — custom graphics for the landing page.

15. **Advanced mode toggle** — show raw commands during deployment for advanced users.

16. **Instance migration** — move between providers.

17. **Multiple VPS providers** — Fly.io, Oracle Cloud free tier, GCP, AWS.

18. **Custom domain setup** — point user's domain to their OpenClaw instance.

### P3 — Repo & Launch

19. **Set up GitHub repo** — README, LICENSE (MIT), contributing guide.

20. **Deploy to Vercel** — connect repo, configure domain (getaclaw.io).

21. **OpenGraph image** — design and add to `/public/og-image.png`.

22. **Favicon** — design and add to `/public/`.

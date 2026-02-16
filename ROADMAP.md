# Get a Claw — Roadmap

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
- [ ] Fix: dark mode does not properly apply to sidebar, navbar, and several component backgrounds
- [ ] Fix: system preference listener uses dynamic `require()` — should be a proper import

### Navbar
- [x] Sticky header with backdrop blur
- [x] Desktop nav links (How it Works, FAQ, GitHub)
- [x] Mobile hamburger menu
- [x] "Get Started" CTA button
- [x] Theme toggle in nav
- [ ] Fix: dark mode background/text not rendering correctly

### Landing Page
- [x] Hero section with tagline and CTAs
- [x] How It Works — 4-step visual grid
- [x] Why Self-Host — 3-column comparison (hosted vs self-hosted)
- [x] Features — 3x2 grid with icons
- [x] FAQ — accordion with chevron animation
- [x] Troubleshooting — alert cards
- [x] Footer with links
- [ ] Fix: some text/background color contrast issues in dark mode
- [ ] Polish: animations on scroll (fade-in sections)
- [ ] Polish: illustrations or visual assets for hero/how-it-works

### Setup Wizard — Navigation
- [x] Wizard shell with Framer Motion step transitions
- [x] Desktop sidebar with step indicators (pending/current/completed)
- [x] Mobile progress bar with step counter
- [x] Zustand wizard store with all step data and navigation logic
- [x] Step completion tracking and jump-back navigation
- [ ] Fix: sidebar background doesn't switch in dark mode

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
- [ ] Fix: input field background/text color contrast issues

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
- [ ] Fix: purple tier badge colors not defined in design system — renders with Tailwind defaults

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
- [ ] **CRITICAL: deployment is 100% simulated** — fake progress timers, no real VPS or agent calls
- [ ] Wire up: call VPS API (via proxy) to create server
- [ ] Wire up: submit cloud-init user data script
- [ ] Wire up: poll for server IP
- [ ] Wire up: connect to @getaclaw/agent via WebSocket
- [ ] Wire up: listen to real step events from agent
- [ ] Wire up: handle errors and retries from real deployment
- [ ] Wire up: surface real logs from agent to action feed

### Setup Wizard — Step: Complete
- [x] Success UI with Control UI link, credentials, next steps checklist
- [x] Copy-to-clipboard for IP, hostname, token
- [x] Show/hide toggle for gateway token
- [x] Navigation buttons (Dashboard, Set Up Another)
- [ ] **CRITICAL: uses hardcoded mock data** (fake IP, fake token, fake URLs)
- [ ] Wire up: receive actual deployment results (IP, token, Tailscale hostname)
- [ ] Wire up: save instance to instances store

### API Proxy Routes
- [x] `/api/vps/hetzner` — proxies to Hetzner Cloud API
- [x] `/api/vps/digitalocean` — proxies to DigitalOcean API
- [x] Path allowlisting (servers, droplets, regions, sizes, images)
- [x] Method allowlisting (GET, POST, DELETE)
- [x] API key forwarded via header, never stored
- [ ] Add rate limiting middleware
- [ ] Add CORS origin restriction (lock to getaclaw.io in production)

### VPS Client Libraries
- [x] `src/lib/vps/hetzner.ts` — create, get, delete server functions
- [x] `src/lib/vps/digitalocean.ts` — create, get, delete droplet functions
- [x] `src/lib/vps/types.ts` — shared interfaces
- [ ] **NOT CONNECTED** — these functions are never called from the wizard

### Cloud-Init Generator
- [x] `src/lib/cloud-init/generator.ts` — generates full cloud-init YAML
- [x] Token and port generation utilities
- [x] Conditional Tailscale installation
- [x] Swap space for low-RAM servers
- [ ] **NOT CONNECTED** — never called from the wizard

### Agent Connection (Browser Side)
- [x] `src/lib/agent/connection.ts` — WebSocket client class
- [x] `src/lib/agent/protocol.ts` — shared message types
- [x] Token auth, request-response pattern, event subscription, timeout handling
- [ ] **NOT CONNECTED** — `AgentConnection` is never instantiated anywhere

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
- [x] Management: config read/write with deep merge, channel CRUD, health check, log retrieval
- [x] Utilities: safe exec (command allowlist), Winston logger, crypto (token gen, TLS cert gen)
- [x] WebSocket protocol types matching TECHNICAL.md spec
- [ ] Test on actual VPS (Ubuntu 24.04)
- [ ] Publish to npm as `@getaclaw/agent`
- [ ] Verify systemd service works correctly
- [ ] Verify cloud-init bootstrap sequence end-to-end

---

## What Needs to Be Done

### P0 — Critical (Must-have for MVP)

1. **Fix dark mode** — sidebar, navbar, input fields, and several card backgrounds don't switch properly. Text becomes unreadable in several components.

2. **Fix color contrast** — input fields show black text on dark/invisible backgrounds. Purple tier colors undefined in design system.

3. **Wire up real deployment** — connect step-deploy.tsx to:
   - VPS client libs (create server with cloud-init)
   - Server IP polling
   - AgentConnection WebSocket
   - Real event streaming from agent
   - Error handling and retry UI

4. **Wire up completion step** — receive real deployment results instead of hardcoded mocks. Save instance to store.

5. **Build dashboard** — load instances from store, display cards with status, add health check / update / delete actions.

6. **End-to-end test** — deploy @getaclaw/agent to a real VPS, verify the full flow works.

### P1 — Important (Should-have for launch)

7. **Rate limiting on API proxy** — prevent abuse of the Vercel proxy routes.

8. **CORS restriction** — lock proxy to getaclaw.io origin in production.

9. **Error states** — proper error UI when VPS creation fails, agent connection fails, steps fail.

10. **Loading/skeleton states** — show skeletons while loading regions/sizes from VPS API.

11. **Agent self-signed cert verification** — browser should verify agent TLS fingerprint.

12. **Publish @getaclaw/agent to npm** — so cloud-init can install it.

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

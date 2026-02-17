# GetaClaw — Product Specification

## Overview

**GetaClaw** is an open-source, privacy-focused web application that automates the deployment of [OpenClaw](https://openclaw.ai) — a self-hosted AI gateway — onto a user's own VPS (Virtual Private Server). The entire setup takes approximately 5 minutes, requires no coding skills, and ensures that all user data (conversations, API keys, server credentials) stays entirely under the user's control.

The project is accessible at [https://getaclaw.io](https://getaclaw.io).

## Problem

Hosted AI assistant services (ChatGPT, Claude, etc.) have access to all your conversations, files, and API keys. Users who care about privacy are stuck with a difficult choice: trust a third-party provider with sensitive data or spend hours setting up a self-hosted alternative manually via SSH and configuration files.

## Solution

GetaClaw bridges the gap by providing a guided, browser-based setup wizard that:

1. Provisions a VPS on the user's chosen cloud provider (Hetzner or DigitalOcean)
2. Installs and configures OpenClaw automatically via cloud-init and the `@getaclaw/agent` daemon
3. Connects messaging channels (WhatsApp, Telegram, Discord, Slack, Signal, iMessage)
4. Provides ongoing management (updates, health checks, channel management) from the browser

**No API keys or credentials are ever stored on GetaClaw's servers.** Everything is processed client-side in the browser or passed directly to the VPS via a secure WebSocket connection.

## Target Users

- **Privacy-conscious individuals** who want an AI assistant without data exposure
- **Non-technical users** ("Beginner" skill level) who have never used a terminal
- **Intermediate users** who know the basics but want automation
- **Advanced users / developers** who want full control with override capabilities

## Core User Flow

### 1. Landing Page
Users land on the marketing homepage which explains:
- What GetaClaw does (hero section)
- How it works in 4 steps (choose server, configure AI, automated setup, access from any device)
- Why self-hosting beats hosted services (privacy, transparency, cost)
- Key features (multi-channel, any AI model, web UI, secure access, one-click updates, multiple instances)
- FAQ (8 common questions)
- Troubleshooting (5 common issues)

### 2. Setup Wizard (9 steps)
1. **Welcome** — Select skill level (beginner, intermediate, advanced). This adapts the verbosity of explanations throughout the wizard.
2. **VPS Provider** — Choose Hetzner (recommended, from ~EUR 3.79/mo) or DigitalOcean (from $6/mo). Paste the provider's API key with contextual help for obtaining it.
3. **Server Config** — Pick a server name, location (6 regions per provider), and size (3 tiers per provider).
4. **Security** — Choose between password protection (good security) or Tailscale VPN (excellent security, server invisible to public internet).
5. **AI Models** — Enter an OpenRouter API key and select from 8 curated models: Claude Sonnet 4.5, Claude Haiku 4.5, GPT-4o, GPT-4o Mini, Gemini 2.5 Pro, Gemini 2.5 Flash, Llama 4 Maverick, DeepSeek R1.
6. **Channels** — Toggle messaging channels on/off. WhatsApp and Signal are configured post-deployment (QR code / CLI linking). Telegram, Discord, and Slack require bot tokens entered during setup. iMessage requires a paired macOS node.
7. **Review** — Summary of all settings with edit buttons to jump back to any section. Privacy reminder about client-side processing.
8. **Deploy** — Real-time deployment feed showing 8-9 steps (create server, wait for boot, connect to agent, prepare system, install OpenClaw, configure, optionally set up Tailscale, start services, health check). Each step shows progress bars, duration, and expandable logs.
9. **Complete** — Displays Control UI URL, server IP, Tailscale hostname (if applicable), gateway token with copy buttons, and a next-steps checklist.

### 3. Dashboard
After setup, users can manage their OpenClaw instances from a dashboard page (`/dashboard`). This supports multiple independent instances (e.g., personal, work, family — each on their own server).

## Key Product Principles

- **Privacy first**: No user data leaves the browser. VPS API keys are proxied through a thin, stateless API layer that stores nothing.
- **Beginner friendly**: Contextual explanations adapt to skill level. Every external service link opens in a new tab with clear instructions.
- **Transparent**: 100% open source (MIT license). Users can inspect every line of code and fork freely.
- **Affordable**: GetaClaw itself is free. Users pay only for VPS hosting (~$4/mo) and AI model usage (pay-per-use via OpenRouter).
- **Non-destructive**: Users retain full SSH access to their server as a fallback.

## Supported Integrations

### VPS Providers
- **Hetzner** (recommended) — European data centers, best value
- **DigitalOcean** — Global data centers, simple interface
- Planned: Fly.io, Oracle Cloud (free tier), GCP, AWS, manual cloud-init

### AI Models (via OpenRouter)
- Anthropic: Claude Sonnet 4.5, Claude Haiku 4.5
- OpenAI: GPT-4o, GPT-4o Mini
- Google: Gemini 2.5 Pro, Gemini 2.5 Flash
- Meta: Llama 4 Maverick
- DeepSeek: DeepSeek R1

### Messaging Channels
- WhatsApp (QR code)
- Telegram (Bot Token via @BotFather)
- Discord (Bot Token via Developer Portal)
- Slack (App Token + Bot Token)
- Signal (CLI linking post-deployment)
- iMessage (macOS node pairing post-deployment)

## Instance Lifecycle

1. **Provisioning** — VPS is created via provider API
2. **Setting up** — Cloud-init runs, agent connects, OpenClaw is installed
3. **Online** — Healthy and serving requests
4. **Offline** — Server unreachable
5. **Error** — Setup or health check failed

## Future Considerations

- One-click updates for both OpenClaw and the agent from the browser
- Additional VPS providers
- Instance migration between providers
- Shared instance access for teams/families
- Mobile companion app for instance management

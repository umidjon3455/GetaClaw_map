# GetaClaw Analytics Plan (PostHog)

## Philosophy

Privacy-first, anonymous analytics. No cookies, no PII, no fingerprinting. We track *what* users do, never *who* they are. This aligns with the product's core value prop: your data stays yours.

PostHog config:
- `persistence: "memory"` - no cookies, no localStorage tracking
- `disable_session_recording: true` - no session replays
- No `$set` or `$identify` calls - fully anonymous
- Respect Do Not Track header
- Self-hosted PostHog is ideal long-term, but PostHog Cloud free tier (1M events/mo) works to start

---

## Funnel Overview

```
Landing Page View
  -> Hero CTA / Navbar CTA click
    -> Wizard Start (Step 1: Welcome)
      -> Skill Level Selected
        -> VPS Provider Selected + API Key Entered
          -> Server Configured
            -> Security Mode Chosen
              -> Models Selected
                -> Channels Configured
                  -> Review Completed
                    -> Deploy Started
                      -> Deploy Success / Deploy Failed
                        -> Control UI Opened
```

**Primary metric**: Landing -> Deploy Success conversion rate
**Secondary metric**: Step-to-step drop-off rates in the wizard

---

## Events

### Landing Page

| Event | Properties | Purpose |
|-------|-----------|---------|
| `page_view` | `path`, `referrer`, `utm_source`, `utm_medium`, `utm_campaign` | Track traffic sources |
| `cta_click` | `location` (hero / navbar / how-it-works), `destination` (/setup / github) | Which CTAs drive conversions |
| `section_visible` | `section` (how-it-works / why-self-host / features / faq / troubleshooting) | Scroll depth / engagement |
| `faq_toggle` | `question_index`, `action` (open / close) | What questions users care about |
| `external_link_click` | `url`, `label` (github / openclaw-docs) | Outbound interest |

### Wizard - Navigation

| Event | Properties | Purpose |
|-------|-----------|---------|
| `wizard_started` | `referrer` | Funnel entry |
| `wizard_step_viewed` | `step`, `step_index` | Track which steps users reach |
| `wizard_step_completed` | `step`, `step_index`, `duration_ms` | Time spent per step |
| `wizard_step_back` | `from_step`, `to_step` | Confusion/hesitation signals |
| `wizard_abandoned` | `last_step`, `total_duration_ms` | Where do users give up |
| `wizard_review_edit` | `section` (vps / server / security / models / channels) | What do users reconsider |

### Wizard - Selections

| Event | Properties | Purpose |
|-------|-----------|---------|
| `skill_level_selected` | `level` (beginner / intermediate / advanced) | Audience composition |
| `vps_provider_selected` | `provider` (hetzner / digitalocean) | Provider demand |
| `server_region_selected` | `region`, `provider` | Regional demand |
| `server_size_selected` | `size`, `provider`, `price_monthly` | Price sensitivity |
| `security_mode_selected` | `mode` (password / tailscale) | Security preference |
| `models_selected` | `count`, `model_ids` | Model popularity |
| `channels_configured` | `channels`, `count` | Channel demand |
| `channels_skipped` | - | How many skip channels entirely |

### Deploy

| Event | Properties | Purpose |
|-------|-----------|---------|
| `deploy_started` | `provider`, `region`, `size`, `security_mode`, `channel_count`, `model_count` | Full deploy context |
| `deploy_step_started` | `step_id`, `estimated_duration` | Substep tracking |
| `deploy_step_completed` | `step_id`, `actual_duration`, `estimated_duration` | Duration accuracy |
| `deploy_step_failed` | `step_id`, `error`, `elapsed` | Failure diagnosis |
| `deploy_completed` | `total_duration_ms`, `provider`, `security_mode` | Success tracking |
| `deploy_failed` | `failed_at_step`, `error`, `total_elapsed` | Failure tracking |
| `deploy_interrupted` | `last_completed_step` | Page close during deploy |
| `deploy_resumed` | `resume_from_step` | Recovery tracking |
| `deploy_retried` | `previous_error` | Retry behavior |

### Post-Deploy

| Event | Properties | Purpose |
|-------|-----------|---------|
| `complete_screen_viewed` | `total_deploy_duration` | Success celebration |
| `control_ui_opened` | `security_mode` | Immediate engagement |
| `credential_copied` | `type` (ip / token / hostname) | What users need |
| `checklist_item_checked` | `item` | Post-setup engagement |
| `setup_another_clicked` | - | Power user signal |

### Errors

| Event | Properties | Purpose |
|-------|-----------|---------|
| `error_displayed` | `step`, `error_type`, `message` | Error frequency |
| `404_page_viewed` | `path` | Broken links |

### Theme

| Event | Properties | Purpose |
|-------|-----------|---------|
| `theme_changed` | `to` (light / dark) | User preference |

---

## Implementation

### 1. Install PostHog

```bash
npm install posthog-js
```

### 2. Create analytics provider

`src/lib/analytics/posthog.ts` - PostHog init with privacy config
`src/lib/analytics/events.ts` - Type-safe event tracking functions
`src/components/shared/analytics-provider.tsx` - React context provider

### 3. Provider setup

```tsx
// src/lib/analytics/posthog.ts
import posthog from "posthog-js";

export function initAnalytics() {
  if (typeof window === "undefined") return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    persistence: "memory",           // No cookies, no localStorage
    capture_pageview: false,         // We'll track manually for SPA
    capture_pageleave: true,         // Track when users leave
    disable_session_recording: true, // No session replays
    autocapture: false,              // No auto-capture, explicit events only
    respect_dnt: true,               // Respect Do Not Track
    advanced_disable_decide: true,   // Skip feature flag calls
  });
}

export { posthog };
```

### 4. Type-safe event helpers

```tsx
// src/lib/analytics/events.ts
import { posthog } from "./posthog";

// Wrapper that no-ops if PostHog isn't loaded
function track(event: string, properties?: Record<string, unknown>) {
  posthog.capture(event, properties);
}

// Landing
export const trackPageView = (path: string) =>
  track("page_view", { path, referrer: document.referrer });

export const trackCtaClick = (location: string, destination: string) =>
  track("cta_click", { location, destination });

export const trackSectionVisible = (section: string) =>
  track("section_visible", { section });

export const trackFaqToggle = (index: number, action: "open" | "close") =>
  track("faq_toggle", { question_index: index, action });

// Wizard
export const trackWizardStarted = () =>
  track("wizard_started", { referrer: document.referrer });

export const trackWizardStepViewed = (step: string, index: number) =>
  track("wizard_step_viewed", { step, step_index: index });

export const trackWizardStepCompleted = (step: string, index: number, durationMs: number) =>
  track("wizard_step_completed", { step, step_index: index, duration_ms: durationMs });

export const trackWizardAbandoned = (lastStep: string, durationMs: number) =>
  track("wizard_abandoned", { last_step: lastStep, total_duration_ms: durationMs });

// Selections
export const trackSkillLevel = (level: string) =>
  track("skill_level_selected", { level });

export const trackVpsProvider = (provider: string) =>
  track("vps_provider_selected", { provider });

export const trackSecurityMode = (mode: string) =>
  track("security_mode_selected", { mode });

export const trackModelsSelected = (count: number, models: string[]) =>
  track("models_selected", { count, model_ids: models });

// Deploy
export const trackDeployStarted = (props: Record<string, unknown>) =>
  track("deploy_started", props);

export const trackDeployCompleted = (durationMs: number, provider: string) =>
  track("deploy_completed", { total_duration_ms: durationMs, provider });

export const trackDeployFailed = (step: string, error: string, elapsed: number) =>
  track("deploy_failed", { failed_at_step: step, error, total_elapsed: elapsed });

// ... etc
```

### 5. Analytics provider component

```tsx
// src/components/shared/analytics-provider.tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initAnalytics, posthog } from "@/lib/analytics/posthog";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    posthog.capture("page_view", { path: pathname });
  }, [pathname]);

  return <>{children}</>;
}
```

### 6. Integration points

Where to add tracking calls:

| File | Events to add |
|------|---------------|
| `src/app/layout.tsx` | Wrap with `<AnalyticsProvider>` |
| `src/components/landing/hero.tsx` | `cta_click` on buttons |
| `src/components/landing/faq.tsx` | `faq_toggle` on accordion |
| `src/components/landing/footer.tsx` | `external_link_click` |
| `src/components/shared/navbar.tsx` | `cta_click`, `theme_changed` |
| `src/components/wizard/step-welcome.tsx` | `wizard_started`, `skill_level_selected` |
| `src/components/wizard/step-vps-provider.tsx` | `vps_provider_selected` |
| `src/components/wizard/step-server-config.tsx` | `server_region_selected`, `server_size_selected` |
| `src/components/wizard/step-security.tsx` | `security_mode_selected` |
| `src/components/wizard/step-models.tsx` | `models_selected` |
| `src/components/wizard/step-channels.tsx` | `channels_configured` / `channels_skipped` |
| `src/components/wizard/step-review.tsx` | `wizard_review_edit` |
| `src/components/wizard/step-deploy.tsx` | `deploy_started`, `deploy_completed`, `deploy_failed`, `deploy_retried` |
| `src/components/wizard/step-complete.tsx` | `control_ui_opened`, `credential_copied` |
| `src/components/wizard/wizard-shell.tsx` | `wizard_step_viewed`, `wizard_step_completed`, `wizard_step_back` |
| `src/app/not-found.tsx` | `404_page_viewed` |

### 7. Section visibility tracking

Use an `IntersectionObserver` hook for landing page sections:

```tsx
// src/lib/hooks/use-track-visibility.ts
import { useEffect, useRef } from "react";
import { trackSectionVisible } from "@/lib/analytics/events";

export function useTrackVisibility(section: string) {
  const ref = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackSectionVisible(section);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [section]);

  return ref;
}
```

### 8. Environment variables

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## PostHog Dashboards

### Dashboard 1: Funnel Overview
- **Landing -> Wizard -> Deploy -> Success** conversion funnel
- Daily/weekly unique visitors
- Traffic sources (referrer, UTM params)
- Drop-off by wizard step

### Dashboard 2: Wizard Analytics
- Step completion rates (bar chart)
- Average time per step
- Back-navigation frequency (confusion indicator)
- Skill level distribution
- Most common selections (provider, region, size, security, models, channels)

### Dashboard 3: Deploy Health
- Deploy success rate (%)
- Average deploy duration
- Substep duration distribution
- Most common failure points
- Retry rate
- Resume rate

### Dashboard 4: Feature Adoption
- VPS provider distribution (pie chart)
- Security mode distribution
- Most popular AI models
- Channel adoption rates
- Server size distribution

---

## Review Cadence

Every 2-3 days:
1. Check funnel conversion - where are users dropping off?
2. Check deploy success rate - any new failure patterns?
3. Check which FAQ items get opened most - what confuses users?
4. Check section scroll depth - are users reading the landing page?
5. Identify the highest-impact optimization based on data

---

## Privacy Compliance

- No cookies set (memory-only persistence)
- No PII collected (no emails, IPs, names)
- No session recordings
- Respect DNT header
- No cross-site tracking
- No third-party data sharing
- Open source codebase - users can verify what's tracked
- Consider adding a small "We use anonymous analytics" note in the footer

# GetaClaw SEO Plan

## Value Proposition

GetaClaw is a **free, open-source tool** that lets anyone deploy a private AI assistant (OpenClaw) on their own VPS in **5 minutes** — no terminal, no SSH, no config files. It saves hours of manual setup and keeps all data on the user's own server.

**Target keywords** (primary): `self-hosted AI`, `private AI assistant`, `deploy OpenClaw`, `OpenClaw setup`
**Target keywords** (secondary): `self-hosted chatbot`, `private ChatGPT alternative`, `AI on your own server`, `VPS AI setup`, `open source AI assistant`
**Target keywords** (long-tail): `how to self-host AI`, `deploy AI on VPS`, `private AI no coding`, `OpenClaw VPS tutorial`, `self-hosted WhatsApp AI bot`

---

## Current State: What's Working

- Root layout has solid metadata (title, description, 7 keywords, OG, Twitter card)
- Single H1 with good keyword density
- Clean heading hierarchy (H1 > H2 > H3)
- Semantic HTML sections with IDs
- Font optimization via next/font (display: swap, latin subset)
- PWA manifest + full favicon set
- metadataBase set correctly
- External links use `target="_blank" rel="noopener noreferrer"`

---

## Gaps & Fixes

### 1. robots.txt (Critical)

**Problem**: No robots.txt exists. Search engines have no crawl directives.

**Fix**: Create `src/app/robots.ts` using Next.js metadata API.

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/setup", "/dashboard"],
      },
    ],
    sitemap: "https://getaclaw.io/sitemap.xml",
  };
}
```

**Why disallow /setup and /dashboard**: These are app pages (wizard, user dashboard) — not content pages. They have no value to search engines and would dilute crawl budget.

---

### 2. Sitemap (Critical)

**Problem**: No sitemap.xml. Search engines can't discover pages efficiently.

**Fix**: Create `src/app/sitemap.ts`.

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://getaclaw.io",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
  ];
}
```

Currently only the homepage needs indexing. As we add blog/docs pages, they go here too.

---

### 3. JSON-LD Structured Data (Critical)

**Problem**: Zero structured data markup. Missing rich snippet opportunities.

**Fix**: Add two JSON-LD blocks to the root layout:

**a) SoftwareApplication schema** — Makes GetaClaw appear as a software product in search results:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "GetaClaw",
  "description": "Open-source, privacy-focused tool to deploy OpenClaw on your own VPS in 5 minutes.",
  "url": "https://getaclaw.io",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "GetaClaw",
    "url": "https://getaclaw.io"
  }
}
```

**b) FAQPage schema** — Enables FAQ rich snippets in Google (expandable Q&A directly in search results). This is high-value because the FAQ section already has 8 questions.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is OpenClaw?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OpenClaw is an open-source AI gateway..."
      }
    }
    // ... all 8 questions
  ]
}
```

**Implementation**: Add a `<script type="application/ld+json">` block in the root layout `<head>`, and a separate FAQPage JSON-LD in the homepage or FAQ component.

---

### 4. Page-Specific Metadata (High)

**Problem**: `/setup` and `/dashboard` pages inherit root metadata. If somehow indexed, they'd show the homepage title/description.

**Fix**: Add `export const metadata` to each page:

**setup/page.tsx** (or setup/layout.tsx):
```ts
export const metadata: Metadata = {
  title: "Setup Wizard — GetaClaw",
  description: "Step-by-step wizard to deploy your private OpenClaw AI assistant on your own VPS.",
  robots: { index: false, follow: false }, // Don't index app pages
};
```

**dashboard/page.tsx**:
```ts
export const metadata: Metadata = {
  title: "Dashboard — GetaClaw",
  description: "Manage your OpenClaw instances.",
  robots: { index: false, follow: false },
};
```

---

### 5. Consistent Social Meta Tags (High)

**Problem**: Title and description differ between page meta, OG, and Twitter card — confusing and suboptimal.

**Current state**:
| Tag | Title | Description |
|-----|-------|-------------|
| Page | "GetaClaw — Set Up Your Private AI Assistant in 5 Minutes" | "Open-source, privacy-focused tool to deploy OpenClaw on your own VPS. No coding required. Your AI, your server, your data." |
| OG | Same as page | "Open-source, privacy-focused tool to deploy OpenClaw on your own VPS. No coding required." (truncated) |
| Twitter | "GetaClaw — Private AI Assistant Setup" (different!) | "Deploy OpenClaw on your own server in 5 minutes. Privacy-focused & open source." (different!) |

**Fix**: Align all three. Use the page title for OG and Twitter. Use the full description everywhere:

```ts
const title = "GetaClaw — Set Up Your Private AI Assistant in 5 Minutes";
const description = "Free, open-source tool to deploy OpenClaw on your own VPS. No coding required. Your AI, your server, your data.";

// Then use `title` and `description` in all three: metadata, openGraph, twitter
```

Also add "Free" to the description — important for the value proposition since the tool costs nothing.

---

### 6. Custom 404 Page (High)

**Problem**: No `not-found.tsx`. Users hitting dead URLs see a generic Next.js 404.

**Fix**: Create `src/app/not-found.tsx` with:
- GetaClaw branding
- "Page not found" message
- Link back to homepage
- Link to the setup wizard

This keeps users on-site instead of bouncing. Also improves brand perception.

---

### 7. Semantic HTML for FAQ & Troubleshooting (Medium)

**Problem**: FAQ questions use `<button>` with `<span>` — not semantic. Troubleshooting titles use `<div>` with class names instead of actual `<h3>` tags.

**Fix**:
- FAQ: Keep the `<button>` for interactivity but ensure the question text is wrapped in or associated with a heading element. Could use `<h3>` inside the button.
- Troubleshooting: Change `<div className="... font-semibold">` to `<h3 className="...">` for problem titles.

This helps search engines understand the content hierarchy and pairs well with the FAQPage JSON-LD.

---

### 8. OG Image Optimization (Medium)

**Problem**: `og-image.png` is 792KB. Social platforms will load it, but it's heavier than needed.

**Fix**: Compress to ~150-250KB using:
```bash
# Using sharp or squoosh to optimize
npx @squoosh/cli --oxipng '{level:3}' public/og-image.png
```

Or convert to WebP for supported platforms (keep PNG as fallback).

---

### 9. Clean Up Unused Public Assets (Low)

**Problem**: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are Next.js template leftovers. They add noise and could confuse crawlers.

**Fix**: Delete all 5 SVG files from `public/`.

---

### 10. Keyword Density & Copy Refinements (Medium)

The landing page copy is good but could be strengthened for SEO:

**Hero section** — Add "free" and "open-source" more prominently:
- Current badge: "Open Source · Privacy First"
- Suggested badge: "Free & Open Source · Privacy First"

**Meta description** — Add "free":
- Current: "Open-source, privacy-focused tool..."
- Suggested: "Free, open-source tool..."

**H1** — Current is great: "Your private AI assistant. Your server. 5 minutes."
- Keep as-is. It's compelling and keyword-rich.

**FAQ answers** — Ensure answers naturally include target keywords like "self-hosted AI", "private AI assistant", "deploy on your own server".

---

### 11. Internal Linking Strategy (Medium)

**Problem**: Only 2 internal links in content (/ and /setup). No cross-section linking.

**Fix**: This is less relevant now since we only have one content page. But as content grows (blog, docs, changelog), add:
- Links from FAQ answers to relevant sections
- "Learn more" links between sections
- Footer links to all major sections

---

### 12. Future Content Opportunities (Low — Roadmap)

To improve organic search traffic long-term, consider adding:

1. **Blog / Changelog** (`/blog`) — Write about self-hosting AI, privacy, comparisons, updates
2. **Docs page** (`/docs`) — SEO-friendly documentation for power users
3. **Comparison pages** — "GetaClaw vs ChatGPT", "Self-hosted AI vs Cloud AI"
4. **Use case pages** — "Private AI for Families", "AI for Small Business"

Each page targets different long-tail keywords and creates more entry points from search.

---

## Implementation Priority

| # | Task | Impact | Effort |
|---|------|--------|--------|
| 1 | Create `robots.ts` | Critical | 5 min |
| 2 | Create `sitemap.ts` | Critical | 5 min |
| 3 | Add SoftwareApplication JSON-LD | Critical | 10 min |
| 4 | Add FAQPage JSON-LD | Critical | 15 min |
| 5 | Align social meta tags + add "free" | High | 5 min |
| 6 | Add noindex metadata to /setup & /dashboard | High | 5 min |
| 7 | Create custom 404 page | High | 15 min |
| 8 | Fix FAQ/Troubleshooting semantic HTML | Medium | 10 min |
| 9 | Compress OG image | Medium | 5 min |
| 10 | Delete unused SVGs from public/ | Low | 2 min |
| 11 | Add "Free" to hero badge | Low | 2 min |

**Total estimated effort: ~80 minutes**

---

## Verification Checklist

After implementation, validate with:
- [ ] Google Rich Results Test (https://search.google.com/test/rich-results) — verify JSON-LD
- [ ] Open Graph Debugger (https://developers.facebook.com/tools/debug/) — verify OG tags
- [ ] Twitter Card Validator — verify Twitter card
- [ ] Google Search Console — submit sitemap, check indexing
- [ ] Lighthouse SEO audit (Chrome DevTools) — should score 100
- [ ] Check robots.txt is accessible at https://getaclaw.io/robots.txt
- [ ] Check sitemap at https://getaclaw.io/sitemap.xml

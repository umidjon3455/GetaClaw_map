# Get a Claw — Design Specification

## Design System: "Coral Claw"

Get a Claw uses a custom design system called **Coral Claw** — a warm, approachable visual language that conveys trust, simplicity, and technical competence without feeling intimidating to non-technical users.

## Color Palette

### Primary Colors
| Token | Value | Usage |
|-------|-------|-------|
| `coral` | `#E8634A` | Primary brand color, CTAs, active states, accents |
| `coral-hover` | `#D4553D` | Hover state for primary buttons |
| `coral-active` | `#C04A35` | Active/pressed state |
| `coral-light` | `#FDF0ED` | Light backgrounds for selected/active cards |

### Coral Scale (50-900)
Full 9-step scale from `#FEF5F3` (50) to `#793226` (900) for fine-grained usage across light and dark themes.

### Neutral Colors
| Token | Value | Usage |
|-------|-------|-------|
| `charcoal` | `#1A1A2E` | Primary text (light mode), deep backgrounds |
| `charcoal-light` | `#2A2A42` | Secondary dark surfaces |
| `warm-white` | `#FAF8F5` | Page background (light mode) |
| `sand` | `#E8E0D4` | Borders, dividers, subtle backgrounds |
| `sand-dark` | `#D4CBC0` | Hover borders, scrollbar thumbs |
| `slate` | `#6B7280` | Secondary text |
| `slate-light` | `#9CA3AF` | Muted/placeholder text |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `sea-green` | `#2D9F7F` | Success states, completed steps, checkmarks |
| `sea-green-light` | `#34B891` | Success hover |
| `sea-green-dark` | `#257A63` | Success active |
| `amber` | `#E5A431` | Warnings, caution indicators |
| `soft-red` | `#D94452` | Errors, destructive actions |

### Dark Mode
Dark mode overrides use a dedicated surface scale:
| Token | Value | Usage |
|-------|-------|-------|
| `dark-bg` | `#0F0F1A` | Page background |
| `dark-surface` | `#1A1A2E` | Card/section backgrounds |
| `dark-elevated` | `#252540` | Elevated elements (dropdowns, toggles) |
| `dark-border` | `#333355` | Borders and dividers |

Dark mode is toggled via `html.dark` class with CSS custom property overrides. The theme system supports three modes: light, dark, and system (follows OS preference). Defaults to light.

## Typography

### Font Stack
| Role | Font | Variable | Fallback |
|------|------|----------|----------|
| Headings | Space Grotesk | `--font-heading` | system-ui, sans-serif |
| Body | Inter | `--font-body` | system-ui, sans-serif |
| Monospace | JetBrains Mono | `--font-mono` | ui-monospace, monospace |

All fonts are loaded from Google Fonts with `display: swap` for performance.

### Heading Style
- Font family: Space Grotesk
- Letter spacing: `-0.02em`
- Font weight: Bold (700)

## Spacing & Radius

### Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `radius-sm` | `6px` | Small elements (checkboxes, inline badges) |
| `radius-md` | `10px` | Buttons, inputs, nav items |
| `radius-lg` | `16px` | Cards, panels, sections |
| `radius-xl` | `24px` | Large containers |

### Layout
- Max content width: `1200px`
- Horizontal padding: `20px` (mobile), `32px` (desktop)
- Section vertical padding: `80px` (mobile), `112px` (desktop)

## Component Patterns

### Buttons

**Primary (CTA)**
- Background: `coral` / `coral-hover` on hover / `coral-active` on press
- Text: white, semibold, 14px
- Padding: `10px 24px`
- Disabled: 40% opacity, `cursor-not-allowed`

**Secondary / Outline**
- Border: `border` color
- Text: `text-primary`
- Hover: `sand/40` background (light) / `dark-elevated` (dark)

**Back button** — secondary style, used on left side of wizard step actions.

### Cards / Selection Items

Interactive selection cards (VPS provider, skill level, security mode, models, channels) follow a consistent pattern:
- Default: `border-border`, transparent background
- Hover: `border-border-hover`
- Selected: `border-coral`, `bg-coral-light` (light mode) / `border-coral`, `bg-coral-900/20` (dark mode)
- Inner icon container changes from `bg-sand/60` to `bg-coral text-white` when selected

### Form Inputs

- Border: `border` / `border-coral` on focus
- Focus ring: `ring-2 ring-coral/20`
- Background: `background` (light) / `dark-surface` (dark)
- Font: monospace for API keys and tokens
- Password fields include show/hide toggle with `Eye`/`EyeOff` icons

### Status Indicators

**Step completion (sidebar)**
- Pending: numbered circle with `border-border`
- Current: `bg-coral text-white` circle
- Completed: `bg-sea-green text-white` circle with checkmark

**Deployment action cards**
- Pending: empty bordered circle on timeline
- Running: `bg-coral` circle with spinning Loader2 icon, coral-tinted card border
- Success: `bg-sea-green` circle with checkmark
- Error: `bg-soft-red` circle with X icon, red-tinted card
- Warning: `bg-amber` circle with AlertTriangle icon

**Tier badges (models)**
- Premium: coral background/text
- Fast & Cheap: sea-green tones
- Open Source: amber tones
- Reasoning: purple tones

### Toggle Switches

Channel toggles use a custom implementation:
- Track: `bg-sand` (off) / `bg-coral` (on)
- Thumb: white circle with shadow, slides via `translate-x`
- Size: `20px` tall, `36px` wide

## Layout Structure

### Landing Page
Linear scroll with bordered sections alternating between plain and `bg-surface` backgrounds:
1. Hero (no top border)
2. How It Works (4-column grid on desktop)
3. Why Self-Host (3-column comparison cards)
4. Features (3x2 grid of feature cards)
5. FAQ (accordion with chevron rotation)
6. Troubleshooting (stacked alert cards with amber warning icons)
7. Footer

### Wizard Layout
Two-panel layout:
- **Left**: Fixed 256px sidebar (desktop only) with step list navigation
- **Right**: Step content centered with max-width 672px (`max-w-2xl`)
- **Mobile**: Horizontal progress bar replaces sidebar (step counter + coral progress bar)
- Step transitions use Framer Motion: fade + 12px vertical slide, 250ms ease-out

### Navbar
- Sticky, `z-50`, backdrop blur (`backdrop-blur-md`)
- Height: 64px
- Logo: "Get a" in text-primary + "Claw" in coral
- Desktop: nav links + theme toggle + "Get Started" CTA
- Mobile: theme toggle + hamburger menu expanding below nav

## Animation & Motion

- **Page transitions (wizard steps)**: `AnimatePresence` with `mode="wait"`, `opacity 0 -> 1`, `y 12 -> 0`, 250ms ease-out
- **Deployment feed**: Staggered entry with 50ms delay per step card, 300ms fade-in
- **FAQ accordion**: CSS `grid-rows-[0fr]` -> `grid-rows-[1fr]` transition, 200ms
- **Chevron rotation**: 180deg on open, 200ms
- **Progress bars**: `transition-all duration-500 ease-out`
- **Hover effects**: `transition-colors` (default duration)

## Scrollbar & Selection

- Custom webkit scrollbar: 6px wide, transparent track, `sand-dark` thumb (light mode), `dark-border` thumb (dark mode)
- Text selection: `coral-200` background with `charcoal` text (light), `coral-700` background with `sand` text (dark)
- Smooth scrolling enabled (`scroll-behavior: smooth`)

## Focus States

Focus ring utility class `.focus-ring`:
- `outline-none`
- `ring-2 ring-coral/40`
- `ring-offset-2 ring-offset-background`

## Iconography

All icons use [Lucide React](https://lucide.dev/) at consistent sizes:
- Navigation / inline: `h-4 w-4` or `h-3.5 w-3.5`
- Card icons: `h-5 w-5` inside `h-10 w-10` or `h-12 w-12` containers
- Status indicators: `h-2.5 w-2.5` to `h-5 w-5`
- Stroke width: Default (2) for most, 2.5-3 for status checkmarks

## Responsive Breakpoints

Using Tailwind CSS v4 default breakpoints:
- `sm`: 640px (tighter padding, side-by-side buttons)
- `md`: 768px (desktop nav appears)
- `lg`: 1024px (wizard sidebar appears, 3-4 column grids)

## Accessibility Notes

- `aria-label` on icon-only buttons (hamburger menu, theme toggle)
- `suppressHydrationWarning` on `<html>` for theme flash prevention
- Font `display: swap` for web font loading performance
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<aside>`

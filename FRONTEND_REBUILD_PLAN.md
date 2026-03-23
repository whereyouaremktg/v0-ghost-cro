# Ghost CRO — Frontend Rebuild Plan

## Vision
A world-class, product-led frontend rewrite that **evolves the Ghost OS aesthetic** (dark + amber/gold, modernized) while preserving every backend API route, hook, and database interaction untouched.

---

## Design Direction: "Ghost OS 3.0"
- **Dark theme** with refined surfaces (`#09090B` base, `#111113` cards, `#18181B` elevated)
- **Amber/Gold accent** (`#FBBF24` primary, `#F59E0B` hover) — evolved with better contrast and intentional use
- **Glassmorphism** — subtler, only on overlays and modals (not every card)
- **Typography** — Geist Sans/Mono preserved, but with better hierarchy (larger headings, tighter body, tabular-nums for data)
- **Motion** — Framer Motion for page transitions, staggered list animations, and micro-interactions (hover lifts, state changes)
- **Information density** — Data-rich but breathing. Each section has clear purpose and whitespace separation.

---

## Phase 1: Foundation (Design System + Shell)
Build the bones everything else mounts on.

### 1a. Design Tokens (`globals.css` rewrite)
- Modernized CSS custom properties for colors, spacing, typography, shadows
- HSL-based color system for easy opacity variants
- Semantic tokens: `--surface-{0,1,2,3}`, `--accent`, `--text-{primary,secondary,muted}`
- Severity tokens: `--critical` (red), `--warning` (amber), `--success` (green), `--info` (blue)
- Shadow system: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-glow`
- Motion tokens: `--ease-out-expo`, `--duration-fast/normal/slow`

### 1b. Base UI Components (`components/ui/`)
Rebuild from shadcn/ui primitives, Ghost-branded:
- `button.tsx` — primary (amber fill), secondary (ghost), destructive, outline, icon-only
- `card.tsx` — default, elevated, interactive (hover lift), metric
- `badge.tsx` — severity (critical/warning/success), status (active/inactive), plan
- `input.tsx`, `textarea.tsx`, `select.tsx` — dark-themed form controls
- `dialog.tsx`, `sheet.tsx` — modals and slide-overs
- `skeleton.tsx` — loading states with shimmer
- `tooltip.tsx` — information tooltips
- `tabs.tsx` — underline-style tab navigation
- `dropdown-menu.tsx` — context menus
- `avatar.tsx` — user/store avatar with fallback
- `progress.tsx` — progress bars (scan progress, scores)
- `score-ring.tsx` — circular score gauge (0-100) with grade letter
- `code-block.tsx` — syntax-highlighted code display for fixes
- `empty-state.tsx` — friendly empty states with icon + CTA

### 1c. Layout Shell
- `app/layout.tsx` — Root layout (fonts, providers, metadata)
- `app/dashboard/layout.tsx` — Sidebar + header + main area (server component with auth check)
- `components/layout/sidebar.tsx` — Collapsible sidebar with nav items, store badge, issue count
- `components/layout/header.tsx` — Breadcrumb + search + user menu
- `components/layout/mobile-nav.tsx` — Bottom tab bar for mobile

**Verification:** App builds, sidebar navigates, auth redirects work.

---

## Phase 2: Auth + Onboarding Flow
The first thing users see — must be polished and fast.

### 2a. Auth Pages
- `app/login/page.tsx` — Email/password with Supabase Auth
- `app/signup/page.tsx` — Registration with email
- Clean, centered card layout. Ghost logo. Subtle background pattern.
- Error handling with toast notifications (Sonner)

### 2b. Onboarding (3-step flow)
- `app/onboarding/layout.tsx` — Step progress bar at top
- `app/onboarding/connect/page.tsx` — Store URL input → Shopify OAuth
  - Clean input with `.myshopify.com` suffix
  - Security trust badges
  - "Read-only access" callout
- `app/onboarding/scanning/page.tsx` — Scan progress visualization
  - Animated Ghost logo (pulse/orbit)
  - Step-by-step checklist with green checkmarks
  - Real progress bar tied to `/api/analyze/[id]/status` polling
  - Time remaining estimate
- `app/onboarding/results/page.tsx` — First results preview
  - Score ring with grade
  - Top 3 opportunities as cards
  - Revenue impact headline
  - CTA: "Start Free Trial" → Shopify billing
  - Secondary: "Continue with limited access" → dashboard

**Verification:** Full signup → connect → scan → results flow works end-to-end.

---

## Phase 3: Dashboard (Core Experience)

### 3a. Dashboard Home (`app/dashboard/page.tsx`)
**Layout:** Hero score card + 4 KPI cards + 2-column (insights + activity)

- **Score Hero Card** — Large score ring, trend arrow (±pts from last scan), grade letter, "Last scanned X ago"
- **KPI Row** (4 cards):
  - Revenue Impact ($) with trend
  - Issues Found (count by severity breakdown)
  - Scans Completed (total)
  - Top Fix Potential (highest single fix impact)
- **Insights Panel** — Top 5 friction points from latest test, ordered by severity, with "View fix →" links
- **Activity Feed** — Timeline of recent scans with scores, clickable to test detail
- **Industry Benchmark** — Mini bar chart comparing user's scores to category averages (Recharts)

### 3b. Issues List (`app/dashboard/issues/page.tsx`)
- Search + filter bar (severity, status, category)
- Sort options (severity, impact, newest)
- Issue cards with:
  - Severity badge (color-coded left border)
  - Title + location
  - Impact metric (e.g., "~23% abandonment")
  - Status chip (Open/Fixed/Dismissed)
  - Quick action buttons
- Bulk actions toolbar (mark fixed, dismiss)
- Empty state when no issues

### 3c. Issue Detail (`app/dashboard/issues/[id]/page.tsx`)
- Back button + breadcrumb
- Issue header: title, severity, status, affected area
- Description section with AI reasoning
- **Code Fix Panel:**
  - File target + language badge
  - Before/After diff view (or just the fix if no original)
  - Copy button
  - "Deploy to Sandbox" button → `/api/shopify/sandbox/deploy`
  - Effort estimate badge
- Mark as Fixed / Dismiss buttons

### 3d. Scanner (`app/dashboard/scanner/page.tsx`)
- Store URL display (pre-filled from connected store)
- Scan configuration toggles:
  - Theme Analysis (UX friction)
  - Checkout Analysis (cart experience)
  - Speed Analysis (performance)
- Persona mix selector (balanced, price-sensitive, mobile-heavy, skeptical)
- "Run Scan" button → starts analysis, redirects to scanning progress view
- Recent scan history (last 3)

### 3e. History (`app/dashboard/history/page.tsx`)
- Timeline view of all scans
- Each entry: date, score, change, status, store URL
- Click to expand → shows score breakdown (friction/trust/clarity/mobile)
- Score trend chart (Recharts line chart over time)

### 3f. Ghost Personas / Insights (`app/dashboard/insights/page.tsx`)
**Phase A (Report-style — built now):**
- Persona cards from latest test:
  - Name, demographics, avatar/icon
  - Verdict: "Would Purchase" (green) or "Would Abandon" (red)
  - Reasoning text
  - Abandon point (if abandoned)
- Funnel visualization (Recharts): Landed → Cart → Checkout → Purchased
- Recommendations list ordered by priority with effort badges

**Phase B (Live simulation — future enhancement):**
- Animated persona avatars browsing store
- Real-time commentary stream
- Click-through heatmap visualization

**Verification:** Dashboard loads real data from Supabase, issues are clickable, scanner triggers real API calls.

---

## Phase 4: Settings & Integrations

### 4a. Settings Shell (`app/dashboard/settings/page.tsx`)
- Tab navigation: Profile | Billing | Integrations | Notifications

### 4b. Profile Tab
- Name, email, company, phone fields
- Monthly revenue goal input
- Technical contact email
- Save button → updates `profiles` table

### 4c. Billing Tab
- Current plan display (Free/Starter/Growth/Scale)
- Usage meter (tests used / limit)
- Plan comparison cards
- Upgrade button → `/api/shopify/billing/create`
- Cancel button → `/api/shopify/billing/cancel`

### 4d. Integrations Tab
- **Shopify:** Connected store display, disconnect option
- **Google Analytics 4:** Connect button → OAuth flow, property selector modal, status display, disconnect
- Connection status badges (connected/disconnected)

### 4e. Notifications Tab
- Email notification preferences
- Slack alerts toggle (if applicable)

**Verification:** Settings save correctly, billing flows work through Shopify, GA4 connects.

---

## Phase 5: Landing Page (Product-Led)

### 5a. Landing Page (`app/page.tsx`)
Product-led approach — show the actual product as the hero.

- **Navbar** — Ghost logo + "Login" + "Get Started" (amber CTA)
- **Hero Section:**
  - Headline: "Your silent CRO engine for Shopify"
  - Subheadline: Brief value prop
  - **Live product preview** — An interactive/animated mockup of the dashboard showing a sample score, floating insight cards with real examples
  - Primary CTA: "Connect Your Store" → signup
  - Secondary: "See how it works"
- **How It Works** — 3-step visual: Connect → Scan → Fix
  - Each step has an animated product screenshot/mockup
- **Feature Showcase** — 3-4 cards:
  - AI Theme Analysis
  - Ghost Persona Testing
  - Production-Ready Code Fixes
  - Industry Benchmarks
- **Social Proof** — Metrics bar (stores optimized, GMV analyzed, avg score improvement)
- **Pricing** — 3 plan cards (Starter/Growth/Scale) with feature comparison
- **Final CTA** — "Start your free scan" with trust badges
- **Footer** — Links, legal, contact

**Verification:** Landing page looks premium, CTAs navigate correctly, responsive on mobile.

---

## Phase 6: Polish & Mobile

### 6a. Responsive Refinement
- Mobile sidebar → bottom tab navigation
- Stacked layouts on small screens
- Touch-friendly tap targets
- Optimized card layouts for mobile

### 6b. Animation Polish
- Page transitions (Framer Motion layout animations)
- Staggered list rendering for issues, personas, activity
- Score gauge animation on mount
- Skeleton loading states on every data-dependent view
- Toast notifications for actions (scan started, issue fixed, settings saved)

### 6c. Error States & Edge Cases
- Network error handling with retry
- Empty states for: no scans yet, no issues, no GA4, no billing
- 404 page
- Auth session expiry handling

---

## Files That Do NOT Get Touched
```
app/api/**/*           # All 29 API routes
lib/**/*               # Analysis engine, Shopify client, Supabase clients, security, utils
scripts/**/*           # Database migrations
config/**/*            # Proxy config
next.config.mjs        # Next.js config
tsconfig.json          # TypeScript config
postcss.config.mjs     # PostCSS config
package.json           # Dependencies (no new deps needed)
.env*                  # Environment variables
```

## Files That Get Rebuilt
```
app/globals.css                    # Design tokens + global styles
app/page.tsx                       # Landing page
app/layout.tsx                     # Root layout
app/login/page.tsx                 # Login
app/signup/page.tsx                # Signup
app/onboarding/layout.tsx          # Onboarding layout
app/onboarding/page.tsx            # Onboarding root
app/onboarding/connect/page.tsx    # Store connection
app/onboarding/scanning/page.tsx   # Scan progress
app/onboarding/results/page.tsx    # First results
app/dashboard/layout.tsx           # Dashboard layout (preserve auth logic)
app/dashboard/page.tsx             # Dashboard home
app/dashboard/scanner/page.tsx     # Scanner
app/dashboard/issues/page.tsx      # Issues list
app/dashboard/issues/[id]/page.tsx # Issue detail
app/dashboard/history/page.tsx     # Scan history
app/dashboard/insights/page.tsx    # Personas & recommendations
app/dashboard/settings/page.tsx    # Settings
app/dashboard/test/[id]/page.tsx   # Test detail
app/dashboard/onboarding/page.tsx  # Post-connect config
components/**/*                    # All components rebuilt
styles/tokens/**/*                 # Design token files
```

## Hooks (Preserved + Extended)
```
hooks/use-latest-test.ts      # Keep as-is
hooks/use-test-history.ts     # Keep as-is
hooks/use-test-result.ts      # Keep as-is
hooks/use-store-analysis.ts   # Keep as-is
hooks/use-auth-user-id.ts     # Keep as-is
hooks/use-subscription.ts     # NEW: fetch billing/plan data
hooks/use-store.ts            # NEW: fetch connected store info
```

---

## Implementation Order Summary
1. **Foundation** → Design tokens, base UI components, layout shell
2. **Auth + Onboarding** → Login, signup, 3-step onboarding
3. **Dashboard Core** → Home, issues list, issue detail, scanner
4. **Dashboard Extended** → History, insights/personas, test detail
5. **Settings** → Profile, billing, integrations, notifications
6. **Landing Page** → Product-led marketing page
7. **Polish** → Mobile, animations, error states, empty states

# Ghost CRO Navigation Audit Report

**Generated:** 2026-02-01
**Branch:** `claude/audit-dashboard-navigation-oihid`

## PHASE 1: Canonical Dashboard

**Canonical dashboard location:** `app/dashboard/page.tsx`
**Last modified:** Commit `2952445` - "Wire dashboard and onboarding to latest test data"
**Deprecated versions:** None - this is the single canonical implementation

The dashboard uses a server-side layout (`app/dashboard/layout.tsx`) with auth checking that redirects to `/login` in production if not authenticated.

---

## PHASE 2: Dashboard Component Inventory

| Component | Location | Purpose | Has Real Data? | Has Click Actions? |
|-----------|----------|---------|----------------|-------------------|
| ScoreHeroCard | `components/dashboard/score-hero-card.tsx` | Display store health score with gauge | Yes (from `useLatestTest`) | Not clickable |
| StatCard (x4) | `components/ui/stat-card.tsx` | Show key metrics (Revenue, Issues, Tests, Speed) | Partial (some hardcoded) | Not clickable |
| InsightsPanel | `components/dashboard/insights-panel.tsx` | List AI insights/issues | Yes | "View all" links, "Fix" button not wired |
| ActivityFeed | `components/dashboard/activity-feed.tsx` | Recent activity timeline | Hardcoded mock data | "View log" links to `/dashboard/history` |
| BenchmarkSection | `components/dashboard/benchmark-section.tsx` | Industry comparison | Partial (AOV, RPV hardcoded to 0) | Not clickable |
| Sidebar | `components/dashboard/sidebar.tsx` | Navigation | Hardcoded store data, email | Nav links work, "Upgrade" not wired |
| DashboardHeader | `components/dashboard/header.tsx` | Page header with actions | Hardcoded "lastScan" | Refresh, Search, Bell not wired |

### Data Sources

| Component | Data Source | Loading State? | Error State? | Empty State? |
|-----------|-------------|----------------|--------------|--------------|
| Dashboard Page | `useLatestTest(userId)` → Supabase `tests` table | Yes (Skeleton) | No | Yes (EmptyState) |
| Issues Page | `useLatestTest(userId)` → Supabase `tests` table | Yes | No | Yes |
| Issue Detail | `useLatestTest(userId)` + filter by ID | Yes | No | Yes |
| Settings Page | Server-side Supabase queries | N/A (server) | No | Displays "Not connected" |

---

## PHASE 3: Navigation Click Paths

### Sidebar Navigation

| Element | Route | Status |
|---------|-------|--------|
| Dashboard | `/dashboard` | Works |
| Scanner | `/dashboard/scanner` | Works (UI only) |
| Issues | `/dashboard/issues` | Works |
| Experiments | `/dashboard/experiments` | Works (mock data) |
| Insights | `/dashboard/insights` | Works (mock data) |
| Settings | `/dashboard/settings` | Works |
| Logo → Dashboard | `/dashboard` | Works |
| Upgrade button | None | Not wired |
| Store Selector | None | Not functional (select hidden) |
| User profile area | None | Not clickable |

### Header Actions

| Element | Action | Status |
|---------|--------|--------|
| Refresh (RefreshCw) icon | None | Not wired |
| Search button | None | Not wired (shows ⌘K but no handler) |
| Bell (notifications) | None | Not wired |

### Dashboard Click-Throughs

**Score Hero Card:**
- Not clickable (display only)

**Stats Grid Items:**
- Not clickable (display only)

**Insights Panel:**
- "View all {n} →" → `/dashboard/issues` (works)
- "Fix →" button on issues → No navigation wired, just renders a button

**Activity Feed:**
- "View log →" → `/dashboard/history` (works)
- Individual activity items not clickable

### Issues Page (`/dashboard/issues`)

| Element | Action | Status |
|---------|--------|--------|
| Individual issue row | "View details" → `/dashboard/issues/[id]` | Works |
| Search input | None | Not wired (no onChange handler) |
| Sort dropdown | None | Not wired |
| Filter buttons | None | Not wired (display only) |
| "Export report" | None | Not wired |
| Checkbox selection | Local state only | No bulk actions |

### Issue Detail Page (`/dashboard/issues/[id]`)

| Element | Action | Status |
|---------|--------|--------|
| "Copy" code snippet | Clipboard API | Works |
| "Mark as Fixed" | `PATCH /api/issues/${id}/status` | Works |
| Back to issues link | `/dashboard/issues` | Works |

### Scanner Page (`/dashboard/scanner`)

| Element | Action | Status |
|---------|--------|--------|
| "Trigger new scan" | None | Not wired (no onClick) |
| Scan config checkboxes | Local state only | No persistence |
| Schedule dropdown | Local state only | No persistence |
| Scan history items | None | Not clickable (hardcoded mock data) |

### Settings Page (`/dashboard/settings`)

| Tab | Content | Status |
|-----|---------|--------|
| Integrations | Shows Shopify/GA4/Slack/Flow cards | Displays connection status |
| Integrations → Connect Shopify | `/dashboard/test-shopify` | **404 (page doesn't exist)** |
| Integrations → Connect GA4 | `/api/auth/google-analytics` | Works (OAuth) |
| Integrations → Connect Slack | None | Not wired |
| Notifications | `notifications-tab.tsx` | Exists |
| Billing → Upgrade | `/pricing` | **404 (page doesn't exist)** |
| General/Team tabs | Placeholder text | Not implemented |

---

## PHASE 4: Data Flow Issues

### Hardcoded/Mock Data

1. **ActivityFeed** (`dashboard/page.tsx:24-43`): Hardcoded activities array
2. **Scanner history** (`scanner/page.tsx:9-13`): Hardcoded scan history
3. **History page** (`history/page.tsx:6-10`): Hardcoded log entries
4. **Insights page** (`insights/page.tsx:8-21`): Hardcoded insights array
5. **Experiments page** (`experiments/page.tsx:8-21`): Hardcoded experiments array
6. **Sidebar stores** (`sidebar.tsx:36-39`): Hardcoded store list
7. **Sidebar user** (`sidebar.tsx:104`): Hardcoded email "alex@ghostcro.ai"
8. **Dashboard header** (`layout.tsx:37`): Hardcoded "lastScan" as "2 hours ago"
9. **StatCard "Active Tests"** (`page.tsx:156-160`): Hardcoded to "1"

### Display Issues

1. **BenchmarkSection** (`page.tsx:183-192`): `aov` and `revenuePerVisitor` are hardcoded to `0`
2. **ScoreHeroCard**: Displays "Your store converts X% below top performers" — this might be confusing when score is high

---

## PHASE 5: Backend Features Without UI

| API Route | Purpose | Called From Frontend? | Notes |
|-----------|---------|----------------------|-------|
| `/api/shopify/billing/create` | Create Shopify billing | No | Backend ready, needs upgrade button |
| `/api/shopify/billing/callback` | Billing OAuth callback | N/A | |
| `/api/shopify/billing/cancel` | Cancel subscription | No | No cancel UI |
| `/api/shopify/billing/status` | Check billing status | No | |
| `/api/shopify/sandbox/deploy` | Deploy theme sandbox | No | |
| `/api/shopify/theme/publish` | Publish theme changes | No | |
| `/api/shopify/metrics` | Fetch Shopify metrics | No | |
| `/api/shopify/checkouts` | Fetch checkout data | No | |
| `/api/shopify/shipping` | Shipping rates | No | |
| `/api/shopify/auto-discover` | Auto-discover stores | No | |
| `/api/analytics/ga4/properties` | List GA4 properties | No | |
| `/api/analytics/ga4/disconnect` | Disconnect GA4 | No | |
| `/api/cron/weekly-scan` | Scheduled scanning | N/A | Cron job |
| `/api/analyze` | Trigger analysis | Indirect | Only via onboarding flow |

**Actively Used Routes:**
- `/api/auth/shopify/initiate` (onboarding connect)
- `/api/auth/shopify/callback` (OAuth callback)
- `/api/auth/google-analytics` (settings integrations)
- `/api/analyze/[id]/status` (onboarding scanning poll)
- `/api/issues/[id]/status` (mark as fixed)
- `/api/crm/sync` (onboarding + auth callback)

---

## PHASE 6: Navigation Map

```
Landing (/)
  ├── [Log in] → /login ✅
  ├── [Start Optimizing] → /signup ✅
  └── [#features, #how-it-works, #pricing] → Anchor links (no pages)

Auth
  ├── /login → Dashboard on success ✅
  └── /signup → Dashboard on success ✅

Onboarding Flow (separate from dashboard)
  /onboarding → redirects to /onboarding/connect ✅
  └── /onboarding/connect
        └── [Connect Store] → /api/auth/shopify/initiate ✅
              └── [OAuth Success] → /onboarding/scanning?testId=X ✅
                    └── [Analysis Complete] → /onboarding/results?testId=X ✅
                          ├── [Start Free Trial] → ❌ Not wired
                          └── [Continue with limited access] → ❌ Not wired

Dashboard (/dashboard)
  ├── Sidebar Nav
  │   ├── Dashboard → /dashboard ✅
  │   ├── Scanner → /dashboard/scanner ✅
  │   ├── Issues → /dashboard/issues ✅
  │   │   └── [View Details] → /dashboard/issues/[id] ✅
  │   │         └── [Mark as Fixed] → /api/issues/[id]/status ✅
  │   ├── Experiments → /dashboard/experiments ✅ (mock data)
  │   ├── Insights → /dashboard/insights ✅ (mock data)
  │   ├── Settings → /dashboard/settings ✅
  │   │   ├── Integrations ✅
  │   │   │   ├── Connect Shopify → /dashboard/test-shopify ❌ 404
  │   │   │   ├── Connect GA4 → /api/auth/google-analytics ✅
  │   │   │   └── Connect Slack → ❌ Not wired
  │   │   ├── Billing → Upgrade → /pricing ❌ 404
  │   │   ├── General → 🔲 Placeholder
  │   │   └── Team → 🔲 Placeholder
  │   └── Upgrade (sidebar bottom) → ❌ Not wired
  │
  ├── Dashboard in-dashboard onboarding
  │   └── /dashboard/onboarding → Config flow → /dashboard ✅
  │
  ├── Activity Feed
  │   └── [View log] → /dashboard/history ✅ (mock data)
  │
  ├── Insights Panel
  │   └── [View all] → /dashboard/issues ✅
  │
  └── Legacy Routes
      └── /dashboard/run-test → /ghost#simulation ❌ 404
```

---

## PHASE 7: Prioritized Fix List

### 🔴 Critical: Broken Paths (User clicks, gets error)

1. **Settings → Connect Shopify → 404**
   - Symptom: Button navigates to `/dashboard/test-shopify` which doesn't exist
   - Fix: Change route in `integrations-tab.tsx:21` to `/api/auth/shopify/initiate` or `/onboarding/connect`
   - File: `components/dashboard/settings/integrations-tab.tsx:21`

2. **Settings → Billing → Upgrade → 404**
   - Symptom: Button navigates to `/pricing` which doesn't exist
   - Fix: Create `/pricing` page or redirect to Shopify billing API
   - File: `components/dashboard/settings/billing-tab.tsx:60`

3. **Dashboard → Run Test redirect → 404**
   - Symptom: `/dashboard/run-test` redirects to `/ghost#simulation` which doesn't exist
   - Fix: Update redirect to `/dashboard/scanner` or remove route
   - File: `app/dashboard/run-test/page.tsx:5`

### 🟡 Important: Dead Ends (UI exists, not wired up)

1. **Scanner → "Trigger new scan" button**
   - Current: Button renders but no onClick handler
   - Needs: Wire to `/api/analyze` with user's store
   - File: `app/dashboard/scanner/page.tsx:25-28`

2. **Sidebar → Upgrade button**
   - Current: Button renders but no onClick
   - Needs: Wire to `/api/shopify/billing/create`
   - File: `components/dashboard/sidebar.tsx:95-97`

3. **Header → Refresh, Search, Notifications**
   - Current: Buttons render but no handlers
   - Needs: Refresh → trigger re-scan, Search → open search modal, Bell → notifications panel
   - File: `components/dashboard/header.tsx:28-49`

4. **Insights Panel → "Fix →" buttons**
   - Current: Button renders, no navigation
   - Needs: Link to `/dashboard/issues/[id]`
   - File: `components/dashboard/insights-panel.tsx:102-104`

5. **Issues page → Search, Filters, Sort, Export**
   - Current: UI elements render but no functionality
   - Needs: Wire to filter/search logic
   - File: `app/dashboard/issues/page.tsx:107-135`

6. **Store Selector**
   - Current: Renders hardcoded stores, select is hidden/non-functional
   - Needs: Fetch real stores, implement switching
   - File: `components/dashboard/store-selector.tsx`

7. **Onboarding Results → CTAs**
   - Current: "Start Free Trial" and "Continue with limited access" have no handlers
   - Needs: Wire to billing/dashboard navigation
   - File: `app/onboarding/results/page.tsx:134-142`

### 🟢 Enhancement: Missing UI for Ready Backend

1. **Billing Management**
   - Backend: `/api/shopify/billing/create`, `/cancel`, `/status`
   - Needs: Wire sidebar "Upgrade" button, add "Manage subscription" in billing tab
   - Suggested: Add in billing-tab.tsx

2. **GA4 Property Selection**
   - Backend: `/api/analytics/ga4/properties`
   - Needs: After GA4 OAuth, show property picker
   - Suggested: Add modal in integrations-tab

3. **Theme Sandbox Deploy**
   - Backend: `/api/shopify/sandbox/deploy`, `/api/shopify/theme/publish`
   - Needs: UI for previewing/applying fixes
   - Suggested: Add to issue detail page

4. **Disconnect Integrations**
   - Backend: `/api/analytics/ga4/disconnect`
   - Needs: "Disconnect" button on integration cards
   - Suggested: Add to integrations-tab

### ⚪ Future: Not Started

1. **Pricing Page** (`/pricing`)
   - Per billing-tab: Needed for upgrade flow
   - Priority: High (blocks billing)

2. **General Settings Tab**
   - Profile management, password change
   - Priority: Medium

3. **Team Settings Tab**
   - Multi-user support
   - Priority: Low (Enterprise feature)

4. **Slack Integration**
   - OAuth flow + webhook setup
   - Priority: Medium

5. **Notifications System**
   - In-app notifications panel
   - Priority: Medium

6. **Real Activity Feed Data**
   - Replace mock data with actual scan/fix history
   - Priority: Medium

7. **Search Functionality**
   - Global search (⌘K)
   - Priority: Low

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Sidebar routes working | 6/6 |
| Critical broken paths | 3 |
| Unwired UI elements | 7 |
| Backend ready, needs UI | 4 |
| Not started | 7 |
| Hardcoded mock data instances | 9 |
| API routes total | 26 |
| API routes actively used | 6 |
| API routes orphaned | ~15 |

---

## Key Files Reference

### Dashboard Core
- `app/dashboard/page.tsx` - Main dashboard
- `app/dashboard/layout.tsx` - Layout with auth + sidebar
- `components/dashboard/sidebar.tsx` - Navigation sidebar
- `components/dashboard/header.tsx` - Page header

### Dashboard Components
- `components/dashboard/score-hero-card.tsx`
- `components/dashboard/insights-panel.tsx`
- `components/dashboard/activity-feed.tsx`
- `components/dashboard/benchmark-section.tsx`

### Data Hooks
- `hooks/use-latest-test.ts` - Fetches latest test from Supabase
- `hooks/use-auth-user-id.ts` - Gets current user ID
- `hooks/use-test-result.ts` - Fetches specific test by ID

### Settings
- `components/dashboard/settings/settings-content.tsx`
- `components/dashboard/settings/integrations-tab.tsx`
- `components/dashboard/settings/billing-tab.tsx`
- `components/dashboard/settings/notifications-tab.tsx`

### Onboarding Flow
- `app/onboarding/connect/page.tsx`
- `app/onboarding/scanning/page.tsx`
- `app/onboarding/results/page.tsx`
- `app/dashboard/onboarding/page.tsx` (in-dashboard config)

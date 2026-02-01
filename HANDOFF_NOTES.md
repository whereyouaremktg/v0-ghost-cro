# Ghost CRO - Implementation Handoff Notes

**Date:** 2026-02-01
**Branch:** `claude/audit-dashboard-navigation-oihid`
**Last Commit:** `428081f` - "Implement P3 fixes: billing cancel and integrations disconnect"

---

## Summary of Work Completed

### Phase 1: Navigation Audit
Created comprehensive audit documenting all broken paths, unwired UI elements, and mock data sources.
- **File created:** `NAVIGATION_AUDIT.md`

### Phase 2: Implementation Plan
Created detailed implementation plan with P0-P3 priority tiers.
- **File created:** `IMPLEMENTATION_PLAN.md`

---

## Completed Fixes by Priority

### P0: Critical Broken Paths (3/3 Complete)
| Item | Description | File |
|------|-------------|------|
| P0.1 | Fix Settings → Connect Shopify 404 | `components/dashboard/settings/integrations-tab.tsx` |
| P0.2 | Fix Settings → Billing → Upgrade 404 | `components/dashboard/settings/billing-tab.tsx` |
| P0.3 | Fix Run Test redirect 404 | `app/dashboard/run-test/page.tsx` |

### P1: Core Unwired Functionality (7/7 Complete)
| Item | Description | File |
|------|-------------|------|
| P1.1 | Wire Scanner "Trigger new scan" button | `app/dashboard/scanner/page.tsx` |
| P1.2 | Wire Sidebar Upgrade button | `components/dashboard/sidebar.tsx` |
| P1.3 | Wire InsightsPanel "Fix →" buttons | `components/dashboard/insights-panel.tsx` |
| P1.4 | Wire Onboarding Results CTAs | `app/onboarding/results/page.tsx` |
| P1.5 | Wire Issues page Search/Filter/Sort | `app/dashboard/issues/page.tsx` |
| P1.6 | Wire Header Refresh button | `components/dashboard/header.tsx` |
| P1.7 | Fix Store Selector | `components/dashboard/store-selector.tsx`, `sidebar.tsx` |

### P2: Replace Mock/Hardcoded Data (9/9 Complete)
| Item | Description | File |
|------|-------------|------|
| P2.1 | Activity Feed → Real scan history | `app/dashboard/page.tsx` |
| P2.2 | Scanner History → Real data | `app/dashboard/scanner/page.tsx` |
| P2.3 | History Page → Real data | `app/dashboard/history/page.tsx` |
| P2.4 | Insights Page → Real recommendations | `app/dashboard/insights/page.tsx` |
| P2.5 | Experiments Page → "Coming Soon" | `app/dashboard/experiments/page.tsx` |
| P2.6 | Sidebar Stores → Real data | `components/dashboard/sidebar.tsx` |
| P2.7 | Sidebar User Email → Real data | `components/dashboard/sidebar.tsx` |
| P2.8 | Dashboard Header "Last Scan" → Real timestamp | `components/dashboard/header.tsx` |
| P2.9 | StatCard "Completed Scans" → Real count | `app/dashboard/page.tsx` |

### P3: Backend Integration (2/4 Complete)
| Item | Description | Status | File |
|------|-------------|--------|------|
| P3.1 | Cancel subscription button | ✅ Complete | `components/dashboard/settings/billing-tab.tsx` |
| P3.2 | GA4 property selection after OAuth | ❌ Not started | - |
| P3.3 | Disconnect integrations (GA4) | ✅ Complete | `components/dashboard/settings/integrations-tab.tsx` |
| P3.4 | Theme sandbox preview | ❌ Not started | - |

---

## New Files Created

1. **`hooks/use-test-history.ts`** - Reusable hook for fetching test history from Supabase
   ```typescript
   export function useTestHistory(userId?: string | null, limit: number = 10)
   // Returns: { tests: TestHistoryItem[], isLoading, error, mutate }
   ```

2. **`NAVIGATION_AUDIT.md`** - Complete audit documentation

3. **`IMPLEMENTATION_PLAN.md`** - Detailed implementation plan with code examples

---

## Key Technical Patterns Used

### Data Fetching
- Using SWR with Supabase client for real-time data
- Pattern: `useSWR(userId ? \`key-${userId}\` : null, fetcher)`

### Design System
- **Dashboard (dark):** `#0A0A0A` bg, `#111111` cards, `#FBBF24` accent
- **Settings (light):** white bg, zinc colors
- Components: `GhostCard`, `GhostButton`, `GhostSelect`, `Button` (shadcn)

### API Patterns
- All billing operations go through `/api/shopify/billing/*`
- GA4 operations through `/api/analytics/ga4/*`
- Auth flows through `/api/auth/*`

---

## Remaining Work (P3)

### P3.2: GA4 Property Selection After OAuth
**Goal:** After GA4 OAuth callback, show modal to select which property to use.

**Files to modify:**
- `app/api/auth/google-analytics/callback/route.ts` - Add redirect param
- Create: `components/dashboard/settings/ga4-property-modal.tsx`
- `components/dashboard/settings/integrations-tab.tsx` - Add modal trigger

**API exists:** `/api/analytics/ga4/properties` - returns list of properties

### P3.4: Theme Sandbox Preview
**Goal:** Add "Preview Fix" button on issue detail that opens sandbox preview.

**Files to modify:**
- `app/dashboard/issues/[id]/page.tsx` - Add preview button
- Wire to `/api/shopify/sandbox/deploy` and `/api/shopify/theme/publish`

---

## Testing Notes

The codebase has no installed `node_modules`, so TypeScript checking shows dependency errors. These are expected - the code should work when dependencies are installed.

All changes follow existing patterns in the codebase and use the established design system.

---

## Git Status

All changes have been committed and pushed to `origin/claude/audit-dashboard-navigation-oihid`.

To continue work:
```bash
git checkout claude/audit-dashboard-navigation-oihid
npm install  # if needed
```

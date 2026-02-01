# Ghost CRO Implementation Plan

**Based on Navigation Audit - 2026-02-01**

---

## Design System Reference

### Dashboard (Dark Theme)
```
Background: #0A0A0A (darkest), #111111 (cards), #161616 (hover)
Borders: #1F1F1F, #2A2A2A (hover)
Text: white (primary), #9CA3AF (secondary), #6B7280 (muted)
Accent: #FBBF24 (amber), #F59E0B (amber hover)
Components: GhostCard, GhostButton, GhostSelect
```

### Settings (Light Theme - inside settings shell)
```
Background: white, zinc-50/50
Borders: zinc-200, zinc-100
Text: zinc-900 (primary), zinc-500 (secondary)
Components: Button (shadcn)
```

---

## Priority Tiers

| Tier | Criteria | Timeline |
|------|----------|----------|
| P0 | Broken paths causing 404 errors | Immediate |
| P1 | Core functionality not wired (blocks user flow) | High |
| P2 | Missing real data (displays mock/hardcoded) | Medium |
| P3 | Enhancement features (nice to have) | Low |

---

## P0: Critical Broken Paths (3 items)

### P0.1: Fix Settings → Connect Shopify 404

**Problem:** Button navigates to `/dashboard/test-shopify` which doesn't exist

**Solution:** Redirect to the existing onboarding flow

**File:** `components/dashboard/settings/integrations-tab.tsx`

**Change:**
```tsx
// Line 21: Change from
router.push("/dashboard/test-shopify")

// To
window.location.href = "/api/auth/shopify/initiate"
```

**Testing:**
- [ ] Click "Connect Store" in Settings → Integrations
- [ ] Should redirect to Shopify OAuth
- [ ] After OAuth, should redirect back to dashboard

---

### P0.2: Fix Settings → Billing → Upgrade 404

**Problem:** Button navigates to `/pricing` which doesn't exist

**Solution:** Wire to Shopify billing API directly

**File:** `components/dashboard/settings/billing-tab.tsx`

**Change:**
```tsx
// Line 60: Change from
onClick={() => router.push('/pricing')}

// To
onClick={async () => {
  try {
    const response = await fetch('/api/shopify/billing/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro' })
    })
    const data = await response.json()
    if (data.confirmationUrl) {
      window.location.href = data.confirmationUrl
    }
  } catch (error) {
    console.error('Failed to initiate billing', error)
  }
}}
```

**Testing:**
- [ ] Click "Upgrade Plan" in Settings → Billing
- [ ] Should redirect to Shopify billing confirmation
- [ ] After confirmation, should redirect back with active subscription

---

### P0.3: Fix Run Test Redirect 404

**Problem:** `/dashboard/run-test` redirects to `/ghost#simulation` which doesn't exist

**Solution:** Redirect to scanner page instead

**File:** `app/dashboard/run-test/page.tsx`

**Change:**
```tsx
// Change redirect from
redirect("/ghost#simulation")

// To
redirect("/dashboard/scanner")
```

**Testing:**
- [ ] Navigate to `/dashboard/run-test`
- [ ] Should redirect to `/dashboard/scanner`

---

## P1: Core Unwired Functionality (7 items)

### P1.1: Wire Scanner "Trigger new scan" Button

**Problem:** Button exists but has no onClick handler

**Files:**
- `app/dashboard/scanner/page.tsx`
- Create: `hooks/use-trigger-scan.ts` (optional, can inline)

**Implementation:**

```tsx
// app/dashboard/scanner/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Scan, Loader2 } from "lucide-react"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { GhostSelect } from "@/components/ui/ghost-select"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"

export default function ScannerPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const { test, mutate } = useLatestTest(userId)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get scan history from actual tests (will need new hook)
  const history = test ? [
    { id: test.id, date: new Date(test.created_at).toLocaleString(), status: "Completed", score: test.score }
  ] : []

  const handleTriggerScan = async () => {
    if (!userId) {
      setError("Please log in to run a scan")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (!response.ok) {
        throw new Error('Failed to start scan')
      }

      const data = await response.json()

      // Redirect to scanning page to show progress
      router.push(`/onboarding/scanning?testId=${data.testId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scan')
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <GhostCard className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Scanner</h2>
          <p className="text-sm text-[#9CA3AF]">
            Run a new scan to detect conversion leaks and performance issues.
          </p>
          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}
        </div>
        <GhostButton onClick={handleTriggerScan} disabled={isScanning}>
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scan className="h-4 w-4" />
          )}
          {isScanning ? "Scanning..." : "Trigger new scan"}
        </GhostButton>
      </GhostCard>
      {/* ... rest of component */}
    </div>
  )
}
```

**Testing:**
- [ ] Click "Trigger new scan"
- [ ] Should show loading state
- [ ] Should redirect to scanning progress page
- [ ] After completion, should show new results

---

### P1.2: Wire Sidebar Upgrade Button

**Problem:** Button renders but no onClick handler

**File:** `components/dashboard/sidebar.tsx`

**Implementation:**

```tsx
// Add state and handler
const [isUpgrading, setIsUpgrading] = useState(false)

const handleUpgrade = async () => {
  setIsUpgrading(true)
  try {
    const response = await fetch('/api/shopify/billing/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro' })
    })
    const data = await response.json()
    if (data.confirmationUrl) {
      window.location.href = data.confirmationUrl
    }
  } catch (error) {
    console.error('Failed to initiate upgrade', error)
  } finally {
    setIsUpgrading(false)
  }
}

// Update button (line 95-97)
<GhostButton size="sm" className="w-full" onClick={handleUpgrade} disabled={isUpgrading}>
  {isUpgrading ? "Processing..." : "Upgrade"}
</GhostButton>
```

**Testing:**
- [ ] Click "Upgrade" in sidebar
- [ ] Should redirect to Shopify billing

---

### P1.3: Wire InsightsPanel "Fix →" Buttons

**Problem:** Buttons render but don't navigate to issue detail

**File:** `components/dashboard/insights-panel.tsx`

**Implementation:**

```tsx
// Line 102-104: Change from
<GhostButton variant="ghost" size="sm">
  Fix →
</GhostButton>

// To
<GhostButton
  variant="ghost"
  size="sm"
  asChild
>
  <Link href={`/dashboard/issues/${issue.id}`}>
    Fix →
  </Link>
</GhostButton>
```

**Testing:**
- [ ] Click "Fix →" on any insight
- [ ] Should navigate to `/dashboard/issues/[id]`
- [ ] Issue detail page should load correctly

---

### P1.4: Wire Onboarding Results CTAs

**Problem:** "Start Free Trial" and "Continue with limited access" have no handlers

**File:** `app/onboarding/results/page.tsx`

**Implementation:**

```tsx
// Line 134: Wire "Start Free Trial"
<GhostButton
  className="px-6"
  onClick={async () => {
    const response = await fetch('/api/shopify/billing/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'pro' })
    })
    const data = await response.json()
    if (data.confirmationUrl) {
      window.location.href = data.confirmationUrl
    }
  }}
>
  Start Free Trial →
</GhostButton>

// Line 139-141: Wire "Continue with limited access"
<button
  className="text-[#6B7280] hover:text-[#9CA3AF] text-sm"
  onClick={() => router.push('/dashboard')}
>
  Continue with limited access →
</button>
```

**Testing:**
- [ ] Complete onboarding flow
- [ ] Click "Start Free Trial" → should redirect to billing
- [ ] Click "Continue with limited access" → should go to dashboard

---

### P1.5: Wire Issues Page Search/Filter/Sort

**Problem:** UI elements exist but don't function

**File:** `app/dashboard/issues/page.tsx`

**Implementation:** Add local state filtering (can upgrade to URL params later)

```tsx
// Add state at top of component
const [searchQuery, setSearchQuery] = useState("")
const [severityFilter, setSeverityFilter] = useState<string | null>(null)
const [sortBy, setSortBy] = useState<"severity" | "impact">("severity")

// Filter issues
const filteredIssues = useMemo(() => {
  let result = allIssues

  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    result = result.filter(issue =>
      issue.title.toLowerCase().includes(query) ||
      issue.fix?.toLowerCase().includes(query)
    )
  }

  if (severityFilter) {
    result = result.filter(issue => issue.severity === severityFilter)
  }

  // Sort
  result.sort((a, b) => {
    if (sortBy === "severity") {
      const order = { critical: 0, high: 1, medium: 2 }
      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
    }
    return (b.potentialImpact ?? 0) - (a.potentialImpact ?? 0)
  })

  return result
}, [allIssues, searchQuery, severityFilter, sortBy])

// Wire up inputs
<input
  type="text"
  placeholder="Search issues..."
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="..."
/>
```

**Testing:**
- [ ] Type in search box → issues should filter
- [ ] Click severity filter → should filter by severity
- [ ] Change sort → issues should reorder

---

### P1.6: Wire Header Refresh Button

**Problem:** RefreshCw button has no handler

**File:** `components/dashboard/header.tsx`

**Implementation:**

```tsx
// Add to component
const handleRefresh = () => {
  // Trigger a page refresh to re-fetch data
  window.location.reload()
}

// Update button
<button
  className="p-2 rounded-lg hover:bg-[#111111] transition-colors text-[#9CA3AF]"
  onClick={handleRefresh}
  title="Refresh data"
>
  <RefreshCw className="h-4 w-4" />
</button>
```

**Future Enhancement:** Instead of full page reload, add SWR mutate to refresh data in place.

---

### P1.7: Fix Store Selector

**Problem:** Renders hardcoded stores, select hidden

**Files:**
- `components/dashboard/store-selector.tsx`
- `components/dashboard/sidebar.tsx`

**Implementation:**

1. **Fetch real stores** in sidebar:
```tsx
// In sidebar, fetch stores from Supabase
const { data: stores } = useSWR(userId ? `stores-${userId}` : null, async () => {
  const supabase = createClient()
  const { data } = await supabase
    .from('stores')
    .select('id, shop, name')
    .eq('user_id', userId)
    .eq('is_active', true)
  return data || []
})
```

2. **Update StoreSelector** to actually switch stores (store in context/cookie)

**Testing:**
- [ ] Multiple stores should appear in dropdown
- [ ] Selecting a store should update dashboard data

---

## P2: Replace Mock/Hardcoded Data (9 items)

### P2.1: Activity Feed → Real Data

**File:** `app/dashboard/page.tsx` (lines 24-43)

**Implementation:**
- Create `hooks/use-activity-feed.ts` to fetch from `tests` table
- Transform test records into activity items
- Add scan completions, issue fixes as activity types

```tsx
// hooks/use-activity-feed.ts
export function useActivityFeed(userId: string | null) {
  return useSWR(userId ? `activity-${userId}` : null, async () => {
    const supabase = createClient()
    const { data: tests } = await supabase
      .from('tests')
      .select('id, created_at, score, issues_found')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    return tests?.map(test => ({
      id: test.id,
      type: 'scan_complete',
      title: 'Scan completed',
      description: `Found ${test.issues_found} issues. Score: ${test.score}`,
      timestamp: test.created_at,
      icon: 'scan'
    })) || []
  })
}
```

---

### P2.2: Scanner History → Real Data

**File:** `app/dashboard/scanner/page.tsx` (lines 9-13)

**Implementation:** Fetch from `tests` table ordered by date

---

### P2.3: History Page → Real Data

**File:** `app/dashboard/history/page.tsx`

**Implementation:** Use same pattern as scanner history

---

### P2.4: Insights Page → Real Data

**File:** `app/dashboard/insights/page.tsx`

**Implementation:** Pull from latest test's friction points

---

### P2.5: Experiments Page → Real Data

**File:** `app/dashboard/experiments/page.tsx`

**Implementation:** Will need experiments table or mark as "Coming Soon"

---

### P2.6: Sidebar Stores → Real Data

**File:** `components/dashboard/sidebar.tsx` (lines 36-39)

**Implementation:** Covered in P1.7

---

### P2.7: Sidebar User Email → Real Data

**File:** `components/dashboard/sidebar.tsx` (line 107)

**Implementation:**
```tsx
// Fetch user in sidebar
const { userId } = useAuthUserId()
const { data: user } = useSWR(userId ? `user-${userId}` : null, async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Use in template
<p className="text-sm text-white font-medium">
  {user?.email || 'Loading...'}
</p>
```

---

### P2.8: Dashboard Header "Last Scan" → Real Data

**File:** `app/dashboard/layout.tsx` (line 37)

**Implementation:**
- Pass last scan date from dashboard page data
- Or fetch in header component

---

### P2.9: StatCard "Active Tests" → Real Data

**File:** `app/dashboard/page.tsx` (lines 156-160)

**Implementation:** Count from tests table or experiments

---

## P3: Backend Integration (4 items)

### P3.1: Wire Full Billing Flow

**API Routes:**
- `/api/shopify/billing/create` ✅ exists
- `/api/shopify/billing/callback` ✅ exists
- `/api/shopify/billing/cancel` ✅ exists
- `/api/shopify/billing/status` ✅ exists

**Frontend Needs:**
- Upgrade button → create (P1.2 covers this)
- Cancel subscription button in billing tab
- Show subscription status in billing tab

**Implementation for cancel:**
```tsx
// In billing-tab.tsx
const handleCancel = async () => {
  if (!confirm('Are you sure you want to cancel?')) return

  const response = await fetch('/api/shopify/billing/cancel', {
    method: 'POST'
  })

  if (response.ok) {
    // Refresh page to show updated status
    window.location.reload()
  }
}
```

---

### P3.2: GA4 Property Selection After OAuth

**API Route:** `/api/analytics/ga4/properties` ✅ exists

**Frontend Needs:** Modal after OAuth to select property

**Implementation:**
- After GA4 callback redirects back, show property selection modal
- Fetch properties from API
- Save selection to database

---

### P3.3: Disconnect Integrations

**API Route:** `/api/analytics/ga4/disconnect` ✅ exists

**Frontend Needs:** "Disconnect" button on connected integrations

**Implementation:**
```tsx
// In integrations-tab.tsx, add disconnect button
{connections.ga4 && (
  <Button
    variant="ghost"
    size="sm"
    className="text-red-500"
    onClick={async () => {
      await fetch('/api/analytics/ga4/disconnect', { method: 'POST' })
      window.location.reload()
    }}
  >
    Disconnect
  </Button>
)}
```

---

### P3.4: Theme Sandbox Preview

**API Routes:**
- `/api/shopify/sandbox/deploy` ✅ exists
- `/api/shopify/theme/publish` ✅ exists

**Frontend Needs:**
- "Preview Fix" button on issue detail
- Opens sandbox preview in new tab
- "Apply to Live Theme" button

**Suggested Location:** `app/dashboard/issues/[id]/page.tsx`

---

## Implementation Order

### Sprint 1: Fix Broken Paths (P0) - Estimated: 1-2 hours
1. P0.1: Fix Connect Shopify 404
2. P0.2: Fix Upgrade 404
3. P0.3: Fix Run Test 404

### Sprint 2: Core Functionality (P1) - Estimated: 4-6 hours
1. P1.1: Wire Scanner button
2. P1.2: Wire Sidebar Upgrade
3. P1.3: Wire InsightsPanel Fix buttons
4. P1.4: Wire Onboarding CTAs
5. P1.5: Wire Issues Search/Filter
6. P1.6: Wire Header Refresh
7. P1.7: Fix Store Selector

### Sprint 3: Real Data (P2) - Estimated: 3-4 hours
1. P2.1: Activity Feed
2. P2.2: Scanner History
3. P2.7: Sidebar User Email
4. P2.8: Header Last Scan
5. P2.9: Active Tests count

### Sprint 4: Backend Integration (P3) - Estimated: 4-6 hours
1. P3.1: Billing flow completion
2. P3.2: GA4 property selection
3. P3.3: Disconnect integrations

---

## Testing Checklist

### After Sprint 1:
- [ ] All sidebar nav links work (no 404s)
- [ ] Settings → Connect Shopify initiates OAuth
- [ ] Settings → Billing → Upgrade initiates billing
- [ ] `/dashboard/run-test` redirects to scanner

### After Sprint 2:
- [ ] Scanner button triggers analysis
- [ ] Sidebar upgrade initiates billing
- [ ] "Fix →" buttons navigate to issue detail
- [ ] Onboarding CTAs work
- [ ] Issues search/filter work
- [ ] Refresh button reloads data

### After Sprint 3:
- [ ] Activity feed shows real scans
- [ ] Scanner history shows actual scans
- [ ] User email displays correctly
- [ ] "Last scan" shows real timestamp

### After Sprint 4:
- [ ] Full billing upgrade flow works
- [ ] Can cancel subscription
- [ ] GA4 property selection works
- [ ] Can disconnect integrations

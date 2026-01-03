# Ghost CRO - Data Flow Audit

**Created:** 2026-01-03
**Status:** ⚠️ CRITICAL ISSUES FOUND
**Priority:** Fix before GA4/billing features

---

## Executive Summary

The Ghost CRO data pipeline has been mapped end-to-end. Several critical bugs have been identified that cause `NaN` values, function string rendering, and missing simulation percentages in the UI.

### Critical Issues Found:
1. ✅ **Revenue calculations already have defensive checks** - but UI may not handle edge cases
2. ❌ **Function strings rendering** - Missing `()` on `.toLocaleString` calls
3. ❌ **"0% of simulated buyers"** - Threat cards don't receive buyer attribution data properly
4. ⚠️ **Missing format utility** - No centralized formatting with null safety (partially exists)

---

## Complete Data Flow Map

```
[1. USER INPUT]
    Component: components/analyze-form.tsx
    User enters: Store URL
    Validation: Basic .myshopify.com or .com check
    Action: Currently redirects to Stripe (not implemented yet)

[2. API CALL]
    Endpoint: app/api/analyze/route.ts
    Method: POST
    Input: { url: string, personaMix?: string }

    Process:
    a) Scrape URL → ScrapedData object (title, price, images, etc.)
    b) Build prompt → lib/analysis/prompts/store-analysis.ts
    c) Call Claude API (Sonnet 4) → Get StoreAnalysis JSON
    d) Call Claude API again → Get persona simulation + friction points

[3. DATA STORAGE]
    Location: Browser localStorage (lib/client-storage.ts)
    Table: "testResults" key in localStorage
    Schema: TestResult interface (lib/types.ts)

    TestResult structure:
    {
      id: string,
      date: string,
      url: string,
      score: number,
      frictionPoints: {
        critical: FrictionPoint[],
        high: FrictionPoint[],
        medium: FrictionPoint[],
        working: string[]
      },
      personaResults: PersonaResult[],
      recommendations: Recommendation[],
      funnelData: FunnelData,
      storeAnalysis?: StoreAnalysis
    }

[4. DATA RETRIEVAL]
    Page: app/ghost/test/[id]/page.tsx
    Method: getTestResult(id) from client-storage
    Type: Client-side component (uses useEffect)

    Data transformations:
    - Calculate revenue opportunity (lib/calculations/revenue-opportunity.ts)
    - Calculate threat impacts (lib/calculations/threat-impact.ts)
    - Build store snapshot (lib/analysis/build-store-snapshot.ts)
    - Generate Ghost summary (lib/insights/generate-ghost-summary.ts)

[5. UI RENDERING]
    Components chain:
    app/ghost/test/[id]/page.tsx
    ├── StoreSnapshot (components/analysis/store-snapshot.tsx)
    ├── GhostSummary (components/analysis/ghost-summary.tsx)
    ├── RevenueOpportunityDisplay (components/dashboard/revenue-opportunity-display.tsx)
    ├── ThreatCard (inline in page.tsx)
    ├── PersonaCard (inline in page.tsx)
    └── Recovery Plan Table (inline in page.tsx)
```

---

## Data Schema Analysis

### FrictionPoint (from API)
```typescript
{
  id: string,              // Generated: "critical_0", "high_1"
  title: string,           // e.g., "Hidden shipping costs"
  location: string,        // e.g., "Cart page"
  impact: string,          // e.g., "25% abandonment"
  affected: string,        // e.g., "Budget-conscious shoppers"
  fix: string             // e.g., "Show shipping early"
}
```

### Enhanced Threat (in page.tsx)
```typescript
{
  ...frictionPoint,
  severity: "critical" | "high" | "medium",
  estimatedImpact: number,          // For sorting
  impactRange: { min: number, max: number },
  confidence: "high" | "medium" | "low",
  methodology: string,
  buyerAttributionRate: number      // e.g., 0.8 for 80%
}
```

**KEY FINDING:** The `buyerAttributionRate` is calculated on page.tsx lines 1137-1143, but the calculation has a bug!

```typescript
// CURRENT CODE (BUGGY):
const buyersCitingThreat = test.personaResults.filter((p) => {
  const reasoning = p.reasoning?.toLowerCase() || ""
  const threatTitle = threat.title.toLowerCase()
  const threatLocation = threat.location.toLowerCase()
  // Only checks FIRST WORD of title/location - too narrow!
  return reasoning.includes(threatTitle.split(" ")[0]) ||
         reasoning.includes(threatLocation.split(" ")[0])
}).length
```

This is why we see "0% of simulated buyers" - the keyword matching is too strict!

---

## Revenue Calculation Flow

### Input Chain:
```
Shopify Metrics (if connected) OR Defaults
  ↓
monthlyVisitors: 50000 (default)
currentConversionRate: calculated from personaResults
aov: 85 (default)
categoryBenchmarkCR: 0.028 (2.8%)
  ↓
calculateRevenueOpportunity()
  ↓
Returns: {
  currentMonthlyRevenue: number,
  potentialMonthlyRevenue: number,
  monthlyOpportunity: { min, max },
  annualOpportunity: { min, max },
  opportunityPercentage: number,
  benchmarkGap: number
}
```

### Defensive Checks (ALREADY EXISTS):
File: `lib/calculations/revenue-opportunity.ts` lines 38-42
```typescript
const monthlyVisitors = input.monthlyVisitors || 50000
const currentConversionRate = isNaN(input.currentConversionRate) ? 0.025 : (input.currentConversionRate || 0.025)
const aov = input.aov || 85
const categoryBenchmarkCR = input.categoryBenchmarkCR || 0.028
```

**STATUS:** ✅ Revenue calculations are safe. The NaN issue must be in how data is passed to these functions.

---

## Identified Bugs

### BUG #1: Missing `()` on `.toLocaleString` calls

**Location:** Need to grep the entire codebase

**Expected:** `value.toLocaleString()`
**Actual:** `value.toLocaleString` (missing parentheses)
**Result:** Renders as `"function toLocaleString() { [native code] }"`

**Files to check:**
- app/ghost/test/[id]/page.tsx
- components/analysis/*.tsx
- components/dashboard/*.tsx

---

### BUG #2: Buyer Attribution Always 0%

**Location:** app/ghost/test/[id]/page.tsx lines 1137-1143

**Root Cause:** Keyword matching is too strict. Only checks first word of threat title/location.

**Example Failure:**
- Threat title: "Unexpected shipping costs appear late"
- First word: "Unexpected"
- Persona reasoning: "The shipping costs weren't shown upfront, so I abandoned"
- Match: ❌ FAIL (reasoning doesn't include "unexpected", it says "shipping")

**Fix Required:**
```typescript
// BETTER APPROACH:
const buyersCitingThreat = test.personaResults.filter((p) => {
  const reasoning = p.reasoning?.toLowerCase() || ""
  const threatTitle = threat.title.toLowerCase()
  const threatLocation = threat.location.toLowerCase()

  // Extract meaningful keywords (not "the", "a", "an", etc.)
  const titleKeywords = threatTitle
    .split(/\s+/)
    .filter(word => word.length > 3 && !['this', 'that', 'with', 'from'].includes(word))

  const locationKeywords = threatLocation
    .split(/\s+/)
    .filter(word => word.length > 3)

  // Check if reasoning mentions ANY of the keywords
  return titleKeywords.some(kw => reasoning.includes(kw)) ||
         locationKeywords.some(kw => reasoning.includes(kw))
}).length
```

---

### BUG #3: No Centralized Formatting Utility

**Current State:**
- `lib/utils/format.ts` EXISTS with some utilities
- But page.tsx still has inline `.toLocaleString()` calls
- Missing null safety in some places

**Files using formatting:**
- ✅ components/analysis/store-snapshot.tsx (uses format utils)
- ❌ app/ghost/test/[id]/page.tsx (inline formatting)
- ❌ Various other components

**Action Required:**
1. Check if `lib/utils/format.ts` has all needed functions
2. Replace ALL inline `.toLocaleString()` with safe format utils
3. Add null safety to format functions

---

## Data Disconnects

### Issue: Simulation % Not Shown on Threat Cards

**Expected UI:** "40% of simulated buyers cited this issue"
**Actual UI:** "0% of simulated buyers cited this issue"

**Data Path:**
1. Page.tsx calculates `buyersCitingThreat` (buggy logic)
2. Passes to `calculateThreatImpact()`
3. Returns `buyerAttributionRate` (e.g., 0.4 for 40%)
4. Stored in threat object as `threat.buyerAttributionRate`
5. Passed to `ThreatCard` component
6. **BUG:** ThreatCard uses `methodology` prop to show percentage, but methodology string generation might not include it

**ThreatCard receives:**
```typescript
<ThreatCard
  issue={threat}
  severity={threat.severity}
  impactRange={threat.impactRange}
  confidence={threat.confidence}
  methodology={threat.methodology}  // ← Contains the percentage text
  index={index}
  onViewFix={() => scrollToFix(threat.title)}
/>
```

**ThreatCard displays:** (line 674-677)
```typescript
{methodology && (
  <div className="mt-3 p-2 bg-gray-50 border border-gray-100 rounded-lg">
    <p className="text-[10px] text-gray-600 leading-relaxed">{methodology}</p>
  </div>
)}
```

**Methodology is generated in:** `lib/calculations/threat-impact.ts` line 71
```typescript
const methodology = `${attributionPercent}% of simulated buyers cited this issue. Estimated ${crLiftMinPercent}-${crLiftMaxPercent}% conversion rate improvement if fixed.`
```

So methodology SHOULD contain the percentage! The bug is in the `buyersCitingThreat` calculation.

---

## Next Steps (Priority Order)

### Phase 1: Fix Critical Bugs
1. ✅ Create this audit document
2. ⬜ Fix buyer attribution keyword matching (BUG #2)
3. ⬜ Find and fix `.toLocaleString` without `()` (BUG #1)
4. ⬜ Ensure format utils are used everywhere

### Phase 2: Add Console Logging
1. ⬜ Add logs to `/api/analyze/route.ts`
2. ⬜ Add logs to `/ghost/test/[id]/page.tsx`
3. ⬜ Add logs to calculation functions

### Phase 3: Test
1. ⬜ Run a test scan
2. ⬜ Verify revenue displays correctly
3. ⬜ Verify threat cards show buyer percentages
4. ⬜ Verify no function strings render

---

## Files Requiring Changes

### Critical:
- [ ] `app/ghost/test/[id]/page.tsx` - Fix buyer attribution logic (lines 1137-1143)
- [ ] `app/ghost/test/[id]/page.tsx` - Replace inline `.toLocaleString` with format utils
- [ ] Search all files for `.toLocaleString` without `()`

### Nice-to-have:
- [ ] `lib/utils/format.ts` - Ensure all format functions exist and are null-safe
- [ ] `app/api/analyze/route.ts` - Add debug logging
- [ ] `lib/calculations/revenue-opportunity.ts` - Add debug logging

---

## Type Safety Analysis

### Current Types (lib/types.ts):
```typescript
FrictionPoint - Basic threat data from API
PersonaResult - Buyer simulation result
Recommendation - Fix recommendations
TestResult - Complete analysis result
```

### Missing/Inconsistent:
- `FrictionPoint.impact` is a string ("25% abandonment"), but calculations expect numbers
- `PersonaResult.reasoning` is used for attribution but might be too freeform
- No type for enhanced threat (with impactRange, confidence, etc.)

**Recommendation:**
- Keep current types (they work)
- Add `EnhancedThreat` type in page.tsx or separate file
- Document that `FrictionPoint.impact` is human-readable, not for calculations

---

## Performance Notes

- ✅ Uses client-side storage (fast)
- ✅ Calculations happen once on page load
- ⚠️ Page.tsx is 2000+ lines (consider splitting)
- ⚠️ Many inline components (consider extracting)

---

## Conclusion

**Data flow is sound.** The bugs are:
1. Keyword matching logic too strict → 0% attribution
2. Missing `()` on `.toLocaleString` → function strings
3. Some inline formatting instead of using utils → potential NaN display

All issues are fixable without changing the core architecture.

**Estimated fix time:** 1-2 hours

**Risk level:** LOW (isolated bugs, no data pipeline changes needed)

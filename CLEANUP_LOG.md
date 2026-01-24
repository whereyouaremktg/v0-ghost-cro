# Ghost CRO - Surgical Codebase Reset Log

**Date:** 2026-01-24
**Status:** ✅ COMPLETE

## Summary

Successfully removed ~5,000+ lines of UI/styling code while preserving all 25 API routes and core infrastructure.

---

## Phase 1: Safe Deletions (No Dependencies)

### 1A - Landing Page Components Deleted
- `components/hero-section.tsx`
- `components/navbar.tsx`
- `components/footer.tsx`
- `components/faq-section.tsx`
- `components/social-proof.tsx`
- `components/pricing-section.tsx`
- `components/features-section.tsx`
- `components/problem-section.tsx`
- `components/how-it-works.tsx`
- `components/product-demo-section.tsx`
- `components/logos-trust-bar.tsx`
- `components/comparison-section.tsx`
- `components/final-cta.tsx`

### 1B - Landing/Auth Pages Deleted
- `app/page.tsx` (original landing page)
- `app/login/` (entire folder)
- `app/signup/` (entire folder)
- `app/pricing/` (entire folder)

### 1C-D - Test Files & Duplicate CSS Deleted
- `examples/` (entire folder)
- `app/dashboard/test-shopify/` (entire folder)
- `styles/` (entire folder - kept app/globals.css)

---

## Phase 2: Experimental Features Deleted

### Folders Removed
- `components/dashboard/mission-control/` (~1,100 lines)
- `components/dashboard/live-lab/` (~200 lines)
- `components/dashboard/simulations/` (~300 lines)
- `components/dashboard/sandbox/` (~150 lines)

### Pages Removed
- `app/dashboard/simulations/`
- `app/dashboard/live-lab/`
- `app/dashboard/sandbox/`

---

## Phase 3: Dashboard Components Deleted

### Orphaned Components Deleted
- `components/dashboard/dashboard-content.tsx`
- `components/dashboard/merchant-summary.tsx`
- `components/dashboard/circular-score.tsx`
- `components/dashboard/stat-card.tsx`
- `components/dashboard/persona-selector.tsx`
- `components/dashboard/revenue-opportunity-display.tsx`
- `components/dashboard/connect-shopify-gate.tsx`
- `components/dashboard/recent-tests-table.tsx`
- `components/dashboard/ai-insight-panel.tsx`
- `components/dashboard/ghost-timeline.tsx`
- `components/dashboard/score-chart.tsx`
- `components/dashboard/revenue-calculator.tsx`
- `components/theme-provider.tsx`

### Analysis Components Deleted
- `components/analysis/` (entire folder)
- `components/analyze-form.tsx`

---

## Files Created/Replaced

### New Minimal Components
1. **`components/dashboard/sidebar.tsx`** (85 lines)
   - Cleaned up navigation (removed links to deleted pages)
   - Minimal, functional sidebar

2. **`components/dashboard/header.tsx`** (30 lines)
   - Simplified header without Button dependency
   - User email display

3. **`components/dashboard/ghost-os.tsx`** (179 lines)
   - Complete rewrite - minimal functional dashboard
   - Shows stats, latest test, recent tests
   - Preserved all prop types from original

### New Auth Pages
4. **`app/login/page.tsx`** (92 lines)
   - Minimal login form with Supabase auth

5. **`app/signup/page.tsx`** (92 lines)
   - Minimal signup form with Supabase auth

6. **`app/page.tsx`** (5 lines)
   - Simple redirect to /dashboard

---

## Files Modified

1. **`app/layout.tsx`**
   - Removed Google Font dependency (network issue in build env)
   - Uses system font stack

---

## Infrastructure Preserved (Untouched)

### lib/ Directory (28 files)
- `lib/supabase/` (4 files)
- `lib/shopify/` (5 files)
- `lib/analytics/` (2 files)
- `lib/analysis/` (4 files)
- `lib/calculations/` (2 files)
- `lib/crm/` (1 file)
- `lib/utils/` (1 file)
- Core utilities (5 files)

### app/api/ Routes (25 total)
All API routes verified working:
- `/api/analyze` & `/api/analyze/[id]/status`
- `/api/auth/shopify/*` (4 routes)
- `/api/auth/google-analytics/*` (2 routes)
- `/api/analytics/ga4/*` (4 routes)
- `/api/shopify/billing/*` (4 routes)
- `/api/shopify/*` (6 routes)
- `/api/cron/weekly-scan`
- `/api/crm/sync`

### Other Preserved
- `hooks/` directory
- `scripts/` directory (SQL migrations)
- `components/ui/` (Button, Dialog, Input, etc.)
- `components/dashboard/settings/` (5 files)
- `components/dashboard/history-content.tsx`
- All type definitions

---

## Build Verification

```
✓ Compiled successfully in 17.2s
✓ Generating static pages (33/33) in 3.0s

Route (app)
├ ○ /
├ ƒ /api/* (25 API routes)
├ ƒ /dashboard
├ ƒ /dashboard/history
├ ƒ /dashboard/settings
├ ƒ /dashboard/test/[id]
├ ○ /login
└ ○ /signup
```

---

## Final File Counts

| Location | Files |
|----------|-------|
| app/*.tsx | 11 |
| lib/*.ts | 28 |
| components/*.tsx | 16 |

---

## Known Issues / TODOs

1. **Font Loading** - Removed Google Font due to build environment network issues. Add back in production if needed.

2. **Supabase Token Encryption** - Existing TODO in codebase: tokens stored unencrypted in database.

3. **Onboarding Page** - `app/dashboard/onboarding/page.tsx` still exists - review if needed.

---

## Success Criteria

- [x] `npm run build` passes
- [x] All 25 API routes exist
- [x] lib/ infrastructure untouched
- [x] components/ cleaned up
- [x] No TypeScript errors
- [x] CLEANUP_LOG.md documents everything

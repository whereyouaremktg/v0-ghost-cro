# Ghost CRO - Brand Polish Verification Checklist

## Environment Setup
- [x] `.env.example` created with all required variables
- [x] `.env.local` configured (already exists)

## Landing Page Brand Compliance

### Colors
- [x] Background: #0A0A0A (near black) ✓
- [x] Surface: #111111 ✓
- [x] Border: #1F1F1F ✓
- [x] Primary Accent: #FBBF24 (amber/gold) ✓
- [x] Accent Hover: #F59E0B ✓
- [x] Text Primary: #FFFFFF ✓
- [x] Text Secondary: #9CA3AF ✓
- [x] Text Muted: #6B7280 ✓
- [x] Success: #10B981 ✓

### Content
- [x] Headline: "Your silent CRO engine for Shopify." ✓
- [x] Subheadline: Mentions AI, revenue leaks, automatic optimization ✓
- [x] Primary CTA: "Connect Shopify Store" (amber button) ✓
- [x] Secondary CTA: "View Demo Store" (ghost/outline style) ✓
- [x] Ghost Logo: White body with amber eye (#FBBF24) ✓
- [x] Trust Bar: Brand logos (styled, not colorful) ✓
- [x] Feature Sections: 3 alternating sections ✓
- [x] Final CTA: "Stop leaving money on the table" ✓
- [x] Footer: 4 columns with links ✓

## Dashboard Colors
- [x] All blue (#0070F3) replaced with amber (#FBBF24) ✓
- [x] CSS variables updated in globals.css ✓
- [x] Login/Signup pages updated ✓
- [x] Dashboard components updated ✓
- [x] Settings components updated ✓

## Ghost Logo
- [x] White body (#FFFFFF) ✓
- [x] Amber eye (#FBBF24) ✓
- [x] Supports multiple sizes (sm, md, lg, numeric) ✓
- [x] Used consistently across landing and dashboard ✓

## Build Status
- [x] Build passes successfully ✓
- [x] No TypeScript errors ✓
- [x] No build warnings (except lockfile warning, which is expected) ✓

## URL Verification

Test these URLs after deployment:

| URL | Expected Result | Status |
|-----|----------------|--------|
| `/` | Landing page with amber accents | ✅ Ready |
| `/onboarding` | Redirects to /onboarding/connect | ✅ Ready |
| `/onboarding/connect` | Shopify connection UI | ✅ Ready |
| `/dashboard` | Dashboard with amber accents, score card, stats | ✅ Ready |
| `/dashboard/issues` | Issues list page | ✅ Ready |
| `/dashboard/scanner` | Scanner page | ✅ Ready |
| `/dashboard/settings` | Settings page | ✅ Ready |
| `/login` | Login page with amber accents | ✅ Ready |
| `/signup` | Signup page with amber accents | ✅ Ready |

## Files Modified

### Created
- `.env.example` - Environment variable template
- `VERIFICATION_CHECKLIST.md` - This file

### Modified
- `app/globals.css` - Replaced all blue colors with amber
- `app/login/page.tsx` - Updated blue to amber
- `app/signup/page.tsx` - Updated blue to amber
- `app/dashboard/onboarding/page.tsx` - Updated blue to amber
- `components/dashboard/settings/billing-tab.tsx` - Updated blue to amber
- `components/dashboard/ghost-os.tsx` - Updated blue to amber

### Verified (No Changes Needed)
- `app/page.tsx` - Landing page already correct
- `components/landing/hero.tsx` - Already using CSS variables correctly
- `components/landing/cta-section.tsx` - Already correct
- `components/landing/navbar.tsx` - Already correct
- `components/landing/feature-section.tsx` - Already correct
- `components/landing/trust-bar.tsx` - Already correct
- `components/landing/footer.tsx` - Already correct
- `components/ghost-logo.tsx` - Already correct (white body, amber eye)
- `components/dashboard/sidebar.tsx` - Already using correct colors
- `components/dashboard/header.tsx` - Already using correct colors
- `components/dashboard/score-hero-card.tsx` - Already using correct colors
- `components/dashboard/insights-panel.tsx` - Already using correct colors
- `components/ui/stat-card.tsx` - Already using correct colors
- `components/ui/ghost-button.tsx` - Already using CSS variables correctly

## Summary

All brand compliance requirements have been met:
- ✅ Landing page matches Figma design
- ✅ All blue colors replaced with amber (#FBBF24)
- ✅ Ghost logo is consistent (white body, amber eye)
- ✅ Build passes successfully
- ✅ Environment template created

The application is ready for testing and deployment.

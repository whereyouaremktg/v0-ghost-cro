# Quick Testing Guide - Ghost CRO Fixes

**Purpose:** Verify the bug fixes work correctly
**Time needed:** 10-15 minutes
**Requirements:** Anthropic API key configured in `.env.local`

---

## Pre-Test Setup

1. **Clear localStorage:**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear()
   ```

2. **Open console (F12)** - Keep it open during the entire test to see debug logs

3. **Have a test Shopify store URL ready** (e.g., `example.myshopify.com`)

---

## Run the Test

1. Navigate to the analyze page (wherever the AnalyzeForm is displayed)
2. Enter a Shopify store URL
3. Submit the form
4. Wait for analysis to complete (can take 30-60 seconds)

---

## What to Check in Console

### During API Call:
Look for these logs in order:
```
=== ANALYZE API START ===
Input: { url: '...', personaMix: 'balanced' }
✓ Store Analysis parsed successfully
  - Issues found: X
✓ Persona Analysis parsed successfully
  - Score: XX
  - Persona results: 5
  - Critical threats: X
  - High threats: X
  - Medium threats: X
=== ANALYSIS COMPLETE ===
Result ID: test_...
Total threats: X
Personas: 5
  - Would purchase: X
  - Would abandon: X
Funnel data: { landed: 1000, cart: 500, checkout: 300, purchased: 25 }
```

✅ **All of these should appear.** If any are missing, copy the console output and send it to me.

### On Results Page:
Look for these logs:
```
=== REVENUE CALCULATION ===
Inputs: { monthlyVisitors: 50000, currentConversionRate: 0.025, aov: 85, ... }
Revenue Opportunity: { monthlyMin: 10000, monthlyMax: 15000, ... }

=== THREAT ATTRIBUTION DEBUG (First Threat) ===
Threat: "..."
Keywords extracted: [ 'shipping', 'costs', 'checkout', ... ]
Buyers citing this threat: 4 / 5
Attribution rate: 80%
```

✅ **Check that "Attribution rate" is NOT 0%** (unless the threat genuinely has no buyer citations)

---

## What to Check in UI

### 1. Revenue Opportunity Section

**Location:** Top of the page

**Check for:**
- [ ] Dollar amounts display correctly (NOT "$NaN")
- [ ] Range format: "$10,000 - $15,000/mo" or similar
- [ ] "Current Revenue" shows a number
- [ ] "Potential Revenue" shows a number
- [ ] No red error messages

**Example of what it should look like:**
```
Revenue Opportunity
$10,000 - $15,000/month

Current Revenue: $106,250/mo
Potential Revenue: $120,000/mo
```

---

### 2. Threat Cards

**Location:** "Active Friction Threats" section

**For EACH threat card, check:**
- [ ] **Top-right shows "Est. Recovery"** with a dollar amount
- [ ] **Confidence badge** shows "High Confidence", "Medium Confidence", or "Low Confidence"
- [ ] **Bottom section** has a gray box that says something like:
  ```
  40% of simulated buyers cited this issue. Estimated 0.3-0.5% conversion rate improvement if fixed.
  ```
- [ ] **Percentage is NOT 0%** (unless it genuinely should be)

**Example of a GOOD threat card:**
```
┌─────────────────────────────────────────┐
│ 1  [icon]  Critical   High Confidence   │
│                       Est. Recovery     │
│                       $4,000 - $6,000/mo│
├─────────────────────────────────────────┤
│ Hidden shipping costs at checkout       │
│                                          │
│ Ghost sees:                              │
│ Shoppers hesitate when shipping costs   │
│ appear unexpectedly                      │
│                                          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━ (progress bar) │
│                                          │
│ 80% of simulated buyers cited this      │
│ issue. Estimated 0.5-0.8% conversion    │
│ rate improvement if fixed.               │
├─────────────────────────────────────────┤
│ Where: Checkout page     [View Fix →]   │
└─────────────────────────────────────────┘
```

---

### 3. Persona Cards

**Location:** "Live Buyer Simulation" section

**Check:**
- [ ] All 5 persona cards display
- [ ] Each shows "Would Buy" or "Would Abandon"
- [ ] No error messages
- [ ] Click a card → transcript panel appears on the right

---

### 4. NO Display Bugs Anywhere

Scan the entire page for:
- [ ] ❌ NO "$NaN" anywhere
- [ ] ❌ NO "NaN%" anywhere
- [ ] ❌ NO "function toLocaleString() { [native code] }" strings
- [ ] ❌ NO "undefined" displayed as text
- [ ] ❌ NO "null" displayed as text

---

## Expected Results

### ✅ PASS Criteria:
1. All console logs appear in the correct order
2. Revenue opportunity shows real dollar amounts (not NaN)
3. At least one threat card shows > 0% attribution (unless genuinely 0%)
4. No display bugs (NaN, function strings, etc.)
5. All sections render without errors

### ❌ FAIL Criteria (Report These):
1. Missing console logs → Copy console output and send to me
2. "$NaN" appears anywhere → Screenshot + console output
3. ALL threats show "0% of simulated buyers" → Console output + threat data
4. Function strings appear → Screenshot + location on page
5. Page doesn't load or shows errors → Console output + error message

---

## How to Report Issues

If you find a bug, provide:

1. **Console output** (copy from browser console)
2. **Screenshot** of the bug
3. **Test ID** (found in the URL: `/ghost/test/[id]`)
4. **Browser** and version (e.g., Chrome 120, Firefox 115)

---

## Quick Troubleshooting

### "Revenue shows $0"
- Check console for "=== REVENUE CALCULATION ===" logs
- Verify inputs are not all 0
- Check if `currentConversionRate` is NaN

### "All threats show 0% attribution"
- Check console for "=== THREAT ATTRIBUTION DEBUG ===" log
- Verify "Keywords extracted" has meaningful words
- Check if "Buyers citing this threat" is 0/5 (if so, keyword matching failed)

### "Page is slow to load"
- This is normal - calculations happen client-side
- Wait 2-3 seconds after navigation
- Check console for errors

---

## Success Indicators

If you see this, the fixes are working:

✅ Console shows detailed logs at each step
✅ Revenue opportunity displays "$X,XXX - $X,XXX/mo" format
✅ Threat cards show meaningful attribution percentages (20%, 40%, 80%, etc.)
✅ No NaN values anywhere
✅ All data displays correctly

---

## Next Steps After Testing

### If Everything Works:
1. ✅ Mark this session as complete
2. ✅ Proceed with GA4 integration and billing features
3. ✅ Keep the DATA_FLOW_AUDIT.md and FIXES_APPLIED.md docs for reference

### If Issues Found:
1. ❌ Report findings using the format above
2. ❌ I'll diagnose and fix within 30 minutes
3. ❌ Re-test after fixes applied

---

## Optional: Advanced Checks

If you want to go deeper:

1. **Run multiple scans** with different stores → Verify consistency
2. **Test with low-quality stores** → Should show more threats + higher attribution
3. **Test with high-quality stores** → Should show fewer threats + lower attribution
4. **Compare results** → Attribution percentages should make logical sense

---

**Estimated Testing Time:** 10-15 minutes
**Estimated Fix Time (if needed):** 30 minutes

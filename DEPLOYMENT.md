# Deployment Guide

This guide covers the production deployment setup for Ghost CRO, including cron jobs and webhook configuration.

## Prerequisites

- Vercel account with project deployed
- Shopify Partners account
- Supabase project configured
- All environment variables set (see `SECRETS.md`)

---

## 1. Vercel Cron Job Setup

The weekly watchdog scan runs automatically via Vercel Cron. Configure it as follows:

### Step 1: Create `vercel.json`

Create a `vercel.json` file in your project root (if it doesn't exist):

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-scan",
      "schedule": "0 0 * * 0"
    }
  ]
}
```

**Schedule Explanation:**
- `0 0 * * 0` = Every Sunday at midnight UTC
- Format: `minute hour day-of-month month day-of-week`
- See [Vercel Cron Documentation](https://vercel.com/docs/cron-jobs) for more schedule options

### Step 2: Set CRON_SECRET Environment Variable

In Vercel Dashboard → Settings → Environment Variables:

1. Add `CRON_SECRET` with a secure random string (e.g., generate with `openssl rand -hex 32`)
2. Vercel will automatically include this in the `Authorization` header when calling the cron endpoint

### Step 3: Deploy

After adding `vercel.json` and `CRON_SECRET`, deploy:

```bash
vercel --prod
```

### Step 4: Verify Cron Job

1. Go to Vercel Dashboard → Your Project → Cron Jobs
2. You should see `/api/cron/weekly-scan` listed
3. Wait for the next scheduled run or trigger manually for testing

**Manual Test:**
```bash
curl -X GET https://your-app.vercel.app/api/cron/weekly-scan \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 2. Shopify App Uninstalled Webhook Setup

Configure the `app/uninstalled` webhook in Shopify Partners to automatically deactivate stores when users uninstall the app.

### Step 1: Access Shopify Partners Dashboard

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Navigate to your app
3. Go to **App Setup** → **Webhooks**

### Step 2: Add Webhook

1. Click **Create webhook**
2. Configure:
   - **Event:** `app/uninstalled`
   - **Format:** `JSON`
   - **URL:** `https://your-app.vercel.app/api/shopify/webhooks`
   - **API version:** `2024-01` (or latest stable)

### Step 3: Set Webhook Secret

1. Generate a webhook secret:
   ```bash
   openssl rand -hex 32
   ```

2. Add to Vercel Environment Variables:
   - Key: `SHOPIFY_WEBHOOK_SECRET`
   - Value: Your generated secret

3. In Shopify Partners → Webhooks → Edit your webhook:
   - Paste the same secret in the **Webhook secret** field

### Step 4: Test Webhook

Use Shopify's webhook testing tool or simulate with:

```bash
curl -X POST https://your-app.vercel.app/api/shopify/webhooks \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: app/uninstalled" \
  -H "X-Shopify-Shop-Domain: test-store.myshopify.com" \
  -H "X-Shopify-Hmac-Sha256: YOUR_HMAC_SIGNATURE" \
  -d '{"shop_domain": "test-store.myshopify.com"}'
```

**Note:** HMAC signature must be calculated correctly. See [Shopify Webhook Verification](https://shopify.dev/docs/apps/webhooks/configuration/https#step-5-verify-the-webhook).

---

## 3. Email Setup (Resend)

For weekly retention emails, configure Resend:

### Step 1: Install Resend Package

```bash
npm install resend
```

### Step 2: Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add to Vercel Environment Variables:
   - Key: `RESEND_API_KEY`
   - Value: Your Resend API key

### Step 3: Configure From Email

1. In Resend Dashboard → Domains, add and verify your domain
2. Add to Vercel Environment Variables:
   - Key: `RESEND_FROM_EMAIL`
   - Value: `Ghost CRO <noreply@yourdomain.com>`

### Step 4: Test Email (Optional)

Add `TEST_EMAIL` environment variable for testing:
- Key: `TEST_EMAIL`
- Value: Your email address

---

## 4. Post-Deployment Checklist

- [ ] Vercel Cron job is scheduled and running
- [ ] `CRON_SECRET` is set in Vercel environment variables
- [ ] Shopify `app/uninstalled` webhook is configured
- [ ] `SHOPIFY_WEBHOOK_SECRET` matches in both Shopify and Vercel
- [ ] Resend API key is configured (if using email)
- [ ] All environment variables from `SECRETS.md` are set
- [ ] Test webhook receives `app/uninstalled` events
- [ ] Test cron job runs successfully (check Vercel logs)

---

## Troubleshooting

### Cron Job Not Running

1. Check Vercel Dashboard → Cron Jobs for errors
2. Verify `CRON_SECRET` matches in both code and environment
3. Check function logs in Vercel Dashboard → Functions

### Webhook Not Receiving Events

1. Verify webhook URL is publicly accessible (no auth required)
2. Check `SHOPIFY_WEBHOOK_SECRET` matches exactly
3. Review webhook delivery logs in Shopify Partners Dashboard
4. Check Vercel function logs for incoming requests

### Email Not Sending

1. Verify `RESEND_API_KEY` is set correctly
2. Check Resend Dashboard → Logs for delivery status
3. Ensure domain is verified in Resend
4. Review function logs for email errors

---

## Support

For deployment issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Shopify Webhooks Guide](https://shopify.dev/docs/apps/webhooks)
- [Resend Documentation](https://resend.com/docs)

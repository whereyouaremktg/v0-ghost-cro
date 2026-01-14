# Deployment Guide

## 1. Vercel Cron Setup
Add this to `vercel.json` in root:
```json
{
  "crons": [{
    "path": "/api/cron/weekly-scan",
    "schedule": "0 0 * * 0"
  }]
}
```

## 2. Shopify Webhook
In Shopify Partners > App Setup > Event Subscriptions:
- Create webhook: `app/uninstalled`
- URL: `https://your-app.com/api/shopify/webhooks`

# Environment Variables Reference

Complete list of all environment variables required for Ghost CRO production deployment.

---

## Required Variables

### Authentication & API Keys

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for AI analysis | `sk-ant-api03-...` | ✅ Yes |
| `SHOPIFY_CLIENT_ID` | Shopify app client ID | `abc123def456...` | ✅ Yes |
| `SHOPIFY_CLIENT_SECRET` | Shopify app client secret | `shpss_abc123...` | ✅ Yes |
| `SHOPIFY_WEBHOOK_SECRET` | Secret for verifying Shopify webhooks | `your-webhook-secret-here` | ✅ Yes |

### Database (Supabase)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | ✅ Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Yes |

### Cron Jobs

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `CRON_SECRET` | Secret for protecting cron endpoints | `your-secure-random-string` | ✅ Yes |

### Email (Resend)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `RESEND_API_KEY` | Resend API key for sending emails | `re_abc123...` | ⚠️ Optional |
| `RESEND_FROM_EMAIL` | Default sender email address | `Ghost CRO <noreply@yourdomain.com>` | ⚠️ Optional |
| `TEST_EMAIL` | Test email for cron job (development) | `test@example.com` | ⚠️ Optional |

### Application URLs

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `NEXT_PUBLIC_APP_URL` | Public URL of your app | `https://ghostcro.com` | ✅ Yes |
| `NEXTAUTH_URL` | NextAuth callback URL (same as above) | `https://ghostcro.com` | ✅ Yes |
| `VERCEL_URL` | Auto-set by Vercel (fallback) | `your-app.vercel.app` | ⚠️ Auto |

### Google Analytics (Optional)

| Variable | Description | Example Value | Required |
|----------|-------------|---------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxxxx.apps.googleusercontent.com` | ⚠️ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-xxxxx` | ⚠️ Optional |

---

## Environment Variable Templates

### `.env.local` (Development)

```bash
# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Shopify
SHOPIFY_CLIENT_ID=your-shopify-client-id
SHOPIFY_CLIENT_SECRET=shpss_your-shopify-client-secret
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret-here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx

# Cron
CRON_SECRET=your-secure-random-string-here

# Email (Optional)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Ghost CRO <noreply@yourdomain.com>
TEST_EMAIL=test@example.com

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Google Analytics (Optional)
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

### Vercel Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add all variables above **except**:
- `NEXTAUTH_URL` (use `NEXT_PUBLIC_APP_URL` instead)
- `VERCEL_URL` (auto-set by Vercel)

**Important:** Set different values for Production, Preview, and Development environments as needed.

---

## Generating Secrets

### CRON_SECRET

```bash
openssl rand -hex 32
```

### SHOPIFY_WEBHOOK_SECRET

```bash
openssl rand -hex 32
```

### Example Output

```
cron_secret: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
webhook_secret: z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4
```

---

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different secrets** for development, staging, and production
3. **Rotate secrets regularly** (especially after team member changes)
4. **Use Vercel's environment variable encryption** (automatic)
5. **Limit access** to environment variables (only team members who need them)
6. **Use service role keys** only in server-side code (never expose to client)

---

## Verification Checklist

Before deploying to production, verify:

- [ ] All required variables are set in Vercel
- [ ] `CRON_SECRET` is a strong random string
- [ ] `SHOPIFY_WEBHOOK_SECRET` matches Shopify Partners configuration
- [ ] `SUPABASE_SERVICE_ROLE_KEY` has admin access
- [ ] `ANTHROPIC_API_KEY` has sufficient credits/quota
- [ ] `RESEND_API_KEY` is configured (if using email)
- [ ] `NEXT_PUBLIC_APP_URL` matches your production domain
- [ ] All secrets are different from development values

---

## Troubleshooting

### "Environment variable not found"

- Check variable name spelling (case-sensitive)
- Verify variable is set in correct Vercel environment (Production/Preview/Development)
- Redeploy after adding new variables

### "Invalid API key"

- Verify key is copied correctly (no extra spaces)
- Check key hasn't expired or been revoked
- Ensure key has correct permissions/scopes

### "Webhook verification failed"

- Verify `SHOPIFY_WEBHOOK_SECRET` matches exactly in both Shopify and Vercel
- Check webhook URL is publicly accessible
- Review webhook delivery logs in Shopify Partners Dashboard

---

## Support

For issues with environment variables:
1. Check Vercel Dashboard → Settings → Environment Variables
2. Review function logs in Vercel Dashboard → Functions
3. Verify secrets match between services (Shopify, Supabase, etc.)

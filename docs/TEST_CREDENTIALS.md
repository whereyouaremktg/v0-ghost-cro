# Test Credentials Guide

This guide explains how to obtain test credentials for Ghost CRO.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in each credential below
3. Restart your dev server: `npm run dev`

---

## Required Credentials

### 1. Supabase (Database & Auth)

**Where to get:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project (or use existing)
3. Go to **Settings** → **API**
4. Copy these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # ⚠️ Keep this secret!
```

**Test Account:**
- Create a test user via Supabase Auth UI
- Or use: `test@ghostcro.com` / `TestPassword123!`

**Database Setup:**
- Run `scripts/000_full_database_setup.sql` in Supabase SQL Editor

---

### 2. Shopify OAuth (Store Connection)

**Where to get:**
1. Go to [Shopify Partners Dashboard](https://partners.shopify.com/)
2. Create a new app: **Apps** → **Create app** → **Create app manually**
3. App name: `Ghost CRO`
4. App URL: `http://localhost:3000` (for development)
5. Go to **Client credentials** tab
6. Copy:

```env
SHOPIFY_CLIENT_ID=your-client-id
SHOPIFY_CLIENT_SECRET=your-client-secret
```

**Test Store:**
- Create a development store in Shopify Partners
- Or use an existing test store: `your-test-store.myshopify.com`

**Redirect URI:**
- Add to app settings: `http://localhost:3000/api/auth/shopify/callback`

---

### 3. Anthropic Claude AI (Analysis Engine)

**Where to get:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up / Log in
3. Go to **Settings** → **API Keys**
4. Create a new API key
5. Copy:

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**Test Usage:**
- Free tier includes some credits
- Each analysis uses ~$0.10-0.50 in API costs
- Monitor usage in Anthropic dashboard

---

## Optional Credentials

### 4. Google Analytics 4 (Optional - for Real Personas)

**Where to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Analytics Data API**
4. Go to **APIs & Services** → **Credentials**
5. Create **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Authorized redirect URI: `http://localhost:3000/api/auth/google-analytics/callback`
8. Copy:

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
```

**Test Property:**
- Connect to a GA4 property that has traffic data
- Or skip this - the app will use default personas

---

## Test User Accounts

### Supabase Test User

Create via Supabase Auth UI or SQL:

```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES (
  'test@ghostcro.com',
  crypt('TestPassword123!', gen_salt('bf')),
  NOW()
);
```

**Login Credentials:**
- Email: `test@ghostcro.com`
- Password: `TestPassword123!`

---

### Shopify Test Store

**Development Store:**
1. In Shopify Partners → **Stores** → **Add store** → **Development store**
2. Store name: `ghost-cro-test`
3. Store URL: `ghost-cro-test.myshopify.com`

**Test Products:**
- Add a few test products
- Set up shipping zones
- Enable test payments (Shopify Payments test mode)

---

## Environment File Template

Create `.env.local` with this structure:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Shopify
SHOPIFY_CLIENT_ID=xxxxx
SHOPIFY_CLIENT_SECRET=xxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000

# Optional: Google Analytics
# GOOGLE_CLIENT_ID=xxxxx
# GOOGLE_CLIENT_SECRET=xxxxx
```

---

## Testing Checklist

- [ ] Supabase project created and database migrated
- [ ] Test user created in Supabase Auth
- [ ] Shopify app created in Partners dashboard
- [ ] Shopify development store created
- [ ] Anthropic API key obtained
- [ ] `.env.local` file created with all credentials
- [ ] Dev server starts without errors: `npm run dev`
- [ ] Can log in at `/login`
- [ ] Can connect Shopify store at `/dashboard/settings`
- [ ] Can run analysis at `/dashboard`

---

## Troubleshooting

### "Supabase environment variables are missing"
- Check `.env.local` exists
- Verify variable names match exactly (case-sensitive)
- Restart dev server after adding variables

### "Shopify OAuth is not configured"
- Verify `SHOPIFY_CLIENT_ID` and `SHOPIFY_CLIENT_SECRET` are set
- Check redirect URI matches exactly in Shopify app settings

### "Anthropic API key is not configured"
- Verify `ANTHROPIC_API_KEY` starts with `sk-ant-api03-`
- Check API key is active in Anthropic console

### "Database error" or "Table doesn't exist"
- Run `scripts/000_full_database_setup.sql` in Supabase SQL Editor
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly

---

## Security Notes

⚠️ **Never commit `.env.local` to git!**
- It's already in `.gitignore`
- Contains sensitive credentials
- Use `.env.example` for documentation only

⚠️ **Service Role Key:**
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security
- Only use in server-side code
- Never expose to client

---

## Production Deployment

For production (Vercel, etc.):
1. Set all environment variables in your hosting platform
2. Use production URLs:
   - `NEXT_PUBLIC_APP_URL=https://yourdomain.com`
   - `NEXTAUTH_URL=https://yourdomain.com`
3. Update Shopify app redirect URI to production URL
4. Use production Supabase project (or separate project)
5. Monitor API usage in Anthropic dashboard

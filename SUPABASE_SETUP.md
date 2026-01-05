# Supabase Setup Guide for Ghost CRO

## ✅ Current Status

Your Supabase integration is already configured! Here's what's set up:

- ✅ Server client (`lib/supabase/server.ts`)
- ✅ Browser client (`lib/supabase/client.ts`)
- ✅ Admin client (`lib/supabase/admin.ts`)
- ✅ Database tables: `profiles`, `subscriptions`, `tests`

## 🔧 Required Environment Variables

Make sure these are set in your `.env.local` and Vercel:

```bash
# Supabase Public Keys (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Admin Key (REQUIRED for storing Shopify tokens)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Important:** The `SUPABASE_SERVICE_ROLE_KEY` is needed because we're storing Shopify OAuth tokens server-side. This key bypasses Row Level Security (RLS) and should **never** be exposed to the client.

## 📊 Database Migration

**IMPORTANT:** Run the complete database setup script in your Supabase SQL Editor:

**File:** `scripts/000_full_database_setup.sql`

This creates all required tables in the correct order:
- `profiles` table (extends auth.users)
- `subscriptions` table (with Shopify billing columns)
- `tests` table (checkout analyses)
- `stores` table (Shopify OAuth tokens)
- All RLS policies and indexes
- Auto-create profile trigger

**Note:** If you get an error about `profiles` not existing, run `000_full_database_setup.sql` instead of the individual migration scripts.

## 🔐 Security Notes

1. **Token Storage:** Currently storing access tokens as plain text. For production, consider:
   - Using Supabase Vault for encryption
   - Or encrypting tokens before storing (using `crypto` or a library like `@noble/ciphers`)

2. **Admin Client:** Only use `supabaseAdmin` in server-side API routes, never in client components.

## 🧪 Testing the Integration

1. **Run the migration** in Supabase SQL Editor
2. **Set environment variables** in `.env.local`
3. **Connect a Shopify store** via `/dashboard/settings`
4. **Check Supabase Dashboard** → `stores` table should have a new row

## 📝 What Changed

- ✅ OAuth callback now saves tokens to Supabase `stores` table
- ✅ Falls back to localStorage if database save fails (graceful degradation)
- ✅ Requires authenticated user (redirects to login if not signed in)

## 🚀 Next Steps

1. Run the migration script in Supabase
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
3. Test the Shopify connection flow
4. (Optional) Add token encryption for production


# Run Ghost CRO locally (one-time setup)

Do this once per machine. After that, `npm run dev` and signup/login work without hitting Supabase errors.

## Already have Supabase / Vercel?

Your Vercel project already has the env vars; your **local** run doesn’t. Copy them into this repo:

1. **From Vercel:** Project → Settings → Environment Variables. Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and `SUPABASE_SERVICE_ROLE_KEY` if you use it).
2. **Or from Supabase:** [Dashboard](https://supabase.com/dashboard) → your project → Settings → API. Copy **Project URL** and **anon public** key.
3. In this repo root, create **`.env.local`** and paste:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=<paste Project URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key>
   ```
4. Restart `npm run dev` and refresh. No new Supabase project needed.

---

## 1. Install dependencies

```bash
npm install
```

## 2. Create `.env.local` with Supabase

The app needs Supabase for auth and data. Without it, you’ll see a setup page instead of the app.

**2a.** Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard).

**2b.** In the project: **Settings → API**. Copy:

- **Project URL** → use as `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**2c.** In this repo root, create a file named **`.env.local`** (same folder as `package.json`) with:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with your Project URL and anon key. No quotes. You can copy `.env.example` and edit it.

**Optional for full features:** Add `SUPABASE_SERVICE_ROLE_KEY` (same API settings page, “service_role” key) for server-side flows (e.g. storing Shopify tokens). See `SECRETS.md` and `SUPABASE_SETUP.md`.

## 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If `.env.local` is set correctly, you’ll see the app. Use **Sign up** or **Login** to create an account.

## If you still see “One-time local setup”

- Confirm `.env.local` is in the **project root** (next to `package.json`), not inside `app/` or elsewhere.
- Confirm variable names are exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Restart the dev server: stop it (Ctrl+C), then run `npm run dev` again.
- Don’t commit `.env.local`; it’s gitignored.

## Optional: database migrations

For full behavior (profiles, tests, stores, subscriptions), run the SQL in `scripts/000_full_database_setup.sql` in the Supabase SQL Editor. See `SUPABASE_SETUP.md`.

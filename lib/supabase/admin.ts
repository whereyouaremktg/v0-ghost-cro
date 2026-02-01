import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  throw new Error(
    "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local. Get the service_role key from Supabase Dashboard → Project Settings → API."
  )
}

// Admin client with service role key - bypasses RLS
// Only use in server-side code for admin operations
export const supabaseAdmin = createClient(url, serviceRoleKey)

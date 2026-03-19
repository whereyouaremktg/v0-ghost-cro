import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Shopify app launch entry point.
 *
 * When merchants click the app from the Shopify admin, Shopify sends them here
 * with a ?shop= query parameter. This route checks whether the user already has
 * an active session for that shop and routes them accordingly:
 *   - Authenticated + store connected -> /dashboard
 *   - Otherwise -> /api/auth/shopify/initiate (OAuth flow)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const shop = searchParams.get("shop")
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  if (!shop) {
    return NextResponse.redirect(`${baseUrl}/login`)
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Check if this user already has an active store connection for this shop
      // Use admin client since this GET comes from Shopify Admin (no user cookies)
      const { data: store } = await supabaseAdmin
        .from("stores")
        .select("id")
        .eq("user_id", user.id)
        .eq("shop", shop)
        .eq("is_active", true)
        .maybeSingle()

      if (store) {
        return NextResponse.redirect(`${baseUrl}/dashboard`)
      }
    }
  } catch {
    // If session check fails, fall through to OAuth
  }

  // No active session or store not connected - initiate OAuth
  return NextResponse.redirect(
    `${baseUrl}/api/auth/shopify/initiate?shop=${encodeURIComponent(shop)}`
  )
}

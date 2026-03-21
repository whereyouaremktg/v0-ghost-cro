import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { getCurrentSubscription } from "@/lib/shopify/billing"
import { decryptToken } from "@/lib/security/encryption"

/**
 * Get current subscription status
 *
 * Returns both:
 * - Shopify subscription data (from Shopify API)
 * - Local subscription data (from Supabase)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get Shopify credentials from request body or fall back to DB
    let body: { shop?: string; accessToken?: string } = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is fine - we'll auto-fetch
    }

    let { shop, accessToken } = body

    // Auto-fetch store credentials if not provided in request
    if (!shop || !accessToken) {
      const { data: store } = await supabaseAdmin
        .from("stores")
        .select("shop, access_token")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()

      shop = shop || store?.shop || undefined
      accessToken = accessToken || store?.access_token || undefined
    }

    // 3. Get local subscription from database
    const { data: localSub, error: dbError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (dbError && dbError.code !== "PGRST116") {
      // PGRST116 is "not found" which is OK
      console.error("Error fetching local subscription:", dbError)
    }

    // 4. If Shopify credentials available, fetch from Shopify too
    let shopifySubscription = null

    if (shop && accessToken) {
      try {
        const result = await getCurrentSubscription(shop, decryptToken(accessToken))
        const subscriptions = result.data?.currentAppInstallation?.activeSubscriptions || []
        shopifySubscription = subscriptions[0] || null
      } catch (shopifyError) {
        console.error("Error fetching Shopify subscription:", shopifyError)
        // Don't fail the request, just return local data
      }
    }

    // 5. Calculate additional info
    const isTrialing =
      localSub?.trial_ends_at && new Date(localSub.trial_ends_at) > new Date()
    const trialDaysRemaining = isTrialing
      ? Math.ceil(
          (new Date(localSub.trial_ends_at).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : 0

    return NextResponse.json({
      shopifySubscription,
      localSubscription: localSub,
      isTrialing,
      trialDaysRemaining,
      testsRemaining: localSub
        ? (localSub.tests_limit || 0) - (localSub.tests_used || 0)
        : 0,
    })
  } catch (error) {
    console.error("Error fetching subscription status:", error)
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    )
  }
}

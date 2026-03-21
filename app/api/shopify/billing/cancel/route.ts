import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { cancelSubscription } from "@/lib/shopify/billing"
import { decryptToken } from "@/lib/security/encryption"

/**
 * Cancel an active subscription
 *
 * This cancels the subscription on Shopify and updates the local database.
 * If shop/accessToken/subscriptionId are not provided, they will be fetched
 * from the database for the current user.
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

    // 2. Get request data (optional - can auto-fetch if not provided)
    let body: { shop?: string; accessToken?: string; subscriptionId?: string } = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is fine - we'll auto-fetch
    }

    let { shop, accessToken, subscriptionId } = body
    if (accessToken) {
      accessToken = decryptToken(accessToken)
    }

    // 3. Auto-fetch missing data from database
    // Use admin client to bypass RLS (POST routes can have cookie session issues)
    if (!shop || !accessToken) {
      const { data: store, error: storeError } = await supabaseAdmin
        .from("stores")
        .select("shop, access_token")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()

      if (storeError || !store) {
        return NextResponse.json(
          { error: "No active store found for this user" },
          { status: 400 }
        )
      }

      shop = shop || store.shop
      accessToken = accessToken || decryptToken(store.access_token)
    }

    if (!subscriptionId) {
      const { data: subscription, error: subError } = await supabase
        .from("subscriptions")
        .select("shopify_charge_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (subError || !subscription?.shopify_charge_id) {
        return NextResponse.json(
          { error: "No active subscription found to cancel" },
          { status: 400 }
        )
      }

      subscriptionId = subscription.shopify_charge_id
    }

    if (!shop || !accessToken || !subscriptionId) {
      return NextResponse.json(
        { error: "Missing required fields: shop, accessToken, and subscriptionId" },
        { status: 400 }
      )
    }

    // 3. Cancel on Shopify
    console.log(`Canceling subscription ${subscriptionId} for shop ${shop}`)

    const result = await cancelSubscription(shop, accessToken, subscriptionId)

    // Check for errors
    if (result.errors && result.errors.length > 0) {
      console.error("Shopify cancel errors:", result.errors)
      return NextResponse.json({ error: result.errors[0].message }, { status: 400 })
    }

    const userErrors = result.data?.appSubscriptionCancel?.userErrors
    if (userErrors && userErrors.length > 0) {
      console.error("Shopify user errors:", userErrors)
      return NextResponse.json({ error: userErrors[0].message }, { status: 400 })
    }

    // 4. Update local database
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "canceled",
        plan: "free",
        tests_limit: 1,
        shopify_charge_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (updateError) {
      console.error("Error updating local subscription:", updateError)
      // Don't fail - the Shopify cancellation succeeded
    }

    console.log(`Successfully canceled subscription for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: "Subscription canceled successfully",
    })
  } catch (error) {
    console.error("Cancel subscription error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to cancel subscription",
      },
      { status: 500 }
    )
  }
}

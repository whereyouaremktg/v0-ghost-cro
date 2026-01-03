import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cancelSubscription } from "@/lib/shopify/billing"

/**
 * Cancel an active subscription
 *
 * This cancels the subscription on Shopify and updates the local database
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

    // 2. Get request data
    const { shop, accessToken, subscriptionId } = await request.json()

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

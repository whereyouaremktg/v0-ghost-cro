import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSubscription, SHOPIFY_PLANS, getAppBaseUrl } from "@/lib/shopify/billing"

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

    // 2. Get plan and Shopify credentials from request
    const { plan, shop, accessToken } = await request.json()

    if (!plan || !shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields: plan, shop, and accessToken are required" },
        { status: 400 }
      )
    }

    if (!SHOPIFY_PLANS[plan]) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}. Valid plans are: starter, growth, scale` },
        { status: 400 }
      )
    }

    // 3. Build return URL for after charge approval
    const baseUrl = getAppBaseUrl()
    const returnUrl = `${baseUrl}/api/shopify/billing/callback?plan=${plan}&user_id=${user.id}&shop=${encodeURIComponent(shop)}`

    // 4. Create subscription charge via Shopify GraphQL
    // Use test mode in development
    const isTestMode = process.env.NODE_ENV !== "production"

    console.log(`Creating ${isTestMode ? "TEST" : "LIVE"} subscription for plan: ${plan}`)

    const result = await createSubscription(shop, accessToken, plan, returnUrl, isTestMode)

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      console.error("Shopify GraphQL errors:", result.errors)
      return NextResponse.json(
        { error: result.errors[0].message },
        { status: 400 }
      )
    }

    // Check for user errors from the mutation
    const userErrors = result.data?.appSubscriptionCreate?.userErrors
    if (userErrors && userErrors.length > 0) {
      console.error("Shopify user errors:", userErrors)
      return NextResponse.json(
        { error: userErrors[0].message },
        { status: 400 }
      )
    }

    const confirmationUrl = result.data?.appSubscriptionCreate?.confirmationUrl

    if (!confirmationUrl) {
      console.error("No confirmation URL returned:", result)
      return NextResponse.json(
        { error: "Failed to create subscription - no confirmation URL returned" },
        { status: 500 }
      )
    }

    // 5. Return the confirmation URL - user must approve on Shopify
    return NextResponse.json({
      confirmationUrl,
      subscriptionId: result.data?.appSubscriptionCreate?.appSubscription?.id,
    })
  } catch (error) {
    console.error("Shopify billing create error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create subscription",
      },
      { status: 500 }
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createSubscription, SHOPIFY_PLANS, getAppBaseUrl } from "@/lib/shopify/billing"
import { BillingRequestSchema } from "@/lib/types/subscription"
import { decryptToken } from "@/lib/security/encryption"

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
    const rawBody: unknown = await request.json().catch(() => ({}))
    const body = (typeof rawBody === "object" && rawBody !== null
      ? { ...(rawBody as Record<string, unknown>) }
      : {}) as Record<string, unknown>

    // Temporary compatibility for in-flight clients still sending "pro"
    if (body.plan === "pro") {
      body.plan = "growth"
    }

    const parsedBody = BillingRequestSchema.safeParse(body)

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsedBody.error.issues },
        { status: 400 }
      )
    }

    const { plan } = parsedBody.data
    let shop =
      typeof body.shop === "string" && body.shop.trim().length > 0
        ? body.shop.trim()
        : undefined
    let accessToken =
      typeof body.accessToken === "string" && body.accessToken.trim().length > 0
        ? body.accessToken.trim()
        : undefined

    // Backwards compatibility for existing clients that only send { plan }.
    // Pull active store credentials from DB when request body omits shop/token.
    if (!shop || !accessToken) {
      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("shop, access_token")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()

      if (storeError) {
        console.error("Failed to load active store for billing create:", storeError)
        return NextResponse.json(
          { error: "Failed to load connected Shopify store" },
          { status: 500 }
        )
      }

      shop = store?.shop || undefined
      accessToken = store?.access_token || undefined
    }

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: "Connect your Shopify store in Settings before starting billing." },
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

    const result = await createSubscription(
      shop,
      decryptToken(accessToken),
      plan,
      returnUrl,
      isTestMode
    )

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

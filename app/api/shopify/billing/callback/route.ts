import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { SHOPIFY_PLANS, getAppBaseUrl } from "@/lib/shopify/billing"

/**
 * Get Supabase admin client for server-side operations
 * Uses service role key to bypass RLS
 */
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * Handle the callback from Shopify after user approves/declines charge
 *
 * Shopify redirects here with:
 * - charge_id: The subscription ID if approved (undefined if declined)
 * - plan: Our plan key (from returnUrl)
 * - user_id: The user's Supabase ID (from returnUrl)
 * - shop: The Shopify store domain (from returnUrl)
 */
export async function GET(request: Request) {
  const baseUrl = getAppBaseUrl()

  try {
    const { searchParams } = new URL(request.url)
    const chargeId = searchParams.get("charge_id")
    const plan = searchParams.get("plan")
    const userId = searchParams.get("user_id")
    const shop = searchParams.get("shop")

    console.log("Billing callback received:", { chargeId, plan, userId, shop })

    // If no charge_id, user declined the charge
    if (!chargeId) {
      console.log("User declined the charge")
      return NextResponse.redirect(`${baseUrl}/pricing?canceled=true`)
    }

    // Validate required parameters
    if (!plan || !userId) {
      console.error("Missing required parameters:", { plan, userId })
      return NextResponse.redirect(`${baseUrl}/pricing?error=invalid_params`)
    }

    // Validate plan
    const planConfig = SHOPIFY_PLANS[plan]
    if (!planConfig) {
      console.error("Invalid plan:", plan)
      return NextResponse.redirect(`${baseUrl}/pricing?error=invalid_plan`)
    }

    // Calculate dates
    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + planConfig.trialDays * 24 * 60 * 60 * 1000)
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Update subscription in database
    const supabaseAdmin = getSupabaseAdmin()

    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({
        shopify_charge_id: chargeId,
        shopify_shop: shop,
        plan: plan,
        status: "active",
        tests_limit: planConfig.testsLimit,
        tests_used: 0,
        trial_ends_at: trialEndsAt.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("user_id", userId)

    if (error) {
      console.error("Error updating subscription:", error)
      return NextResponse.redirect(`${baseUrl}/dashboard?error=subscription_failed`)
    }

    console.log(`Successfully activated ${plan} subscription for user ${userId}`)

    // Success! Redirect to dashboard with success message
    return NextResponse.redirect(`${baseUrl}/dashboard?success=true&plan=${plan}`)
  } catch (error) {
    console.error("Billing callback error:", error)
    return NextResponse.redirect(`${baseUrl}/dashboard?error=callback_failed`)
  }
}

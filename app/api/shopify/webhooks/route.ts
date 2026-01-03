import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { extractPlanFromName, PLAN_TESTS_LIMIT } from "@/lib/shopify/billing"

/**
 * Get Supabase admin client for webhook operations
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
 * Verify Shopify webhook signature using HMAC
 */
function verifyWebhookSignature(body: string, hmac: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.warn("SHOPIFY_WEBHOOK_SECRET not set - skipping verification in development")
    return process.env.NODE_ENV !== "production"
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64")

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac))
  } catch {
    return false
  }
}

/**
 * Handle Shopify webhooks for billing events
 *
 * Supported topics:
 * - app_subscriptions/update: Subscription status changed
 * - app/uninstalled: App was uninstalled from store
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const hmac = request.headers.get("x-shopify-hmac-sha256") || ""
    const topic = request.headers.get("x-shopify-topic") || ""
    const shop = request.headers.get("x-shopify-shop-domain") || ""

    console.log(`Received Shopify webhook: ${topic} from ${shop}`)

    // Verify webhook signature in production
    if (!verifyWebhookSignature(body, hmac)) {
      console.error("Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const payload = JSON.parse(body)
    const supabaseAdmin = getSupabaseAdmin()

    switch (topic) {
      case "app_subscriptions/update": {
        // Subscription was updated (activated, cancelled, etc.)
        const subscription = payload.app_subscription
        if (!subscription) {
          console.log("No subscription in payload")
          break
        }

        const chargeId = subscription.admin_graphql_api_id
        const status = subscription.status?.toLowerCase()
        const name = subscription.name || ""

        console.log(`Subscription update: ${chargeId} -> ${status}`)

        if (chargeId) {
          // Determine plan from subscription name
          const plan = extractPlanFromName(name)
          const testsLimit = PLAN_TESTS_LIMIT[plan] || 1

          const updateData: Record<string, unknown> = {
            status: status === "active" ? "active" : status,
            updated_at: new Date().toISOString(),
          }

          // If cancelled, downgrade to free
          if (status === "cancelled" || status === "expired") {
            updateData.plan = "free"
            updateData.tests_limit = 1
            updateData.shopify_charge_id = null
          } else if (status === "active") {
            updateData.plan = plan
            updateData.tests_limit = testsLimit
          }

          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update(updateData)
            .eq("shopify_charge_id", chargeId)

          if (error) {
            console.error("Error updating subscription:", error)
          } else {
            console.log(`Updated subscription ${chargeId} to status: ${status}`)
          }
        }
        break
      }

      case "app/uninstalled": {
        // App was uninstalled - cancel subscription
        console.log(`App uninstalled from ${shop}`)

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            plan: "free",
            tests_limit: 1,
            shopify_charge_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("shopify_shop", shop)

        if (error) {
          console.error("Error canceling subscription on uninstall:", error)
        } else {
          console.log(`Canceled subscription for shop ${shop}`)
        }
        break
      }

      default:
        console.log(`Unhandled webhook topic: ${topic}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

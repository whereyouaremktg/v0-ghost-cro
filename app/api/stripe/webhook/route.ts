import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Lazy initialize Stripe to avoid build errors when key is missing
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  return new Stripe(key, {
    apiVersion: "2025-12-15.clover",
  })
}

// Lazy initialize Supabase to avoid build errors when keys are missing
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Supabase configuration is missing")
  }
  return createClient(url, key)
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const PLAN_LIMITS: Record<string, number> = {
  starter: 5,
  growth: 15,
  scale: 999,
}

export async function POST(request: NextRequest) {
  // Stripe webhook temporarily disabled - returning OK to silence errors
  return new Response("OK", { status: 200 })
  
  /* COMMENTED OUT - Stripe integration disabled for now
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    let event: Stripe.Event

    // Verify webhook signature
    const stripe = getStripe()
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      } catch (err) {
        console.error("Webhook signature verification failed:", err)
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
      }
    } else {
      // For development without webhook secret
      event = JSON.parse(body)
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan || "starter"

        if (userId) {
          // Update subscription in database
          const supabaseAdmin = getSupabaseAdmin()
          const { error } = await supabaseAdmin
            .from("subscriptions")
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              plan: plan,
              status: "active",
              tests_limit: PLAN_LIMITS[plan] || 5,
              tests_used: 0,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)

          if (error) {
            console.error("Error updating subscription:", error)
          } else {
            console.log("Subscription created for user:", userId, "plan:", plan)
          }
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID and update
        const supabaseAdmin = getSupabaseAdmin()
        // Access subscription period properties safely
        const periodStart = (subscription as any).current_period_start || Math.floor(Date.now() / 1000)
        const periodEnd = (subscription as any).current_period_end || Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000)
        
        const updateData: {
          status: string
          current_period_start: string
          current_period_end: string
          updated_at: string
        } = {
          status: subscription.status === "active" ? "active" : subscription.status,
          current_period_start: new Date(periodStart * 1000).toISOString(),
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_customer_id", customerId)

        if (error) {
          console.error("Error updating subscription:", error)
        }
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade to free plan
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            plan: "free",
            status: "canceled",
            tests_limit: 1,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        if (error) {
          console.error("Error canceling subscription:", error)
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Mark subscription as past due
        const supabaseAdmin = getSupabaseAdmin()
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", customerId)

        if (error) {
          console.error("Error updating subscription status:", error)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
  */
}

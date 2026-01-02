import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getSessionWithFallback } from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithFallback()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to continue", redirect: "/login" }, { status: 401 })
    }

    const { priceId } = await request.json()

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 })
    }

    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/#pricing?canceled=true`,
      subscription_data: {
        trial_period_days: 14,
      },
      metadata: {
        userEmail: session.user.email,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

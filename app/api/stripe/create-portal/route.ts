import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { auth } from "@/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { customerId } = await request.json()

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // Create Stripe Customer Portal Session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/dashboard/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Stripe portal error:", error)
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    )
  }
}

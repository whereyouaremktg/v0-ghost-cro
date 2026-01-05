import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get("shop")

    if (!shop) {
      return NextResponse.json({ error: "Shop parameter required" }, { status: 400 })
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID
    if (!clientId) {
      return NextResponse.json({ error: "Shopify OAuth not configured" }, { status: 500 })
    }

    // Generate state for CSRF protection
    const state = Math.random().toString(36).substring(7)
    const cookieStore = await cookies()
    cookieStore.set("shopify_oauth_state", state, {
      path: "/",
      maxAge: 600, // 10 minutes
      httpOnly: true,
      sameSite: "lax",
    })

    // Build OAuth URL
    const redirectUri = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/auth/shopify/callback`
    const scopes = "read_products,read_orders,read_checkouts"
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Shopify OAuth initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}


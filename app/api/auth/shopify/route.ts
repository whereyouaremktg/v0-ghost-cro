import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get("shop")

    if (!shop) {
      return NextResponse.json({ error: "Shop parameter is required" }, { status: 400 })
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/shopify/callback`
    const scopes = "read_orders,read_products,read_analytics"
    const state = Math.random().toString(36).substring(7) // Generate random state for CSRF protection

    // Build Shopify OAuth URL
    const shopifyAuthUrl = new URL(`https://${shop}/admin/oauth/authorize`)
    shopifyAuthUrl.searchParams.append("client_id", clientId!)
    shopifyAuthUrl.searchParams.append("scope", scopes)
    shopifyAuthUrl.searchParams.append("redirect_uri", redirectUri)
    shopifyAuthUrl.searchParams.append("state", state)

    // Store state in a cookie for verification (you could also use session storage)
    const response = NextResponse.redirect(shopifyAuthUrl.toString())
    response.cookies.set("shopify_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("Shopify OAuth initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate Shopify OAuth" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateOAuthState } from "@/lib/security/oauth-state"
import { SHOPIFY_SCOPES } from "@/lib/shopify/scopes"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shop = searchParams.get("shop")

    if (!shop) {
      return NextResponse.json({ error: "Shop parameter required" }, { status: 400 })
    }

    const clientId = process.env.SHOPIFY_CLIENT_ID
    if (!clientId) {
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${baseUrl}/onboarding/connect?error=shopify_not_configured`
      )
    }

    // Generate state for CSRF protection
    const state = generateOAuthState()
    const cookieStore = await cookies()
    cookieStore.set("shopify_oauth_state", state, {
      path: "/",
      maxAge: 600, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    // Build OAuth URL
    const baseUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const redirectUri = `${baseUrl}/api/auth/shopify/callback`
    const scopes = SHOPIFY_SCOPES.join(",")
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Shopify OAuth initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate OAuth" }, { status: 500 })
  }
}

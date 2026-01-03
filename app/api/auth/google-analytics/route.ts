import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    const redirectUri = `${nextAuthUrl}/api/auth/google-analytics/callback`

    if (!clientId) {
      console.error("GOOGLE_CLIENT_ID is not set in environment variables")
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=oauth_not_configured&message=${encodeURIComponent("Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in your environment variables.")}`
      )
    }

    const state = Math.random().toString(36).substring(7) // CSRF protection

    // Build Google OAuth URL
    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    googleAuthUrl.searchParams.append("client_id", clientId)
    googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
    googleAuthUrl.searchParams.append("response_type", "code")
    googleAuthUrl.searchParams.append("scope", "https://www.googleapis.com/auth/analytics.readonly")
    googleAuthUrl.searchParams.append("access_type", "offline") // Request refresh token
    googleAuthUrl.searchParams.append("prompt", "consent") // Force consent to get refresh token
    googleAuthUrl.searchParams.append("state", state)

    // Store state in cookie for verification
    const response = NextResponse.redirect(googleAuthUrl.toString())
    response.cookies.set("google_analytics_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
    })

    return response
  } catch (error) {
    console.error("Google Analytics OAuth initiation error:", error)
    const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${nextAuthUrl}/dashboard/settings?error=oauth_failed&message=${encodeURIComponent("Failed to initiate Google Analytics OAuth")}`
    )
  }
}

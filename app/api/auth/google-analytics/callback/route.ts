import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { google } from 'googleapis'
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"

    // Handle user denial
    if (error === 'access_denied') {
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=ga4_access_denied&message=${encodeURIComponent("User declined Google Analytics access")}`
      )
    }

    // Verify required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=missing_parameters&message=${encodeURIComponent("Missing OAuth parameters")}`
      )
    }

    // Verify state to prevent CSRF
    const cookieStore = await cookies()
    const savedState = cookieStore.get("google_analytics_oauth_state")?.value

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=invalid_state&message=${encodeURIComponent("Invalid OAuth state - possible CSRF attempt")}`
      )
    }

    // Validate required environment variables
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error("Google OAuth credentials are missing")
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=oauth_not_configured&message=${encodeURIComponent("Google OAuth credentials are missing from server configuration")}`
      )
    }

    const redirectUri = `${nextAuthUrl}/api/auth/google-analytics/callback`

    // Exchange code for tokens
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    )

    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.access_token || !tokens.refresh_token) {
      console.error("No tokens received:", tokens)
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=token_exchange_failed&message=${encodeURIComponent("No access token received from Google")}`
      )
    }

    // Get user info for database storage
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(
        `${nextAuthUrl}/login?error=authentication_required&message=${encodeURIComponent("Please log in to connect Google Analytics")}`
      )
    }

    // Store tokens in database
    const { error: dbError } = await supabase
      .from('ga4_connections')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(tokens.expiry_date || Date.now() + 3600000).toISOString(),
        scope: tokens.scope || 'https://www.googleapis.com/auth/analytics.readonly',
        connected_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error("Database error storing tokens:", dbError)
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=storage_failed&message=${encodeURIComponent("Failed to save GA4 connection: " + dbError.message)}`
      )
    }

    // Clear the state cookie
    const response = NextResponse.redirect(
      `${nextAuthUrl}/dashboard/settings?success=ga4_connected`
    )
    response.cookies.delete("google_analytics_oauth_state")

    return response

  } catch (error) {
    console.error("Google Analytics OAuth callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${nextAuthUrl}/dashboard/settings?error=callback_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { encryptToken } from "@/lib/security/encryption"
import { validateOAuthState } from "@/lib/security/oauth-state"

function getBaseUrl(): string {
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const shop = searchParams.get("shop")
    const state = searchParams.get("state")

    // Verify required parameters
    if (!code || !shop || !state) {
      const nextAuthUrl = getBaseUrl()
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=missing_parameters`,
      )
    }

    // Verify state (CSRF Protection)
    const cookieStore = await cookies()
    const savedState = cookieStore.get("shopify_oauth_state")?.value

    if (!savedState || !validateOAuthState(savedState, state)) {
      const nextAuthUrl = getBaseUrl()
      return NextResponse.redirect(`${nextAuthUrl}/dashboard/settings?error=invalid_state`)
    }
    cookieStore.delete("shopify_oauth_state")

    // Exchange code for access token
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      const nextAuthUrl = getBaseUrl()
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=oauth_not_configured&message=Shopify OAuth credentials are missing.`
      )
    }

    const accessTokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    })

    if (!accessTokenResponse.ok) {
      const errorText = await accessTokenResponse.text()
      const nextAuthUrl = getBaseUrl()
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=token_exchange_failed&message=${encodeURIComponent(errorText)}`,
      )
    }

    const tokenData = await accessTokenResponse.json()
    const accessToken = tokenData.access_token
    const scopes = tokenData.scope ? tokenData.scope.split(',') : []

    if (!accessToken) {
      const nextAuthUrl = getBaseUrl()
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=token_exchange_failed&message=${encodeURIComponent("No access token received")}`,
      )
    }

    // Get authenticated user from Supabase
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      const nextAuthUrl = getBaseUrl()
      return NextResponse.redirect(
        `${nextAuthUrl}/login?error=not_authenticated&message=${encodeURIComponent("Please sign in to connect your store")}`,
      )
    }

    // Save store connection to Supabase using admin client (bypasses RLS)
    // SECURITY: Hard-fail if database write fails - NO localStorage fallback
    const { error: dbError } = await supabaseAdmin
      .from('stores')
      .upsert({
        user_id: user.id,
        shop: shop,
        access_token: encryptToken(accessToken),
        scopes: scopes,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,shop',
      })

    if (dbError) {
      console.error("SECURITY ERROR: Failed to save store to database:", dbError)
      const nextAuthUrl = getBaseUrl()
      // Hard-fail: redirect to login with install_failed - NO localStorage fallback allowed
      return NextResponse.redirect(
        `${nextAuthUrl}/login?error=install_failed`
      )
    }

    // Trigger CRM sync after successful store connection (non-critical)
    try {
      await fetch(`${getBaseUrl()}/api/crm/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
    } catch (crmError) {
      console.error("CRM sync failed (non-critical):", crmError)
    }

    // Register App Uninstalled Webhook (non-critical)
    const nextAuthUrl = getBaseUrl()
    try {
      const webhookResponse = await fetch(`https://${shop}/admin/api/2023-10/webhooks.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
        body: JSON.stringify({
          webhook: {
            topic: "app/uninstalled",
            address: `${nextAuthUrl}/api/shopify/webhooks`,
            format: "json",
          },
        }),
      })
      
      if (!webhookResponse.ok) {
        const error = await webhookResponse.text()
        console.warn("Failed to register app/uninstalled webhook:", error)
      } else {
        console.log("Successfully registered app/uninstalled webhook")
      }
    } catch (webhookError) {
      console.error("Webhook registration network error:", webhookError)
    }

    // Redirect to onboarding connect page with success flag.
    // We redirect to /onboarding/connect (NOT /dashboard/*) because the dashboard layout
    // gates on having an active store — the freshly-written record may not be visible yet
    // due to route caching or DB replication lag, causing a redirect loop.
    // The connect page detects store_connected=1 and auto-triggers the first scan.
    return NextResponse.redirect(`${nextAuthUrl}/onboarding/connect?store_connected=1`)
  } catch (error) {
    console.error("Shopify OAuth callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const nextAuthUrl = getBaseUrl()
    return NextResponse.redirect(
      `${nextAuthUrl}/dashboard/settings?error=callback_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}

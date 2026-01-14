import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const shop = searchParams.get("shop")
    const state = searchParams.get("state")

    // Verify required parameters
    if (!code || !shop || !state) {
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=missing_parameters`,
      )
    }

    // Verify state (CSRF Protection)
    const cookieStore = await cookies()
    const savedState = cookieStore.get("shopify_oauth_state")?.value

    if (!savedState || savedState !== state) {
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      return NextResponse.redirect(`${nextAuthUrl}/dashboard/settings?error=invalid_state`)
    }

    // Exchange code for access token
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
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
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=token_exchange_failed&message=${encodeURIComponent(errorText)}`,
      )
    }

    const tokenData = await accessTokenResponse.json()
    const accessToken = tokenData.access_token
    const scopes = tokenData.scope ? tokenData.scope.split(',') : []

    if (!accessToken) {
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
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
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
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
        access_token: accessToken, // TODO: Encrypt this in production
        scopes: scopes,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,shop',
      })

    if (dbError) {
      console.error("SECURITY ERROR: Failed to save store to database:", dbError)
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      // Hard-fail: redirect to login with install_failed - NO localStorage fallback allowed
      return NextResponse.redirect(
        `${nextAuthUrl}/login?error=install_failed`
      )
    }

    // Trigger CRM sync after successful store connection (non-critical)
    try {
      await fetch(`${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/api/crm/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
    } catch (crmError) {
      console.error("CRM sync failed (non-critical):", crmError)
    }

    // Register App Uninstalled Webhook (non-critical)
    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
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

    // Clean redirect - NO tokens in URL or cookies
    // Always redirect to onboarding - the onboarding page will check if setup is already complete
    // and redirect to dashboard if needed
    return NextResponse.redirect(`${nextAuthUrl}/dashboard/onboarding`)
  } catch (error) {
    console.error("Shopify OAuth callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${nextAuthUrl}/dashboard/settings?error=callback_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}

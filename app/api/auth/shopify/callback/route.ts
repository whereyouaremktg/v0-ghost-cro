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
    try {
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
        console.error("Failed to save store to database:", dbError)
        // Fall back to localStorage for now, but log the error
        // In production, you'd want to handle this more gracefully
      }
    } catch (error) {
      console.error("Database error:", error)
      // Continue with localStorage fallback
    }

    // Prepare Safe Injection Data (for localStorage fallback)
    const shopJson = JSON.stringify(shop)
    const tokenJson = JSON.stringify(accessToken)
    const shopName = shop.replace('.myshopify.com', '')

    // The Enterprise "Provisioning" Screen
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Provisioning Environment...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      background: #fafafa;
      color: #18181b;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    
    .container {
      max-width: 480px;
      width: 100%;
      background: white;
      border-radius: 12px;
      border: 1px solid #e4e4e7;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      padding: 3rem;
      text-align: center;
    }
    
    .logo {
      width: 48px;
      height: 48px;
      margin: 0 auto 1.5rem;
      background: #0070F3;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #18181b;
    }
    
    .subtitle {
      color: #71717a;
      font-size: 0.875rem;
      margin-bottom: 2rem;
    }
    
    .steps {
      text-align: left;
      margin-bottom: 2rem;
    }
    
    .step {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
      color: #71717a;
      font-size: 0.875rem;
      opacity: 0.5;
      transition: all 0.3s ease;
    }
    
    .step.active {
      opacity: 1;
      color: #18181b;
    }
    
    .step.completed {
      opacity: 1;
      color: #10b981;
    }
    
    .step-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #e4e4e7;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
    }
    
    .step.active .step-icon {
      border-color: #0070F3;
      background: #0070F3;
    }
    
    .step.active .step-icon::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: white;
      animation: pulse 1.5s ease-in-out infinite;
    }
    
    .step.completed .step-icon {
      border-color: #10b981;
      background: #10b981;
    }
    
    .step.completed .step-icon::after {
      content: '✓';
      color: white;
      font-size: 12px;
      font-weight: bold;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    .progress-bar {
      height: 4px;
      background: #e4e4e7;
      border-radius: 2px;
      overflow: hidden;
      margin-top: 1rem;
    }
    
    .progress-fill {
      height: 100%;
      background: #0070F3;
      width: 0%;
      animation: progress 2.5s ease-out forwards;
      border-radius: 2px;
    }
    
    @keyframes progress {
      0% { width: 0%; }
      33% { width: 33%; }
      66% { width: 66%; }
      100% { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">👻</div>
    <h1>Provisioning Environment</h1>
    <p class="subtitle">Setting up secure connection to ${shopName}</p>
    
    <div class="steps">
      <div class="step active" id="s1">
        <div class="step-icon"></div>
        <div>Authenticating OAuth...</div>
      </div>
      <div class="step" id="s2">
        <div class="step-icon"></div>
        <div>Verifying Scopes...</div>
      </div>
      <div class="step" id="s3">
        <div class="step-icon"></div>
        <div>Establishing Secure Link...</div>
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill"></div>
    </div>
  </div>
  
  <script>
    // Animate steps
    setTimeout(() => {
      document.getElementById('s1').classList.add('completed');
      document.getElementById('s1').classList.remove('active');
      document.getElementById('s2').classList.add('active');
    }, 800);
    
    setTimeout(() => {
      document.getElementById('s2').classList.add('completed');
      document.getElementById('s2').classList.remove('active');
      document.getElementById('s3').classList.add('active');
    }, 1600);
    
    setTimeout(() => {
      document.getElementById('s3').classList.add('completed');
      document.getElementById('s3').classList.remove('active');
    }, 2400);
    
    // Secure Storage & Redirect
    try {
      const data = { shop: ${shopJson}, token: ${tokenJson}, timestamp: Date.now() };
      localStorage.setItem("ghost_shopify_connection", JSON.stringify(data));
      
      setTimeout(() => {
        window.location.href = "/dashboard/onboarding";
      }, 2500);
    } catch (e) {
      console.error(e);
      setTimeout(() => {
        window.location.href = "/dashboard?error=storage";
      }, 2500);
    }
  </script>
</body>
</html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Shopify OAuth callback error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${nextAuthUrl}/dashboard/settings?error=callback_failed&message=${encodeURIComponent(errorMessage)}`
    )
  }
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const shop = searchParams.get("shop")
    const state = searchParams.get("state")
    const hmac = searchParams.get("hmac")

    // Verify required parameters
    if (!code || !shop || !state) {
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=missing_parameters`,
      )
    }

    // Verify state to prevent CSRF
    const cookieStore = await cookies()
    const savedState = cookieStore.get("shopify_oauth_state")?.value

    if (!savedState || savedState !== state) {
      const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"
      return NextResponse.redirect(`${nextAuthUrl}/dashboard/settings?error=invalid_state`)
    }

    // Validate required environment variables
    const clientId = process.env.SHOPIFY_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || "http://localhost:3000"

    if (!clientId || !clientSecret) {
      console.error("Shopify OAuth credentials are missing")
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=oauth_not_configured&message=Shopify OAuth credentials are missing. Please set SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET in your environment variables.`
      )
    }

    // Exchange code for access token
    const accessTokenUrl = `https://${shop}/admin/oauth/access_token`
    const accessTokenResponse = await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    if (!accessTokenResponse.ok) {
      const errorText = await accessTokenResponse.text()
      console.error("Failed to exchange code for access token:", errorText)
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=token_exchange_failed&message=${encodeURIComponent(errorText)}`,
      )
    }

    const { access_token } = await accessTokenResponse.json()

    // Create HTML page that stores the token in localStorage and automatically triggers first scan
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Connecting Shopify...</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0d1117;
      color: #e6edf3;
    }
    .container {
      text-align: center;
      background: #161b22;
      padding: 3rem;
      border-radius: 12px;
      border: 1px solid rgba(132, 204, 22, 0.2);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      max-width: 400px;
    }
    .loader {
      border: 3px solid rgba(132, 204, 22, 0.1);
      border-top: 3px solid #84cc16;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }
    p {
      margin: 0;
      color: #8b949e;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="loader"></div>
    <h2>Connecting your store...</h2>
    <p>Setting up Ghost and starting your first analysis</p>
  </div>
  <script>
    const shopifyData = {
      shop: "${shop}",
      accessToken: "${access_token}",
      connectedAt: new Date().toISOString()
    };

    localStorage.setItem("shopifyStore", JSON.stringify(shopifyData));

    // Redirect to run-test page to automatically trigger first scan
    setTimeout(() => {
      window.location.href = "/dashboard/run-test?auto=true";
    }, 1500);
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
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/settings?error=callback_failed`)
  }
}

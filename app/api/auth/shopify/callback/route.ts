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
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=missing_parameters`,
      )
    }

    // Verify state to prevent CSRF
    const cookieStore = await cookies()
    const savedState = cookieStore.get("shopify_oauth_state")?.value

    if (!savedState || savedState !== state) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard/settings?error=invalid_state`)
    }

    // Exchange code for access token
    const accessTokenUrl = `https://${shop}/admin/oauth/access_token`
    const accessTokenResponse = await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    })

    if (!accessTokenResponse.ok) {
      console.error("Failed to exchange code for access token:", await accessTokenResponse.text())
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/dashboard/settings?error=token_exchange_failed`,
      )
    }

    const { access_token } = await accessTokenResponse.json()

    // Create HTML page that stores the token in localStorage and redirects
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
      background: #f5f5f5;
    }
    .container {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      border: 2px solid #000;
      box-shadow: 4px 4px 0 0 #000;
    }
    .loader {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #84cc16;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="loader"></div>
    <h2>Connecting your Shopify store...</h2>
    <p>Please wait while we complete the setup.</p>
  </div>
  <script>
    const shopifyData = {
      shop: "${shop}",
      accessToken: "${access_token}",
      connectedAt: new Date().toISOString()
    };

    localStorage.setItem("shopifyStore", JSON.stringify(shopifyData));

    // Redirect to settings page
    setTimeout(() => {
      window.location.href = "/dashboard/settings?connected=true";
    }, 1000);
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

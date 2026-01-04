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

    const tokenData = await accessTokenResponse.json()
    
    if (!tokenData.access_token) {
      console.error("No access token in response:", tokenData)
      return NextResponse.redirect(
        `${nextAuthUrl}/dashboard/settings?error=token_exchange_failed&message=${encodeURIComponent("No access token received from Shopify")}`,
      )
    }

    const access_token = tokenData.access_token

    // Properly escape values for safe injection into HTML/JavaScript
    const shopJson = JSON.stringify(shop)
    const tokenJson = JSON.stringify(access_token)
    const shopName = shop.replace('.myshopify.com', '')

    // Create HTML page with premium Ghost-themed animation
    // Stores token in localStorage and redirects to /ghost?auto=true
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Ghost Initializing...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --ghost-blue: #0070F3;
      --ghost-blue-glow: rgba(0, 112, 243, 0.4);
      --ghost-dark: #0a0a0a;
      --ghost-card: #111111;
      --ghost-border: rgba(0, 112, 243, 0.15);
      --ghost-text: #e5e5e5;
      --ghost-muted: #737373;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      background: var(--ghost-dark);
      color: var(--ghost-text);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    /* Animated background grid */
    .bg-grid {
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(rgba(0, 112, 243, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 112, 243, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: grid-pulse 4s ease-in-out infinite;
    }
    
    @keyframes grid-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }
    
    /* Floating particles */
    .particles {
      position: fixed;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }
    
    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--ghost-blue);
      border-radius: 50%;
      opacity: 0;
      animation: float-up 8s ease-in-out infinite;
    }
    
    .particle:nth-child(1) { left: 10%; animation-delay: 0s; }
    .particle:nth-child(2) { left: 25%; animation-delay: 1s; }
    .particle:nth-child(3) { left: 40%; animation-delay: 2s; }
    .particle:nth-child(4) { left: 55%; animation-delay: 3s; }
    .particle:nth-child(5) { left: 70%; animation-delay: 4s; }
    .particle:nth-child(6) { left: 85%; animation-delay: 5s; }
    
    @keyframes float-up {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.8; }
      100% { transform: translateY(-100vh) scale(1); opacity: 0; }
    }
    
    /* Main container */
    .container {
      position: relative;
      z-index: 10;
      text-align: center;
      padding: 3rem;
      max-width: 480px;
      width: 100%;
    }
    
    /* Ghost logo animation */
    .ghost-logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
      position: relative;
    }
    
    .ghost-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid var(--ghost-border);
      position: relative;
      animation: breathe 2s ease-in-out infinite;
    }
    
    .ghost-circle::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: var(--ghost-blue);
      animation: spin 1.5s linear infinite;
    }
    
    .ghost-icon {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }
    
    @keyframes breathe {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 var(--ghost-blue-glow); }
      50% { transform: scale(1.05); box-shadow: 0 0 30px 10px var(--ghost-blue-glow); }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    
    /* Typography */
    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    
    .store-name {
      color: var(--ghost-blue);
    }
    
    .subtitle {
      color: var(--ghost-muted);
      font-size: 0.9375rem;
      margin-bottom: 2.5rem;
    }
    
    /* Terminal-style progress */
    .terminal {
      background: var(--ghost-card);
      border: 1px solid var(--ghost-border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      margin-bottom: 1.5rem;
      box-shadow: 
        0 0 0 1px rgba(0, 112, 243, 0.1),
        0 20px 50px -10px rgba(0, 0, 0, 0.5);
    }
    
    .terminal-header {
      display: flex;
      gap: 6px;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--ghost-border);
    }
    
    .terminal-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    
    .terminal-dot.red { background: #ff5f56; }
    .terminal-dot.yellow { background: #ffbd2e; }
    .terminal-dot.green { background: #27c93f; }
    
    .log-line {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
      opacity: 0;
      transform: translateY(10px);
      animation: log-appear 0.4s ease forwards;
    }
    
    .log-line:nth-child(2) { animation-delay: 0.3s; }
    .log-line:nth-child(3) { animation-delay: 0.8s; }
    .log-line:nth-child(4) { animation-delay: 1.3s; }
    .log-line:nth-child(5) { animation-delay: 1.8s; }
    
    @keyframes log-appear {
      to { opacity: 1; transform: translateY(0); }
    }
    
    .log-prefix {
      color: var(--ghost-blue);
      flex-shrink: 0;
    }
    
    .log-text {
      color: var(--ghost-muted);
    }
    
    .log-text.success {
      color: var(--ghost-blue);
    }
    
    .cursor {
      display: inline-block;
      width: 8px;
      height: 14px;
      background: var(--ghost-blue);
      margin-left: 4px;
      animation: blink 1s step-end infinite;
    }
    
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    
    /* Progress bar */
    .progress-container {
      background: var(--ghost-card);
      border: 1px solid var(--ghost-border);
      border-radius: 8px;
      padding: 1rem 1.25rem;
    }
    
    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      font-size: 0.8125rem;
    }
    
    .progress-status {
      color: var(--ghost-muted);
    }
    
    .progress-percent {
      color: var(--ghost-blue);
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
    }
    
    .progress-bar {
      height: 6px;
      background: rgba(0, 112, 243, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--ghost-blue), #3291ff);
      border-radius: 3px;
      width: 0%;
      animation: progress-load 2.5s ease-out forwards;
      box-shadow: 0 0 20px var(--ghost-blue-glow);
    }
    
    @keyframes progress-load {
      0% { width: 0%; }
      20% { width: 25%; }
      40% { width: 45%; }
      60% { width: 70%; }
      80% { width: 90%; }
      100% { width: 100%; }
    }
    
    /* Error state */
    .error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      display: none;
    }
    
    /* Responsive */
    @media (max-width: 480px) {
      .container { padding: 1.5rem; }
      h1 { font-size: 1.5rem; }
      .terminal { padding: 1rem; }
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <div class="particles">
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
    <div class="particle"></div>
  </div>
  
  <div class="container">
    <div class="ghost-logo">
      <div class="ghost-circle">
        <div class="ghost-icon">👻</div>
      </div>
    </div>
    
    <h1>Initializing <span class="store-name">${shopName}</span></h1>
    <p class="subtitle">Ghost is connecting to your Shopify store</p>
    
    <div class="terminal">
      <div class="terminal-header">
        <div class="terminal-dot red"></div>
        <div class="terminal-dot yellow"></div>
        <div class="terminal-dot green"></div>
      </div>
      <div class="terminal-body">
        <div class="log-line">
          <span class="log-prefix">→</span>
          <span class="log-text">Establishing secure connection...</span>
        </div>
        <div class="log-line">
          <span class="log-prefix">→</span>
          <span class="log-text">Authenticating with Shopify Admin API...</span>
        </div>
        <div class="log-line">
          <span class="log-prefix">→</span>
          <span class="log-text">Storing access credentials locally...</span>
        </div>
        <div class="log-line">
          <span class="log-prefix">→</span>
          <span class="log-text">Preparing Ghost simulation engine...</span>
        </div>
        <div class="log-line">
          <span class="log-prefix">✓</span>
          <span class="log-text success">Ready to deploy Ghosts<span class="cursor"></span></span>
        </div>
      </div>
    </div>
    
    <div class="progress-container">
      <div class="progress-label">
        <span class="progress-status">Launching Ghost Mission Control</span>
        <span class="progress-percent" id="percent">0%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
    
    <div id="error" class="error"></div>
  </div>
  
  <script>
    // Animate percentage counter
    let progress = 0;
    const percentEl = document.getElementById('percent');
    const progressInterval = setInterval(() => {
      if (progress < 100) {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        percentEl.textContent = Math.floor(progress) + '%';
      }
    }, 200);
    
    try {
      // Store Shopify credentials in localStorage
      const shopifyData = {
        shop: ${shopJson},
        accessToken: ${tokenJson},
        connectedAt: new Date().toISOString()
      };
      
      localStorage.setItem("shopifyStore", JSON.stringify(shopifyData));
      
      // Redirect to Ghost Mission Control with auto-discovery flag
      setTimeout(() => {
        clearInterval(progressInterval);
        percentEl.textContent = '100%';
        window.location.href = "/ghost?auto=true";
      }, 3000);
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error storing Shopify data:", error);
      const errorEl = document.getElementById("error");
      if (errorEl) {
        errorEl.textContent = "Failed to store connection data. Redirecting...";
        errorEl.style.display = "block";
      }
      setTimeout(() => {
        window.location.href = "/ghost";
      }, 3000);
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

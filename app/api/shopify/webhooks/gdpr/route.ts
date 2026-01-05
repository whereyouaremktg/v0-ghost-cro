import { NextResponse } from "next/server"
import crypto from "crypto"

// Helper to verify Shopify webhook signature
function verifyWebhook(data: string, hmac: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.warn("SHOPIFY_WEBHOOK_SECRET not set - skipping verification in development")
    return process.env.NODE_ENV !== "production"
  }
  
  if (!hmac) return false
  
  const hash = crypto
    .createHmac("sha256", secret)
    .update(data, "utf8")
    .digest("base64")

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const topic = req.headers.get("x-shopify-topic")
    const hmac = req.headers.get("x-shopify-hmac-sha256")
    const rawBody = await req.text()

    // Verify source (Security Best Practice)
    if (!verifyWebhook(rawBody, hmac)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // We just log it for now. 
    // In a real app, you MUST handle data erasure requests here to be legal.
    // Since we store minimal PII (email/name) in Supabase, manual deletion is okay for MVP.
    console.log(`GDPR Webhook received: ${topic}`, rawBody)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("GDPR Webhook Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}


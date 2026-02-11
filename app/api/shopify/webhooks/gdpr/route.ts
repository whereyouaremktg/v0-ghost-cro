import { NextResponse } from "next/server"
import crypto from "crypto"

function verifyWebhookSignature(body: string, hmac: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET
  if (!secret) {
    console.error("SHOPIFY_WEBHOOK_SECRET not set - cannot verify GDPR webhook")
    return false
  }

  if (!hmac) {
    return false
  }

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64")

  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac))
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  try {
    const topic = req.headers.get("x-shopify-topic") || ""
    const hmac = req.headers.get("x-shopify-hmac-sha256")
    const shop = req.headers.get("x-shopify-shop-domain") || "unknown-shop"
    const rawBody = await req.text()

    if (!verifyWebhookSignature(rawBody, hmac)) {
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 401 },
      )
    }

    const payload = rawBody ? JSON.parse(rawBody) : {}

    switch (topic) {
      case "customers/data_request":
        console.log("[GDPR] customers/data_request received", {
          shop,
          customerId: payload?.customer?.id ?? null,
          orderCount: payload?.orders_requested?.length ?? 0,
        })
        break
      case "customers/redact":
        console.log("[GDPR] customers/redact received", {
          shop,
          customerId: payload?.customer?.id ?? null,
          note: "TODO: implement customer data deletion flow",
        })
        break
      case "shop/redact":
        console.log("[GDPR] shop/redact received", {
          shop,
          shopId: payload?.shop_id ?? null,
          note: "TODO: implement shop data deletion flow",
        })
        break
      default:
        console.log("[GDPR] Unhandled webhook topic", { shop, topic })
        break
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("GDPR Webhook Error:", error)
    return NextResponse.json({ error: "Server Error" }, { status: 500 })
  }
}

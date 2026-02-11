import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { decryptToken } from "@/lib/security/encryption"
import { verifyActiveSubscription } from "@/lib/shopify/billing"

export async function GET(request: NextRequest) {
  try {
    if (!process.env.CRON_SECRET) {
      console.error("CRON_SECRET is not configured")
      return NextResponse.json({ error: "Cron is not configured" }, { status: 500 })
    }

    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    const baseUrl =
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : request.nextUrl.origin)

    const { data: stores, error: storesError } = await supabaseAdmin
      .from("stores")
      .select("shop, access_token, user_id")
      .eq("is_active", true)

    if (storesError) {
      console.error("Failed to load active stores for weekly scan cron:", storesError)
      return NextResponse.json({ error: "Failed to load stores" }, { status: 500 })
    }

    const triggeredShops: string[] = []
    const skippedShops: string[] = []
    let emailCount = 0

    for (const store of stores || []) {
      if (!store.shop || !store.access_token || !store.user_id) {
        skippedShops.push(store.shop || "unknown")
        continue
      }

      const accessToken = decryptToken(store.access_token)
      const hasActiveSubscription = await verifyActiveSubscription(store.shop, accessToken)

      if (!hasActiveSubscription) {
        skippedShops.push(store.shop)
        continue
      }

      try {
        const analysisResponse = await fetch(`${baseUrl}/api/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-cron-secret": process.env.CRON_SECRET,
          },
          body: JSON.stringify({ userId: store.user_id }),
        })

        if (!analysisResponse.ok) {
          const errorBody = await analysisResponse.text()
          console.error(`Failed to trigger cron analysis for ${store.shop}:`, errorBody)
          skippedShops.push(store.shop)
          continue
        }

        triggeredShops.push(store.shop)

        if (resend) {
          await resend.emails.send({
            from: "Ghost CRO <reports@ghostcro.com>",
            to: process.env.TEST_EMAIL || "founder@example.com",
            subject: `Weekly Report: ${store.shop}`,
            html: `<p>Weekly scan triggered for <strong>${store.shop}</strong>. A new analysis job is now running.</p>`,
          })
          emailCount += 1
        }
      } catch (error) {
        console.error(`Cron trigger failed for ${store.shop}:`, error)
        skippedShops.push(store.shop)
      }
    }

    console.log("Weekly cron triggered stores:", triggeredShops)
    if (skippedShops.length > 0) {
      console.log("Weekly cron skipped stores:", skippedShops)
    }

    return NextResponse.json({
      success: true,
      triggered: triggeredShops.length,
      skipped: skippedShops.length,
      triggeredShops,
      skippedShops,
      emailsSent: emailCount,
    })
  } catch (error) {
    console.error("Weekly scan cron failed:", error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}

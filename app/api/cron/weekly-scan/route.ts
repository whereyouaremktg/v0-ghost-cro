import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend"

export async function GET(request: NextRequest) {
  try {
    // 1. Auth Check
    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Initialize Emailer
    const resendKey = process.env.RESEND_API_KEY
    const resend = resendKey ? new Resend(resendKey) : null

    // 3. Get Active Stores
    const { data: stores } = await supabaseAdmin
      .from("stores")
      .select("shop, user_id, is_active")
      .eq("is_active", true)

    // 4. Loop & Notify
    let emailCount = 0
    for (const store of stores || []) {
      console.log(`Scanning ${store.shop}...`)

      if (resend) {
        // Send retention email (Default to test email for MVP safety)
        const targetEmail = process.env.TEST_EMAIL || "founder@example.com"

        await resend.emails.send({
          from: "Ghost CRO <reports@ghostcro.com>",
          to: targetEmail,
          subject: `👻 Weekly Report: ${store.shop}`,
          html: `<p>We scanned <strong>${store.shop}</strong>. Log in to see your new Conversion Health Score.</p>`
        })
        emailCount++
      }
    }

    return NextResponse.json({ success: true, emailsSent: emailCount })
  } catch (error) {
    console.error("Cron failed:", error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}

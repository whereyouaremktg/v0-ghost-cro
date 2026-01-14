import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Resend } from "resend" 

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
    const { data: stores } = await supabaseAdmin.from("stores").select("shop, is_active").eq("is_active", true)

    let emailCount = 0
    for (const store of stores || []) {
      if (resend) {
        await resend.emails.send({
          from: "Ghost CRO <reports@ghostcro.com>",
          to: process.env.TEST_EMAIL || "founder@example.com", 
          subject: `👻 Weekly Report: ${store.shop}`,
          html: `<p>We scanned <strong>${store.shop}</strong>. Log in to see your new Health Score.</p>`
        })
        emailCount++
      }
    }
    return NextResponse.json({ success: true, emailsSent: emailCount })
  } catch (error) {
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}

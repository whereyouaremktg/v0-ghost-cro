import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Email integration using Resend
// Install: npm install resend
let Resend: any = null
try {
  Resend = require("resend").Resend
} catch {
  // Resend not installed - will log email simulation instead
  console.warn("Resend package not installed. Emails will be simulated.")
}

/**
 * Weekly Watchdog Cron Job
 * 
 * This endpoint is called by Vercel Cron to scan all active stores
 * for retention monitoring and health checks.
 * 
 * Security: Protected by CRON_SECRET environment variable
 * 
 * Expected Vercel Cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/weekly-scan",
 *     "schedule": "0 0 * * 0"  // Every Sunday at midnight UTC
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify Authorization header matches CRON_SECRET
    const authHeader = request.headers.get("Authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error("CRON_SECRET environment variable is not set")
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      )
    }

    // Verify the Authorization header matches the secret
    // Expected format: "Bearer <CRON_SECRET>" or just "<CRON_SECRET>"
    const providedSecret = authHeader?.replace("Bearer ", "").trim()
    
    if (!authHeader || providedSecret !== cronSecret) {
      console.error("Invalid cron secret provided")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    console.log("=== WEEKLY WATCHDOG SCAN START ===")

    // Query Supabase for all active stores
    const { data: stores, error: storesError } = await supabaseAdmin
      .from("stores")
      .select("id, shop, user_id, is_active, updated_at")
      .eq("is_active", true)

    if (storesError) {
      console.error("Failed to fetch active stores:", storesError)
      return NextResponse.json(
        { error: "Failed to fetch stores", details: storesError.message },
        { status: 500 }
      )
    }

    const storesCount = stores?.length || 0
    console.log(`Found ${storesCount} active stores to scan`)

    // Initialize Resend if available
    const resendApiKey = process.env.RESEND_API_KEY
    const resend = Resend && resendApiKey ? new Resend(resendApiKey) : null

    // Iterate through stores and send retention emails
    let emailsSent = 0
    for (const store of stores || []) {
      console.log(`Running scan for ${store.shop} (user: ${store.user_id})`)
      
      // Get user email from profiles table
      // TODO: Join with profiles table to get user email
      // For now, use TEST_EMAIL env var or skip if not available
      const testEmail = process.env.TEST_EMAIL
      
      if (resend && testEmail) {
        try {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "Ghost CRO <noreply@ghostcro.com>",
            to: testEmail, // TODO: Replace with store.user_email after joining profiles table
            subject: "Ghost Report: Weekly Scan Complete",
            text: `We scanned your store ${store.shop}. Log in to see your new Health Score.\n\nVisit: ${process.env.NEXT_PUBLIC_APP_URL || "https://ghostcro.com"}/dashboard`,
          })
          emailsSent++
          console.log(`✓ Email sent for ${store.shop}`)
        } catch (emailError) {
          console.error(`Failed to send email for ${store.shop}:`, emailError)
        }
      } else {
        // Email simulation (when Resend not configured)
        console.log(`[EMAIL SIMULATION] Would send to user for store ${store.shop}`)
        console.log(`  Subject: Ghost Report: Weekly Scan Complete`)
        console.log(`  Body: We scanned your store ${store.shop}. Log in to see your new Health Score.`)
      }
    }

    console.log("=== WEEKLY WATCHDOG SCAN COMPLETE ===")

    return NextResponse.json({
      success: true,
      storesScanned: storesCount,
      emailsSent: emailsSent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Weekly scan cron job error:", error)
    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

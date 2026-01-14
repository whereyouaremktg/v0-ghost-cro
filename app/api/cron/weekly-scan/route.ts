import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

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

    // Iterate through stores and log scan (stub for now)
    // TODO: Implement actual retention monitoring logic:
    // - Check last activity date
    // - Verify subscription status
    // - Flag inactive stores for follow-up
    // - Send retention emails if needed
    for (const store of stores || []) {
      console.log(`Running scan for ${store.shop} (user: ${store.user_id})`)
      // Stub: Add actual retention logic here
    }

    console.log("=== WEEKLY WATCHDOG SCAN COMPLETE ===")

    return NextResponse.json({
      success: true,
      storesScanned: storesCount,
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

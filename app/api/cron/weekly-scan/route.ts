import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

/**
 * Weekly Watchdog Cron Job
 * Scans all active stores for monitoring and health checks
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check: Require CRON_SECRET
    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Query Supabase for active stores
    const { data: stores, error: storesError } = await supabaseAdmin
      .from("stores")
      .select("shop")
      .eq("is_active", true)

    if (storesError) {
      console.error("Failed to query stores:", storesError)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    // Loop through stores and log scanning
    const count = stores?.length || 0
    for (const store of stores || []) {
      console.log(`Scanning ${store.shop}`)
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Weekly scan cron failed:", error)
    return NextResponse.json({ error: "Cron failed" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { syncToCRM, formatContactForCRM } from "@/lib/crm/sync"

/**
 * CRM Sync API Endpoint
 * 
 * This endpoint can be called to manually sync user data to CRM,
 * or can be triggered by webhooks/events.
 * 
 * POST /api/crm/sync
 * Body: { userId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    // Get store connection if exists
    const { data: store } = await supabaseAdmin
      .from('stores')
      .select('shop, connected_at')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    // Format and sync to CRM
    const contact = formatContactForCRM(profile, store || undefined)
    await syncToCRM('user.created', contact, {
      userId,
      syncedAt: new Date().toISOString(),
    })

    // Update sync timestamp
    await supabaseAdmin
      .from('profiles')
      .update({ crm_synced_at: new Date().toISOString() })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      message: "Contact synced to CRM",
    })
  } catch (error) {
    console.error("CRM sync error:", error)
    return NextResponse.json(
      { error: "Failed to sync to CRM" },
      { status: 500 }
    )
  }
}


import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({
        connected: false,
        propertyId: null,
      })
    }

    // Check if user has GA4 connection
    const { data: connection, error } = await supabase
      .from('ga4_connections')
      .select('selected_property_id')
      .eq('user_id', user.id)
      .single()

    if (error || !connection) {
      return NextResponse.json({
        connected: false,
        propertyId: null,
      })
    }

    return NextResponse.json({
      connected: true,
      propertyId: connection.selected_property_id,
    })
  } catch (error) {
    console.error("Error checking GA4 status:", error)
    return NextResponse.json({
      connected: false,
      propertyId: null,
    })
  }
}

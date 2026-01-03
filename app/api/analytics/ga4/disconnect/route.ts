import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Delete GA4 connection
    const { error } = await supabase
      .from('ga4_connections')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error("Error disconnecting GA4:", error)
      return NextResponse.json(
        { error: "Failed to disconnect GA4" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "GA4 disconnected successfully",
    })
  } catch (error) {
    console.error("Error in disconnect route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

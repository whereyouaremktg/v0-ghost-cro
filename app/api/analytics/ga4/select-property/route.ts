import { NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const SelectPropertySchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = SelectPropertySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      )
    }

    const { data: updatedRow, error: updateError } = await supabase
      .from("ga4_connections")
      .update({ selected_property_id: parsed.data.propertyId })
      .eq("user_id", user.id)
      .select("user_id")
      .maybeSingle()

    if (updateError) {
      console.error("Failed to save GA4 selected property:", updateError)
      return NextResponse.json({ error: "Failed to save property" }, { status: 500 })
    }

    if (!updatedRow) {
      return NextResponse.json({ error: "GA4 connection not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("GA4 select-property route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

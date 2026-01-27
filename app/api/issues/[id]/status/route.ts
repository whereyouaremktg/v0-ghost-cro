import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { test_id, status } = await request.json()

    if (!test_id || !status) {
      return NextResponse.json(
        { error: "test_id and status are required" },
        { status: 400 },
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase.from("issue_status").upsert({
      user_id: user.id,
      test_id,
      issue_id: params.id,
      status,
      fixed_at: status === "fixed" ? new Date().toISOString() : null,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error("Failed to update issue status", error)
    return NextResponse.json(
      { error: "Failed to update issue status" },
      { status: 500 },
    )
  }
}

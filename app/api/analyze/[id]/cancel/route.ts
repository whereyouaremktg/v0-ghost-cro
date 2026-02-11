import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    void request
    const params = await context.params
    const jobId = params.id
    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from("tests")
      .select("id, user_id, status, results")
      .eq("id", jobId)
      .maybeSingle()

    if (jobError) {
      console.error("Failed to load job for cancel:", jobError)
      return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 })
    }

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    if (job.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const existingResults =
      job.results && typeof job.results === "object"
        ? (job.results as Record<string, unknown>)
        : {}

    const { error: updateError } = await supabaseAdmin
      .from("tests")
      .update({
        status: "failed",
        results: {
          ...existingResults,
          error: "Canceled by user",
        },
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId)

    if (updateError) {
      console.error("Failed to update canceled job:", updateError)
      return NextResponse.json({ error: "Failed to cancel job" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cancel analysis route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

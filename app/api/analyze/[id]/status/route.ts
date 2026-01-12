import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/analyze/[id]/status
 * 
 * Polling endpoint to check analysis job status
 * Returns job status and results when completed
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch job from database
    const { data: job, error: dbError } = await supabase
      .from("tests")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", user.id)
      .single()

    if (dbError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Return job status and results
    return NextResponse.json({
      id: job.id,
      status: job.status,
      store_url: job.store_url,
      overall_score: job.overall_score,
      friction_score: job.friction_score,
      trust_score: job.trust_score,
      clarity_score: job.clarity_score,
      mobile_score: job.mobile_score,
      results: job.results,
      created_at: job.created_at,
      completed_at: job.completed_at,
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json(
      { error: "Failed to check job status" },
      { status: 500 }
    )
  }
}

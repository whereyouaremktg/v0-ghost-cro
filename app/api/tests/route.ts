import { NextResponse } from "next/server"
import { saveTestResult, getAllTestResults } from "@/lib/test-storage"
import type { TestResult } from "@/lib/types"

// POST - Save a test result
export async function POST(request: Request) {
  try {
    const result: TestResult = await request.json()
    saveTestResult(result)
    return NextResponse.json({ success: true, id: result.id })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save test result" }, { status: 500 })
  }
}

// GET - Get all test results
export async function GET() {
  try {
    const results = getAllTestResults()
    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get test results" }, { status: 500 })
  }
}

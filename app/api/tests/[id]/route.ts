import { NextResponse } from "next/server"
import { getTestResult } from "@/lib/test-storage"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = getTestResult(id)

    if (!result) {
      return NextResponse.json({ error: "Test result not found" }, { status: 404 })
    }

    return NextResponse.json({ result })
  } catch (error) {
    return NextResponse.json({ error: "Failed to get test result" }, { status: 500 })
  }
}

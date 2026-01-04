import { NextRequest, NextResponse } from "next/server"
import {
  fetchAbandonedCheckouts,
  calculateAbandonedCheckoutStats,
  type AbandonedCheckout,
} from "@/lib/shopify/client"

/**
 * GET /api/shopify/checkouts
 * 
 * Fetch abandoned checkouts from Shopify
 * 
 * Query params:
 * - shop: Shopify store domain
 * - accessToken: OAuth access token
 * - status: 'open' or 'closed' (default: 'open')
 * - limit: Max number of checkouts to return (default: 250)
 * - days: Number of days to look back (default: 30)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shop, accessToken, status = "open", limit = 250, days = 30 } = body

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing shop or accessToken" },
        { status: 400 }
      )
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Fetch abandoned checkouts
    const checkouts = await fetchAbandonedCheckouts(
      { shop, accessToken },
      {
        status: status as "open" | "closed",
        limit,
        created_at_min: startDate.toISOString(),
        created_at_max: endDate.toISOString(),
      }
    )

    // Calculate statistics
    const stats = calculateAbandonedCheckoutStats(checkouts)

    return NextResponse.json({
      success: true,
      period: {
        start: startDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
        days,
      },
      checkouts,
      stats,
    })
  } catch (error) {
    console.error("Error fetching abandoned checkouts:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch abandoned checkouts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}




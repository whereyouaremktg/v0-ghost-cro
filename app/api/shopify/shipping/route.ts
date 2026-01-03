import { NextRequest, NextResponse } from "next/server"
import {
  fetchShippingZones,
  analyzeShippingShock,
  fetchAbandonedCheckouts,
} from "@/lib/shopify/client"

/**
 * POST /api/shopify/shipping
 * 
 * Fetch shipping zones and analyze shipping shock
 * 
 * Body:
 * - shop: Shopify store domain
 * - accessToken: OAuth access token
 * - includeAnalysis: Whether to include shipping shock analysis (requires abandoned checkouts)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shop, accessToken, includeAnalysis = true } = body

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing shop or accessToken" },
        { status: 400 }
      )
    }

    // Fetch shipping zones
    const shippingZones = await fetchShippingZones({ shop, accessToken })

    // Optionally fetch abandoned checkouts for analysis
    let shippingShockAnalysis = null
    if (includeAnalysis) {
      try {
        // Get abandoned checkouts from last 30 days
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - 30)

        const abandonedCheckouts = await fetchAbandonedCheckouts(
          { shop, accessToken },
          {
            status: "open",
            limit: 250,
            created_at_min: startDate.toISOString(),
            created_at_max: endDate.toISOString(),
          }
        )

        shippingShockAnalysis = analyzeShippingShock(shippingZones, abandonedCheckouts)
      } catch (error) {
        console.error("Failed to fetch abandoned checkouts for shipping analysis:", error)
        // Still return shipping zones even if analysis fails
        shippingShockAnalysis = analyzeShippingShock(shippingZones, [])
      }
    }

    return NextResponse.json({
      success: true,
      shippingZones,
      analysis: shippingShockAnalysis,
    })
  } catch (error) {
    console.error("Error fetching shipping zones:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch shipping zones",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}



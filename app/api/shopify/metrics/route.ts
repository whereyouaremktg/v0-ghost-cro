import { NextRequest, NextResponse } from "next/server"
import {
  fetchAbandonedCheckouts,
  calculateAbandonedCheckoutStats,
  fetchShippingZones,
  analyzeShippingShock,
} from "@/lib/shopify/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shop, accessToken } = body

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing shop or accessToken" },
        { status: 400 }
      )
    }

    // Calculate date range for last 30 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const formatDate = (date: Date) => date.toISOString().split("T")[0]

    // Fetch analytics data from Shopify Admin API
    // Note: This uses the Reports API for analytics data
    // For more detailed analytics, you may need Shopify Plus with Analytics API access

    // Get orders for the last 30 days
    const ordersUrl = `https://${shop}/admin/api/2024-01/orders.json?status=any&created_at_min=${startDate.toISOString()}`
    const ordersResponse = await fetch(ordersUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!ordersResponse.ok) {
      const errorText = await ordersResponse.text()
      console.error("Shopify API error:", errorText)
      return NextResponse.json(
        { error: "Failed to fetch orders from Shopify", details: errorText },
        { status: ordersResponse.status }
      )
    }

    const ordersData = await ordersResponse.json()
    const orders = ordersData.orders || []

    // Calculate metrics
    const totalOrders = orders.length
    const totalRevenue = orders.reduce(
      (sum: number, order: any) => sum + parseFloat(order.total_price || "0"),
      0
    )

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Fetch abandoned checkouts for the last 30 days
    let abandonedCheckouts = []
    let abandonedCheckoutStats = null
    
    try {
      abandonedCheckouts = await fetchAbandonedCheckouts(
        { shop, accessToken },
        {
          status: "open",
          limit: 250,
          created_at_min: startDate.toISOString(),
          created_at_max: endDate.toISOString(),
        }
      )
      
      abandonedCheckoutStats = calculateAbandonedCheckoutStats(abandonedCheckouts)
    } catch (error) {
      console.error("Failed to fetch abandoned checkouts:", error)
      // Continue without abandoned checkout data - don't fail the entire request
    }

    // Fetch shipping zones and rates
    let shippingZones = []
    let shippingShockAnalysis = null
    
    try {
      shippingZones = await fetchShippingZones({ shop, accessToken })
      
      // Analyze shipping shock using abandoned checkout data
      if (abandonedCheckouts.length > 0) {
        shippingShockAnalysis = analyzeShippingShock(shippingZones, abandonedCheckouts)
      } else {
        // Still analyze shipping zones even without checkout data
        shippingShockAnalysis = analyzeShippingShock(shippingZones, [])
      }
    } catch (error) {
      console.error("Failed to fetch shipping zones:", error)
      // Continue without shipping data - don't fail the entire request
    }

    // For sessions and conversion rate, we'd need Shopify Analytics API (requires Shopify Plus)
    // or access to Google Analytics. For now, we'll return what we can calculate from orders.

    // Try to fetch shop data to get some additional context
    const shopUrl = `https://${shop}/admin/api/2024-01/shop.json`
    const shopResponse = await fetch(shopUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    let shopData = null
    if (shopResponse.ok) {
      const shopJson = await shopResponse.json()
      shopData = shopJson.shop
    }

    // Return calculated metrics
    return NextResponse.json({
      success: true,
      period: {
        start: formatDate(startDate),
        end: formatDate(endDate),
        days: 30,
      },
      metrics: {
        totalOrders,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
        currency: orders[0]?.currency || shopData?.currency || "USD",
        // Note: Sessions and conversion rate require Analytics API access
        // These would need to be calculated from external analytics or Shopify Plus
        estimatedConversionRate: null, // Requires Analytics API
        totalSessions: null, // Requires Analytics API
      },
      abandonedCheckouts: {
        total: abandonedCheckoutStats?.total || 0,
        totalValue: abandonedCheckoutStats?.totalValue || 0,
        averageValue: abandonedCheckoutStats?.averageValue || 0,
        dropOffPoints: abandonedCheckoutStats?.dropOffPoints || {
          atCart: 0,
          atShipping: 0,
          atPayment: 0,
          unknown: 0,
        },
        byDay: abandonedCheckoutStats?.byDay || [],
      },
      shipping: {
        zones: shippingZones.length,
        analysis: shippingShockAnalysis
          ? {
              hasFreeShipping: shippingShockAnalysis.hasFreeShipping,
              freeShippingThreshold: shippingShockAnalysis.freeShippingThreshold,
              averageShippingCost: shippingShockAnalysis.averageShippingCost,
              shippingCostRange: shippingShockAnalysis.shippingCostRange,
              hasHiddenShipping: shippingShockAnalysis.hasHiddenShipping,
              countriesWithHighShipping: shippingShockAnalysis.countriesWithHighShipping,
              recommendations: shippingShockAnalysis.recommendations,
            }
          : null,
      },
      shop: {
        name: shopData?.name || shop,
        domain: shopData?.domain || shop,
        email: shopData?.email || null,
      },
      note: "Session data and conversion rates require Shopify Analytics API (Shopify Plus) or external analytics integration.",
    })
  } catch (error) {
    console.error("Error fetching Shopify metrics:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

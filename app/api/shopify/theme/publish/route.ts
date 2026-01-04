/**
 * Shopify Theme Publish API
 * 
 * Publishes a Ghost-optimized sandbox theme to make it live
 */

import { NextRequest, NextResponse } from "next/server"
import { publishTheme } from "@/lib/shopify/theme-sandbox"

export interface PublishRequest {
  shop: string
  accessToken: string
  themeId: number
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json()
    
    // Validate required fields
    if (!body.shop || !body.accessToken || !body.themeId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing shop, accessToken, or themeId"
        },
        { status: 400 }
      )
    }
    
    const config = {
      shop: body.shop,
      accessToken: body.accessToken,
    }
    
    // Publish the theme
    const result = await publishTheme(config, body.themeId)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: "Theme published successfully"
      }, { status: 200 })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || "Failed to publish theme"
        },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error("Theme publish error:", error)
    
    const errorMessage = error instanceof Error ? error.message : "Unexpected error during publish"
    const statusCode = errorMessage.includes("Permission") ? 403 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: statusCode }
    )
  }
}



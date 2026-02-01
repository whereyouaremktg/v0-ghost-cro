/**
 * Ghost Sandbox Deployment API
 * 
 * Handles deployment of AI-generated code fixes to a sandboxed Shopify theme.
 * Creates a new sandbox theme if needed, then injects the code fixes.
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { deployFixesToSandbox, findGhostSandboxes } from "@/lib/shopify/theme-sandbox"
import type { CodeFix, DeploymentResult } from "@/lib/types"

export interface DeployRequest {
  shop?: string
  accessToken?: string
  fixes: Array<{
    frictionPointId: string
    codeFix: CodeFix
  }>
  createNewSandbox?: boolean
  existingSandboxId?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: DeployRequest = await request.json()

    if (!body.fixes || body.fixes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No fixes provided for deployment",
          errorCode: "API_ERROR"
        } as DeploymentResult,
        { status: 400 }
      )
    }

    let shop = body.shop
    let accessToken = body.accessToken

    if (!shop || !accessToken) {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized", errorCode: "PERMISSION_DENIED" } as DeploymentResult,
          { status: 401 }
        )
      }

      const { data: store, error: storeError } = await supabase
        .from("stores")
        .select("shop, access_token")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle()

      if (storeError || !store) {
        return NextResponse.json(
          { success: false, error: "No active store found for this user", errorCode: "PERMISSION_DENIED" } as DeploymentResult,
          { status: 400 }
        )
      }

      shop = shop || store.shop
      accessToken = accessToken || store.access_token
    }

    if (!shop || !accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing shop or accessToken",
          errorCode: "PERMISSION_DENIED"
        } as DeploymentResult,
        { status: 400 }
      )
    }

    const config = {
      shop,
      accessToken,
    }
    
    // Deploy fixes to sandbox
    const result = await deployFixesToSandbox(
      config,
      body.fixes.map(f => ({ id: f.frictionPointId, codeFix: f.codeFix })),
      {
        createNewSandbox: body.createNewSandbox ?? true,
        existingSandboxId: body.existingSandboxId,
      }
    )
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      const statusCode = result.errorCode === "PERMISSION_DENIED" ? 403 : 
                         result.errorCode === "RATE_LIMITED" ? 429 : 500
      return NextResponse.json(result, { status: statusCode })
    }
    
  } catch (error) {
    console.error("Sandbox deployment error:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unexpected error during deployment",
        errorCode: "API_ERROR"
      } as DeploymentResult,
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to list existing Ghost sandbox themes
 */
export async function GET(request: NextRequest) {
  try {
    const shop = request.nextUrl.searchParams.get("shop")
    const accessToken = request.headers.get("X-Shopify-Access-Token")
    
    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing shop parameter or access token" },
        { status: 400 }
      )
    }
    
    const sandboxes = await findGhostSandboxes({ shop, accessToken })
    
    return NextResponse.json({
      sandboxes: sandboxes.map(s => ({
        id: s.id,
        name: s.name,
        role: s.role,
        createdAt: s.created_at,
        previewable: s.previewable,
      }))
    })
    
  } catch (error) {
    console.error("Failed to list sandbox themes:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list sandboxes" },
      { status: 500 }
    )
  }
}



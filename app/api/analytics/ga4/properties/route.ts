import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { google } from 'googleapis'
import { refreshAccessTokenIfNeeded } from '@/lib/analytics/ga4-oauth'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Get fresh access token
    const tokenData = await refreshAccessTokenIfNeeded(user.id)

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: tokenData.access_token,
    })

    // Use Admin API to list GA4 properties
    const analyticsAdmin = google.analyticsadmin('v1beta')

    const response = await analyticsAdmin.accounts.list({
      auth: oauth2Client,
    })

    const accounts = response.data.accounts || []
    const properties = []

    // Fetch properties for each account
    for (const account of accounts) {
      try {
        const propertiesResponse = await analyticsAdmin.properties.list({
          filter: `parent:${account.name}`,
          auth: oauth2Client,
        })

        const accountProperties = (propertiesResponse.data.properties || []).map(prop => ({
          id: prop.name?.split('/')[1], // Extract numeric ID
          displayName: prop.displayName,
          accountName: account.displayName,
          createTime: prop.createTime,
        }))

        properties.push(...accountProperties)
      } catch (error) {
        console.error(`Error fetching properties for account ${account.name}:`, error)
        // Continue with other accounts
      }
    }

    return NextResponse.json({
      success: true,
      properties,
    })
  } catch (error) {
    console.error("Failed to fetch GA4 properties:", error)

    // Handle token expiration
    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        {
          error: "GA4 connection expired. Please reconnect your account.",
          reconnect: true,
        },
        { status: 401 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to fetch GA4 properties",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST endpoint to save selected property
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID is required" },
        { status: 400 }
      )
    }

    // Update selected property
    const { error } = await supabase
      .from('ga4_connections')
      .update({ selected_property_id: propertyId })
      .eq('user_id', user.id)

    if (error) {
      console.error("Error saving property:", error)
      return NextResponse.json(
        { error: "Failed to save property" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Property saved successfully",
    })
  } catch (error) {
    console.error("Error in save property route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

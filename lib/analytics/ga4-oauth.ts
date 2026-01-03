import { google } from 'googleapis'
import { createClient } from '@/lib/supabase/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

interface TokenData {
  access_token: string
  refresh_token: string
  expires_at: string
}

/**
 * Refresh the access token if it's expired
 */
export async function refreshAccessTokenIfNeeded(
  userId: string
): Promise<TokenData> {
  const supabase = await createClient()

  // Get current tokens
  const { data: connection, error } = await supabase
    .from('ga4_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !connection) {
    throw new Error('No GA4 connection found. Please connect your Google Analytics account.')
  }

  const expiresAt = new Date(connection.expires_at)
  const now = new Date()

  // If token is still valid (with 5-minute buffer), return it
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000) {
    return {
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
      expires_at: connection.expires_at,
    }
  }

  // Token is expired, refresh it
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/google-analytics/callback`
  )

  oauth2Client.setCredentials({
    refresh_token: connection.refresh_token,
  })

  try {
    const { credentials } = await oauth2Client.refreshAccessToken()

    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token')
    }

    // Update database with new token
    const newExpiresAt = new Date(credentials.expiry_date || Date.now() + 3600000)

    await supabase
      .from('ga4_connections')
      .update({
        access_token: credentials.access_token,
        expires_at: newExpiresAt.toISOString(),
      })
      .eq('user_id', userId)

    return {
      access_token: credentials.access_token,
      refresh_token: connection.refresh_token,
      expires_at: newExpiresAt.toISOString(),
    }
  } catch (error) {
    console.error('Token refresh failed:', error)
    throw new Error('GA4 connection expired. Please reconnect your Google Analytics account.')
  }
}

/**
 * Create GA4 client with OAuth credentials
 */
export async function createGA4ClientWithOAuth(
  userId: string
): Promise<BetaAnalyticsDataClient> {
  const tokenData = await refreshAccessTokenIfNeeded(userId)

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
  })

  return new BetaAnalyticsDataClient({
    auth: oauth2Client,
  })
}

/**
 * Check if user has GA4 connected
 */
export async function hasGA4Connection(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ga4_connections')
    .select('id')
    .eq('user_id', userId)
    .single()

  return !error && !!data
}

/**
 * Get selected GA4 property ID for user
 */
export async function getSelectedPropertyId(userId: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ga4_connections')
    .select('selected_property_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.selected_property_id
}

/**
 * Update selected GA4 property ID
 */
export async function updateSelectedPropertyId(
  userId: string,
  propertyId: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ga4_connections')
    .update({ selected_property_id: propertyId })
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to update selected property')
  }
}

/**
 * Disconnect GA4 (delete tokens)
 */
export async function disconnectGA4(userId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ga4_connections')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error('Failed to disconnect GA4')
  }
}

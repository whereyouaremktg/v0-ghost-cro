import { NextRequest, NextResponse } from 'next/server'
import { fetchGA4Metrics, type GA4Config } from '@/lib/analytics/ga4-client'
import { createClient } from '@/lib/supabase/server'
import { createGA4ClientWithOAuth, getSelectedPropertyId } from '@/lib/analytics/ga4-oauth'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()
    const { propertyId, credentials, startDate, endDate, useOAuth = true } = body

    // Parse dates or use defaults (last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    let analyticsClient: BetaAnalyticsDataClient
    let finalPropertyId = propertyId

    // Try OAuth first if user is authenticated
    if (useOAuth && user) {
      try {
        analyticsClient = await createGA4ClientWithOAuth(user.id)

        // If no propertyId provided, try to get saved one
        if (!finalPropertyId) {
          finalPropertyId = await getSelectedPropertyId(user.id)
        }

        if (!finalPropertyId) {
          return NextResponse.json(
            {
              error: 'No GA4 property selected',
              hint: 'Please select a property from your settings'
            },
            { status: 400 }
          )
        }

        // Fetch metrics using OAuth
        const propertyPath = `properties/${finalPropertyId}`
        const formatDate = (date: Date) => date.toISOString().split('T')[0]

        const [metricsResponse] = await analyticsClient.runReport({
          property: propertyPath,
          dateRanges: [{ startDate: formatDate(start), endDate: formatDate(end) }],
          metrics: [
            { name: 'sessions' },
            { name: 'totalUsers' },
            { name: 'transactions' },
            { name: 'averageSessionDuration' },
            { name: 'bounceRate' },
          ],
        })

        const rows = metricsResponse.rows || []
        const getValue = (index: number) => parseFloat(rows[0]?.metricValues?.[index]?.value || '0')

        const sessions = getValue(0)
        const totalUsers = getValue(1)
        const transactions = getValue(2)
        const conversionRate = sessions > 0 ? (transactions / sessions) * 100 : 0

        const metrics = {
          sessions,
          totalUsers,
          transactions,
          conversionRate: parseFloat(conversionRate.toFixed(2)),
          averageSessionDuration: parseFloat(getValue(3).toFixed(2)),
          bounceRate: parseFloat((getValue(4) * 100).toFixed(2)),
          source: 'ga4' as const,
        }

        return NextResponse.json({
          success: true,
          method: 'oauth',
          period: {
            start: formatDate(start),
            end: formatDate(end),
            days: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
          },
          metrics,
        })
      } catch (oauthError) {
        console.warn('OAuth failed, falling back to service account:', oauthError)
        // Fall through to service account method
      }
    }

    // Fallback to service account method (backwards compatibility)
    if (!propertyId || !credentials) {
      return NextResponse.json(
        { error: 'Missing propertyId or credentials' },
        { status: 400 }
      )
    }

    // Validate credentials structure
    if (!credentials.client_email || !credentials.private_key) {
      return NextResponse.json(
        { error: 'Invalid credentials format. Need client_email and private_key from service account JSON.' },
        { status: 400 }
      )
    }

    const config: GA4Config = {
      propertyId,
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    }

    // Fetch metrics from GA4 using service account
    const metrics = await fetchGA4Metrics(config, start, end)

    return NextResponse.json({
      success: true,
      method: 'service_account',
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        days: Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)),
      },
      metrics,
    })
  } catch (error) {
    console.error('GA4 API error:', error)

    // Handle token expiration
    if (error instanceof Error && error.message.includes('expired')) {
      return NextResponse.json(
        {
          error: 'GA4 connection expired. Please reconnect your account.',
          reconnect: true,
        },
        { status: 401 }
      )
    }

    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Permission denied')) {
        return NextResponse.json(
          {
            error: 'Permission denied. Make sure the service account has access to the GA4 property.',
            details: error.message,
          },
          { status: 403 }
        )
      }

      if (error.message.includes('not found')) {
        return NextResponse.json(
          {
            error: 'GA4 property not found. Check your Property ID.',
            details: error.message,
          },
          { status: 404 }
        )
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

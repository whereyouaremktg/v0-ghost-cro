/**
 * Google Analytics 4 Client
 *
 * Fetches session data, conversion metrics, and demographic information
 * from Google Analytics 4 using the Google Analytics Data API
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data'

export interface GA4Config {
  propertyId: string
  credentials: {
    client_email: string
    private_key: string
  }
}

export interface GA4Metrics {
  sessions: number
  totalUsers: number
  transactions: number
  conversionRate: number
  averageSessionDuration: number
  bounceRate: number
  demographics: {
    ageGroups: Array<{
      ageRange: string
      sessions: number
      percentage: number
    }>
    genders: Array<{
      gender: string
      sessions: number
      percentage: number
    }>
    locations: Array<{
      country: string
      city?: string
      sessions: number
      percentage: number
    }>
    devices: Array<{
      deviceCategory: string
      sessions: number
      percentage: number
    }>
  }
  source: 'ga4'
}

/**
 * Initialize GA4 client with service account credentials
 */
export function createGA4Client(config: GA4Config): BetaAnalyticsDataClient {
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: config.credentials.client_email,
      private_key: config.credentials.private_key.replace(/\\n/g, '\n'),
    },
  })
}

/**
 * Fetch metrics from GA4
 */
export async function fetchGA4Metrics(
  config: GA4Config,
  startDate: Date,
  endDate: Date
): Promise<GA4Metrics> {
  const analyticsDataClient = createGA4Client(config)
  const propertyId = `properties/${config.propertyId}`

  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  try {
    // Fetch overall metrics
    const [metricsResponse] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'transactions' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    })

    const sessions = parseInt(metricsResponse.rows?.[0]?.metricValues?.[0]?.value || '0')
    const totalUsers = parseInt(metricsResponse.rows?.[0]?.metricValues?.[1]?.value || '0')
    const transactions = parseInt(metricsResponse.rows?.[0]?.metricValues?.[2]?.value || '0')
    const averageSessionDuration = parseFloat(metricsResponse.rows?.[0]?.metricValues?.[3]?.value || '0')
    const bounceRate = parseFloat(metricsResponse.rows?.[0]?.metricValues?.[4]?.value || '0')

    const conversionRate = sessions > 0 ? (transactions / sessions) * 100 : 0

    // Fetch demographic data - Age
    const [ageResponse] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'userAgeBracket' }],
      metrics: [{ name: 'sessions' }],
    })

    const ageGroups = (ageResponse.rows || []).map((row) => ({
      ageRange: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0, // Will calculate below
    }))

    // Calculate percentages
    const totalAgeSessions = ageGroups.reduce((sum, group) => sum + group.sessions, 0)
    ageGroups.forEach((group) => {
      group.percentage = totalAgeSessions > 0 ? (group.sessions / totalAgeSessions) * 100 : 0
    })

    // Fetch demographic data - Gender
    const [genderResponse] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'userGender' }],
      metrics: [{ name: 'sessions' }],
    })

    const genders = (genderResponse.rows || []).map((row) => ({
      gender: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalGenderSessions = genders.reduce((sum, g) => sum + g.sessions, 0)
    genders.forEach((g) => {
      g.percentage = totalGenderSessions > 0 ? (g.sessions / totalGenderSessions) * 100 : 0
    })

    // Fetch demographic data - Locations (top 10)
    const [locationResponse] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'sessions' }],
      limit: 10,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    })

    const locations = (locationResponse.rows || []).map((row) => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      city: row.dimensionValues?.[1]?.value,
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalLocationSessions = locations.reduce((sum, loc) => sum + loc.sessions, 0)
    locations.forEach((loc) => {
      loc.percentage = totalLocationSessions > 0 ? (loc.sessions / totalLocationSessions) * 100 : 0
    })

    // Fetch device data
    const [deviceResponse] = await analyticsDataClient.runReport({
      property: propertyId,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    })

    const devices = (deviceResponse.rows || []).map((row) => ({
      deviceCategory: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalDeviceSessions = devices.reduce((sum, d) => sum + d.sessions, 0)
    devices.forEach((d) => {
      d.percentage = totalDeviceSessions > 0 ? (d.sessions / totalDeviceSessions) * 100 : 0
    })

    return {
      sessions,
      totalUsers,
      transactions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      averageSessionDuration: parseFloat(averageSessionDuration.toFixed(2)),
      bounceRate: parseFloat(bounceRate.toFixed(2)),
      demographics: {
        ageGroups: ageGroups.sort((a, b) => b.sessions - a.sessions),
        genders: genders.sort((a, b) => b.sessions - a.sessions),
        locations: locations.sort((a, b) => b.sessions - a.sessions),
        devices: devices.sort((a, b) => b.sessions - a.sessions),
      },
      source: 'ga4',
    }
  } catch (error) {
    console.error('Failed to fetch GA4 metrics:', error)
    throw error
  }
}

/**
 * Fetch only demographic data from GA4 (lightweight version)
 */
export async function fetchGA4Demographics(
  analyticsClient: any,
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<GA4Metrics['demographics'] | null> {
  const propertyPath = `properties/${propertyId}`
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  try {
    // Fetch demographic data - Age
    const [ageResponse] = await analyticsClient.runReport({
      property: propertyPath,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'userAgeBracket' }],
      metrics: [{ name: 'sessions' }],
    })

    const ageGroups = (ageResponse.rows || []).map((row: any) => ({
      ageRange: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalAgeSessions = ageGroups.reduce((sum, group) => sum + group.sessions, 0)
    ageGroups.forEach((group) => {
      group.percentage = totalAgeSessions > 0 ? (group.sessions / totalAgeSessions) * 100 : 0
    })

    // Fetch demographic data - Gender
    const [genderResponse] = await analyticsClient.runReport({
      property: propertyPath,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'userGender' }],
      metrics: [{ name: 'sessions' }],
    })

    const genders = (genderResponse.rows || []).map((row: any) => ({
      gender: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalGenderSessions = genders.reduce((sum, g) => sum + g.sessions, 0)
    genders.forEach((g) => {
      g.percentage = totalGenderSessions > 0 ? (g.sessions / totalGenderSessions) * 100 : 0
    })

    // Fetch device data
    const [deviceResponse] = await analyticsClient.runReport({
      property: propertyPath,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    })

    const devices = (deviceResponse.rows || []).map((row: any) => ({
      deviceCategory: row.dimensionValues?.[0]?.value || 'Unknown',
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalDeviceSessions = devices.reduce((sum, d) => sum + d.sessions, 0)
    devices.forEach((d) => {
      d.percentage = totalDeviceSessions > 0 ? (d.sessions / totalDeviceSessions) * 100 : 0
    })

    // Fetch locations (top 10)
    const [locationResponse] = await analyticsClient.runReport({
      property: propertyPath,
      dateRanges: [
        {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        },
      ],
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'sessions' }],
      limit: 10,
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    })

    const locations = (locationResponse.rows || []).map((row: any) => ({
      country: row.dimensionValues?.[0]?.value || 'Unknown',
      city: row.dimensionValues?.[1]?.value,
      sessions: parseInt(row.metricValues?.[0]?.value || '0'),
      percentage: 0,
    }))

    const totalLocationSessions = locations.reduce((sum, loc) => sum + loc.sessions, 0)
    locations.forEach((loc) => {
      loc.percentage = totalLocationSessions > 0 ? (loc.sessions / totalLocationSessions) * 100 : 0
    })

    return {
      ageGroups: ageGroups.sort((a, b) => b.sessions - a.sessions),
      genders: genders.sort((a, b) => b.sessions - a.sessions),
      locations: locations.sort((a, b) => b.sessions - a.sessions),
      devices: devices.sort((a, b) => b.sessions - a.sessions),
    }
  } catch (error) {
    console.error('Failed to fetch GA4 demographics:', error)
    return null
  }
}

/**
 * Generate realistic personas based on GA4 demographic data
 * Returns personas in the format: "Persona Name (Age X, $Y, Device)"
 */
export function generatePersonasFromGA4Demographics(
  demographics: GA4Metrics['demographics'],
  count: number = 5
): string[] {
  const personas: string[] = []

  // Get top age groups, devices, and locations
  const topAgeGroups = demographics.ageGroups.filter(ag => ag.ageRange && ag.ageRange !== 'Unknown').slice(0, 3)
  const topGenders = demographics.genders.filter(g => g.gender && g.gender !== 'Unknown').slice(0, 2)
  const topDevices = demographics.devices.filter(d => d.deviceCategory && d.deviceCategory !== 'Unknown').slice(0, 2)
  const topLocations = demographics.locations.slice(0, 3)

  // If we don't have enough demographic data, return empty array (will fallback to defaults)
  if (topAgeGroups.length === 0 || topDevices.length === 0) {
    return []
  }

  // Map age ranges to specific ages and income estimates
  const ageMapping: Record<string, { age: number; income: string; personaName: string }> = {
    '18-24': { age: 21, income: '$45K', personaName: 'Gen Z Shopper' },
    '25-34': { age: 29, income: '$70K', personaName: 'Millennial Professional' },
    '35-44': { age: 38, income: '$95K', personaName: 'Established Buyer' },
    '45-54': { age: 48, income: '$110K', personaName: 'Experienced Shopper' },
    '55-64': { age: 58, income: '$105K', personaName: 'Mature Buyer' },
    '65+': { age: 68, income: '$75K', personaName: 'Senior Shopper' },
  }

  // Generate personas based on actual demographic distribution
  for (let i = 0; i < count; i++) {
    const ageGroup = topAgeGroups[i % topAgeGroups.length]
    const device = topDevices[i % topDevices.length]
    const location = topLocations[i % topLocations.length]
    const gender = topGenders[i % topGenders.length] || { gender: '', percentage: 0 }

    const ageData = ageMapping[ageGroup.ageRange] || { age: 35, income: '$75K', personaName: 'Typical Shopper' }
    const deviceName = device.deviceCategory === 'mobile' ? 'Mobile' : device.deviceCategory === 'tablet' ? 'Tablet' : 'Desktop'

    // Create persona name based on demographics
    let personaName = ageData.personaName
    if (location.city || location.country) {
      personaName = `${location.city || location.country} ${ageData.personaName}`
    }

    // Format: "Persona Name (Age X, $Y, Device)"
    const personaString = `${personaName} (Age ${ageData.age}, ${ageData.income}, ${deviceName})`
    personas.push(personaString)
  }

  return personas
}

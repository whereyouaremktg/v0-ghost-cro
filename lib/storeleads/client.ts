/**
 * Store Leads API Client
 * This is the only place that touches the external Store Leads API
 */

interface StoreLeadsResponse {
  domain?: string
  estimated_sales_monthly?: number
  estimated_traffic_monthly?: number
  global_rank?: number
  industry?: string
  platform?: string
  technologies?: Array<{
    name: string
    category?: string
  }>
}

interface NormalizedStoreLeadsData {
  revenue: number | null
  traffic: number | null
  rank: number | null
  apps: string[]
}

/**
 * Clean domain: remove https://, http://, www., and trailing slashes
 */
function cleanDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '')
    .toLowerCase()
    .trim()
}

/**
 * Fetch store intelligence data from Store Leads API
 * @param domain - Store domain (e.g., "store.myshopify.com" or "store.com")
 * @returns Normalized data or null if not found/error
 */
export async function fetchStoreLeadsData(
  domain: string
): Promise<NormalizedStoreLeadsData | null> {
  const apiKey = process.env.STORE_LEADS_API_KEY

  if (!apiKey) {
    console.warn('STORE_LEADS_API_KEY not configured')
    return null
  }

  const cleanedDomain = cleanDomain(domain)

  try {
    // Store Leads API uses query parameter for API key authentication
    const url = `https://storeleads.app/json/api/v1/all/domain/${encodeURIComponent(cleanedDomain)}?api_key=${encodeURIComponent(apiKey)}`
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Handle 404 - domain not found in Store Leads
    if (response.status === 404) {
      console.log(`Store Leads: Domain not found: ${cleanedDomain}`)
      return null
    }

    // Handle 429 - Rate limit
    if (response.status === 429) {
      console.warn('Store Leads: Rate limit exceeded')
      return null
    }

    // Handle other errors
    if (!response.ok) {
      console.error(`Store Leads API error: ${response.status} ${response.statusText}`)
      return null
    }

    const data: StoreLeadsResponse = await response.json()

    // Normalize the response
    return {
      revenue: data.estimated_sales_monthly || null,
      traffic: data.estimated_traffic_monthly || null,
      rank: data.global_rank || null,
      apps: (data.technologies || []).map((tech) => tech.name),
    }
  } catch (error) {
    console.error('Store Leads API request failed:', error)
    return null
  }
}


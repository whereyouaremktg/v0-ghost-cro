/**
 * Shopify API Client
 * 
 * Utilities for interacting with Shopify Admin API
 */

export interface ShopifyClientConfig {
  shop: string
  accessToken: string
}

export interface AbandonedCheckout {
  id: string
  cart_token: string
  email: string | null
  created_at: string
  updated_at: string
  abandoned_checkout_url: string
  total_price: string
  subtotal_price: string
  total_tax: string
  currency: string
  line_items: Array<{
    id: string
    title: string
    quantity: number
    price: string
    variant_title?: string
  }>
  shipping_lines: Array<{
    title: string
    price: string
    code?: string
  }>
  billing_address: {
    first_name: string
    last_name: string
    address1: string
    city: string
    province: string
    country: string
    zip: string
  } | null
  shipping_address: {
    first_name: string
    last_name: string
    address1: string
    city: string
    province: string
    country: string
    zip: string
  } | null
  completed_at: string | null
  note: string | null
  discount_codes: Array<{
    code: string
    amount: string
    type: string
  }>
}

export interface AbandonedCheckoutsResponse {
  checkouts: AbandonedCheckout[]
}

/**
 * Fetch abandoned checkouts from Shopify
 * 
 * @param config - Shopify client configuration
 * @param options - Query options
 * @returns Array of abandoned checkouts
 */
export async function fetchAbandonedCheckouts(
  config: ShopifyClientConfig,
  options: {
    status?: "open" | "closed"
    limit?: number
    created_at_min?: string
    created_at_max?: string
  } = {}
): Promise<AbandonedCheckout[]> {
  const { shop, accessToken } = config
  const { status = "open", limit = 250, created_at_min, created_at_max } = options

  const url = new URL(`https://${shop}/admin/api/2024-01/checkouts.json`)
  
  // Add query parameters
  if (status) {
    url.searchParams.append("status", status)
  }
  if (limit) {
    url.searchParams.append("limit", limit.toString())
  }
  if (created_at_min) {
    url.searchParams.append("created_at_min", created_at_min)
  }
  if (created_at_max) {
    url.searchParams.append("created_at_max", created_at_max)
  }

  const response = await fetch(url.toString(), {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch abandoned checkouts: ${errorText}`)
  }

  const data: AbandonedCheckoutsResponse = await response.json()
  return data.checkouts || []
}

/**
 * Get abandoned checkout statistics
 */
export interface AbandonedCheckoutStats {
  total: number
  totalValue: number
  averageValue: number
  byDay: Array<{
    date: string
    count: number
    value: number
  }>
  dropOffPoints: {
    atCart: number
    atShipping: number
    atPayment: number
    unknown: number
  }
}

export function calculateAbandonedCheckoutStats(
  checkouts: AbandonedCheckout[]
): AbandonedCheckoutStats {
  const total = checkouts.length
  const totalValue = checkouts.reduce(
    (sum, checkout) => sum + parseFloat(checkout.total_price || "0"),
    0
  )
  const averageValue = total > 0 ? totalValue / total : 0

  // Group by day
  const byDayMap = new Map<string, { count: number; value: number }>()
  
  checkouts.forEach((checkout) => {
    const date = new Date(checkout.created_at).toISOString().split("T")[0]
    const existing = byDayMap.get(date) || { count: 0, value: 0 }
    byDayMap.set(date, {
      count: existing.count + 1,
      value: existing.value + parseFloat(checkout.total_price || "0"),
    })
  })

  const byDay = Array.from(byDayMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Analyze drop-off points
  // Note: This is a simplified analysis - we'd need more data to accurately determine drop-off point
  const dropOffPoints = {
    atCart: 0,
    atShipping: 0,
    atPayment: 0,
    unknown: 0,
  }

  checkouts.forEach((checkout) => {
    // If they have shipping address but no completed_at, likely dropped at payment
    if (checkout.shipping_address && !checkout.completed_at) {
      dropOffPoints.atPayment++
    }
    // If they have line items but no shipping, likely dropped at shipping
    else if (checkout.line_items.length > 0 && !checkout.shipping_address) {
      dropOffPoints.atShipping++
    }
    // Otherwise, likely at cart
    else if (checkout.line_items.length > 0) {
      dropOffPoints.atCart++
    } else {
      dropOffPoints.unknown++
    }
  })

  return {
    total,
    totalValue,
    averageValue,
    byDay,
    dropOffPoints,
  }
}

/**
 * Shipping Zone and Rate Types
 */
export interface Country {
  id: number
  name: string
  code: string
  tax: number
  tax_name: string
  provinces: Array<{
    id: number
    name: string
    code: string
    tax: number
    tax_name: string
  }>
}

export interface ShippingRate {
  id: number
  name: string
  price: string
  shipping_zone_id: number
  carrier_service_id?: number
  carrier_service_type?: string
  min_order_subtotal?: string
  max_order_subtotal?: string
  min_weight?: string
  max_weight?: string
  delivery_category?: string
}

export interface ShippingZone {
  id: number
  name: string
  profile_id?: number
  location_group_id?: number
  countries: Country[]
  price_based_shipping_rates: ShippingRate[]
  weight_based_shipping_rates: ShippingRate[]
  carrier_shipping_rate_providers: Array<{
    id: number
    carrier_service_id: number
    flat_modifier: string
    percent_modifier: string
    service_filter: any
  }>
}

export interface ShippingZonesResponse {
  shipping_zones: ShippingZone[]
}

/**
 * Fetch shipping zones and rates from Shopify
 * 
 * @param config - Shopify client configuration
 * @returns Array of shipping zones with rates
 */
export async function fetchShippingZones(
  config: ShopifyClientConfig
): Promise<ShippingZone[]> {
  const { shop, accessToken } = config

  const url = `https://${shop}/admin/api/2024-01/shipping_zones.json`

  const response = await fetch(url, {
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Failed to fetch shipping zones: ${errorText}`)
  }

  const data: ShippingZonesResponse = await response.json()
  return data.shipping_zones || []
}

/**
 * Calculate shipping shock metrics
 * 
 * Shipping shock occurs when:
 * 1. Shipping costs are hidden until checkout
 * 2. Shipping costs are unexpectedly high
 * 3. Free shipping threshold is not clearly communicated
 */
export interface ShippingShockAnalysis {
  hasFreeShipping: boolean
  freeShippingThreshold: number | null
  averageShippingCost: number
  minShippingCost: number
  maxShippingCost: number
  shippingCostRange: string
  hasHiddenShipping: boolean // Shipping not visible on product page
  countriesWithHighShipping: Array<{
    country: string
    minCost: number
    maxCost: number
  }>
  recommendations: string[]
}

export function analyzeShippingShock(
  shippingZones: ShippingZone[],
  abandonedCheckouts: AbandonedCheckout[]
): ShippingShockAnalysis {
  // Collect all shipping rates
  const allRates: Array<{ rate: ShippingRate; zone: string }> = []
  
  shippingZones.forEach((zone) => {
    zone.price_based_shipping_rates.forEach((rate) => {
      allRates.push({ rate, zone: zone.name })
    })
    zone.weight_based_shipping_rates.forEach((rate) => {
      allRates.push({ rate, zone: zone.name })
    })
  })

  // Calculate shipping costs
  const shippingCosts = allRates
    .map(({ rate }) => parseFloat(rate.price || "0"))
    .filter((cost) => cost > 0)

  const averageShippingCost =
    shippingCosts.length > 0
      ? shippingCosts.reduce((sum, cost) => sum + cost, 0) / shippingCosts.length
      : 0
  const minShippingCost = shippingCosts.length > 0 ? Math.min(...shippingCosts) : 0
  const maxShippingCost = shippingCosts.length > 0 ? Math.max(...shippingCosts) : 0

  // Check for free shipping
  const freeShippingRates = allRates.filter(
    (r) => parseFloat(r.rate.price || "0") === 0
  )
  const hasFreeShipping = freeShippingRates.length > 0

  // Find free shipping threshold (min order subtotal required)
  const freeShippingThresholds = freeShippingRates
    .map((r) => parseFloat(r.rate.min_order_subtotal || "0"))
    .filter((threshold) => threshold > 0)
  const freeShippingThreshold =
    freeShippingThresholds.length > 0 ? Math.min(...freeShippingThresholds) : null

  // Analyze abandoned checkouts for shipping-related abandonment
  const checkoutsWithShipping = abandonedCheckouts.filter(
    (checkout) => checkout.shipping_lines && checkout.shipping_lines.length > 0
  )
  const shippingCostsInCheckouts = checkoutsWithShipping.map((checkout) =>
    parseFloat(checkout.shipping_lines[0]?.price || "0")
  )

  // Identify countries with high shipping costs
  const countriesWithHighShipping: Array<{
    country: string
    minCost: number
    maxCost: number
  }> = []

  shippingZones.forEach((zone) => {
    const zoneRates = [
      ...zone.price_based_shipping_rates,
      ...zone.weight_based_shipping_rates,
    ]
    const zoneCosts = zoneRates
      .map((rate) => parseFloat(rate.price || "0"))
      .filter((cost) => cost > 0)

    if (zoneCosts.length > 0) {
      const avgCost = zoneCosts.reduce((sum, cost) => sum + cost, 0) / zoneCosts.length
      // Consider "high" if average is above $15
      if (avgCost > 15) {
        zone.countries.forEach((country) => {
          countriesWithHighShipping.push({
            country: country.name,
            minCost: Math.min(...zoneCosts),
            maxCost: Math.max(...zoneCosts),
          })
        })
      }
    }
  })

  // Generate recommendations
  const recommendations: string[] = []
  
  if (!hasFreeShipping) {
    recommendations.push("Consider adding free shipping to reduce cart abandonment")
  }
  
  if (freeShippingThreshold && freeShippingThreshold > 50) {
    recommendations.push(
      `Free shipping threshold is $${freeShippingThreshold} - consider lowering or clearly displaying this threshold on product pages`
    )
  }
  
  if (averageShippingCost > 10) {
    recommendations.push(
      `Average shipping cost is $${averageShippingCost.toFixed(2)} - consider showing shipping costs earlier in the funnel or offering free shipping`
    )
  }
  
  if (countriesWithHighShipping.length > 0) {
    recommendations.push(
      `${countriesWithHighShipping.length} shipping zone(s) have high shipping costs - consider regional pricing or free shipping thresholds`
    )
  }

  // Determine if shipping is hidden (heuristic: if we have shipping zones but no clear indication on product pages)
  // This would ideally be determined from the store analysis, but we can infer from checkout data
  const hasHiddenShipping = checkoutsWithShipping.length > 0 && shippingCostsInCheckouts.length > 0

  return {
    hasFreeShipping,
    freeShippingThreshold,
    averageShippingCost: parseFloat(averageShippingCost.toFixed(2)),
    minShippingCost: parseFloat(minShippingCost.toFixed(2)),
    maxShippingCost: parseFloat(maxShippingCost.toFixed(2)),
    shippingCostRange: `$${minShippingCost.toFixed(2)} - $${maxShippingCost.toFixed(2)}`,
    hasHiddenShipping,
    countriesWithHighShipping,
    recommendations,
  }
}


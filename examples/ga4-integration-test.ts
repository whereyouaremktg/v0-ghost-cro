/**
 * Example: How to use GA4 Integration in Ghost CRO
 *
 * This shows how to fetch metrics with GA4 credentials
 */

// Example: Fetch Shopify metrics WITH GA4 integration
async function fetchMetricsWithGA4() {
  // These would come from your settings/database in production
  const ga4PropertyId = '123456789' // Your GA4 Property ID
  const ga4Credentials = {
    client_email: 'ghost-cro@your-project.iam.gserviceaccount.com',
    private_key: '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n',
  }

  const response = await fetch('/api/shopify/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shop: 'your-store.myshopify.com',
      accessToken: 'your-shopify-access-token',
      // Include GA4 credentials to get real analytics data
      ga4PropertyId,
      ga4Credentials,
    }),
  })

  const data = await response.json()

  console.log('Metrics:', data.metrics)
  console.log('Data Quality:', data.dataQuality)
  console.log('Demographics:', data.demographics)

  // Expected output with GA4:
  // {
  //   metrics: {
  //     totalSessions: 15821,  // Real data from GA4!
  //     conversionRate: 2.64,  // Real conversion rate!
  //     averageOrderValue: 58.27,
  //     dataSource: 'ga4'
  //   },
  //   dataQuality: "✅ Real analytics data from Google Analytics 4",
  //   demographics: {
  //     ageGroups: [
  //       { ageRange: '25-34', sessions: 5234, percentage: 33.1 },
  //       { ageRange: '35-44', sessions: 4123, percentage: 26.1 },
  //       ...
  //     ],
  //     devices: [
  //       { deviceCategory: 'mobile', sessions: 9823, percentage: 62.1 },
  //       { deviceCategory: 'desktop', sessions: 5998, percentage: 37.9 }
  //     ],
  //     ...
  //   }
  // }
}

// Example: Fetch GA4 metrics directly (without Shopify)
async function fetchGA4Only() {
  const response = await fetch('/api/analytics/ga4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      propertyId: '123456789',
      credentials: {
        client_email: 'ghost-cro@your-project.iam.gserviceaccount.com',
        private_key: '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n',
      },
      startDate: '2025-12-04', // Optional - defaults to last 30 days
      endDate: '2026-01-03',   // Optional
    }),
  })

  const data = await response.json()

  console.log('GA4 Metrics:', data.metrics)

  // Expected output:
  // {
  //   success: true,
  //   period: { start: '2025-12-04', end: '2026-01-03', days: 30 },
  //   metrics: {
  //     sessions: 15821,
  //     totalUsers: 12453,
  //     transactions: 417,
  //     conversionRate: 2.64,
  //     demographics: { ... }
  //   }
  // }
}

// Example: Generate personas from GA4 demographics
import { generatePersonasFromGA4Demographics } from '@/lib/analytics/ga4-client'

function generateRealisticPersonas(demographics: any) {
  const personas = generatePersonasFromGA4Demographics(demographics, 5)

  console.log('Generated Personas:', personas)

  // Expected output:
  // [
  //   {
  //     name: 'New York Shopper',
  //     age: '29',
  //     income: '$70K',
  //     device: 'Mobile',
  //     location: 'New York, United States'
  //   },
  //   {
  //     name: 'Los Angeles Shopper',
  //     age: '38',
  //     income: '$95K',
  //     device: 'Desktop',
  //     location: 'Los Angeles, United States'
  //   },
  //   ...
  // ]
}

// How to store GA4 credentials (localStorage example for testing)
function storeGA4Credentials(propertyId: string, clientEmail: string, privateKey: string) {
  localStorage.setItem('ga4PropertyId', propertyId)
  localStorage.setItem('ga4Credentials', JSON.stringify({
    client_email: clientEmail,
    private_key: privateKey,
  }))
}

function loadGA4Credentials() {
  const propertyId = localStorage.getItem('ga4PropertyId')
  const credentialsJson = localStorage.getItem('ga4Credentials')

  if (!propertyId || !credentialsJson) {
    return null
  }

  return {
    propertyId,
    credentials: JSON.parse(credentialsJson),
  }
}

export {
  fetchMetricsWithGA4,
  fetchGA4Only,
  generateRealisticPersonas,
  storeGA4Credentials,
  loadGA4Credentials,
}

/**
 * Shopify Billing API Integration
 *
 * Handles app subscription creation, management, and cancellation
 * using Shopify's GraphQL Admin API.
 */

// Plan configuration
export interface ShopifyPlan {
  name: string
  price: number
  testsLimit: number
  trialDays: number
  description: string
}

export const SHOPIFY_PLANS: Record<string, ShopifyPlan> = {
  starter: {
    name: "Starter",
    price: 49,
    testsLimit: 5,
    trialDays: 7,
    description: "Perfect for small stores testing the waters",
  },
  growth: {
    name: "Growth",
    price: 99,
    testsLimit: 15,
    trialDays: 7,
    description: "For growing stores serious about optimization",
  },
  scale: {
    name: "Scale",
    price: 150,
    testsLimit: 999,
    trialDays: 7,
    description: "For high-volume stores maximizing conversions",
  },
}

// Map plan key to tests limit (for webhook handlers)
export const PLAN_TESTS_LIMIT: Record<string, number> = {
  starter: 5,
  growth: 15,
  scale: 999,
  free: 1,
}

/**
 * GraphQL mutation to create an app subscription
 */
export const APP_SUBSCRIPTION_CREATE = `
  mutation AppSubscriptionCreate(
    $name: String!
    $lineItems: [AppSubscriptionLineItemInput!]!
    $returnUrl: URL!
    $trialDays: Int
    $test: Boolean
  ) {
    appSubscriptionCreate(
      name: $name
      returnUrl: $returnUrl
      trialDays: $trialDays
      test: $test
      lineItems: $lineItems
    ) {
      appSubscription {
        id
        status
        createdAt
        currentPeriodEnd
        trialDays
      }
      confirmationUrl
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * GraphQL query to get current active subscriptions
 */
export const GET_CURRENT_SUBSCRIPTION = `
  query GetCurrentSubscription {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        status
        createdAt
        currentPeriodEnd
        trialDays
        test
        lineItems {
          plan {
            pricingDetails {
              ... on AppRecurringPricing {
                price {
                  amount
                  currencyCode
                }
                interval
              }
            }
          }
        }
      }
    }
  }
`

/**
 * GraphQL mutation to cancel an app subscription
 */
export const APP_SUBSCRIPTION_CANCEL = `
  mutation AppSubscriptionCancel($id: ID!) {
    appSubscriptionCancel(id: $id) {
      appSubscription {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * GraphQL response types
 */
export interface AppSubscription {
  id: string
  name: string
  status: string
  createdAt: string
  currentPeriodEnd: string | null
  trialDays: number
  test: boolean
  lineItems?: Array<{
    plan: {
      pricingDetails: {
        price: {
          amount: string
          currencyCode: string
        }
        interval: string
      }
    }
  }>
}

export interface SubscriptionCreateResponse {
  data?: {
    appSubscriptionCreate?: {
      appSubscription?: AppSubscription
      confirmationUrl?: string
      userErrors?: Array<{
        field: string[]
        message: string
      }>
    }
  }
  errors?: Array<{ message: string }>
}

export interface CurrentSubscriptionResponse {
  data?: {
    currentAppInstallation?: {
      activeSubscriptions?: AppSubscription[]
    }
  }
  errors?: Array<{ message: string }>
}

export interface SubscriptionCancelResponse {
  data?: {
    appSubscriptionCancel?: {
      appSubscription?: {
        id: string
        status: string
      }
      userErrors?: Array<{
        field: string[]
        message: string
      }>
    }
  }
  errors?: Array<{ message: string }>
}

/**
 * Execute a GraphQL query/mutation against Shopify Admin API
 */
export async function shopifyGraphQL<T = unknown>(
  shop: string,
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const url = `https://${shop}/admin/api/2024-01/graphql.json`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Shopify GraphQL error (${response.status}): ${errorText}`)
  }

  return response.json() as Promise<T>
}

/**
 * Create a new app subscription
 */
export async function createSubscription(
  shop: string,
  accessToken: string,
  planKey: string,
  returnUrl: string,
  isTest: boolean = false
): Promise<SubscriptionCreateResponse> {
  const plan = SHOPIFY_PLANS[planKey]
  if (!plan) {
    throw new Error(`Invalid plan: ${planKey}`)
  }

  const variables = {
    name: `Ghost CRO ${plan.name} Plan`,
    returnUrl,
    trialDays: plan.trialDays,
    test: isTest,
    lineItems: [
      {
        plan: {
          appRecurringPricingDetails: {
            price: {
              amount: plan.price,
              currencyCode: "USD",
            },
            interval: "EVERY_30_DAYS",
          },
        },
      },
    ],
  }

  return shopifyGraphQL<SubscriptionCreateResponse>(
    shop,
    accessToken,
    APP_SUBSCRIPTION_CREATE,
    variables
  )
}

/**
 * Get current active subscription for the app installation
 */
export async function getCurrentSubscription(
  shop: string,
  accessToken: string
): Promise<CurrentSubscriptionResponse> {
  return shopifyGraphQL<CurrentSubscriptionResponse>(
    shop,
    accessToken,
    GET_CURRENT_SUBSCRIPTION
  )
}

/**
 * Cancel an app subscription
 */
export async function cancelSubscription(
  shop: string,
  accessToken: string,
  subscriptionId: string
): Promise<SubscriptionCancelResponse> {
  return shopifyGraphQL<SubscriptionCancelResponse>(
    shop,
    accessToken,
    APP_SUBSCRIPTION_CANCEL,
    { id: subscriptionId }
  )
}

/**
 * Extract plan key from subscription name
 * e.g., "Ghost CRO Growth Plan" -> "growth"
 */
export function extractPlanFromName(subscriptionName: string): string {
  const name = subscriptionName.toLowerCase()
  if (name.includes("scale")) return "scale"
  if (name.includes("growth")) return "growth"
  if (name.includes("starter")) return "starter"
  return "free"
}

/**
 * Get the base URL for the app (handles various deployment scenarios)
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

/**
 * Verify that a store has an active subscription
 * 
 * This is a hard gate for monetization - checks Shopify directly
 * to ensure the store has an ACTIVE subscription before allowing
 * access to expensive AI analysis features.
 * 
 * @param shop - Shopify store domain (e.g., "mystore.myshopify.com")
 * @param accessToken - Shopify OAuth access token
 * @returns true if store has an active subscription, false otherwise
 */
export async function verifyActiveSubscription(
  shop: string,
  accessToken: string
): Promise<boolean> {
  try {
    // Run the GET_CURRENT_SUBSCRIPTION query
    const result = await getCurrentSubscription(shop, accessToken)
    const subscriptions = result.data?.currentAppInstallation?.activeSubscriptions || []
    
    // Return TRUE only if status is "ACTIVE"
    // Return FALSE if null, cancelled, or frozen
    if (subscriptions.length === 0) {
      return false
    }
    
    const hasActiveSubscription = subscriptions.some(
      (sub: AppSubscription) => {
        const status = sub.status?.toUpperCase()
        return status === "ACTIVE"
      }
    )
    
    return hasActiveSubscription
  } catch (error) {
    console.error(`Failed to verify subscription for ${shop}:`, error)
    // Fail closed - if we can't verify, deny access
    return false
  }
}

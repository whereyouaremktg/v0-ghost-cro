/**
 * Shopify OAuth Scopes
 *
 * Required permissions for Ghost CRO to analyze stores.
 *
 * Note: The Billing API (appSubscriptionCreate, etc.) does NOT require
 * a special OAuth scope - it's available to all apps by default since
 * it bills the merchant for app usage, not store data access.
 * See: https://shopify.dev/docs/api/admin-graphql/latest/mutations/appSubscriptionCreate
 */

export const SHOPIFY_SCOPES = [
  // Analytics & Data (read-only)
  "read_analytics",        // Access to store analytics data
  "read_customer_events",  // Customer behavior tracking
  "read_orders",          // Order data and conversion metrics
  "read_product_listings", // Product listing information
  "read_products",        // Product details and inventory
  "read_reports",         // Store performance reports
  "read_themes",          // Theme information for checkout analysis
  "read_checkouts",       // Abandoned checkout data (critical for CRO)
  "read_shipping",        // Shipping rates and zones
  "read_customers",       // Customer segments and data
] as const

/**
 * Get all scopes as a comma-separated string for OAuth URL
 */
export function getAllScopesString(): string {
  return SHOPIFY_SCOPES.join(",")
}

/**
 * Get scopes as a comma-separated string for OAuth URL
 * (alias for getAllScopesString for backwards compatibility)
 */
export function getShopifyScopesString(): string {
  return SHOPIFY_SCOPES.join(",")
}

/**
 * Check if a scope is in the required list
 */
export function isRequiredScope(scope: string): boolean {
  return SHOPIFY_SCOPES.includes(scope as any)
}



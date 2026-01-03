/**
 * Shopify OAuth Scopes
 * 
 * Required permissions for Ghost CRO to analyze stores.
 * All scopes are read-only - Ghost CRO will never modify your store.
 */

export const SHOPIFY_SCOPES = [
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
 * Get scopes as a comma-separated string for OAuth URL
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


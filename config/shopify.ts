/**
 * Centralized Shopify API configuration.
 * Import this instead of hardcoding "2024-01" everywhere.
 */

export const SHOPIFY_API_VERSION = "2024-01"

export function shopifyAdminUrl(shop: string, path: string): string {
  return `https://${shop}/admin/api/${SHOPIFY_API_VERSION}${path}`
}

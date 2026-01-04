import { NextResponse } from "next/server"
import type { ShopifyClientConfig } from "@/lib/shopify/client"

/**
 * Shopify Product interface (subset of fields we need)
 */
interface ShopifyProduct {
  id: number
  title: string
  handle: string
  vendor: string
  product_type: string
  created_at: string
  updated_at: string
  published_at: string
  status: "active" | "archived" | "draft"
  images: Array<{
    id: number
    src: string
    alt: string | null
  }>
  variants: Array<{
    id: number
    title: string
    price: string
    sku: string
    inventory_quantity: number
  }>
}

interface ShopifyProductsResponse {
  products: ShopifyProduct[]
}

/**
 * Auto-Discovery API
 * 
 * Uses the Shopify Admin REST API to auto-discover the store's primary product
 * and construct a full product URL for the Ghost simulation.
 * 
 * This enables a "Shopify-First" onboarding flow where users don't need to
 * manually enter a URL - we discover it automatically from their store.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shop, accessToken } = body as ShopifyClientConfig

    // Validate required fields
    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: "Missing required fields: shop and accessToken" },
        { status: 400 }
      )
    }

    // Fetch the first product from the store
    const productsUrl = `https://${shop}/admin/api/2024-01/products.json?limit=1&status=active`

    const response = await fetch(productsUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to fetch products:", errorText)
      return NextResponse.json(
        { 
          error: "Failed to fetch products from Shopify",
          details: errorText,
          status: response.status
        },
        { status: response.status }
      )
    }

    const data: ShopifyProductsResponse = await response.json()
    const products = data.products || []

    if (products.length === 0) {
      // No products found - return the store homepage instead
      return NextResponse.json({
        success: true,
        hasProducts: false,
        storeUrl: `https://${shop}`,
        message: "No active products found. Using store homepage for analysis.",
        product: null,
      })
    }

    const product = products[0]
    const productUrl = `https://${shop}/products/${product.handle}`

    // Return the discovered product info
    return NextResponse.json({
      success: true,
      hasProducts: true,
      storeUrl: `https://${shop}`,
      productUrl,
      product: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        vendor: product.vendor,
        productType: product.product_type,
        status: product.status,
        image: product.images?.[0]?.src || null,
        price: product.variants?.[0]?.price || null,
      },
    })
  } catch (error) {
    console.error("Auto-discover error:", error)
    return NextResponse.json(
      { 
        error: "Failed to auto-discover store products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}



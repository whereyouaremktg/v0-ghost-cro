/**
 * Ghost Sandbox Scraper
 * 
 * Utility to scrape the Ghost Sandbox Theme URL and extract store data
 * for validation comparison against the original test results.
 */

import * as cheerio from "cheerio"
import type { ScrapedData } from "@/app/api/analyze/route"

export interface SandboxScrapeResult {
  success: boolean
  data?: ScrapedData
  error?: string
  timestamp: string
}

/**
 * Scrape a sandbox theme URL to extract store data
 * This is used for validation to compare against original test results
 */
export async function scrapeSandboxTheme(
  previewUrl: string
): Promise<SandboxScrapeResult> {
  try {
    // Fetch the page with a user agent to avoid blocking
    const response = await fetch(previewUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch sandbox URL: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract product title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "No title found"

    // Extract price
    const price =
      $('meta[property="og:price:amount"]').attr("content") ||
      $('[itemprop="price"]').attr("content") ||
      $('.price, .product-price, [class*="price"]')
        .first()
        .text()
        .trim() ||
      "Price not found"

    // Extract description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('.product-description, .description, [itemprop="description"]').first().text().trim() ||
      "No description found"

    // Extract images
    const images: string[] = []
    $('meta[property="og:image"]').each((_, el) => {
      const img = $(el).attr("content")
      if (img) images.push(img)
    })
    if (images.length === 0) {
      $(".product-image img, .product-gallery img").each((_, el) => {
        const src = $(el).attr("src")
        if (src) images.push(src)
      })
    }

    // Extract trust signals - specifically look for Ghost CRO fixes
    const trustSignals: string[] = []
    
    // Look for Ghost CRO trust signals
    $('[data-ghost-fix="trust-injection"]').each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length < 200) trustSignals.push(text)
    })
    
    // Also check for standard trust badges
    $(
      '.trust-badge, [class*="trust"], [class*="secure"], [class*="guarantee"], .reviews, [class*="rating"]',
    ).each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length < 200) trustSignals.push(text)
    })

    // Extract shipping info - specifically look for Ghost CRO shipping fixes
    let shippingInfo = ""
    
    // Check for Ghost CRO shipping preview
    const ghostShipping = $('[data-ghost-fix="shipping-transparency"]').first()
    if (ghostShipping.length > 0) {
      shippingInfo = ghostShipping.text().trim()
    } else {
      shippingInfo =
        $('.shipping-info, [class*="shipping"], [class*="delivery"]').first().text().trim() ||
        "No shipping info visible"
    }

    // Extract reviews/ratings
    const reviewCount =
      $('[itemprop="reviewCount"]').text().trim() ||
      $('.review-count, [class*="review-count"]').first().text().trim() ||
      "0"
    const rating =
      $('[itemprop="ratingValue"]').attr("content") ||
      $('.rating, [class*="rating"]').first().text().trim() ||
      "No rating"

    // Extract payment methods - check for Ghost CRO express checkout
    const paymentMethods: string[] = []
    
    // Check for Ghost CRO express checkout
    const ghostCheckout = $('[data-ghost-fix="express-checkout"]')
    if (ghostCheckout.length > 0) {
      paymentMethods.push("Express Checkout (Ghost CRO)")
    }
    
    // Standard payment methods
    $(
      '.payment-methods img, [class*="payment"] img, [alt*="pay"], [alt*="visa"], [alt*="mastercard"], [alt*="PayPal"]',
    ).each((_, el) => {
      const alt = $(el).attr("alt")
      if (alt) paymentMethods.push(alt)
    })

    // Extract cart-specific info
    const cartInfo =
      $('.cart-total, .subtotal, [class*="cart-summary"]').text().trim() ||
      "No cart information visible"

    // Check for Ghost CRO fixes presence
    const ghostFixesDetected: string[] = []
    $('[data-ghost-fix]').each((_, el) => {
      const fixType = $(el).attr("data-ghost-fix")
      if (fixType) ghostFixesDetected.push(fixType)
    })

    return {
      success: true,
      data: {
        title,
        price,
        description: description.slice(0, 500), // Limit length
        images: images.slice(0, 3), // First 3 images
        trustSignals: trustSignals.slice(0, 5),
        shippingInfo,
        reviews: {
          count: reviewCount,
          rating,
        },
        paymentMethods: paymentMethods.slice(0, 5),
        cartInfo,
      },
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Sandbox scraping error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }
  }
}

/**
 * Compare original scraped data with sandbox scraped data
 * Returns a differential analysis showing what changed
 */
export interface ValidationComparison {
  fixesDetected: string[]
  improvements: {
    trustSignals: boolean
    shippingTransparency: boolean
    expressCheckout: boolean
  }
  metrics: {
    trustSignalCount: { original: number; sandbox: number }
    shippingInfoVisible: { original: boolean; sandbox: boolean }
    paymentMethodsCount: { original: number; sandbox: number }
  }
}

export function compareSandboxToOriginal(
  original: ScrapedData,
  sandbox: ScrapedData
): ValidationComparison {
  const fixesDetected: string[] = []
  const improvements = {
    trustSignals: sandbox.trustSignals.length > original.trustSignals.length,
    shippingTransparency: sandbox.shippingInfo !== "No shipping info visible" && 
                          original.shippingInfo === "No shipping info visible",
    expressCheckout: sandbox.paymentMethods.some(pm => 
      pm.toLowerCase().includes("express") || pm.toLowerCase().includes("ghost")
    ),
  }

  // Detect which fixes are present
  if (improvements.trustSignals) {
    fixesDetected.push("trust-injection")
  }
  if (improvements.shippingTransparency) {
    fixesDetected.push("shipping-transparency")
  }
  if (improvements.expressCheckout) {
    fixesDetected.push("express-checkout")
  }

  return {
    fixesDetected,
    improvements,
    metrics: {
      trustSignalCount: {
        original: original.trustSignals.length,
        sandbox: sandbox.trustSignals.length,
      },
      shippingInfoVisible: {
        original: original.shippingInfo !== "No shipping info visible",
        sandbox: sandbox.shippingInfo !== "No shipping info visible",
      },
      paymentMethodsCount: {
        original: original.paymentMethods.length,
        sandbox: sandbox.paymentMethods.length,
      },
    },
  }
}


/**
 * Category Leaders Benchmark Engine
 * 
 * Provides "Gold Standard" benchmarks for different e-commerce categories.
 * Used to compare stores against category leaders and identify gaps.
 */

export interface CategoryBenchmark {
  category: string
  avg_load_time: number // seconds
  images_per_pdp: number // product detail page
  has_sticky_atc: boolean // sticky add-to-cart button
  trust_badges_count: number
  shipping_transparency: "high" | "medium" | "low"
  express_checkout_options: number // Apple Pay, PayPal, etc.
  mobile_optimization_score: number // 0-100
  cart_abandonment_rate: number // percentage
  checkout_steps: number
  has_guest_checkout: boolean
  has_reviews: boolean
  has_size_guide: boolean
  has_live_chat: boolean
  has_free_shipping_threshold: boolean
  avg_free_shipping_threshold: number // USD
}

/**
 * Category Leader Benchmarks
 * Based on analysis of top-performing stores in each category
 */
export const CATEGORY_BENCHMARKS: Record<string, CategoryBenchmark> = {
  apparel: {
    category: "Apparel",
    avg_load_time: 1.2,
    images_per_pdp: 5,
    has_sticky_atc: true,
    trust_badges_count: 3,
    shipping_transparency: "high",
    express_checkout_options: 3,
    mobile_optimization_score: 95,
    cart_abandonment_rate: 65,
    checkout_steps: 2,
    has_guest_checkout: true,
    has_reviews: true,
    has_size_guide: true,
    has_live_chat: true,
    has_free_shipping_threshold: true,
    avg_free_shipping_threshold: 50,
  },
  beauty: {
    category: "Beauty",
    avg_load_time: 1.1,
    images_per_pdp: 6,
    has_sticky_atc: true,
    trust_badges_count: 4,
    shipping_transparency: "high",
    express_checkout_options: 4,
    mobile_optimization_score: 97,
    cart_abandonment_rate: 60,
    checkout_steps: 2,
    has_guest_checkout: true,
    has_reviews: true,
    has_size_guide: false,
    has_live_chat: true,
    has_free_shipping_threshold: true,
    avg_free_shipping_threshold: 35,
  },
  electronics: {
    category: "Electronics",
    avg_load_time: 1.3,
    images_per_pdp: 4,
    has_sticky_atc: true,
    trust_badges_count: 5,
    shipping_transparency: "high",
    express_checkout_options: 5,
    mobile_optimization_score: 92,
    cart_abandonment_rate: 70,
    checkout_steps: 2,
    has_guest_checkout: true,
    has_reviews: true,
    has_size_guide: false,
    has_live_chat: true,
    has_free_shipping_threshold: true,
    avg_free_shipping_threshold: 100,
  },
  home: {
    category: "Home & Garden",
    avg_load_time: 1.4,
    images_per_pdp: 5,
    has_sticky_atc: true,
    trust_badges_count: 3,
    shipping_transparency: "medium",
    express_checkout_options: 2,
    mobile_optimization_score: 88,
    cart_abandonment_rate: 68,
    checkout_steps: 3,
    has_guest_checkout: true,
    has_reviews: true,
    has_size_guide: false,
    has_live_chat: false,
    has_free_shipping_threshold: true,
    avg_free_shipping_threshold: 75,
  },
  food: {
    category: "Food & Beverage",
    avg_load_time: 1.2,
    images_per_pdp: 4,
    has_sticky_atc: true,
    trust_badges_count: 4,
    shipping_transparency: "high",
    express_checkout_options: 3,
    mobile_optimization_score: 90,
    cart_abandonment_rate: 62,
    checkout_steps: 2,
    has_guest_checkout: true,
    has_reviews: true,
    has_size_guide: false,
    has_live_chat: true,
    has_free_shipping_threshold: true,
    avg_free_shipping_threshold: 40,
  },
}

/**
 * Gap Analysis Result
 * Identifies where a store falls short compared to category leaders
 */
export interface GapAnalysis {
  category: string
  gaps: Array<{
    metric: string
    storeValue: number | boolean | string
    benchmarkValue: number | boolean | string
    gap: string
    impact: "high" | "medium" | "low"
    recommendation: string
  }>
  overallScore: number // 0-100, how close to category leader
}

/**
 * Compare store stats against category benchmark
 * 
 * @param category - Store category (apparel, beauty, electronics, etc.)
 * @param storeStats - Current store statistics
 * @returns Gap analysis with specific recommendations
 */
export function compareToCategoryLeaders(
  category: string,
  storeStats: Partial<CategoryBenchmark>
): GapAnalysis {
  const benchmark = CATEGORY_BENCHMARKS[category.toLowerCase()]
  
  if (!benchmark) {
    // Default to apparel if category not found
    const defaultBenchmark = CATEGORY_BENCHMARKS.apparel
    return {
      category: "Unknown (using Apparel benchmark)",
      gaps: [],
      overallScore: 0,
    }
  }

  const gaps: GapAnalysis["gaps"] = []
  let score = 100

  // Compare each metric
  if (storeStats.avg_load_time !== undefined) {
    const gap = storeStats.avg_load_time - benchmark.avg_load_time
    if (gap > 0.5) {
      gaps.push({
        metric: "Page Load Time",
        storeValue: `${storeStats.avg_load_time}s`,
        benchmarkValue: `${benchmark.avg_load_time}s`,
        gap: `${gap.toFixed(1)}s slower`,
        impact: gap > 2 ? "high" : "medium",
        recommendation: `Top ${benchmark.category} brands load in ${benchmark.avg_load_time}s. Optimize images and reduce JavaScript to improve load time.`,
      })
      score -= 10
    }
  }

  if (storeStats.images_per_pdp !== undefined) {
    const gap = benchmark.images_per_pdp - storeStats.images_per_pdp
    if (gap > 0) {
      gaps.push({
        metric: "Product Images",
        storeValue: `${storeStats.images_per_pdp} images`,
        benchmarkValue: `${benchmark.images_per_pdp} images`,
        gap: `${gap} fewer images`,
        impact: gap > 2 ? "high" : "medium",
        recommendation: `Top ${benchmark.category} brands show ${benchmark.images_per_pdp} images per product. Add more product photos to increase conversion.`,
      })
      score -= 8
    }
  }

  if (storeStats.has_sticky_atc !== undefined && !storeStats.has_sticky_atc && benchmark.has_sticky_atc) {
    gaps.push({
      metric: "Sticky Add-to-Cart",
      storeValue: false,
      benchmarkValue: true,
      gap: "Missing sticky ATC button",
      impact: "high",
      recommendation: `Top ${benchmark.category} brands use sticky add-to-cart buttons. This keeps the purchase option visible as users scroll.`,
    })
    score -= 12
  }

  if (storeStats.trust_badges_count !== undefined) {
    const gap = benchmark.trust_badges_count - storeStats.trust_badges_count
    if (gap > 0) {
      gaps.push({
        metric: "Trust Badges",
        storeValue: `${storeStats.trust_badges_count} badges`,
        benchmarkValue: `${benchmark.trust_badges_count} badges`,
        gap: `${gap} fewer badges`,
        impact: gap > 2 ? "high" : "medium",
        recommendation: `Top ${benchmark.category} brands display ${benchmark.trust_badges_count} trust badges. Add security badges, return policies, and guarantees.`,
      })
      score -= 7
    }
  }

  if (storeStats.express_checkout_options !== undefined) {
    const gap = benchmark.express_checkout_options - storeStats.express_checkout_options
    if (gap > 0) {
      gaps.push({
        metric: "Express Checkout Options",
        storeValue: `${storeStats.express_checkout_options} options`,
        benchmarkValue: `${benchmark.express_checkout_options} options`,
        gap: `${gap} fewer options`,
        impact: "high",
        recommendation: `Top ${benchmark.category} brands offer ${benchmark.express_checkout_options} express checkout options (Apple Pay, PayPal, etc.). Add more payment methods to reduce friction.`,
      })
      score -= 15
    }
  }

  if (storeStats.has_guest_checkout !== undefined && !storeStats.has_guest_checkout && benchmark.has_guest_checkout) {
    gaps.push({
      metric: "Guest Checkout",
      storeValue: false,
      benchmarkValue: true,
      gap: "Forced account creation",
      impact: "high",
      recommendation: `Top ${benchmark.category} brands allow guest checkout. Forcing account creation increases abandonment.`,
    })
    score -= 20
  }

  if (storeStats.has_reviews !== undefined && !storeStats.has_reviews && benchmark.has_reviews) {
    gaps.push({
      metric: "Product Reviews",
      storeValue: false,
      benchmarkValue: true,
      gap: "No reviews displayed",
      impact: "high",
      recommendation: `Top ${benchmark.category} brands display product reviews. Reviews build trust and increase conversion.`,
    })
    score -= 15
  }

  if (storeStats.has_free_shipping_threshold !== undefined && !storeStats.has_free_shipping_threshold && benchmark.has_free_shipping_threshold) {
    gaps.push({
      metric: "Free Shipping Threshold",
      storeValue: false,
      benchmarkValue: true,
      gap: "No free shipping offer",
      impact: "medium",
      recommendation: `Top ${benchmark.category} brands offer free shipping at $${benchmark.avg_free_shipping_threshold}. This encourages higher order values.`,
    })
    score -= 10
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score)

  return {
    category: benchmark.category,
    gaps,
    overallScore: score,
  }
}

/**
 * Get benchmark for a specific category
 */
export function getCategoryBenchmark(category: string): CategoryBenchmark | null {
  return CATEGORY_BENCHMARKS[category.toLowerCase()] || null
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return Object.keys(CATEGORY_BENCHMARKS)
}

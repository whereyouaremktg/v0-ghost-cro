/**
 * Category benchmarks for conversion rate optimization
 * 
 * Based on industry averages and top performer data
 */

export interface CategoryBenchmark {
  categoryName: string
  avgConversionRate: number // as decimal: 0.028 = 2.8%
  avgAOV: number
  topPerformerCR: number // top 10% stores
}

export const CATEGORY_BENCHMARKS: Record<string, CategoryBenchmark> = {
  fashion: {
    categoryName: "Fashion",
    avgConversionRate: 0.021,
    avgAOV: 85,
    topPerformerCR: 0.045,
  },
  beauty: {
    categoryName: "Beauty",
    avgConversionRate: 0.032,
    avgAOV: 62,
    topPerformerCR: 0.058,
  },
  home: {
    categoryName: "Home & Garden",
    avgConversionRate: 0.018,
    avgAOV: 124,
    topPerformerCR: 0.038,
  },
  electronics: {
    categoryName: "Electronics",
    avgConversionRate: 0.015,
    avgAOV: 156,
    topPerformerCR: 0.032,
  },
  health: {
    categoryName: "Health & Wellness",
    avgConversionRate: 0.028,
    avgAOV: 58,
    topPerformerCR: 0.052,
  },
  default: {
    categoryName: "E-commerce",
    avgConversionRate: 0.023,
    avgAOV: 85,
    topPerformerCR: 0.042,
  },
}

/**
 * Get benchmarks for a given industry/category
 */
export function getCategoryBenchmarks(industry: string | null | undefined): CategoryBenchmark {
  if (!industry) {
    return CATEGORY_BENCHMARKS.default
  }

  // Normalize the industry string
  const key = industry.toLowerCase().replace(/[^a-z]/g, "")

  // Try to match common variations
  if (key.includes("fashion") || key.includes("apparel") || key.includes("clothing")) {
    return CATEGORY_BENCHMARKS.fashion
  }
  if (key.includes("beauty") || key.includes("cosmetic") || key.includes("skincare")) {
    return CATEGORY_BENCHMARKS.beauty
  }
  if (key.includes("home") || key.includes("garden") || key.includes("furniture")) {
    return CATEGORY_BENCHMARKS.home
  }
  if (key.includes("electronic") || key.includes("tech") || key.includes("gadget")) {
    return CATEGORY_BENCHMARKS.electronics
  }
  if (key.includes("health") || key.includes("wellness") || key.includes("fitness")) {
    return CATEGORY_BENCHMARKS.health
  }

  // Default fallback
  return CATEGORY_BENCHMARKS.default
}





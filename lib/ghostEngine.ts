import type { TestResult, FrictionPoint } from "./types"

/**
 * Extract percentage from impact string (e.g., "~23% abandonment" -> 23)
 */
function extractImpactPercentage(impact: string): number {
  const match = impact.match(/(\d+(?:\.\d+)?)%/)
  return match ? parseFloat(match[1]) : 0
}

/**
 * Calculate revenue leak based on friction severity and metrics
 * 
 * @deprecated This function is deprecated. Use `calculateRevenueOpportunity` from `@/lib/calculations/revenue-opportunity` instead.
 * The new function provides a more accurate calculation based on conversion rate benchmarks.
 */
export interface RevenueLeakResult {
  daily: number
  weekly: number
  monthly: number
}

/**
 * @deprecated Use `calculateRevenueOpportunity` from `@/lib/calculations/revenue-opportunity` instead.
 */
export function calculateRevenueLeak(
  testResult: TestResult | null,
  metrics?: {
    averageOrderValue?: number
    monthlySessions?: number
    monthlyRevenue?: number
  }
): RevenueLeakResult {
  if (!testResult || testResult.status !== "completed") {
    return { daily: 0, weekly: 0, monthly: 0 }
  }

  const aov = metrics?.averageOrderValue || 85 // Default AOV
  const monthlySessions = metrics?.monthlySessions || 50000 // Default sessions
  const monthlyRevenue = metrics?.monthlyRevenue || monthlySessions * 0.025 * aov // Default 2.5% CVR

  // Calculate total abandonment impact from friction points
  let totalAbandonmentImpact = 0

  // Critical friction points have highest impact
  testResult.frictionPoints.critical.forEach((fp) => {
    const impact = extractImpactPercentage(fp.impact)
    totalAbandonmentImpact += impact * 0.8 // Critical issues cause 80% of their stated impact
  })

  // High priority friction points
  testResult.frictionPoints.high.forEach((fp) => {
    const impact = extractImpactPercentage(fp.impact)
    totalAbandonmentImpact += impact * 0.5 // High issues cause 50% of their stated impact
  })

  // Medium priority friction points
  testResult.frictionPoints.medium.forEach((fp) => {
    const impact = extractImpactPercentage(fp.impact)
    totalAbandonmentImpact += impact * 0.2 // Medium issues cause 20% of their stated impact
  })

  // Cap total impact at 50% to avoid unrealistic numbers
  totalAbandonmentImpact = Math.min(totalAbandonmentImpact, 50)

  // Calculate revenue leak: (abandonment % / 100) * current revenue
  // This represents revenue lost due to friction
  const monthlyLeak = (totalAbandonmentImpact / 100) * monthlyRevenue
  const weeklyLeak = monthlyLeak / 4.33 // Average weeks per month
  const dailyLeak = monthlyLeak / 30 // Average days per month

  return {
    daily: Math.round(dailyLeak),
    weekly: Math.round(weeklyLeak),
    monthly: Math.round(monthlyLeak),
  }
}

/**
 * Calculate Ghost health score based on friction severity
 * Higher score = healthier checkout (less friction)
 */
export function calculateGhostHealthScore(testResult: TestResult | null): number {
  if (!testResult || testResult.status !== "completed") {
    return 0
  }

  const { frictionPoints } = testResult

  // Base score starts at 100
  let healthScore = 100

  // Deduct points for each friction severity level
  // Critical issues are most damaging
  healthScore -= frictionPoints.critical.length * 25
  healthScore -= frictionPoints.high.length * 15
  healthScore -= frictionPoints.medium.length * 5

  // Add points for things working well
  healthScore += frictionPoints.working.length * 3

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(healthScore)))
}

/**
 * Industry adjustment multipliers
 * Different industries have different conversion rate expectations
 */
const INDUSTRY_ADJUSTMENTS: Record<string, number> = {
  fashion: 1.0,        // Baseline
  electronics: 0.9,   // Lower conversion expectations
  beauty: 1.1,         // Higher conversion expectations
  home: 0.95,
  food: 1.05,
  jewelry: 0.85,       // Lower conversion (high consideration)
  sports: 1.0,
  books: 1.15,         // Higher conversion (low friction)
  default: 1.0,        // Default/Retail baseline
}

/**
 * Normalize category name for lookup
 */
function normalizeCategory(category: string | null | undefined): string {
  if (!category) return 'default'
  return category.toLowerCase().trim()
}

/**
 * Calculate percentile benchmark based on score
 * Returns the percentile (0-100) that this score represents
 * @param score - The checkout health score (0-100)
 * @param category - Optional industry category for adjustment (e.g., "Fashion", "Electronics")
 */
export function calculatePercentileBenchmark(score: number, category?: string | null): number {
  // Apply industry adjustment
  const normalizedCategory = normalizeCategory(category)
  const adjustment = INDUSTRY_ADJUSTMENTS[normalizedCategory] || INDUSTRY_ADJUSTMENTS.default
  
  // Adjust score based on industry (e.g., Electronics scores are adjusted down)
  // A score of 50 in Fashion might be 40th percentile, but in Electronics it might be 60th percentile
  const adjustedScore = score * adjustment
  
  // Clamp adjusted score to valid range
  const clampedScore = Math.max(0, Math.min(100, adjustedScore))
  
  // Industry benchmark distribution:
  // 0-50: Bottom 20%
  // 51-60: 20th-40th percentile
  // 61-70: 40th-60th percentile
  // 71-80: 60th-80th percentile
  // 81-90: 80th-95th percentile
  // 91-100: Top 5%

  if (clampedScore <= 50) {
    return Math.round(20 * (clampedScore / 50))
  } else if (clampedScore <= 60) {
    return Math.round(20 + 20 * ((clampedScore - 50) / 10))
  } else if (clampedScore <= 70) {
    return Math.round(40 + 20 * ((clampedScore - 60) / 10))
  } else if (clampedScore <= 80) {
    return Math.round(60 + 20 * ((clampedScore - 70) / 10))
  } else if (clampedScore <= 90) {
    return Math.round(80 + 15 * ((clampedScore - 80) / 10))
  } else {
    return Math.round(95 + 5 * ((clampedScore - 90) / 10))
  }
}

/**
 * Get percentile label for display
 * @param percentile - The percentile (0-100)
 * @param category - Optional industry category for context
 */
export function getPercentileLabel(percentile: number, category?: string | null): string {
  const normalizedCategory = normalizeCategory(category)
  const categoryLabel = normalizedCategory !== 'default' 
    ? normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1)
    : null
  
  let label: string
  if (percentile >= 95) label = "Top 5%"
  else if (percentile >= 90) label = "Top 10%"
  else if (percentile >= 80) label = "Top 20%"
  else if (percentile >= 60) label = "Top 40%"
  else if (percentile >= 40) label = "Top 60%"
  else if (percentile >= 20) label = "Top 80%"
  else label = "Bottom 20%"
  
  // Add category context if available
  if (categoryLabel) {
    return `${label} of ${categoryLabel} Stores`
  }
  
  return label
}


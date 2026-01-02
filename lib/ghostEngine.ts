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
 */
export interface RevenueLeakResult {
  daily: number
  weekly: number
  monthly: number
}

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
 * Calculate percentile benchmark based on score
 * Returns the percentile (0-100) that this score represents
 */
export function calculatePercentileBenchmark(score: number): number {
  // Industry benchmark distribution:
  // 0-50: Bottom 20%
  // 51-60: 20th-40th percentile
  // 61-70: 40th-60th percentile
  // 71-80: 60th-80th percentile
  // 81-90: 80th-95th percentile
  // 91-100: Top 5%

  if (score <= 50) {
    return Math.round(20 * (score / 50))
  } else if (score <= 60) {
    return Math.round(20 + 20 * ((score - 50) / 10))
  } else if (score <= 70) {
    return Math.round(40 + 20 * ((score - 60) / 10))
  } else if (score <= 80) {
    return Math.round(60 + 20 * ((score - 70) / 10))
  } else if (score <= 90) {
    return Math.round(80 + 15 * ((score - 80) / 10))
  } else {
    return Math.round(95 + 5 * ((score - 90) / 10))
  }
}

/**
 * Get percentile label for display
 */
export function getPercentileLabel(percentile: number): string {
  if (percentile >= 95) return "Top 5%"
  if (percentile >= 90) return "Top 10%"
  if (percentile >= 80) return "Top 20%"
  if (percentile >= 60) return "Top 40%"
  if (percentile >= 40) return "Top 60%"
  if (percentile >= 20) return "Top 80%"
  return "Bottom 20%"
}


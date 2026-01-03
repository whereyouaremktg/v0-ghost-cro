/**
 * Revenue Opportunity Calculation
 * 
 * Calculates potential revenue opportunity based on:
 * - Current conversion rate vs category benchmark
 * - Monthly traffic and AOV
 * - Provides ranges instead of false precision
 */

export interface RevenueCalculationInput {
  monthlyVisitors: number
  currentConversionRate: number // as decimal, e.g., 0.012 for 1.2%
  aov: number
  categoryBenchmarkCR: number // as decimal, e.g., 0.028 for 2.8%
}

export interface RevenueCalculationOutput {
  currentMonthlyRevenue: number
  potentialMonthlyRevenue: number
  monthlyOpportunity: {
    min: number
    max: number
  }
  annualOpportunity: {
    min: number
    max: number
  }
  opportunityPercentage: number // how much more they could make
  benchmarkGap: number // difference between current and benchmark CR
}

/**
 * Calculate revenue opportunity based on conversion rate improvement potential
 */
export function calculateRevenueOpportunity(
  input: RevenueCalculationInput
): RevenueCalculationOutput {
  // Validate inputs and provide defaults to prevent NaN
  const monthlyVisitors = input.monthlyVisitors || 50000
  const currentConversionRate = isNaN(input.currentConversionRate) ? 0.025 : (input.currentConversionRate || 0.025)
  const aov = input.aov || 85
  const categoryBenchmarkCR = input.categoryBenchmarkCR || 0.028

  // Current revenue
  const currentMonthlyRevenue = monthlyVisitors * currentConversionRate * aov

  // Potential revenue at benchmark (conservative estimate)
  const potentialMonthlyRevenue = monthlyVisitors * categoryBenchmarkCR * aov

  // Calculate opportunity gap
  const benchmarkGap = categoryBenchmarkCR - currentConversionRate

  // Opportunity range: conservative (50% of gap) to optimistic (80% of gap)
  // This accounts for the fact that not all improvements are achievable
  const conservativeCRLift = benchmarkGap * 0.5
  const optimisticCRLift = benchmarkGap * 0.8

  const minMonthlyOpportunity = monthlyVisitors * conservativeCRLift * aov
  const maxMonthlyOpportunity = monthlyVisitors * optimisticCRLift * aov

  // Annual opportunity
  const minAnnualOpportunity = minMonthlyOpportunity * 12
  const maxAnnualOpportunity = maxMonthlyOpportunity * 12

  // Opportunity percentage
  const opportunityPercentage = (maxMonthlyOpportunity / currentMonthlyRevenue) * 100

  return {
    currentMonthlyRevenue,
    potentialMonthlyRevenue,
    monthlyOpportunity: {
      min: Math.round(minMonthlyOpportunity),
      max: Math.round(maxMonthlyOpportunity),
    },
    annualOpportunity: {
      min: Math.round(minAnnualOpportunity),
      max: Math.round(maxAnnualOpportunity),
    },
    opportunityPercentage: Math.round(opportunityPercentage * 10) / 10, // Round to 1 decimal
    benchmarkGap: Math.round(benchmarkGap * 10000) / 100, // Convert to percentage points, round to 2 decimals
  }
}

/**
 * Format opportunity as a range string
 */
export function formatOpportunityRange(min: number, max: number): string {
  // Round to appropriate precision based on magnitude
  const roundTo = (value: number): number => {
    if (value >= 1000000) return Math.round(value / 100000) * 100000 // Round to nearest 100k
    if (value >= 100000) return Math.round(value / 10000) * 10000 // Round to nearest 10k
    if (value >= 10000) return Math.round(value / 1000) * 1000 // Round to nearest 1k
    if (value >= 1000) return Math.round(value / 100) * 100 // Round to nearest 100
    return Math.round(value / 10) * 10 // Round to nearest 10
  }

  const roundedMin = roundTo(min)
  const roundedMax = roundTo(max)

  return `$${roundedMin.toLocaleString()} - $${roundedMax.toLocaleString()}`
}

/**
 * Get methodology explanation text
 */
export function getMethodologyText(
  benchmarkGap: number,
  currentCR: number,
  benchmarkCR: number
): string {
  const gapPercent = benchmarkGap.toFixed(1)
  const currentPercent = (currentCR * 100).toFixed(1)
  const benchmarkPercent = (benchmarkCR * 100).toFixed(1)

  return `Based on potential ${gapPercent}% conversion rate improvement (from ${currentPercent}% to ${benchmarkPercent}% category average) at your traffic level`
}



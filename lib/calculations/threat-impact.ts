/**
 * Threat Impact Calculation
 * 
 * Calculates per-threat revenue impact based on:
 * - Buyer simulation attribution
 * - Estimated conversion rate lift
 * - Traffic and AOV
 * - Provides ranges and confidence levels
 */

export interface ThreatImpactInput {
  totalOpportunity: number // from revenue calculation (use max for conservative estimate)
  simulatedBuyersTotal: number
  simulatedBuyersCitingThisThreat: number
  threatSeverity: "critical" | "high" | "medium" | "low"
  estimatedCRLift: { min: number; max: number } // e.g., { min: 0.003, max: 0.005 } for 0.3-0.5%
  monthlyVisitors: number
  aov: number
}

export interface ThreatImpactOutput {
  estimatedRecoveryMin: number
  estimatedRecoveryMax: number
  confidenceLevel: "high" | "medium" | "low"
  buyerAttributionRate: number // e.g., 0.8 for "4/5 buyers cited this"
  methodology: string
}

/**
 * Calculate threat-specific revenue recovery potential
 */
export function calculateThreatImpact(input: ThreatImpactInput): ThreatImpactOutput {
  const {
    simulatedBuyersTotal,
    simulatedBuyersCitingThisThreat,
    estimatedCRLift,
    monthlyVisitors,
    aov,
  } = input

  // Calculate recovery based on CR lift potential
  const minRecovery = monthlyVisitors * estimatedCRLift.min * aov
  const maxRecovery = monthlyVisitors * estimatedCRLift.max * aov

  // Confidence based on simulation attribution
  const attributionRate =
    simulatedBuyersTotal > 0
      ? simulatedBuyersCitingThisThreat / simulatedBuyersTotal
      : 0

  // Determine confidence level
  let confidenceLevel: "high" | "medium" | "low"
  if (attributionRate >= 0.8) {
    confidenceLevel = "high"
  } else if (attributionRate >= 0.5) {
    confidenceLevel = "medium"
  } else {
    confidenceLevel = "low"
  }

  // Adjust confidence based on severity (critical threats with high attribution = very high confidence)
  if (input.threatSeverity === "critical" && attributionRate >= 0.6) {
    confidenceLevel = "high"
  }

  // Generate methodology text
  const crLiftMinPercent = (estimatedCRLift.min * 100).toFixed(1)
  const crLiftMaxPercent = (estimatedCRLift.max * 100).toFixed(1)
  const attributionPercent = Math.round(attributionRate * 100)

  const methodology = `${attributionPercent}% of simulated buyers cited this issue. Estimated ${crLiftMinPercent}-${crLiftMaxPercent}% conversion rate improvement if fixed.`

  return {
    estimatedRecoveryMin: Math.round(minRecovery),
    estimatedRecoveryMax: Math.round(maxRecovery),
    confidenceLevel,
    buyerAttributionRate: Math.round(attributionRate * 100) / 100,
    methodology,
  }
}

/**
 * Get CR lift estimate based on threat severity and type
 */
export function getEstimatedCRLift(
  severity: "critical" | "high" | "medium" | "low",
  threatType?: string
): { min: number; max: number } {
  // Base estimates by severity (as decimal, e.g., 0.003 = 0.3%)
  const baseEstimates = {
    critical: { min: 0.005, max: 0.008 }, // 0.5-0.8% lift
    high: { min: 0.003, max: 0.005 }, // 0.3-0.5% lift
    medium: { min: 0.001, max: 0.003 }, // 0.1-0.3% lift
    low: { min: 0.0005, max: 0.001 }, // 0.05-0.1% lift
  }

  // Adjust based on threat type if provided
  if (threatType) {
    const lowerType = threatType.toLowerCase()
    
    // Shipping issues typically have higher impact
    if (lowerType.includes("shipping") || lowerType.includes("delivery")) {
      return {
        min: baseEstimates[severity].min * 1.2,
        max: baseEstimates[severity].max * 1.2,
      }
    }
    
    // Payment issues are critical
    if (lowerType.includes("payment") || lowerType.includes("checkout")) {
      return {
        min: baseEstimates[severity].min * 1.3,
        max: baseEstimates[severity].max * 1.3,
      }
    }
    
    // Trust signals have moderate impact
    if (lowerType.includes("trust") || lowerType.includes("security")) {
      return {
        min: baseEstimates[severity].min * 0.9,
        max: baseEstimates[severity].max * 0.9,
      }
    }
  }

  return baseEstimates[severity]
}

/**
 * Format recovery range as string
 */
export function formatRecoveryRange(min: number, max: number): string {
  // Round to appropriate precision
  const roundTo = (value: number): number => {
    if (value >= 100000) return Math.round(value / 10000) * 10000
    if (value >= 10000) return Math.round(value / 1000) * 1000
    if (value >= 1000) return Math.round(value / 100) * 100
    return Math.round(value / 10) * 10
  }

  const roundedMin = roundTo(min)
  const roundedMax = roundTo(max)

  // If min and max are very close, show single value
  if (roundedMax - roundedMin < roundedMin * 0.1) {
    return `$${roundedMin.toLocaleString()}`
  }

  return `$${roundedMin.toLocaleString()} - $${roundedMax.toLocaleString}`
}

/**
 * Get confidence badge text and color
 */
export function getConfidenceBadge(confidence: "high" | "medium" | "low"): {
  text: string
  color: string
  bgColor: string
} {
  switch (confidence) {
    case "high":
      return {
        text: "High Confidence",
        color: "text-emerald-700",
        bgColor: "bg-emerald-50",
      }
    case "medium":
      return {
        text: "Medium Confidence",
        color: "text-amber-700",
        bgColor: "bg-amber-50",
      }
    case "low":
      return {
        text: "Low Confidence",
        color: "text-gray-700",
        bgColor: "bg-gray-50",
      }
  }
}


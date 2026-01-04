/**
 * Generate dynamic Ghost Summary insights
 * 
 * This generates executive-level insights based on real store data,
 * calculated opportunity, and simulation results.
 */

import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/format"

export interface GhostSummaryInput {
  // From Store Snapshot
  snapshot: {
    metrics: {
      monthlyVisitors: number
      conversionRate: number
      averageOrderValue: number
      monthlyRevenue: number
    }
    funnel: {
      visitors: number
      addedToCart: number
      reachedCheckout: number
      purchased: number
    }
    benchmarks: {
      categoryName: string
      avgConversionRate: number
      topPerformerCR: number
    }
    opportunity: {
      monthlyGap: number
      annualGap: number
    }
  }

  // From AI Analysis
  analysis: {
    ghostScore: number
    threats: Array<{
      id: string
      title: string
      severity: "critical" | "high" | "medium" | "low"
      location: string
      estimatedRecoveryMin?: number
      estimatedRecoveryMax?: number
      effort?: "low" | "medium" | "high"
    }>
  }

  // From Buyer Simulation
  simulation: {
    totalBuyers: number
    wouldPurchase: number
    wouldAbandon: number
    primaryDropOffPoint?: string
    topReasons?: Array<{
      reason: string
      count: number
    }>
  }
}

export interface SummaryInsight {
  id: string
  icon: "dollar" | "chart-down" | "alert" | "target" | "lightbulb" | "users"
  text: string
  severity: "critical" | "warning" | "info" | "positive"
  priority: number // for sorting
}

export interface GhostSummaryOutput {
  headline: string
  insights: SummaryInsight[]
  primaryAction: {
    title: string
    description: string
    estimatedImpact: string
    effort: "low" | "medium" | "high"
    threatId: string
  }
}

/**
 * Identify the funnel bottleneck
 */
function identifyBottleneck(funnel: GhostSummaryInput["snapshot"]["funnel"]) {
  const stages = [
    {
      stage: "Product Page → Cart",
      from: funnel.visitors,
      to: funnel.addedToCart,
      diagnosis:
        "Visitors aren't finding what they need or aren't convinced to add items.",
    },
    {
      stage: "Cart → Checkout",
      from: funnel.addedToCart,
      to: funnel.reachedCheckout,
      diagnosis: "Shoppers are hesitating before committing to purchase.",
    },
    {
      stage: "Checkout → Purchase",
      from: funnel.reachedCheckout,
      to: funnel.purchased,
      diagnosis: "Something in checkout is causing last-minute abandonment.",
    },
  ]

  let worstStage = stages[0]
  let worstDropOff = 0

  for (const stage of stages) {
    if (stage.from > 0) {
      const dropOff = ((stage.from - stage.to) / stage.from) * 100
      if (dropOff > worstDropOff) {
        worstDropOff = dropOff
        worstStage = stage
      }
    }
  }

  return {
    stage: worstStage.stage,
    dropOffPercent: worstDropOff.toFixed(0),
    diagnosis: worstStage.diagnosis,
    severity:
      worstDropOff > 90
        ? ("critical" as const)
        : worstDropOff > 70
          ? ("warning" as const)
          : ("info" as const),
  }
}

/**
 * Generate Ghost Summary insights
 */
export function generateGhostSummary({
  snapshot,
  analysis,
  simulation,
}: GhostSummaryInput): GhostSummaryOutput {
  const insights: SummaryInsight[] = []

  // --- INSIGHT 1: Revenue opportunity (ALWAYS first) ---
  const { monthlyGap, annualGap } = snapshot.opportunity
  insights.push({
    id: "revenue-opportunity",
    icon: "dollar",
    text: `You're leaving **${formatCurrency(monthlyGap)}/mo** on the table compared to similar ${snapshot.benchmarks.categoryName} stores—that's **${formatCurrency(annualGap)}/year**.`,
    severity:
      monthlyGap > 10000 ? "critical" : monthlyGap > 5000 ? "warning" : "info",
    priority: 1,
  })

  // --- INSIGHT 2: Conversion rate comparison ---
  const crGapPercent = snapshot.benchmarks.avgConversionRate > 0
    ? (
        ((snapshot.benchmarks.avgConversionRate - snapshot.metrics.conversionRate) /
          snapshot.benchmarks.avgConversionRate) *
        100
      ).toFixed(0)
    : "0"
  const crStatus =
    Number(crGapPercent) > 40
      ? "critical"
      : Number(crGapPercent) > 20
        ? "warning"
        : "info"

  insights.push({
    id: "conversion-gap",
    icon: "chart-down",
    text: `Your **${formatPercent(snapshot.metrics.conversionRate)}** conversion rate is **${crGapPercent}% below** the ${snapshot.benchmarks.categoryName} average of ${formatPercent(snapshot.benchmarks.avgConversionRate)}.`,
    severity: crStatus,
    priority: 2,
  })

  // --- INSIGHT 3: Simulation verdict ---
  const purchaseRate =
    simulation.totalBuyers > 0
      ? simulation.wouldPurchase / simulation.totalBuyers
      : 0
  const industryBenchmark = 0.65 // 65% of simulated buyers should convert on a good site

  insights.push({
    id: "simulation-verdict",
    icon: "users",
    text: `**${simulation.wouldPurchase} of ${simulation.totalBuyers}** simulated buyers would complete a purchase (${formatPercent(purchaseRate)} vs ${formatPercent(industryBenchmark)} benchmark).`,
    severity:
      purchaseRate < 0.3 ? "critical" : purchaseRate < 0.5 ? "warning" : "info",
    priority: 3,
  })

  // --- INSIGHT 4: Primary bottleneck ---
  const bottleneck = identifyBottleneck(snapshot.funnel)
  insights.push({
    id: "bottleneck",
    icon: "alert",
    text: `**Primary bottleneck: ${bottleneck.stage}** — ${bottleneck.dropOffPercent}% of visitors drop off here. ${bottleneck.diagnosis}`,
    severity: bottleneck.severity,
    priority: 4,
  })

  // --- INSIGHT 5: Top cited issue from simulation ---
  if (simulation.topReasons && simulation.topReasons.length > 0) {
    const topReason = simulation.topReasons[0]
    const citationRate = (
      (topReason.count / simulation.totalBuyers) *
      100
    ).toFixed(0)

    insights.push({
      id: "top-reason",
      icon: "target",
      text: `**${citationRate}% of simulated buyers** cited "${topReason.reason}" as their primary reason for abandoning.`,
      severity: Number(citationRate) >= 60 ? "critical" : "warning",
      priority: 5,
    })
  }

  // --- Determine primary action ---
  // Find the highest-impact, lowest-effort threat
  const threatsWithImpact = analysis.threats.filter(
    (t) => t.estimatedRecoveryMax && t.effort
  )

  let topThreat = analysis.threats[0] // Fallback to first threat

  if (threatsWithImpact.length > 0) {
    const sortedThreats = [...threatsWithImpact].sort((a, b) => {
      const aRecovery = a.estimatedRecoveryMax || 0
      const bRecovery = b.estimatedRecoveryMax || 0
      const aEffortMultiplier =
        a.effort === "low" ? 3 : a.effort === "medium" ? 2 : 1
      const bEffortMultiplier =
        b.effort === "low" ? 3 : b.effort === "medium" ? 2 : 1
      const aScore = aRecovery * aEffortMultiplier
      const bScore = bRecovery * bEffortMultiplier
      return bScore - aScore
    })

    topThreat = sortedThreats[0]
  }

  const estimatedImpact =
    topThreat.estimatedRecoveryMin && topThreat.estimatedRecoveryMax
      ? `+${formatCurrency(topThreat.estimatedRecoveryMin)} - ${formatCurrency(topThreat.estimatedRecoveryMax)}/mo`
      : "High impact"

  const primaryAction = {
    title: topThreat.title,
    description: `This is your highest-impact, ${topThreat.effort || "medium"}-effort fix.`,
    estimatedImpact,
    effort: (topThreat.effort || "medium") as "low" | "medium" | "high",
    threatId: topThreat.id,
  }

  // --- Generate headline based on severity ---
  const criticalCount = analysis.threats.filter(
    (t) => t.severity === "critical"
  ).length
  let headline: string

  if (analysis.ghostScore < 30) {
    headline = `Critical issues detected. Your checkout needs immediate attention.`
  } else if (analysis.ghostScore < 50) {
    headline = `${criticalCount} high-priority issue${criticalCount !== 1 ? "s" : ""} ${criticalCount === 1 ? "is" : "are"} costing you ${formatCurrency(monthlyGap)}/mo.`
  } else if (analysis.ghostScore < 70) {
    headline = `Good foundation, but ${formatCurrency(monthlyGap)}/mo in opportunity remains.`
  } else {
    headline = `Your checkout is performing well. Fine-tuning could recover ${formatCurrency(monthlyGap)}/mo.`
  }

  return {
    headline,
    insights: insights.sort((a, b) => a.priority - b.priority).slice(0, 5),
    primaryAction,
  }
}




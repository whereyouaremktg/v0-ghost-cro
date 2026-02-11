import type { LucideIcon } from "lucide-react"
import {
  Truck,
  ShieldCheck,
  CreditCard,
  FileText,
  Star,
  Gauge,
  Layout,
  DollarSign,
  AlertTriangle,
  Target,
  TrendingUp,
  Info,
} from "lucide-react"
import type { TestResult, Recommendation } from "@/lib/types"

// ── Color / Severity Mappers ──────────────────────────────────────

export function getScoreColor(score: number) {
  if (score < 50) return "text-red-600"
  if (score < 70) return "text-gray-600"
  return "text-blue-600"
}

export function getSeverityColor(severity: "critical" | "high" | "medium") {
  if (severity === "critical") return "text-red-600 border-red-200 bg-red-50"
  if (severity === "high") return "text-gray-600 border-gray-300 bg-gray-50"
  return "text-gray-500 border-gray-200 bg-gray-50"
}

export function getSeverityLabel(severity: "critical" | "high" | "medium") {
  if (severity === "critical") return "Critical"
  if (severity === "high") return "High"
  return "Medium"
}

// ── Icon Mappers ──────────────────────────────────────────────────

type FrictionPoint = TestResult["frictionPoints"]["critical"][0]

export function getThreatIcon(issue: FrictionPoint): LucideIcon {
  const title = issue.title.toLowerCase()
  const location = issue.location.toLowerCase()

  if (title.includes("shipping") || location.includes("shipping")) return Truck
  if (title.includes("trust") || title.includes("security") || title.includes("review")) return ShieldCheck
  if (title.includes("payment") || location.includes("payment") || location.includes("checkout")) return CreditCard
  if (title.includes("product") || title.includes("clarity") || title.includes("description")) return FileText
  if (title.includes("review") || title.includes("rating") || title.includes("testimonial")) return Star
  if (title.includes("speed") || title.includes("performance") || title.includes("load")) return Gauge
  if (title.includes("navigation") || title.includes("menu") || title.includes("ux")) return Layout
  if (title.includes("revenue") || title.includes("cost") || title.includes("price")) return DollarSign

  return AlertTriangle
}

export function getRecommendationIcon(rec: Recommendation): LucideIcon {
  const title = rec.title.toLowerCase()
  const description = rec.description.toLowerCase()

  if (title.includes("shipping") || description.includes("shipping")) return Truck
  if (title.includes("trust") || title.includes("security") || description.includes("trust")) return ShieldCheck
  if (title.includes("payment") || description.includes("payment")) return CreditCard
  if (title.includes("product") || title.includes("clarity") || description.includes("description")) return FileText
  if (title.includes("review") || title.includes("rating") || description.includes("review")) return Star
  if (title.includes("speed") || title.includes("performance") || description.includes("load")) return Gauge
  if (title.includes("navigation") || title.includes("menu") || description.includes("ux")) return Layout
  if (title.includes("revenue") || title.includes("cost") || description.includes("revenue")) return DollarSign

  return Target
}

export function getBriefIcon(point: string): LucideIcon {
  const lower = point.toLowerCase()

  if (lower.includes("revenue") || lower.includes("leak") || lower.includes("$")) return DollarSign
  if (lower.includes("shipping")) return Truck
  if (lower.includes("trust") || lower.includes("security")) return ShieldCheck
  if (lower.includes("payment")) return CreditCard
  if (lower.includes("review") || lower.includes("rating")) return Star
  if (lower.includes("speed") || lower.includes("performance")) return Gauge
  if (lower.includes("navigation") || lower.includes("ux")) return Layout
  if (lower.includes("conversion") || lower.includes("purchase")) return TrendingUp

  return Info
}

// ── Calculation Functions ─────────────────────────────────────────

export function calculateThreatImpact(
  impact: string,
  severity: "critical" | "high" | "medium",
  monthlyRevenueLeak: number
): number {
  const match = impact.match(/(\d+(?:\.\d+)?)%/)
  const impactPercent = match ? parseFloat(match[1]) : 0

  if (impactPercent === 0) {
    const severityMultiplier = severity === "critical" ? 0.15 : severity === "high" ? 0.08 : 0.03
    return Math.round(monthlyRevenueLeak * severityMultiplier)
  }

  const severityWeight = severity === "critical" ? 0.8 : severity === "high" ? 0.5 : 0.2
  return Math.round((impactPercent / 100) * monthlyRevenueLeak * severityWeight)
}

export function generateGhostSees(
  issue: FrictionPoint,
  severity: "critical" | "high" | "medium"
): string {
  const location = issue.location.toLowerCase()
  const title = issue.title.toLowerCase()

  if (location.includes("shipping") || title.includes("shipping")) {
    return "Ghost sees shoppers hesitating when shipping costs appear unexpectedly."
  }
  if (location.includes("payment") || title.includes("payment")) {
    return "Ghost sees payment friction causing hesitation at the final step."
  }
  if (location.includes("cart") || title.includes("cart")) {
    return "Ghost sees cart abandonment due to unclear next steps."
  }
  if (location.includes("product") || title.includes("product")) {
    return "Ghost sees product page friction reducing initial interest."
  }
  if (title.includes("trust") || title.includes("security")) {
    return "Ghost sees trust signals missing, causing hesitation."
  }
  if (title.includes("account") || title.includes("sign up")) {
    return "Ghost sees forced account creation blocking quick purchases."
  }

  if (severity === "critical") {
    return "Ghost sees this as a major conversion blocker affecting many shoppers."
  }
  if (severity === "high") {
    return "Ghost sees this causing significant friction for some shoppers."
  }
  return "Ghost sees this as a minor friction point worth addressing."
}

export function calculateConfidence(rec: Recommendation): "High" | "Medium" | "Low" {
  if (rec.effort === "low" && (rec.impact.toLowerCase().includes("critical") || rec.impact.toLowerCase().includes("high"))) {
    return "High"
  }
  if (rec.effort === "high" && !rec.impact.toLowerCase().includes("critical")) {
    return "Low"
  }
  return "Medium"
}

// ── Content Generators ────────────────────────────────────────────

export function generateImplementationDetails(rec: Recommendation) {
  const title = rec.title.toLowerCase()
  const description = rec.description.toLowerCase()

  if (title.includes("shipping") || description.includes("shipping")) {
    return {
      whyMatters: [
        "Unexpected shipping costs are the #1 reason for cart abandonment",
        "Transparency builds trust and reduces checkout friction",
      ],
      steps: [
        "Display shipping costs early in the checkout flow (cart or product page)",
        "Offer multiple shipping options with clear pricing",
        "Add a shipping calculator or estimator tool",
        "Show free shipping threshold prominently",
        "Test different shipping messaging and placement",
      ],
      metrics: ["Cart abandonment rate", "Checkout completion rate", "Average order value", "Time to checkout"],
      timeEstimate: rec.effort === "low" ? "1-2 hours" : rec.effort === "medium" ? "4-8 hours" : "1-2 days",
    }
  }

  if (title.includes("payment") || description.includes("payment")) {
    return {
      whyMatters: [
        "Payment friction causes hesitation at the final conversion step",
        "Multiple payment options increase buyer confidence",
      ],
      steps: [
        "Add popular payment methods (Apple Pay, Google Pay, PayPal)",
        "Implement one-click checkout for returning customers",
        "Add trust badges and security indicators near payment fields",
        "Simplify payment form fields (remove unnecessary fields)",
        "Test payment flow on mobile devices",
      ],
      metrics: ["Payment completion rate", "Payment method usage", "Checkout abandonment at payment step", "Mobile conversion rate"],
      timeEstimate: rec.effort === "low" ? "2-4 hours" : rec.effort === "medium" ? "1-2 days" : "3-5 days",
    }
  }

  if (title.includes("trust") || title.includes("security") || description.includes("trust")) {
    return {
      whyMatters: [
        "Trust signals reduce buyer hesitation and increase conversion confidence",
        "Security indicators are critical for first-time buyers",
      ],
      steps: [
        "Add SSL certificate badge and security logos",
        "Display customer reviews and ratings prominently",
        "Show return policy and guarantees clearly",
        "Add social proof (recent purchases, customer count)",
        "Include money-back guarantee or satisfaction promise",
      ],
      metrics: ["Conversion rate", "Time to first purchase", "Bounce rate", "Trust signal engagement"],
      timeEstimate: rec.effort === "low" ? "1-2 hours" : rec.effort === "medium" ? "2-4 hours" : "4-8 hours",
    }
  }

  if (title.includes("account") || title.includes("sign up") || description.includes("account")) {
    return {
      whyMatters: [
        "Forced account creation blocks quick purchases",
        "Guest checkout increases conversion by reducing friction",
      ],
      steps: [
        "Enable guest checkout option",
        "Make account creation optional, not required",
        "Offer account creation after purchase completion",
        "Simplify signup form if account is required",
        "Add social login options (Google, Apple, Facebook)",
      ],
      metrics: ["Checkout completion rate", "Account creation rate", "Guest vs. registered conversion", "Time to checkout"],
      timeEstimate: rec.effort === "low" ? "2-4 hours" : rec.effort === "medium" ? "4-8 hours" : "1-2 days",
    }
  }

  return {
    whyMatters: [
      "This fix addresses a key friction point identified in your checkout flow",
      "Implementing this will improve overall conversion rate and revenue",
    ],
    steps: [
      "Review the specific issue in your current checkout flow",
      "Plan the implementation approach and required changes",
      "Test changes in a staging environment first",
      "Deploy changes and monitor performance",
      "Iterate based on conversion data and user feedback",
    ],
    metrics: ["Conversion rate", "Revenue per visitor", "Checkout completion rate", "User satisfaction"],
    timeEstimate: rec.effort === "low" ? "1-4 hours" : rec.effort === "medium" ? "4-8 hours" : "1-3 days",
  }
}

// ── Persona Helpers ───────────────────────────────────────────────

export function extractDevice(demographics: string): "Mobile" | "Desktop" {
  return demographics.toLowerCase().includes("mobile") ? "Mobile" : "Desktop"
}

export function generateBulletSummary(reasoning: string): string[] {
  const sentences = reasoning.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  const bullets: string[] = []

  if (reasoning.toLowerCase().includes("shipping")) {
    bullets.push("Concerned about shipping costs or transparency")
  }
  if (reasoning.toLowerCase().includes("trust") || reasoning.toLowerCase().includes("security")) {
    bullets.push("Needs more trust signals or security reassurance")
  }
  if (reasoning.toLowerCase().includes("account") || reasoning.toLowerCase().includes("sign up")) {
    bullets.push("Friction from account creation requirement")
  }
  if (reasoning.toLowerCase().includes("payment") || reasoning.toLowerCase().includes("checkout")) {
    bullets.push("Payment or checkout process concerns")
  }
  if (reasoning.toLowerCase().includes("price") || reasoning.toLowerCase().includes("cost")) {
    bullets.push("Price or total cost uncertainty")
  }

  if (bullets.length === 0 && sentences.length > 0) {
    bullets.push(sentences[0].trim().substring(0, 80) + (sentences[0].length > 80 ? "..." : ""))
    if (sentences.length > 1) {
      bullets.push(sentences[1].trim().substring(0, 80) + (sentences[1].length > 80 ? "..." : ""))
    }
  }

  return bullets.slice(0, 3)
}

// ── Executive Brief Generator ─────────────────────────────────────

export type ThreatWithImpact = TestResult["frictionPoints"]["critical"][0] & {
  severity: "critical" | "high" | "medium"
  estimatedImpact: number
}

export function generateExecutiveBrief(
  test: TestResult,
  allThreats: ThreatWithImpact[],
  revenueLeak: { monthly: number; weekly: number; daily: number }
): string[] {
  const brief: string[] = []
  const purchaseCount = test.personaResults.filter((p) => p.verdict === "purchase").length
  const abandonCount = test.personaResults.filter((p) => p.verdict === "abandon").length
  const conversionRate = Math.round((purchaseCount / test.personaResults.length) * 100)

  const cartDropoff = test.funnelData.landed > 0
    ? Math.round(((test.funnelData.landed - test.funnelData.cart) / test.funnelData.landed) * 100)
    : 0
  const checkoutDropoff = test.funnelData.cart > 0
    ? Math.round(((test.funnelData.cart - test.funnelData.checkout) / test.funnelData.cart) * 100)
    : 0
  const paymentDropoff = test.funnelData.checkout > 0
    ? Math.round(((test.funnelData.checkout - test.funnelData.purchased) / test.funnelData.checkout) * 100)
    : 0

  const abandonPoints = test.personaResults
    .filter((p) => p.abandonPoint)
    .map((p) => p.abandonPoint)
  const mostCommonAbandonPoint = abandonPoints.length > 0
    ? abandonPoints.reduce((a, b, _, arr) =>
        arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b
      )
    : null

  const topThreat = allThreats[0]

  brief.push(
    `Your checkout is leaking $${revenueLeak.monthly.toLocaleString()}/month due to friction—that's $${revenueLeak.daily.toLocaleString()} daily.`
  )

  if (conversionRate < 50) {
    brief.push(
      `Only ${conversionRate}% of simulated buyers would purchase (${purchaseCount}/${test.personaResults.length}). Industry benchmark is 60-70% for optimized stores.`
    )
  } else {
    brief.push(
      `${conversionRate}% conversion rate (${purchaseCount}/${test.personaResults.length} buyers) is ${conversionRate < 60 ? "below" : "at"} industry standard—there's still room to capture more revenue.`
    )
  }

  const maxDropoff = Math.max(cartDropoff, checkoutDropoff, paymentDropoff)
  if (maxDropoff > 0) {
    if (maxDropoff === cartDropoff) {
      brief.push(
        `${cartDropoff}% of visitors abandon at the cart stage—likely due to hidden costs or unclear next steps.`
      )
    } else if (maxDropoff === checkoutDropoff) {
      brief.push(
        `${checkoutDropoff}% drop-off occurs at checkout—payment friction or account requirements are blocking conversions.`
      )
    } else {
      brief.push(
        `${paymentDropoff}% abandon during payment—trust signals or payment options need attention.`
      )
    }
  }

  if (mostCommonAbandonPoint) {
    const abandonCountAtPoint = abandonPoints.filter((p) => p === mostCommonAbandonPoint).length
    brief.push(
      `${abandonCountAtPoint} of ${abandonCount} abandoning shoppers left at: ${mostCommonAbandonPoint.toLowerCase()}.`
    )
  } else if (test.frictionPoints.critical.length > 0) {
    brief.push(
      `${test.frictionPoints.critical.length} critical issue${test.frictionPoints.critical.length > 1 ? "s" : ""} ${test.frictionPoints.critical.length === 1 ? "is" : "are"} blocking ${abandonCount} of ${test.personaResults.length} potential buyers.`
    )
  }

  const topRecommendation = test.recommendations[0]
  if (topRecommendation) {
    const estimatedRecovery = Math.round(
      revenueLeak.monthly *
      (topRecommendation.impact.toLowerCase().includes("critical") ? 0.3 :
       topRecommendation.impact.toLowerCase().includes("high") ? 0.2 : 0.1)
    )
    brief.push(
      `Top next step: ${topRecommendation.title.toLowerCase()}—${topRecommendation.effort === "low" ? "quick win" : topRecommendation.effort === "medium" ? "moderate effort" : "requires focus"} that could recover $${estimatedRecovery.toLocaleString()}/mo.`
    )
  } else if (topThreat) {
    brief.push(
      `Top next step: Fix "${topThreat.title.toLowerCase()}"—this ${topThreat.severity} threat is costing you $${topThreat.estimatedImpact.toLocaleString()}/month.`
    )
  } else {
    brief.push(
      `Top next step: Review the Recovery Plan below to prioritize fixes by impact and effort.`
    )
  }

  return brief.slice(0, 5)
}

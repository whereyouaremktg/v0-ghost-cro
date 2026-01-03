"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  RefreshCw,
  Share2,
  Check,
  AlertTriangle,
  AlertCircle,
  Info,
  Loader2,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  BarChart3,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Smartphone,
  Monitor,
  MessageSquare,
  Truck,
  ShieldCheck,
  FileText,
  CreditCard,
  Star,
  Gauge,
  Layout,
  Eye,
  Edit,
  Plus,
  TestTube,
  Send,
  Copy,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import type { TestResult, Recommendation } from "@/lib/types"
import { getTestResult, getAllTestResults } from "@/lib/client-storage"
import { calculateRevenueLeak } from "@/lib/ghostEngine"
import { calculateRevenueOpportunity, formatOpportunityRange, getMethodologyText } from "@/lib/calculations/revenue-opportunity"
import { calculateThreatImpact, formatRecoveryRange, getConfidenceBadge, getEstimatedCRLift } from "@/lib/calculations/threat-impact"
import { RevenueOpportunityDisplay } from "@/components/dashboard/revenue-opportunity-display"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StoreSnapshot } from "@/components/analysis/store-snapshot"
import { buildStoreSnapshot } from "@/lib/analysis/build-store-snapshot"
import { GhostSummary } from "@/components/analysis/ghost-summary"
import { ErrorBoundary } from "@/components/error-boundary"

const sections = [
  { id: "overview", label: "Overview" },
  { id: "threats", label: "Threats" },
  { id: "recovery", label: "Recovery Plan" },
  { id: "ghosts", label: "Ghosts" },
  { id: "analytics", label: "Analytics" },
]

function getScoreColor(score: number) {
  if (score < 50) return "text-orange-600"
  if (score < 70) return "text-amber-600"
  return "text-lime-600"
}

function getSeverityColor(severity: "critical" | "high" | "medium") {
  if (severity === "critical") return "text-orange-600 border-orange-200 bg-orange-50"
  if (severity === "high") return "text-amber-600 border-amber-200 bg-amber-50"
  return "text-gray-600 border-gray-200 bg-gray-50"
}

function getSeverityLabel(severity: "critical" | "high" | "medium") {
  if (severity === "critical") return "Critical"
  if (severity === "high") return "High"
  return "Medium"
}

/**
 * Get icon for threat/friction point based on title and location
 */
function getThreatIcon(issue: TestResult["frictionPoints"]["critical"][0] | TestResult["frictionPoints"]["high"][0] | TestResult["frictionPoints"]["medium"][0]): LucideIcon {
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
  
  return AlertTriangle // Default
}

/**
 * Get icon for recommendation based on title
 */
function getRecommendationIcon(rec: Recommendation): LucideIcon {
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

  return Target // Default
}

/**
 * Animated counter component
 */
function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const startValue = 0
    const endValue = value
    const startTime = Date.now()

    const animate = () => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.floor(startValue + (endValue - startValue) * easeOut)

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(endValue)
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <span>{displayValue.toLocaleString()}</span>
}

/**
 * Simple sparkline component (line chart)
 */
function Sparkline({ data, width = 60, height = 20, color = "lime" }: { data: number[]; width?: number; height?: number; color?: string }) {
  if (data.length < 2) return null

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(" ")

  const colorClass = color === "lime" ? "stroke-lime-500" : color === "orange" ? "stroke-orange-500" : "stroke-gray-400"

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        className={colorClass}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Mini funnel bar component
 */
function MiniFunnelBar({ value, max, label, color = "lime" }: { value: number; max: number; label: string; color?: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const colorClass = color === "lime" ? "bg-lime-500" : color === "orange" ? "bg-orange-500" : "bg-gray-400"

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Impact bar component for threat cards
 */
function ImpactBar({ severity, maxImpact = 100 }: { severity: "critical" | "high" | "medium"; maxImpact?: number }) {
  const impactMap = { critical: 100, high: 65, medium: 35 }
  const percentage = impactMap[severity]
  const colorClass =
    severity === "critical" ? "bg-orange-500" : severity === "high" ? "bg-amber-500" : "bg-gray-400"

  return (
    <div className="mt-2">
      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Get icon for executive brief bullet based on content
 */
function getBriefIcon(point: string): LucideIcon {
  const lower = point.toLowerCase()
  
  if (lower.includes("revenue") || lower.includes("leak") || lower.includes("$")) return DollarSign
  if (lower.includes("shipping")) return Truck
  if (lower.includes("trust") || lower.includes("security")) return ShieldCheck
  if (lower.includes("payment")) return CreditCard
  if (lower.includes("review") || lower.includes("rating")) return Star
  if (lower.includes("speed") || lower.includes("performance")) return Gauge
  if (lower.includes("navigation") || lower.includes("ux")) return Layout
  if (lower.includes("conversion") || lower.includes("purchase")) return TrendingUp
  
  return Info // Default
}

/**
 * Calculate estimated monthly revenue impact from friction point
 * Uses impact percentage and revenue leak data
 */
// Legacy function kept for backward compatibility - now using new calculation system above

/**
 * Generate "Ghost sees" explanation in plain English
 */
function generateGhostSees(
  issue: TestResult["frictionPoints"]["critical"][0] | TestResult["frictionPoints"]["high"][0] | TestResult["frictionPoints"]["medium"][0],
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

  // Generic explanation based on severity
  if (severity === "critical") {
    return "Ghost sees this as a major conversion blocker affecting many shoppers."
  }
  if (severity === "high") {
    return "Ghost sees this causing significant friction for some shoppers."
  }
  return "Ghost sees this as a minor friction point worth addressing."
}

/**
 * Calculate confidence level based on effort and impact
 */
function calculateConfidence(rec: Recommendation): "High" | "Medium" | "Low" {
  // High confidence: low effort + high impact indicators
  if (rec.effort === "low" && (rec.impact.toLowerCase().includes("critical") || rec.impact.toLowerCase().includes("high"))) {
    return "High"
  }
  // Low confidence: high effort + unclear impact
  if (rec.effort === "high" && !rec.impact.toLowerCase().includes("critical")) {
    return "Low"
  }
  // Medium confidence: everything else
  return "Medium"
}

/**
 * Generate implementation details for a recommendation
 */
function generateImplementationDetails(rec: Recommendation) {
  const title = rec.title.toLowerCase()
  const description = rec.description.toLowerCase()

  // Shipping-related fixes
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

  // Payment-related fixes
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

  // Trust/security fixes
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

  // Account/signup fixes
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

  // Generic implementation
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

// Automation Step Component
function AutomationStep({
  step,
  index,
  totalSteps,
  onCopy,
}: {
  step: { text: string; type: "view" | "edit" | "add" | "test" | "publish"; icon: LucideIcon }
  index: number
  totalSteps: number
  onCopy: (text: string) => void
}) {
  const StepIcon = step.icon
  const typeColors = {
    view: "bg-blue-50 text-blue-600 border-blue-200",
    edit: "bg-amber-50 text-amber-600 border-amber-200",
    add: "bg-lime-50 text-lime-600 border-lime-200",
    test: "bg-purple-50 text-purple-600 border-purple-200",
    publish: "bg-green-50 text-green-600 border-green-200",
  }

  return (
    <div className="relative">
      {/* Progress line */}
      {index < totalSteps - 1 && (
        <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-200" />
      )}
      
      <div className="relative flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
        {/* Step number and icon */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
            <StepIcon className="h-4 w-4 text-gray-600" strokeWidth={2} />
          </div>
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>

        {/* Step content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Step {index + 1}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${typeColors[step.type]}`}>
                {step.type}
              </span>
            </div>
            <button
              onClick={() => onCopy(step.text)}
              className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors group"
              title="Copy step"
            >
              <Copy className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" strokeWidth={2} />
            </button>
          </div>
          <p className="text-sm text-gray-900 leading-relaxed">{step.text}</p>
        </div>
      </div>
    </div>
  )
}

// Fix Implementation Modal Component
function FixImplementationModal({
  recommendation,
  isOpen,
  onClose,
}: {
  recommendation: Recommendation | null
  isOpen: boolean
  onClose: () => void
}) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!recommendation) return null

  const details = generateImplementationDetails(recommendation)
  const confidence = calculateConfidence(recommendation)

  const handleCopyStep = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-semibold text-gray-900">{recommendation.title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">{recommendation.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Why This Matters */}
          <div>
            <h3 className="text-sm font-semibold font-heading mb-3 flex items-center gap-2 text-gray-900">
              <Info className="h-4 w-4 text-lime-600" strokeWidth={2.5} />
              Why this fix matters
            </h3>
            <ul className="space-y-2">
              {details.whyMatters.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-500 mt-2 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Automation Runbook Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-heading flex items-center gap-2 text-gray-900">
                <Target className="h-4 w-4 text-lime-600" strokeWidth={2.5} />
                Automation Runbook
              </h3>
              <button
                onClick={() => {
                  const allSteps = details.steps.map((s) => s.text).join("\n")
                  navigator.clipboard.writeText(allSteps)
                }}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                Copy all steps
              </button>
            </div>
            <div className="space-y-2">
              {details.steps.map((step, index) => (
                <AutomationStep
                  key={index}
                  step={step}
                  index={index}
                  totalSteps={details.steps.length}
                  onCopy={(text) => handleCopyStep(text, index)}
                />
              ))}
            </div>
            {copiedIndex !== null && (
              <div className="mt-3 flex items-center gap-2 text-xs text-lime-600 animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
                Step {copiedIndex + 1} copied to clipboard
          </div>
            )}
        </div>

          {/* What to Measure */}
          <div>
            <h3 className="text-sm font-semibold font-heading mb-3 flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-4 w-4 text-lime-600" strokeWidth={2.5} />
              What to measure
            </h3>
            <div className="flex flex-wrap gap-2">
              {details.metrics.map((metric, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                >
                  {metric}
                </span>
              ))}
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <Clock className="h-5 w-5 text-lime-600" strokeWidth={2.5} />
            <div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Estimated time</div>
              <div className="text-sm font-semibold font-heading text-gray-900">{details.timeEstimate}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs font-medium text-gray-500 mb-0.5">Confidence</div>
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                  confidence === "High"
                    ? "bg-lime-50 text-lime-600 border-lime-200"
                    : confidence === "Medium"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-orange-50 text-orange-600 border-orange-200"
                }`}
              >
                {confidence}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Active Friction Threat Card
function ThreatCard({
  issue,
  severity,
  impactRange,
  confidence,
  methodology,
  index,
  onViewFix,
}: {
  issue: TestResult["frictionPoints"]["critical"][0] | TestResult["frictionPoints"]["high"][0] | TestResult["frictionPoints"]["medium"][0]
  severity: "critical" | "high" | "medium"
  impactRange: { min: number; max: number }
  confidence: "high" | "medium" | "low"
  methodology?: string
  index: number
  onViewFix: () => void
}) {
  const ghostSees = generateGhostSees(issue, severity)
  const ThreatIcon = getThreatIcon(issue)
  const confidenceBadge = getConfidenceBadge(confidence)
  const recoveryRange = formatRecoveryRange(impactRange.min, impactRange.max)

  return (
    <div className="group bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-sm font-heading font-bold text-lime-600">
            {index + 1}
          </div>
          <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <ThreatIcon className="h-4 w-4 text-gray-600" strokeWidth={2} />
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${getSeverityColor(severity)}`}>
            {getSeverityLabel(severity)}
          </span>
        </div>
        {impactRange.max > 0 && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <div className={`px-2 py-0.5 rounded text-[9px] font-medium border ${confidenceBadge.color} ${confidenceBadge.bgColor}`}>
                {confidenceBadge.text}
              </div>
            </div>
            <div className="text-[10px] text-gray-500 mb-0.5">Est. Recovery</div>
            <div className="text-base font-heading font-bold text-orange-600">
              {recoveryRange}
              <span className="text-xs font-normal text-gray-500">/mo</span>
            </div>
          </div>
        )}
      </div>
      <h4 className="text-base font-semibold mb-3 font-heading leading-tight text-gray-900">{issue.title}</h4>
      <div className="mb-4 p-3 bg-gray-50 border border-gray-100 rounded-xl">
        <div className="text-[10px] font-medium text-gray-500 mb-1">Ghost sees</div>
        <p className="text-xs text-gray-700 leading-relaxed">{ghostSees}</p>
      </div>
      <ImpactBar severity={severity} />
      {methodology && (
        <div className="mt-3 p-2 bg-gray-50 border border-gray-100 rounded-lg">
          <p className="text-[10px] text-gray-600 leading-relaxed">{methodology}</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-700">Where:</span> {issue.location}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewFix}
          className="text-xs h-7 text-lime-600 hover:text-lime-700 hover:bg-lime-50 rounded-xl button-glow"
        >
          View Fix
          <ArrowRight className="h-3 w-3 ml-1" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  )
}

/**
 * Extract device type from demographics string
 */
function extractDevice(demographics: string): "Mobile" | "Desktop" {
  return demographics.toLowerCase().includes("mobile") ? "Mobile" : "Desktop"
}

/**
 * Generate bullet summary from reasoning
 */
function generateBulletSummary(reasoning: string): string[] {
  const sentences = reasoning.split(/[.!?]+/).filter((s) => s.trim().length > 10)
  const bullets: string[] = []

  // Extract key concerns
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

  // If no specific bullets found, create generic ones from first 2 sentences
  if (bullets.length === 0 && sentences.length > 0) {
    bullets.push(sentences[0].trim().substring(0, 80) + (sentences[0].length > 80 ? "..." : ""))
    if (sentences.length > 1) {
      bullets.push(sentences[1].trim().substring(0, 80) + (sentences[1].length > 80 ? "..." : ""))
    }
  }

  return bullets.slice(0, 3) // Max 3 bullets
}

// Compact Persona Card
function PersonaCard({
  persona,
  isSelected,
  onClick,
}: {
  persona: TestResult["personaResults"][0]
  isSelected: boolean
  onClick: () => void
}) {
  const [isPulsing, setIsPulsing] = useState(false)
  const isAbandoned = persona.verdict === "abandon"
  const device = extractDevice(persona.demographics)
  const shortReason = persona.reasoning.length > 120 ? persona.reasoning.substring(0, 120) + "..." : persona.reasoning

  // Determine icon based on abandonment point or reasoning
  const getPersonaIcon = () => {
    if (persona.abandonPoint) {
      const point = persona.abandonPoint.toLowerCase()
      if (point.includes("shipping")) return Truck
      if (point.includes("payment") || point.includes("checkout")) return CreditCard
      if (point.includes("trust") || point.includes("security")) return ShieldCheck
      if (point.includes("product")) return FileText
    }
    const reasoning = persona.reasoning.toLowerCase()
    if (reasoning.includes("shipping")) return Truck
    if (reasoning.includes("payment")) return CreditCard
    if (reasoning.includes("trust") || reasoning.includes("security")) return ShieldCheck
    if (reasoning.includes("review") || reasoning.includes("rating")) return Star
    return Users // Default
  }
  const PersonaIcon = getPersonaIcon()

  const handleClick = () => {
    setIsPulsing(true)
    setTimeout(() => setIsPulsing(false), 600)
    onClick()
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left bg-white border rounded-[16px] p-4 transition-all duration-300 relative ${
        isSelected
          ? "border-lime-300 bg-lime-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Pulse ring effect on selection */}
      {isPulsing && (
        <div className="absolute inset-0 rounded-[16px] border-2 border-lime-400 animate-pulse-ring pointer-events-none" />
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1 bg-gray-50 border border-gray-200 rounded-lg">
              <PersonaIcon className="h-4 w-4 text-gray-600" strokeWidth={2} />
            </div>
            <h4 className="text-sm font-semibold font-heading text-gray-900">{persona.name}</h4>
            {device === "Mobile" ? (
              <Smartphone className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
            ) : (
              <Monitor className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
            )}
          </div>
          <p className="text-[10px] text-gray-500 truncate">{persona.demographics}</p>
        </div>
        <span
          className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ml-2 flex-shrink-0 border animate-pulse-soft ${
            isAbandoned
              ? "bg-orange-50 text-orange-600 border-orange-200"
              : "bg-lime-50 text-lime-600 border-lime-200"
          }`}
        >
          {isAbandoned ? "Would Abandon" : "Would Buy"}
        </span>
      </div>
      {persona.abandonPoint && (
        <div className="text-[10px] text-gray-600 mb-2 font-medium">
          Drop-off: {persona.abandonPoint}
    </div>
      )}
      <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">&ldquo;{shortReason}&rdquo;</p>
    </button>
  )
}

// Ghost Transcript Panel
function GhostTranscriptPanel({
  persona,
  onClose,
}: {
  persona: TestResult["personaResults"][0] | null
  onClose: () => void
}) {
  if (!persona) {
    return (
      <div className="bg-white border border-gray-200 rounded-[16px] p-8 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" strokeWidth={1.5} />
          <p className="text-sm">Select a persona to view their full transcript</p>
        </div>
      </div>
    )
  }

  const device = extractDevice(persona.demographics)
  const bullets = generateBulletSummary(persona.reasoning)

  return (
    <div className="bg-white border border-gray-200 rounded-[16px] p-6 h-full flex flex-col animate-slide-in-right">
      <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold font-heading text-gray-900">{persona.name}</h3>
            {device === "Mobile" ? (
              <Smartphone className="h-4 w-4 text-gray-400" strokeWidth={2} />
            ) : (
              <Monitor className="h-4 w-4 text-gray-400" strokeWidth={2} />
            )}
          </div>
          <p className="text-xs text-gray-500">{persona.demographics}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={2.5} />
        </button>
      </div>

      <div className="mb-4">
              <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
            persona.verdict === "abandon"
              ? "bg-orange-50 text-orange-600 border-orange-200"
              : "bg-lime-50 text-lime-600 border-lime-200"
          }`}
        >
          {persona.verdict === "abandon" ? "Would Abandon" : "Would Buy"}
              </span>
        {persona.abandonPoint && (
          <span className="ml-2 text-xs text-gray-600">at {persona.abandonPoint}</span>
        )}
            </div>

      <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-xl">
        <div className="text-[10px] font-medium text-gray-500 mb-2 flex items-center gap-2">
          <MessageSquare className="h-3.5 w-3.5" strokeWidth={2} />
          Full Quote
          </div>
        <p className="text-sm text-gray-900 leading-relaxed italic">&ldquo;{persona.reasoning}&rdquo;</p>
        </div>

      <div>
        <div className="text-[10px] font-medium text-gray-500 mb-3 flex items-center gap-2">
          <Info className="h-3.5 w-3.5" strokeWidth={2} />
          Key Insights
          </div>
        <ul className="space-y-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-2 text-xs text-gray-700">
              <div className="w-1.5 h-1.5 rounded-full bg-lime-500 mt-1.5 flex-shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function TestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const [activeSection, setActiveSection] = useState("overview")
  const [test, setTest] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllThreats, setShowAllThreats] = useState(false)
  const [selectedFix, setSelectedFix] = useState<Recommendation | null>(null)
  const [isFixModalOpen, setIsFixModalOpen] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState<TestResult["personaResults"][0] | null>(null)
  const [isHighlighted, setIsHighlighted] = useState(false)
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [shopifyMetrics, setShopifyMetrics] = useState<any>(null)
  const [shopifyStore, setShopifyStore] = useState<{ shop: string; accessToken: string } | null>(null)
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const recoveryPlanRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function loadTest() {
      try {
        const { id } = await params
        console.log("Loading test with ID:", id)
        
        const result = getTestResult(id)
        console.log("Test result:", result ? "Found" : "Not found")

        if (!result) {
          // Check if there are any tests in storage
          const allTests = getAllTestResults()
          console.log("All tests in storage:", allTests.length)
          if (allTests.length > 0) {
            console.log("Available test IDs:", allTests.map(t => t.id))
          }
          throw new Error(`Test not found. ID: ${id}`)
        }

        setTest(result)
        setIsHighlighted(true)
        setTimeout(() => setIsHighlighted(false), 1000)

        // Try to load Shopify metrics if available
        const stored = localStorage.getItem("shopifyStore")
        if (stored) {
          try {
            const store = JSON.parse(stored)
            setShopifyStore({ shop: store.shop, accessToken: store.accessToken })
            const response = await fetch("/api/shopify/metrics", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shop: store.shop,
                accessToken: store.accessToken,
              }),
            })
            if (response.ok) {
              const data = await response.json()
              setShopifyMetrics(data)
            }
          } catch (err) {
            console.error("Failed to load Shopify metrics:", err)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load test")
      } finally {
        setLoading(false)
      }
    }

    loadTest()
  }, [params])

  // IntersectionObserver for scroll-triggered section animations
  useEffect(() => {
    if (!test) return

    // Initialize all sections as visible (progressive enhancement)
    const allSectionIds = sections.map(s => s.id)
    setVisibleSections(new Set(allSectionIds))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section-id")
            if (sectionId) {
              setVisibleSections((prev) => new Set([...prev, sectionId]))
            }
          }
        })
      },
      { threshold: 0.1, rootMargin: "-50px" }
    )

    // Small delay to ensure refs are set
    setTimeout(() => {
      Object.values(sectionRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref)
      })
    }, 100)

    return () => observer.disconnect()
  }, [test])

  // Scroll spy for sections
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200

      for (const section of sections) {
        const element = sectionRefs.current[section.id]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [test])

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId]
    if (element) {
      const offset = 120 // Account for sticky nav
      const elementPosition = element.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: "smooth" })
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading mission control...</p>
        </div>
      </div>
    )
  }

  if (error || !test) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Test Not Found</h2>
          <p className="text-muted-foreground mb-6">{error || "The test result could not be loaded."}</p>
          <div className="space-y-2">
            <Link
              href="/ghost#timeline"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Timeline
            </Link>
            <div className="text-xs text-muted-foreground mt-4">
              <p>If you just ran a scan, check the browser console for errors.</p>
              <p>Test ID: {typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "unknown"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safety check: ensure test has required properties
  if (!test.personaResults || !Array.isArray(test.personaResults)) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Invalid Test Data</h2>
          <p className="text-muted-foreground mb-6">The test result is missing required data.</p>
          <Link
            href="/ghost#timeline"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Timeline
          </Link>
        </div>
      </div>
    )
  }

  // Get metrics from Shopify or use defaults
  const aov = shopifyMetrics?.metrics?.averageOrderValue || 85
  const monthlySessions = shopifyMetrics?.metrics?.totalSessions || 50000
  const monthlyRevenue = shopifyMetrics?.metrics?.totalRevenue || monthlySessions * 0.025 * aov

  // Calculate current conversion rate from test results
  const purchaseCount = test.personaResults.filter((p) => p.verdict === "purchase").length
  const abandonCount = test.personaResults.filter((p) => p.verdict === "abandon").length
  const totalSimulated = test.personaResults.length
  const currentConversionRate = totalSimulated > 0 ? purchaseCount / totalSimulated : 0.025 // Default 2.5%
  
  // Category benchmark (e.g., 2.8% for e-commerce)
  const categoryBenchmarkCR = 0.028

  // Calculate revenue opportunity using new system
  const revenueOpportunity = calculateRevenueOpportunity({
    monthlyVisitors: monthlySessions,
    currentConversionRate,
    aov,
    categoryBenchmarkCR,
  })

  // Legacy revenue leak calculation (for backward compatibility in some places)
  const revenueLeak = calculateRevenueLeak(test, {
    averageOrderValue: aov,
    monthlySessions,
    monthlyRevenue,
  })

  // Get all friction threats with new impact calculation
  const allThreats = [
    ...test.frictionPoints.critical.map((fp) => ({ ...fp, severity: "critical" as const })),
    ...test.frictionPoints.high.map((fp) => ({ ...fp, severity: "high" as const })),
    ...test.frictionPoints.medium.map((fp) => ({ ...fp, severity: "medium" as const })),
  ].map((threat) => {
    // Count how many buyers cited this threat
    const buyersCitingThreat = test.personaResults.filter((p) => {
      const reason = p.reason?.toLowerCase() || ""
      const threatTitle = threat.title.toLowerCase()
      return reason.includes(threatTitle) || reason.includes(threat.location.toLowerCase())
    }).length

    // Get estimated CR lift for this threat
    const estimatedCRLift = getEstimatedCRLift(threat.severity, threat.title)

    // Calculate threat impact
    const threatImpact = calculateThreatImpact({
      totalOpportunity: revenueOpportunity.monthlyOpportunity.max,
      simulatedBuyersTotal: totalSimulated,
      simulatedBuyersCitingThisThreat: buyersCitingThreat,
      threatSeverity: threat.severity,
      estimatedCRLift,
      monthlyVisitors: monthlySessions,
      aov,
    })

    return {
      ...threat,
      estimatedImpact: threatImpact.estimatedRecoveryMax, // For sorting
      impactRange: {
        min: threatImpact.estimatedRecoveryMin,
        max: threatImpact.estimatedRecoveryMax,
      },
      confidence: threatImpact.confidenceLevel,
      methodology: threatImpact.methodology,
      buyerAttributionRate: threatImpact.buyerAttributionRate,
    }
  })

  // Sort by severity (critical first) then by estimated impact
  allThreats.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.estimatedImpact - a.estimatedImpact
  })

  const displayedThreats = showAllThreats ? allThreats : allThreats.slice(0, 3)

  /**
   * Generate executive brief summary in CRO agency tone
   * Direct, specific, non-generic, references actual data
   */
  function generateExecutiveBrief(): string[] {
    const brief: string[] = []
    const purchaseCount = test.personaResults.filter((p) => p.verdict === "purchase").length
    const abandonCount = test.personaResults.filter((p) => p.verdict === "abandon").length
    const conversionRate = Math.round((purchaseCount / test.personaResults.length) * 100)
    
    // Calculate funnel drop-off rates
    const cartDropoff = test.funnelData.landed > 0 
      ? Math.round(((test.funnelData.landed - test.funnelData.cart) / test.funnelData.landed) * 100)
      : 0
    const checkoutDropoff = test.funnelData.cart > 0
      ? Math.round(((test.funnelData.cart - test.funnelData.checkout) / test.funnelData.cart) * 100)
      : 0
    const paymentDropoff = test.funnelData.checkout > 0
      ? Math.round(((test.funnelData.checkout - test.funnelData.purchased) / test.funnelData.checkout) * 100)
      : 0

    // Find most common abandonment point
    const abandonPoints = test.personaResults
      .filter((p) => p.abandonPoint)
      .map((p) => p.abandonPoint)
    const mostCommonAbandonPoint = abandonPoints.length > 0
      ? abandonPoints.reduce((a, b, _, arr) => 
          arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b
        )
      : null

    // Top threat
    const topThreat = allThreats[0]

    // Bullet 1: Revenue opportunity
    brief.push(
      `You have a revenue opportunity of ${formatOpportunityRange(revenueOpportunity.monthlyOpportunity.min, revenueOpportunity.monthlyOpportunity.max)}/month by reaching category average conversion rates.`
    )

    // Bullet 2: Conversion rate context
    if (conversionRate < 50) {
      brief.push(
        `Only ${conversionRate}% of simulated buyers would purchase (${purchaseCount}/${test.personaResults.length}). Industry benchmark is 60-70% for optimized stores.`
      )
    } else {
      brief.push(
        `${conversionRate}% conversion rate (${purchaseCount}/${test.personaResults.length} buyers) is ${conversionRate < 60 ? "below" : "at"} industry standard—there's still room to capture more revenue.`
      )
    }

    // Bullet 3: Funnel drop-off
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

    // Bullet 4: Most common abandonment point
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

    // Bullet 5: Top next step (from top recommendation or threat)
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
        `Top next step: Fix "${topThreat.title.toLowerCase()}"—this ${topThreat.severity} threat could recover ${formatRecoveryRange(topThreat.impactRange.min, topThreat.impactRange.max)}/month.`
      )
    } else {
      brief.push(
        `Top next step: Review the Recovery Plan below to prioritize fixes by impact and effort.`
      )
    }

    return brief.slice(0, 5) // Ensure max 5 bullets
  }

  // Build store snapshot data (with error handling)
  let storeSnapshot
  try {
    storeSnapshot = buildStoreSnapshot(
      test,
      shopifyMetrics,
      shopifyStore?.shop || test.storeUrl || "unknown-store.myshopify.com",
      shopifyStore?.shop?.split(".")[0] || "Your Store"
    )
  } catch (error) {
    console.error("Failed to build store snapshot:", error)
    // Use minimal fallback data
    storeSnapshot = {
      storeUrl: test.storeUrl || "unknown-store.myshopify.com",
      storeName: "Your Store",
      lastScanAt: test.date || new Date().toISOString(),
      metrics: {
        monthlyVisitors: 50000,
        monthlyOrders: 1250,
        conversionRate: 0.025,
        averageOrderValue: 85,
        monthlyRevenue: 106250,
      },
      funnel: {
        visitors: test.funnelData?.landed || 1000,
        addedToCart: test.funnelData?.cart || 500,
        reachedCheckout: test.funnelData?.checkout || 300,
        purchased: test.funnelData?.purchased || 25,
      },
      benchmarks: {
        categoryName: "E-commerce",
        avgConversionRate: 0.023,
        topPerformerCR: 0.042,
      },
      opportunity: {
        currentMonthlyRevenue: 106250,
        potentialMonthlyRevenue: 120000,
        monthlyGap: 13750,
        annualGap: 165000,
      },
    }
  }

  // Map threat to recovery plan fix (by matching title keywords)
  const scrollToFix = (threatTitle: string) => {
    // Scroll to recovery plan section first
    if (recoveryPlanRef.current) {
      const offset = 120
      const elementPosition = recoveryPlanRef.current.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: "smooth" })
      
      // After a short delay, try to highlight the relevant row
      setTimeout(() => {
        const tableRows = recoveryPlanRef.current?.querySelectorAll("tbody tr")
        if (tableRows) {
          // Simple keyword matching to find relevant fix
          const threatKeywords = threatTitle.toLowerCase().split(" ")
          for (const row of Array.from(tableRows)) {
            const fixText = row.textContent?.toLowerCase() || ""
            if (threatKeywords.some((keyword) => fixText.includes(keyword))) {
              row.scrollIntoView({ behavior: "smooth", block: "center" })
              // Temporary highlight
              row.classList.add("bg-primary/5")
              setTimeout(() => row.classList.remove("bg-primary/5"), 2000)
              break
            }
          }
        }
      }, 500)
    }
  }

  const purchaseRate = Math.round((test.funnelData.purchased / test.funnelData.landed) * 100)
  // purchaseCount and abandonCount are already defined above (line 1057-1058)

  // Recovery Plan data (from recommendations)
  const recoveryPlan = test.recommendations
    .sort((a, b) => a.priority - b.priority)
    .map((rec) => {
      // Calculate estimated recovery from impact string or derive from revenue leak
      const impactMatch = rec.impact.match(/\$?([\d,]+)/)
      let recoveryAmount = impactMatch ? parseInt(impactMatch[1].replace(/,/g, "")) : 0

      // If no dollar amount found, estimate based on impact description and effort
      if (recoveryAmount === 0) {
        const impactMultiplier =
          rec.impact.toLowerCase().includes("critical") ? 0.3 :
          rec.impact.toLowerCase().includes("high") ? 0.2 :
          rec.impact.toLowerCase().includes("medium") ? 0.1 : 0.05
        recoveryAmount = Math.round(revenueLeak.monthly * impactMultiplier)
      }

      // Extract percentage if available
      const percentMatch = rec.impact.match(/(\d+(?:\.\d+)?)%/)
      const impactPercent = percentMatch ? parseFloat(percentMatch[1]) : null

      const confidence = calculateConfidence(rec)

      return {
        ...rec,
        recovery: recoveryAmount,
        impactPercent,
        confidence,
      }
    })

  const handleOpenFixModal = (rec: Recommendation) => {
    setSelectedFix(rec)
    setIsFixModalOpen(true)
  }

  // Build simulation data for Ghost Summary
  // purchaseCount and abandonCount are already defined above (line 1057-1058)
  
  // Extract top reasons from persona results
  const reasonCounts = new Map<string, number>()
  test.personaResults.forEach((p) => {
    if (p.reason) {
      const reason = p.reason
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
    }
  })
  const topReasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  // Find primary drop-off point
  const dropOffPoints = test.personaResults
    .filter((p) => p.abandonPoint)
    .map((p) => p.abandonPoint!)
  const dropOffCounts = new Map<string, number>()
  dropOffPoints.forEach((point) => {
    dropOffCounts.set(point, (dropOffCounts.get(point) || 0) + 1)
  })
  const primaryDropOffPoint = Array.from(dropOffCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0]

  // Build threats with impact data
  const threatsWithImpact = allThreats.map((threat) => ({
    id: threat.id,
    title: threat.title,
    severity: threat.severity,
    location: threat.location,
    estimatedRecoveryMin: threat.impactRange?.min,
    estimatedRecoveryMax: threat.impactRange?.max,
    effort: recoveryPlan.find((r) => {
      // Try to match threat to recovery plan item
      const threatTitleLower = threat.title.toLowerCase()
      const recTitleLower = r.title.toLowerCase()
      return (
        threatTitleLower.includes(recTitleLower.split(" ")[0]) ||
        recTitleLower.includes(threatTitleLower.split(" ")[0])
      )
    })?.effort || "medium",
  }))

  // Build Ghost Summary input (with safety checks and error handling)
  let ghostSummaryInput
  try {
    ghostSummaryInput = {
      snapshot: {
        metrics: storeSnapshot.metrics,
        funnel: storeSnapshot.funnel,
        benchmarks: storeSnapshot.benchmarks,
        opportunity: storeSnapshot.opportunity,
      },
      analysis: {
        ghostScore: test.score || 0,
        threats: threatsWithImpact.length > 0 ? threatsWithImpact : [
          {
            id: "default",
            title: "No threats identified",
            severity: "medium" as const,
            location: "Unknown",
            estimatedRecoveryMin: 0,
            estimatedRecoveryMax: 0,
            effort: "medium" as const,
          }
        ],
      },
      simulation: {
        totalBuyers: test.personaResults.length || 0,
        wouldPurchase: purchaseCount || 0,
        wouldAbandon: abandonCount || 0,
        primaryDropOffPoint: primaryDropOffPoint || undefined,
        topReasons: topReasons.length > 0 ? topReasons : undefined,
      },
    }
  } catch (error) {
    console.error("Failed to build Ghost Summary input:", error)
    // Skip Ghost Summary if there's an error
    ghostSummaryInput = null
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Sticky Subnav */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-center gap-2 overflow-x-auto py-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-lime-50 text-lime-600 border border-lime-200 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {section.label}
          </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 bg-gray-50 min-h-screen">
      {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link
              href="/ghost/history"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to History
            </Link>
            <h1 className="text-3xl font-semibold font-heading mb-1">{test.url.replace("https://", "")}</h1>
        <p className="text-sm text-muted-foreground">
          {new Date(test.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </p>
      </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-xl">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-scan
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
        </div>
      </div>

        {/* SECTION 1: Revenue Leak Hero */}
        <section
          id="overview"
          ref={(el) => (sectionRefs.current.overview = el)}
          data-section-id="overview"
          className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("overview") ? "visible" : ""} ${isHighlighted ? "animate-highlight-flash" : ""}`}
        >
          {/* Store Snapshot - Baseline Context */}
          <ErrorBoundary>
            <div className="mb-10">
              <StoreSnapshot {...storeSnapshot} />
            </div>
          </ErrorBoundary>

          {/* Ghost Summary - Dynamic Executive Brief */}
          <ErrorBoundary>
            {ghostSummaryInput ? (
              <div className="mb-10">
                <GhostSummary {...ghostSummaryInput} />
              </div>
            ) : (
              <div className="mb-10 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">Ghost Summary unavailable. Check console for errors.</p>
              </div>
            )}
          </ErrorBoundary>

          <div className="bg-gradient-to-br from-orange-50 via-orange-50/50 to-amber-50 border border-orange-200 rounded-[16px] shadow-sm p-10 mb-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-orange-100 border border-orange-200 rounded-xl">
                <TrendingDown className="h-6 w-6 text-orange-600" strokeWidth={2.5} />
            </div>
              <div>
                <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Revenue Opportunity</h2>
                <p className="text-sm text-gray-600">Potential monthly recovery by reaching category average</p>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-[16px] p-8 shadow-sm card-hover-lift">
              <RevenueOpportunityDisplay
                min={revenueOpportunity.monthlyOpportunity.min}
                max={revenueOpportunity.monthlyOpportunity.max}
                methodology={getMethodologyText(
                  revenueOpportunity.benchmarkGap / 100, // Convert back to decimal
                  currentConversionRate,
                  categoryBenchmarkCR
                )}
                label="Monthly Opportunity"
                size="lg"
              />
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Current Revenue</div>
                  <div className="text-2xl font-heading font-bold text-gray-900">
                    ${Math.round(revenueOpportunity.currentMonthlyRevenue).toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Potential Revenue</div>
                  <div className="text-2xl font-heading font-bold text-lime-600">
                    ${Math.round(revenueOpportunity.potentialMonthlyRevenue).toLocaleString()}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Score & Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 bg-white border border-gray-200 rounded-[16px] shadow-sm p-8 text-center card-hover-lift">
              <div className="text-xs font-medium tracking-wide text-gray-500 mb-3">Ghost Score</div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className={`text-6xl font-heading font-bold leading-none ${getScoreColor(test.score)}`}>
                  <AnimatedCounter value={test.score} duration={1500} />
              </div>
                {test.previousScore && (
                  <div className="mt-2">
                    <Sparkline data={[test.previousScore, test.previousScore + (test.score - test.previousScore) * 0.3, test.previousScore + (test.score - test.previousScore) * 0.7, test.score]} color={test.score >= test.previousScore ? "lime" : "orange"} />
            </div>
          )}
              </div>
              <div className="text-sm text-gray-500">/100</div>
              {test.change && (
                <div className={`text-sm font-medium mt-4 ${test.change >= 0 ? "text-lime-600" : "text-orange-600"}`}>
                  {test.change >= 0 ? "+" : ""}{test.change} vs previous
            </div>
          )}
            </div>
            <div className="lg:col-span-3 grid grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift">
                <div className="text-xs font-medium tracking-wide text-gray-500 mb-2">Would Purchase</div>
                <div className="text-3xl font-heading font-bold text-lime-600">{purchaseRate}%</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift">
                <div className="text-xs font-medium tracking-wide text-gray-500 mb-2">Purchased</div>
                <div className="text-3xl font-heading font-bold text-lime-600">{purchaseCount}</div>
            </div>
              <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift">
                <div className="text-xs font-medium tracking-wide text-gray-500 mb-2">Abandoned</div>
                <div className="text-3xl font-heading font-bold text-orange-600">{abandonCount}</div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Active Friction Threats */}
        <section
          id="threats"
          ref={(el) => (sectionRefs.current.threats = el)}
          data-section-id="threats"
          className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("threats") ? "visible" : ""}`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl">
                <AlertTriangle className="h-5 w-5 text-lime-600" strokeWidth={2.5} />
              </div>
            <div>
                <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Active Friction Threats</h2>
                <p className="text-sm text-gray-600">
                  {allThreats.length} threat{allThreats.length !== 1 ? "s" : ""} identified
                </p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayedThreats.length > 0 ? (
              displayedThreats.map((threat, index) => (
                <ThreatCard
                  key={threat.id}
                  issue={threat}
                  severity={threat.severity}
                  impactRange={threat.impactRange}
                  confidence={threat.confidence}
                  methodology={threat.methodology}
                  index={index}
                  onViewFix={() => scrollToFix(threat.title)}
                />
              ))
            ) : (
              <div className="col-span-3 bg-white border border-gray-200 rounded-[16px] p-12 text-center text-gray-400">
                No threats identified
            </div>
          )}
              </div>
          {allThreats.length > 3 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setShowAllThreats(!showAllThreats)}
                className="rounded-xl"
              >
                {showAllThreats ? (
                  <>
                    Show Less
                    <ChevronUp className="h-4 w-4 ml-2" strokeWidth={2.5} />
                  </>
                ) : (
                  <>
                    View All {allThreats.length} Threats
                    <ChevronDown className="h-4 w-4 ml-2" strokeWidth={2.5} />
                  </>
                )}
              </Button>
            </div>
          )}
        </section>


        {/* SECTION 4: Recovery Plan Table */}
        <section
          id="recovery"
          ref={(el) => {
            sectionRefs.current.recovery = el
            recoveryPlanRef.current = el
          }}
          data-section-id="recovery"
          className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("recovery") ? "visible" : ""}`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl">
              <Target className="h-5 w-5 text-lime-600" strokeWidth={2.5} />
            </div>
          <div>
              <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Recovery Plan</h2>
              <p className="text-sm text-gray-600">Prioritized fixes with estimated recovery</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-medium tracking-wide p-5 text-gray-600">Priority</th>
                    <th className="text-left text-xs font-medium tracking-wide p-5 text-gray-600">Fix</th>
                    <th className="text-left text-xs font-medium tracking-wide p-5 text-gray-600">Impact</th>
                    <th className="text-left text-xs font-medium tracking-wide p-5 text-gray-600">Effort</th>
                    <th className="text-left text-xs font-medium tracking-wide p-5 text-gray-600">Confidence</th>
                    <th className="text-left text-xs font-medium tracking-wide p-5 text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recoveryPlan.map((rec) => {
                    const RecIcon = getRecommendationIcon(rec)
                    return (
                      <tr
                        key={rec.priority}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-lime-50 border border-lime-200 flex items-center justify-center text-sm font-heading font-bold text-lime-600">
                              {rec.priority}
        </div>
                            <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                              <RecIcon className="h-4 w-4 text-gray-600" strokeWidth={2} />
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-medium text-sm mb-1 font-heading text-gray-900">{rec.title}</div>
                          <div className="text-xs text-gray-600 line-clamp-1 leading-relaxed">{rec.description}</div>
                        </td>
                      <td className="p-5">
                        {rec.recovery > 0 ? (
                          <div className="text-base font-heading font-bold text-lime-600">
                            $<AnimatedCounter value={rec.recovery} />/mo
                          </div>
                        ) : rec.impactPercent ? (
                          <div className="text-base font-heading font-bold text-lime-600">
                            +{rec.impactPercent}%
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">{rec.impact}</div>
                        )}
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                            rec.effort === "low"
                              ? "bg-lime-50 text-lime-600 border-lime-200"
                              : rec.effort === "medium"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-orange-50 text-orange-600 border-orange-200"
                          }`}
                        >
                          {rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)}
                        </span>
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                            rec.confidence === "High"
                              ? "bg-lime-50 text-lime-600 border-lime-200"
                              : rec.confidence === "Medium"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : "bg-orange-50 text-orange-600 border-orange-200"
                          }`}
                        >
                          {rec.confidence}
                        </span>
                      </td>
                      <td className="p-5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenFixModal(rec)}
                          className="text-xs h-7 text-lime-600 hover:text-lime-700 hover:bg-lime-50 rounded-xl"
                        >
                          How to implement
                          <ArrowRight className="h-3 w-3 ml-1" strokeWidth={2.5} />
                        </Button>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fix Implementation Modal */}
          <FixImplementationModal
            recommendation={selectedFix}
            isOpen={isFixModalOpen}
            onClose={() => {
              setIsFixModalOpen(false)
              setSelectedFix(null)
            }}
          />
        </section>

        {/* SECTION 5: Live Buyer Simulation */}
        <section
          id="ghosts"
          ref={(el) => (sectionRefs.current.ghosts = el)}
          data-section-id="ghosts"
          className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("ghosts") ? "visible" : ""}`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl">
              <Users className="h-5 w-5 text-lime-600" strokeWidth={2.5} />
        </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Live Buyer Simulation</h2>
              <p className="text-sm text-gray-600">Real-time shopper behavior analysis</p>
            </div>
          </div>

          {/* Summary Bar */}
          <div className="bg-card/50 border border-border/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
        <div>
                  <div className="text-sm font-semibold font-heading mb-1">
                {purchaseCount} of {test.personaResults.length} would purchase
            </div>
                  <div className="text-xs text-muted-foreground/70">
                    {Math.round((purchaseCount / test.personaResults.length) * 100)}% conversion rate
          </div>
                </div>
                {/* Segmented Indicator */}
                <div className="flex gap-1">
                  {test.personaResults.map((persona, index) => (
                    <div
                      key={persona.id}
                      className={`w-3 h-3 rounded-full border ${
                        persona.verdict === "purchase"
                          ? "bg-primary border-primary/30"
                          : "bg-destructive/30 border-destructive/30"
                      }`}
                      title={`${persona.name}: ${persona.verdict === "purchase" ? "Would Buy" : "Would Abandon"}`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground/70 mb-1">Abandonment Rate</div>
                <div className="text-lg font-heading font-bold text-destructive">
                  {Math.round((abandonCount / test.personaResults.length) * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Persona Cards + Transcript Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Persona Cards Grid */}
            <div className={`space-y-3 ${selectedPersona ? "lg:col-span-2" : "lg:col-span-3"}`}>
            {test.personaResults.map((persona) => (
                <PersonaCard
                  key={persona.id}
                  persona={persona}
                  isSelected={selectedPersona?.id === persona.id}
                  onClick={() => setSelectedPersona(selectedPersona?.id === persona.id ? null : persona)}
                />
            ))}
          </div>

            {/* Ghost Transcript Panel */}
            {selectedPersona && (
              <div className="lg:col-span-1">
                <GhostTranscriptPanel
                  persona={selectedPersona}
                  onClose={() => setSelectedPersona(null)}
                />
        </div>
      )}
          </div>
        </section>

        {/* SECTION 6: Supporting Analytics */}
        <section
          id="analytics"
          ref={(el) => (sectionRefs.current.analytics = el)}
          data-section-id="analytics"
          className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("analytics") ? "visible" : ""}`}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-lime-50 border border-lime-200 rounded-xl">
              <BarChart3 className="h-5 w-5 text-lime-600" strokeWidth={2.5} />
        </div>
        <div>
              <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Analytics</h2>
              <p className="text-sm text-gray-600">Conversion funnel and performance metrics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funnel Chart */}
            <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8">
              <h3 className="text-xs font-medium tracking-wide text-gray-500 mb-6 font-heading">Conversion Funnel</h3>
              {/* Mini funnel bars */}
              <div className="space-y-3 mb-6">
                <MiniFunnelBar value={test.funnelData.landed} max={test.funnelData.landed} label="Landed" color="lime" />
                <MiniFunnelBar value={test.funnelData.cart} max={test.funnelData.landed} label="Cart" color="lime" />
                <MiniFunnelBar value={test.funnelData.checkout} max={test.funnelData.landed} label="Checkout" color="lime" />
                <MiniFunnelBar value={test.funnelData.purchased} max={test.funnelData.landed} label="Purchased" color="lime" />
              </div>
              {/* Vertical bars */}
              <div className="flex items-end justify-between gap-3 h-48">
                {Object.entries(test.funnelData).map(([stage, count], index) => {
                  const height = (count / test.funnelData.landed) * 100
                  const prevCount = index > 0 ? Object.values(test.funnelData)[index - 1] : count
                  const dropoff = Math.round(((prevCount - count) / prevCount) * 100)
                  return (
                    <div key={stage} className="flex-1 flex flex-col items-center group">
                      <div className="w-full relative" style={{ height: `${height}%` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-lime-300 to-lime-100 border border-lime-200 rounded-t-[16px] transition-all duration-300 group-hover:from-lime-400 group-hover:to-lime-200" />
                      </div>
                      <div className="mt-4 text-center">
                        <div className="font-heading font-bold text-base mb-1 text-gray-900">{count}</div>
                        <div className="text-xs uppercase tracking-wide text-gray-500">{stage}</div>
                        {index > 0 && dropoff > 0 && (
                          <div className="text-xs text-orange-600 font-medium mt-1.5">-{dropoff}%</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
          </div>

            {/* Score Trend & Stats */}
            <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm p-8">
              <h3 className="text-xs font-medium tracking-wide text-gray-500 mb-6 font-heading">Performance Metrics</h3>
              <div className="space-y-4">
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="text-xs font-medium text-gray-500 mb-2">Conversion Rate</div>
                  <div className="text-4xl font-heading font-bold text-lime-600">{purchaseRate}%</div>
            </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 mb-2">Would Purchase</div>
                    <div className="text-2xl font-heading font-bold text-lime-600">{purchaseCount}</div>
                  </div>
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 mb-2">Would Abandon</div>
                    <div className="text-2xl font-heading font-bold text-orange-600">{abandonCount}</div>
                  </div>
                </div>
                {test.previousScore && (
                  <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="text-xs font-medium text-gray-500 mb-2">Score Change</div>
                    <div
                      className={`text-2xl font-heading font-bold ${test.change && test.change >= 0 ? "text-lime-600" : "text-orange-600"}`}
                    >
                      {test.change && test.change >= 0 ? "+" : ""}{test.change || 0} points
          </div>
        </div>
      )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

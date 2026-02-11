"use client"

import { useState } from "react"
import {
  ArrowRight,
  Target,
  Info,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  TestTube,
  Copy,
  CheckCircle,
  type LucideIcon,
} from "lucide-react"
import type { Recommendation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getRecommendationIcon, generateImplementationDetails, calculateConfidence } from "./shared"
import { AnimatedCounter } from "./overview-section"

// ── Automation Step ───────────────────────────────────────────────

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
    edit: "bg-gray-50 text-gray-600 border-gray-200",
    add: "bg-blue-50 text-blue-600 border-blue-200",
    test: "bg-gray-50 text-gray-600 border-gray-200",
    publish: "bg-blue-50 text-blue-600 border-blue-200",
  }

  return (
    <div className="relative">
      {index < totalSteps - 1 && (
        <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-200" />
      )}
      <div className="relative flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
            <StepIcon className="h-4 w-4 text-gray-600" strokeWidth={2} />
          </div>
          <div className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
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

// ── Fix Implementation Modal ──────────────────────────────────────

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
              <Info className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
              Why this fix matters
            </h3>
            <ul className="space-y-2">
              {details.whyMatters.map((point, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Automation Runbook Steps */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold font-heading flex items-center gap-2 text-gray-900">
                <Target className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
                Automation Runbook
              </h3>
              <button
                onClick={() => {
                  const allSteps = details.steps.join("\n")
                  navigator.clipboard.writeText(allSteps)
                }}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1.5 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                Copy all steps
              </button>
            </div>
            <div className="space-y-2">
              {details.steps.map((stepText, index) => {
                const stepType = stepText.toLowerCase().includes("test") ? "test" :
                  stepText.toLowerCase().includes("view") || stepText.toLowerCase().includes("review") ? "view" :
                  stepText.toLowerCase().includes("edit") || stepText.toLowerCase().includes("change") ? "edit" :
                  stepText.toLowerCase().includes("add") || stepText.toLowerCase().includes("create") || stepText.toLowerCase().includes("enable") ? "add" :
                  stepText.toLowerCase().includes("deploy") || stepText.toLowerCase().includes("publish") ? "publish" : "view"

                const stepIcon = stepType === "test" ? TestTube :
                  stepType === "view" ? Eye :
                  stepType === "edit" ? Edit :
                  stepType === "add" ? Plus :
                  CheckCircle

                return (
                  <AutomationStep
                    key={index}
                    step={{ text: stepText, type: stepType, icon: stepIcon }}
                    index={index}
                    totalSteps={details.steps.length}
                    onCopy={(text) => handleCopyStep(text, index)}
                  />
                )
              })}
            </div>
            {copiedIndex !== null && (
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 animate-fade-in">
                <CheckCircle className="h-3.5 w-3.5" strokeWidth={2} />
                Step {copiedIndex + 1} copied to clipboard
              </div>
            )}
          </div>

          {/* What to Measure */}
          <div>
            <h3 className="text-sm font-semibold font-heading mb-3 flex items-center gap-2 text-gray-900">
              <TrendingUp className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
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
            <Clock className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
            <div>
              <div className="text-xs font-medium text-gray-500 mb-0.5">Estimated time</div>
              <div className="text-sm font-semibold font-heading text-gray-900">{details.timeEstimate}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs font-medium text-gray-500 mb-0.5">Confidence</div>
              <span
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                  confidence === "High"
                    ? "bg-blue-50 text-blue-600 border-blue-200"
                    : confidence === "Medium"
                      ? "bg-gray-50 text-gray-600 border-gray-200"
                      : "bg-gray-100 text-gray-500 border-gray-300"
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

// ── Recovery Section ──────────────────────────────────────────────

interface RecoveryPlanItem extends Recommendation {
  recovery: number
  impactPercent: number | null
  confidence: "High" | "Medium" | "Low"
}

interface RecoverySectionProps {
  recoveryPlan: RecoveryPlanItem[]
  selectedFix: Recommendation | null
  isFixModalOpen: boolean
  onOpenFixModal: (rec: Recommendation) => void
  onCloseFixModal: () => void
  visibleSections: Set<string>
  sectionRef: (el: HTMLDivElement | null) => void
}

export function RecoverySection({
  recoveryPlan,
  selectedFix,
  isFixModalOpen,
  onOpenFixModal,
  onCloseFixModal,
  visibleSections,
  sectionRef,
}: RecoverySectionProps) {
  return (
    <section
      id="recovery"
      ref={sectionRef}
      data-section-id="recovery"
      className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("recovery") ? "visible" : ""}`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Target className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold font-heading mb-1 text-gray-900">Recovery Plan</h2>
          <p className="text-sm text-gray-600">Prioritized fixes with estimated recovery</p>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-[16px] shadow-sm overflow-hidden backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
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
                        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-sm font-heading font-bold text-blue-600">
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
                        <div className="text-base font-heading font-bold text-blue-600">
                          $<AnimatedCounter value={rec.recovery} />/mo
                        </div>
                      ) : rec.impactPercent ? (
                        <div className="text-base font-heading font-bold text-blue-600">
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
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : rec.effort === "medium"
                              ? "bg-gray-50 text-gray-600 border-gray-200"
                              : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {rec.effort.charAt(0).toUpperCase() + rec.effort.slice(1)}
                      </span>
                    </td>
                    <td className="p-5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                          rec.confidence === "High"
                            ? "bg-blue-50 text-blue-600 border-blue-200"
                            : rec.confidence === "Medium"
                              ? "bg-gray-50 text-gray-600 border-gray-200"
                              : "bg-gray-100 text-gray-500 border-gray-300"
                        }`}
                      >
                        {rec.confidence}
                      </span>
                    </td>
                    <td className="p-5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenFixModal(rec)}
                        className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl"
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

      <FixImplementationModal
        recommendation={selectedFix}
        isOpen={isFixModalOpen}
        onClose={onCloseFixModal}
      />
    </section>
  )
}

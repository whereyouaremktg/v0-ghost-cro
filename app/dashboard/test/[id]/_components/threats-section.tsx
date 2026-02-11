"use client"

import {
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import type { TestResult } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { getSeverityColor, getSeverityLabel, getThreatIcon, generateGhostSees } from "./shared"
import type { ThreatWithImpact } from "./shared"

// ── Impact Bar ────────────────────────────────────────────────────

function ImpactBar({ severity }: { severity: "critical" | "high" | "medium" }) {
  const impactMap = { critical: 100, high: 65, medium: 35 }
  const percentage = impactMap[severity]
  const colorClass =
    severity === "critical" ? "bg-red-500" : severity === "high" ? "bg-gray-500" : "bg-gray-400"

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

// ── Threat Card ───────────────────────────────────────────────────

function ThreatCard({
  issue,
  severity,
  estimatedImpact,
  index,
  onViewFix,
}: {
  issue: TestResult["frictionPoints"]["critical"][0]
  severity: "critical" | "high" | "medium"
  estimatedImpact: number
  index: number
  onViewFix: () => void
}) {
  const ghostSees = generateGhostSees(issue, severity)
  const ThreatIcon = getThreatIcon(issue)

  return (
    <div className="group bg-white border border-gray-200 rounded-[16px] shadow-sm p-6 card-hover-lift backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-sm font-heading font-bold text-blue-600">
            {index + 1}
          </div>
          <div className="p-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <ThreatIcon className="h-4 w-4 text-gray-600" strokeWidth={2} />
          </div>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${getSeverityColor(severity)}`}>
            {getSeverityLabel(severity)}
          </span>
        </div>
        {estimatedImpact > 0 && (
          <div className="text-right">
            <div className="text-[10px] text-gray-500 mb-0.5">Est. Impact</div>
            <div className="text-base font-heading font-bold text-red-600">
              ${estimatedImpact.toLocaleString()}
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
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-700">Where:</span> {issue.location}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewFix}
          className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl button-glow"
        >
          View Fix
          <ArrowRight className="h-3 w-3 ml-1" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  )
}

// ── Threats Section ───────────────────────────────────────────────

interface ThreatsSectionProps {
  allThreats: ThreatWithImpact[]
  showAllThreats: boolean
  onToggleShowAll: () => void
  onViewFix: (threatTitle: string) => void
  visibleSections: Set<string>
  sectionRef: React.Ref<HTMLDivElement>
}

export function ThreatsSection({
  allThreats,
  showAllThreats,
  onToggleShowAll,
  onViewFix,
  visibleSections,
  sectionRef,
}: ThreatsSectionProps) {
  const displayedThreats = showAllThreats ? allThreats : allThreats.slice(0, 3)

  return (
    <section
      id="threats"
      ref={sectionRef}
      data-section-id="threats"
      className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("threats") ? "visible" : ""}`}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
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
              estimatedImpact={threat.estimatedImpact}
              index={index}
              onViewFix={() => onViewFix(threat.title)}
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
            onClick={onToggleShowAll}
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
  )
}

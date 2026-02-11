"use client"

import { useState } from "react"
import {
  Users,
  Smartphone,
  Monitor,
  MessageSquare,
  ArrowRight,
  Info,
  Truck,
  CreditCard,
  ShieldCheck,
  FileText,
  Star,
} from "lucide-react"
import type { TestResult } from "@/lib/types"
import { extractDevice, generateBulletSummary } from "./shared"

// ── Persona Card ──────────────────────────────────────────────────

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
    return Users
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
      className={`w-full text-left bg-white border rounded-[16px] p-4 transition-all duration-300 relative backdrop-blur-xl ${
        isSelected
          ? "border-blue-300 bg-blue-50 shadow-md"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
      style={{background: isSelected ? "rgba(239, 246, 255, 0.8)" : "rgba(255, 255, 255, 0.95)"}}
    >
      {isPulsing && (
        <div className="absolute inset-0 rounded-[16px] border-2 border-blue-400 animate-pulse-ring pointer-events-none" />
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
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-blue-50 text-blue-600 border-blue-200"
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

// ── Ghost Transcript Panel ────────────────────────────────────────

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
    <div className="bg-white border border-gray-200 rounded-[16px] p-6 h-full flex flex-col animate-slide-in-right backdrop-blur-xl" style={{background: "rgba(255, 255, 255, 0.95)"}}>
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
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-blue-50 text-blue-600 border-blue-200"
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
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Ghosts Section ────────────────────────────────────────────────

interface GhostsSectionProps {
  test: TestResult
  purchaseCount: number
  abandonCount: number
  selectedPersona: TestResult["personaResults"][0] | null
  onSelectPersona: (persona: TestResult["personaResults"][0] | null) => void
  visibleSections: Set<string>
  sectionRef: React.Ref<HTMLDivElement>
}

export function GhostsSection({
  test,
  purchaseCount,
  abandonCount,
  selectedPersona,
  onSelectPersona,
  visibleSections,
  sectionRef,
}: GhostsSectionProps) {
  return (
    <section
      id="ghosts"
      ref={sectionRef}
      data-section-id="ghosts"
      className={`mb-20 scroll-mt-24 section-scroll-in ${visibleSections.has("ghosts") ? "visible" : ""}`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <Users className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
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
            <div className="flex gap-1">
              {test.personaResults.map((persona) => (
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
        <div className={`space-y-3 ${selectedPersona ? "lg:col-span-2" : "lg:col-span-3"}`}>
          {test.personaResults.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isSelected={selectedPersona?.id === persona.id}
              onClick={() => onSelectPersona(selectedPersona?.id === persona.id ? null : persona)}
            />
          ))}
        </div>

        {selectedPersona && (
          <div className="lg:col-span-1">
            <GhostTranscriptPanel
              persona={selectedPersona}
              onClose={() => onSelectPersona(null)}
            />
          </div>
        )}
      </div>
    </section>
  )
}

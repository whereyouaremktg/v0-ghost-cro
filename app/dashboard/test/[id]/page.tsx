"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Share2, Loader2 } from "lucide-react"
import type { TestResult, Recommendation } from "@/lib/types"
import { getTestResult } from "@/lib/client-storage"
import { calculateRevenueLeak } from "@/lib/ghostEngine"
import { Button } from "@/components/ui/button"
import { calculateThreatImpact, calculateConfidence, generateExecutiveBrief, type ThreatWithImpact } from "./_components/shared"
import { OverviewSection } from "./_components/overview-section"
import { ThreatsSection } from "./_components/threats-section"
import { RecoverySection } from "./_components/recovery-section"
import { GhostsSection } from "./_components/ghosts-section"
import { AnalyticsSection } from "./_components/analytics-section"

const sections = [
  { id: "overview", label: "Overview" },
  { id: "threats", label: "Threats" },
  { id: "recovery", label: "Recovery Plan" },
  { id: "ghosts", label: "Personas" },
  { id: "analytics", label: "Analytics" },
]

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
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const recoveryPlanRef = useRef<HTMLDivElement | null>(null)
  const overviewRef = useRef<HTMLDivElement | null>(null)
  const threatsRef = useRef<HTMLDivElement | null>(null)

  const setSectionRef = useCallback((sectionId: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el
  }, [])

  // Load test data
  useEffect(() => {
    async function loadTest() {
      try {
        const { id } = await params
        const result = getTestResult(id)

        if (!result) {
          throw new Error("Test not found")
        }

        setTest(result)
        setIsHighlighted(true)
        setTimeout(() => setIsHighlighted(false), 1000)
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

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [test])

  // Sync individual refs with sectionRefs object
  useEffect(() => {
    sectionRefs.current.overview = overviewRef.current
    sectionRefs.current.threats = threatsRef.current
  })

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
      const offset = 120
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
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || "Test not found"}</p>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Link>
        </div>
      </div>
    )
  }

  // ── Data Calculations ──────────────────────────────────────────

  const rawRevenueLeak = calculateRevenueLeak(test, {
    averageOrderValue: 85,
    monthlySessions: 50000,
  })
  const revenueLeak = {
    monthly: rawRevenueLeak?.monthly || 0,
    weekly: rawRevenueLeak?.weekly || 0,
    daily: rawRevenueLeak?.daily || 0,
  }

  const allThreats: ThreatWithImpact[] = [
    ...test.frictionPoints.critical.map((fp) => ({ ...fp, severity: "critical" as const })),
    ...test.frictionPoints.high.map((fp) => ({ ...fp, severity: "high" as const })),
    ...test.frictionPoints.medium.map((fp) => ({ ...fp, severity: "medium" as const })),
  ].map((threat) => {
    const estimatedImpact = calculateThreatImpact(threat.impact, threat.severity, revenueLeak.monthly)
    return { ...threat, estimatedImpact }
  })

  allThreats.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return b.estimatedImpact - a.estimatedImpact
  })

  const executiveBrief = generateExecutiveBrief(test, allThreats, revenueLeak)

  const scrollToFix = (threatTitle: string) => {
    if (recoveryPlanRef.current) {
      const offset = 120
      const elementPosition = recoveryPlanRef.current.offsetTop - offset
      window.scrollTo({ top: elementPosition, behavior: "smooth" })

      setTimeout(() => {
        const tableRows = recoveryPlanRef.current?.querySelectorAll("tbody tr")
        if (tableRows) {
          const threatKeywords = threatTitle.toLowerCase().split(" ")
          for (const row of Array.from(tableRows)) {
            const fixText = row.textContent?.toLowerCase() || ""
            if (threatKeywords.some((keyword) => fixText.includes(keyword))) {
              row.scrollIntoView({ behavior: "smooth", block: "center" })
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
  const purchaseCount = test.personaResults.filter((p) => p.verdict === "purchase").length
  const abandonCount = test.personaResults.filter((p) => p.verdict === "abandon").length

  const recoveryPlan = test.recommendations
    .sort((a, b) => a.priority - b.priority)
    .map((rec) => {
      const impactMatch = rec.impact.match(/\$?([\d,]+)/)
      let recoveryAmount = impactMatch ? parseInt(impactMatch[1].replace(/,/g, "")) : 0

      if (recoveryAmount === 0) {
        const impactMultiplier =
          rec.impact.toLowerCase().includes("critical") ? 0.3 :
          rec.impact.toLowerCase().includes("high") ? 0.2 :
          rec.impact.toLowerCase().includes("medium") ? 0.1 : 0.05
        recoveryAmount = Math.round(revenueLeak.monthly * impactMultiplier)
      }

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

  // ── Render ─────────────────────────────────────────────────────

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
                    ? "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
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
              href="/dashboard/history"
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

        <OverviewSection
          test={test}
          revenueLeak={revenueLeak}
          allThreatsCount={allThreats.length}
          purchaseRate={purchaseRate}
          purchaseCount={purchaseCount}
          abandonCount={abandonCount}
          executiveBrief={executiveBrief}
          isHighlighted={isHighlighted}
          visibleSections={visibleSections}
          sectionRef={overviewRef}
        />

        <ThreatsSection
          allThreats={allThreats}
          showAllThreats={showAllThreats}
          onToggleShowAll={() => setShowAllThreats(!showAllThreats)}
          onViewFix={scrollToFix}
          visibleSections={visibleSections}
          sectionRef={threatsRef}
        />

        <RecoverySection
          recoveryPlan={recoveryPlan}
          selectedFix={selectedFix}
          isFixModalOpen={isFixModalOpen}
          onOpenFixModal={handleOpenFixModal}
          onCloseFixModal={() => {
            setIsFixModalOpen(false)
            setSelectedFix(null)
          }}
          visibleSections={visibleSections}
          sectionRef={(el: HTMLDivElement | null) => {
            setSectionRef("recovery")(el)
            recoveryPlanRef.current = el
          }}
        />

        <GhostsSection
          test={test}
          purchaseCount={purchaseCount}
          abandonCount={abandonCount}
          selectedPersona={selectedPersona}
          onSelectPersona={setSelectedPersona}
          visibleSections={visibleSections}
          sectionRef={setSectionRef("ghosts")}
        />

        <AnalyticsSection
          test={test}
          purchaseRate={purchaseRate}
          purchaseCount={purchaseCount}
          abandonCount={abandonCount}
          visibleSections={visibleSections}
          sectionRef={setSectionRef("analytics")}
        />
      </div>
    </div>
  )
}

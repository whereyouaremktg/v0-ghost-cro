"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Ghost,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Activity,
  ShieldAlert,
  CreditCard,
  Smartphone,
  Monitor,
  TrendingUp,
  Eye,
  Loader2,
  Play,
  Store,
  Scan,
  Target,
  DollarSign,
  Users,
  ChevronRight,
  FileText,
  Search,
  BarChart3,
  Clock
} from "lucide-react"
import { saveTestResult, getTestResult, getAllTestResults } from "@/lib/client-storage"
import { calculateRevenueOpportunity, formatOpportunityRange } from "@/lib/calculations/revenue-opportunity"
import type { TestResult } from "@/lib/types"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { MerchantSummary } from "@/components/dashboard/merchant-summary"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CodeDiffViewer } from "@/components/dashboard/sandbox/code-diff-viewer"
import { Button } from "@/components/ui/button"

// ============================================
// TYPES
// ============================================

interface ShopifyStore {
  shop: string
  accessToken: string
  connectedAt: string
}

interface AnalysisEvent {
  id: string
  timestamp: Date
  category: "behavior" | "technical" | "heuristic" | "revenue"
  title: string
  description: string
  impact?: "high" | "medium" | "low"
  revenueRisk?: string
  persona?: string
}

interface DiscoveredProduct {
  title: string
  handle: string
  image: string | null
  price: string | null
  url: string
}

interface GhostOSProps {
  user: {
    id: string
    email: string
    name: string
  }
  stats: {
    currentScore: number
    previousScore: number
    testsThisMonth: number
    testsRemaining: number
    testsLimit: number
    plan: string
  }
  tests: any[]
  latestTestResult?: TestResult | null
}

// ============================================
// PERSONA DEFINITIONS (Agency Style)
// ============================================

const PERSONA_SEGMENTS = [
  { id: "budget", name: "Price Sensitive", role: "Budget Shopper", device: "Mobile", icon: Smartphone, color: "text-blue-400" },
  { id: "impulse", name: "High Intent", role: "Impulse Buyer", device: "Mobile", icon: Zap, color: "text-amber-400" },
  { id: "skeptic", name: "Low Trust", role: "Researcher", device: "Desktop", icon: Search, color: "text-rose-400" },
  { id: "busy", name: "Time Poor", role: "Professional", device: "Mobile", icon: Clock, color: "text-purple-400" },
  { id: "first", name: "New Traffic", role: "First Visitor", device: "Desktop", icon: Users, color: "text-emerald-400" },
]

// ============================================
// MAIN COMPONENT
// ============================================

export function GhostOS({ user, stats, tests, latestTestResult }: GhostOSProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State
  const [shopifyStore, setShopifyStore] = useState<ShopifyStore | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [analysisFeed, setAnalysisFeed] = useState<AnalysisEvent[]>([])
  const [discoveredProduct, setDiscoveredProduct] = useState<DiscoveredProduct | null>(null)
  const [currentResult, setCurrentResult] = useState<TestResult | null>(latestTestResult || null)
  const [activeSegment, setActiveSegment] = useState<string | null>(null)
  const [selectedFix, setSelectedFix] = useState<any | null>(null)
  const [showFixModal, setShowFixModal] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [viewMode, setViewMode] = useState<'scanner' | 'dashboard'>(
    latestTestResult ? 'dashboard' : 'scanner'
  )
  const [displayMode, setDisplayMode] = useState<'merchant' | 'agency'>('merchant')

  // Refs
  const feedContainerRef = useRef<HTMLDivElement>(null)
  const hasAutoRun = useRef(false)

  // Add analysis event
  const addEvent = useCallback((entry: Omit<AnalysisEvent, "id" | "timestamp">) => {
    setAnalysisFeed(prev => [
      ...prev,
      {
        ...entry,
        id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(),
      },
    ])
  }, [])

  // Auto-scroll feed
  useEffect(() => {
    if (feedContainerRef.current) {
      feedContainerRef.current.scrollTop = feedContainerRef.current.scrollHeight
    }
  }, [analysisFeed])

  const isDemoUser = user.email.toLowerCase().includes("demo")

  // Run auto-discovery and analysis
  const runFullSimulation = useCallback(async (store: ShopifyStore) => {
    if (isRunning) return

    setIsRunning(true)
    setAnalysisFeed([])
    setSimulationProgress(0)

    // PHASE 1: Technical Audit
    addEvent({
      category: "technical",
      title: "Initiating Technical Audit",
      description: `Scanning ${store.shop} for performance & security baselines...`
    })
    setSimulationProgress(10)

    try {
      // Product Discovery
      const discoverResponse = await fetch("/api/shopify/auto-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop: store.shop, accessToken: store.accessToken }),
      })

      if (!discoverResponse.ok) throw new Error("Auto-discovery failed")

      const discoverData = await discoverResponse.json()
      const targetUrl = discoverData.productUrl || discoverData.storeUrl
      const productTitle = discoverData.product?.title || "Store Homepage"

      setDiscoveredProduct({
        title: productTitle,
        handle: discoverData.product?.handle || "",
        image: discoverData.product?.image || null,
        price: discoverData.product?.price || null,
        url: targetUrl,
      })

      addEvent({
        category: "technical",
        title: "Target Identified",
        description: `Analyzing High-Traffic URL: ${targetUrl}`
      })
      setSimulationProgress(25)

      // PHASE 2: Behavioral Simulation (Theatrical)
      if (isDemoUser) {
        await new Promise(r => setTimeout(r, 400))

        for (let i = 0; i < PERSONA_SEGMENTS.length; i++) {
          await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
          const segment = PERSONA_SEGMENTS[i]
          setActiveSegment(segment.id)

          // Varied events based on segment
          if (segment.id === 'budget') {
            addEvent({
              category: "behavior",
              title: "Friction Detected: Shipping Cost",
              description: "Mobile user abandoned cart due to unexpected shipping fees.",
              impact: "high",
              revenueRisk: "$3,200/mo",
              persona: segment.name
            })
          } else if (segment.id === 'impulse') {
             addEvent({
              category: "behavior",
              title: "Payment Gateway Latency",
              description: "Express checkout (Shop Pay) not visible above fold.",
              impact: "medium",
              persona: segment.name
            })
          } else {
            addEvent({
              category: "heuristic",
              title: `Simulating Session: ${segment.role}`,
              description: `analyzing ${segment.device} viewport interactions...`,
              persona: segment.name
            })
          }
          setSimulationProgress(25 + ((i + 1) / PERSONA_SEGMENTS.length) * 40)
        }
      }

      // PHASE 3: Synthesis
      addEvent({
        category: "revenue",
        title: "Synthesizing Revenue Data",
        description: "Calculating annualized revenue leakage against benchmarks..."
      })

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, personaMix: "balanced" }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Analysis failed")
      }

      const { result } = await response.json()

      // Save result
      saveTestResult(result)
      setCurrentResult(result)

      addEvent({
        category: "revenue",
        title: "Audit Complete",
        description: `Final Score: ${result.score}/100. Generated ${result.recommendations.length} prioritized fixes.`,
        impact: "high"
      })

      setSimulationProgress(100)
      setActiveSegment(null)

    } catch (error) {
      console.error("Simulation failed:", error)
      addEvent({
        category: "technical",
        title: "Audit Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        impact: "high"
      })
    } finally {
      setIsRunning(false)
      setViewMode('dashboard')
    }
  }, [isRunning, addEvent, isDemoUser])

  // Initialize
  useEffect(() => {
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        const store = JSON.parse(stored)
        setShopifyStore(store)

        const autoParam = searchParams.get("auto")
        if (autoParam === "true" && !hasAutoRun.current) {
          hasAutoRun.current = true
          window.history.replaceState(null, "", "/ghost")
          setTimeout(() => runFullSimulation(store), 500)
        }

        const allResults = getAllTestResults()
        if (allResults.length > 0 && !currentResult) {
          setCurrentResult(allResults[0])
        }
      } catch (error) {
        console.error("Failed to parse shopify store:", error)
      }
    }
    setIsConnecting(false)
  }, [searchParams, runFullSimulation, currentResult])

  const revenueOpportunity = currentResult ? calculateRevenueOpportunity({
    monthlyVisitors: 50000,
    currentConversionRate: 0.025,
    aov: 85,
    categoryBenchmarkCR: 0.028,
  }) : null

  // Loading/Connect States
  if (isConnecting) return <div className="h-screen flex items-center justify-center bg-[#020202] text-white"><Loader2 className="w-8 h-8 animate-spin text-[#0070F3]" /></div>

  if (!shopifyStore) {
    return (
      <div className="h-screen flex items-center justify-center p-6 bg-[#020202] text-white">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/20 flex items-center justify-center">
            <Store className="w-8 h-8 text-[#0070F3]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connect Storefront</h1>
          <p className="text-zinc-500 mb-8">Grant read-only access to begin the audit.</p>
          <a href="/api/auth/shopify" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0070F3] hover:bg-[#0070F3]/90 text-white rounded-xl font-medium transition-all">
            Connect Shopify <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    )
  }

  // Dashboard Mode (Post-Scan)
  if (!isRunning && viewMode === 'dashboard') {
    if (displayMode === 'merchant' && currentResult) {
      return (
        <div className="h-screen flex flex-col bg-[#020202]">
           {/* Agency/Merchant Toggle Header */}
          <header className="flex-shrink-0 h-16 border-b border-white/5 bg-[#0A0A0A] flex items-center justify-between px-6">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                  <Ghost className="w-5 h-5 text-[#0070F3]" />
                </div>
                <span className="font-bold text-white tracking-tight">Ghost Intelligence</span>
             </div>
             <div className="flex bg-white/5 p-1 rounded-lg border border-white/5">
                <button onClick={() => setDisplayMode('merchant')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${displayMode === 'merchant' ? 'bg-[#0070F3] text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Merchant View</button>
                <button onClick={() => setDisplayMode('agency')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${displayMode === 'agency' ? 'bg-[#0070F3] text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}>Agency View</button>
             </div>
          </header>

          <div className="flex-1 overflow-hidden">
            <MerchantSummary
              result={currentResult}
              onViewFix={(fix) => { setSelectedFix(fix); setShowFixModal(true); }}
            />
          </div>

          {/* Fix Modal */}
          <Dialog open={showFixModal} onOpenChange={setShowFixModal}>
            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#0070F3]" />
                  {selectedFix?.title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400">{selectedFix?.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                {selectedFix?.codeFix ? (
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between">
                       <span className="text-xs font-mono text-zinc-400">{selectedFix.codeFix.targetFile}</span>
                       <span className="text-[10px] uppercase font-bold text-[#0070F3] bg-[#0070F3]/10 px-2 py-0.5 rounded">Liquid</span>
                    </div>
                    <CodeDiffViewer
                      originalCode={selectedFix.codeFix.originalCode}
                      optimizedCode={selectedFix.codeFix.optimizedCode}
                      targetFile={selectedFix.codeFix.targetFile}
                      language={selectedFix.codeFix.type}
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                     <h4 className="text-sm font-semibold text-white mb-2">Implementation Strategy</h4>
                     <p className="text-sm text-zinc-400">Manual implementation required for this fix type.</p>
                  </div>
                )}
                <Button className="w-full bg-[#0070F3] hover:bg-[#0070F3]/90 text-white font-medium" onClick={() => setShowFixModal(false)}>
                   Deploy Fix to Sandbox
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )
    }
    // Agency View
    return (
      <div className="h-screen flex flex-col bg-[#F9FAFB]">
        <header className="flex-shrink-0 h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
           <div className="flex items-center gap-2 text-zinc-900">
              <Ghost className="w-5 h-5" />
              <span className="font-bold tracking-tight">Ghost CRO</span>
              <span className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-[10px] text-zinc-500 font-medium uppercase tracking-wider">Agency Mode</span>
           </div>
           <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
              <button onClick={() => setDisplayMode('merchant')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${displayMode === 'merchant' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'}`}>Merchant View</button>
              <button onClick={() => setDisplayMode('agency')} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${displayMode === 'agency' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-zinc-500 hover:text-zinc-900'}`}>Agency View</button>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <DashboardContent user={user} stats={stats} tests={tests} latestTestResult={currentResult || latestTestResult} />
        </div>
      </div>
    )
  }

  // ============================================
  // SCANNER VIEW (THE "WAR ROOM")
  // ============================================
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#020202] text-white font-sans">
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#0070F3]/10 rounded-lg border border-[#0070F3]/20">
               <Activity className="w-5 h-5 text-[#0070F3]" />
            </div>
            <div>
               <h1 className="text-sm font-bold leading-none">Live Audit</h1>
               <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">{shopifyStore.shop}</div>
            </div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-zinc-700"}`} />
                {isRunning ? "Engine Active" : "Standby"}
             </div>
          </div>
        </div>

        <button
          onClick={() => runFullSimulation(shopifyStore)}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0070F3] hover:bg-[#0070F3]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wide rounded-lg transition-all"
        >
          {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {isRunning ? "Audit in Progress..." : "Start New Audit"}
        </button>
      </header>

      {/* Main Grid */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Intelligence Feed */}
        <aside className="w-[30%] border-r border-white/5 bg-[#050505] flex flex-col">
          <div className="p-4 border-b border-white/5 bg-[#0A0A0A]">
             <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Intelligence Feed</h2>
             <p className="text-[10px] text-zinc-600">Real-time heuristic analysis events</p>
          </div>

          <div ref={feedContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
             {analysisFeed.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-700 opacity-50">
                   <Scan className="w-12 h-12 mb-4 stroke-1" />
                   <p className="text-sm">Ready to initialize audit sequence</p>
                </div>
             ) : (
                analysisFeed.map((event) => (
                   <div key={event.id} className={`p-3 rounded-lg border animate-in slide-in-from-left-2 duration-300 ${
                      event.impact === 'high'
                        ? "bg-red-500/5 border-red-500/20"
                        : "bg-white/5 border-white/5"
                   }`}>
                      <div className="flex justify-between items-start mb-1">
                         <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            event.category === 'revenue' ? "bg-emerald-500/20 text-emerald-400" :
                            event.category === 'behavior' ? "bg-purple-500/20 text-purple-400" :
                            "bg-blue-500/20 text-blue-400"
                         }`}>
                            {event.category}
                         </span>
                         <span className="text-[10px] text-zinc-600 font-mono">
                            {event.timestamp.toLocaleTimeString([], {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}
                         </span>
                      </div>
                      <h3 className="text-sm font-medium text-zinc-200 mb-0.5">{event.title}</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">{event.description}</p>
                      {event.revenueRisk && (
                         <div className="mt-2 flex items-center gap-2 text-xs font-medium text-red-400">
                            <ShieldAlert className="w-3 h-3" />
                            Revenue Risk: {event.revenueRisk}
                         </div>
                      )}
                   </div>
                ))
             )}
          </div>
        </aside>

        {/* CENTER: Live Session View */}
        <main className="w-[45%] bg-[#020202] relative flex flex-col">
           {/* Session Info Bar */}
           <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0A0A0A]">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Monitor className="w-3 h-3" />
                    <span>Viewport: 390x844 (Mobile)</span>
                 </div>
                 <div className="h-3 w-px bg-white/10" />
                 <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Activity className="w-3 h-3" />
                    <span>Network: 4G LTE</span>
                 </div>
              </div>
              {activeSegment && (
                 <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-wide">REC</span>
                 </div>
              )}
           </div>

           {/* Viewport Content */}
           <div className="flex-1 p-8 flex items-center justify-center relative overflow-hidden">
              {/* Background Grid */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {discoveredProduct ? (
                 <div className="relative w-[320px] h-[600px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border-8 border-[#1a1a1a]">
                    {/* Mock Store Content */}
                    <div className="h-full w-full bg-[#f5f5f5] relative flex flex-col">
                       {/* Header */}
                       <div className="h-12 bg-white border-b flex items-center justify-center font-bold text-xs text-black">
                          {shopifyStore.shop}
                       </div>

                       {/* Product Hero */}
                       <div className="h-64 bg-gray-200 relative">
                          {discoveredProduct.image && (
                             <img src={discoveredProduct.image} className="w-full h-full object-cover" />
                          )}
                          {/* Heatmap Overlay Mockup */}
                          {isRunning && (
                             <div className="absolute inset-0 bg-gradient-to-t from-red-500/20 to-transparent opacity-50 animate-pulse" />
                          )}
                       </div>

                       {/* Product Details */}
                       <div className="p-4 space-y-3">
                          <div className="h-4 w-3/4 bg-gray-300 rounded" />
                          <div className="h-3 w-1/2 bg-gray-200 rounded" />
                          <div className="mt-4 h-10 w-full bg-black rounded flex items-center justify-center text-white text-xs font-bold">
                             ADD TO CART
                          </div>

                          {/* Threat Overlay */}
                          {activeSegment === 'budget' && (
                             <div className="absolute top-1/2 left-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-xl text-xs z-10 animate-in zoom-in-95 duration-200">
                                <div className="font-bold flex items-center gap-1 mb-1">
                                   <AlertTriangle className="w-3 h-3 fill-white" />
                                   Friction Detected
                                </div>
                                User abandoned: Shipping cost not visible pre-checkout.
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                       <Scan className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-500 text-sm">Target acquisition pending...</p>
                 </div>
              )}
           </div>

           {/* Timeline / Progress */}
           <div className="h-16 border-t border-white/5 bg-[#050505] px-6 flex items-center gap-4">
               <div className="text-xs font-mono text-zinc-500 w-12 text-right">00:0{Math.floor(simulationProgress / 10)}</div>
               <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                     className="h-full bg-[#0070F3] transition-all duration-300 ease-linear"
                     style={{ width: `${simulationProgress}%` }}
                  />
               </div>
               <div className="text-xs font-mono text-zinc-500 w-12">00:10</div>
           </div>
        </main>

        {/* RIGHT: Findings & Segments */}
        <aside className="w-[25%] border-l border-white/5 bg-[#050505] flex flex-col">
           {/* Segments Header */}
           <div className="p-4 border-b border-white/5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Active Segments</h2>
              <div className="space-y-2">
                 {PERSONA_SEGMENTS.map((seg) => (
                    <div key={seg.id} className={`flex items-center gap-3 p-2 rounded-lg transition-all ${activeSegment === seg.id ? "bg-white/10 opacity-100" : "opacity-40"}`}>
                       <seg.icon className={`w-4 h-4 ${seg.color}`} />
                       <div>
                          <div className="text-xs font-bold text-zinc-200">{seg.role}</div>
                          <div className="text-[10px] text-zinc-500">{seg.device}</div>
                       </div>
                       {activeSegment === seg.id && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0070F3] shadow-[0_0_8px_#0070F3]" />
                       )}
                    </div>
                 ))}
              </div>
           </div>

           {/* Live Metrics */}
           <div className="flex-1 p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Session Metrics</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-1">Load Time</div>
                    <div className="text-lg font-mono font-bold text-white">0.8s</div>
                 </div>
                 <div className="p-3 bg-[#0A0A0A] rounded-lg border border-white/5">
                    <div className="text-[10px] text-zinc-500 mb-1">Layout Shift</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">0.01</div>
                 </div>
              </div>

              {/* Value Estimator */}
              {revenueOpportunity && (
                 <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                       <TrendingUp className="w-4 h-4 text-emerald-400" />
                       <span className="text-xs font-bold text-white uppercase">Est. Opportunity</span>
                    </div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                       {formatOpportunityRange(revenueOpportunity.monthlyOpportunity.min, revenueOpportunity.monthlyOpportunity.max)}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">Monthly recoverable revenue</div>
                 </div>
              )}
           </div>
        </aside>

      </div>
    </div>
  )
}

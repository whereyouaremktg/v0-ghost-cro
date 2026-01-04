"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  Ghost, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  Activity,
  Shield,
  CreditCard,
  Truck,
  Clock,
  TrendingUp,
  Eye,
  Loader2,
  Play,
  Store,
  Scan,
  Target,
  DollarSign,
  Users,
  ChevronRight
} from "lucide-react"
import { saveTestResult, getTestResult, getAllTestResults } from "@/lib/client-storage"
import { calculateRevenueOpportunity, formatOpportunityRange } from "@/lib/calculations/revenue-opportunity"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils/format"
import type { TestResult } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ============================================
// TYPES
// ============================================

interface ShopifyStore {
  shop: string
  accessToken: string
  connectedAt: string
}

interface GhostLogEntry {
  id: string
  timestamp: Date
  type: "ghost" | "scan" | "threat" | "success" | "info" | "action"
  persona?: string
  message: string
  detail?: string
  severity?: "critical" | "high" | "medium"
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
// GHOST PERSONAS
// ============================================

const GHOST_PERSONAS = [
  { id: "budget", name: "Budget Parent", emoji: "👨‍👩‍👧", color: "#60a5fa" },
  { id: "impulse", name: "Impulse Buyer", emoji: "⚡", color: "#fbbf24" },
  { id: "skeptic", name: "Skeptic Researcher", emoji: "🔍", color: "#f87171" },
  { id: "busy", name: "Busy Professional", emoji: "💼", color: "#a78bfa" },
  { id: "first", name: "First-Time Visitor", emoji: "🆕", color: "#34d399" },
]

// ============================================
// SIMULATED LOGS FOR DEMO
// ============================================

const SIMULATED_LOGS: Omit<GhostLogEntry, "id" | "timestamp">[] = [
  { type: "info", message: "Ghost Mission Control initialized" },
  { type: "scan", message: "Deploying ghost squad to storefront..." },
  { type: "ghost", persona: "Budget Parent", message: "👨‍👩‍👧 Ghost #1 entered product page" },
  { type: "ghost", persona: "Impulse Buyer", message: "⚡ Ghost #2 scanning checkout flow" },
  { type: "scan", message: "Analyzing Liquid templates for friction..." },
  { type: "ghost", persona: "Skeptic Researcher", message: "🔍 Ghost #3 evaluating trust signals" },
  { type: "threat", message: "⚠️ Shipping costs hidden until checkout", severity: "critical" },
  { type: "ghost", persona: "Busy Professional", message: "💼 Ghost #4 testing mobile experience" },
  { type: "scan", message: "Measuring page load performance..." },
  { type: "threat", message: "Missing trust badges on product page", severity: "high" },
  { type: "ghost", persona: "First-Time Visitor", message: "🆕 Ghost #5 simulating new visitor flow" },
  { type: "scan", message: "Evaluating payment options..." },
  { type: "success", message: "✓ Multiple payment methods detected" },
  { type: "threat", message: "No free shipping threshold displayed", severity: "medium" },
  { type: "info", message: "Compiling threat assessment..." },
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
  const [ghostLogs, setGhostLogs] = useState<GhostLogEntry[]>([])
  const [discoveredProduct, setDiscoveredProduct] = useState<DiscoveredProduct | null>(null)
  const [currentResult, setCurrentResult] = useState<TestResult | null>(latestTestResult || null)
  const [activePersona, setActivePersona] = useState<string | null>(null)
  const [selectedFix, setSelectedFix] = useState<any | null>(null)
  const [showFixModal, setShowFixModal] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  
  // Refs
  const logContainerRef = useRef<HTMLDivElement>(null)
  const hasAutoRun = useRef(false)

  // Add log entry
  const addLog = useCallback((entry: Omit<GhostLogEntry, "id" | "timestamp">) => {
    setGhostLogs(prev => [
      ...prev,
      {
        ...entry,
        id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(),
      },
    ])
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [ghostLogs])

  // Run auto-discovery and analysis
  const runFullSimulation = useCallback(async (store: ShopifyStore) => {
    if (isRunning) return
    
    setIsRunning(true)
    setGhostLogs([])
    setSimulationProgress(0)
    
    // Initial logs
    addLog({ type: "info", message: "Ghost Mission Control initialized", detail: store.shop })
    await new Promise(r => setTimeout(r, 500))
    
    addLog({ type: "scan", message: "Auto-discovering primary product..." })
    setSimulationProgress(10)
    
    try {
      // Call auto-discover API
      const discoverResponse = await fetch("/api/shopify/auto-discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop: store.shop, accessToken: store.accessToken }),
      })
      
      if (!discoverResponse.ok) throw new Error("Auto-discovery failed")
      
      const discoverData = await discoverResponse.json()
      const targetUrl = discoverData.productUrl || discoverData.storeUrl
      
      setDiscoveredProduct({
        title: discoverData.product?.title || "Store Homepage",
        handle: discoverData.product?.handle || "",
        image: discoverData.product?.image || null,
        price: discoverData.product?.price || null,
        url: targetUrl,
      })
      
      addLog({ 
        type: "success", 
        message: `Product discovered: ${discoverData.product?.title || "Homepage"}`,
        detail: targetUrl
      })
      setSimulationProgress(20)
      
      await new Promise(r => setTimeout(r, 400))
      addLog({ type: "scan", message: "Deploying ghost squad to storefront..." })
      
      // Deploy ghosts with staggered logs
      for (let i = 0; i < GHOST_PERSONAS.length; i++) {
        await new Promise(r => setTimeout(r, 300 + Math.random() * 200))
        const persona = GHOST_PERSONAS[i]
        setActivePersona(persona.id)
        addLog({
          type: "ghost",
          persona: persona.name,
          message: `${persona.emoji} Ghost #${i + 1} (${persona.name}) entering storefront`,
        })
        setSimulationProgress(20 + ((i + 1) / GHOST_PERSONAS.length) * 20)
      }
      
      await new Promise(r => setTimeout(r, 500))
      addLog({ type: "scan", message: "Scanning Liquid templates for shipping shock..." })
      setSimulationProgress(45)
      
      await new Promise(r => setTimeout(r, 400))
      addLog({ type: "scan", message: "Analyzing trust signals and social proof..." })
      setSimulationProgress(55)
      
      await new Promise(r => setTimeout(r, 400))
      addLog({ type: "scan", message: "Evaluating payment options and checkout friction..." })
      setSimulationProgress(65)
      
      // Run actual analysis
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
      setSimulationProgress(80)
      
      // Log threats
      const criticalCount = result.frictionPoints?.critical?.length || 0
      const highCount = result.frictionPoints?.high?.length || 0
      
      await new Promise(r => setTimeout(r, 400))
      
      if (criticalCount > 0) {
        addLog({
          type: "threat",
          message: `🚨 ${criticalCount} CRITICAL threat${criticalCount > 1 ? "s" : ""} detected`,
          detail: result.frictionPoints.critical[0]?.title,
          severity: "critical",
        })
      }
      
      if (highCount > 0) {
        await new Promise(r => setTimeout(r, 300))
        addLog({
          type: "threat",
          message: `⚠️ ${highCount} high-priority issue${highCount > 1 ? "s" : ""} found`,
          severity: "high",
        })
      }
      
      // Log verdicts
      const purchaseCount = result.personaResults?.filter((p: any) => p.verdict === "purchase").length || 0
      const abandonCount = result.personaResults?.filter((p: any) => p.verdict === "abandon").length || 0
      
      await new Promise(r => setTimeout(r, 500))
      addLog({
        type: "info",
        message: `Ghost verdict: ${purchaseCount}/5 would purchase, ${abandonCount}/5 would abandon`,
      })
      
      setSimulationProgress(90)
      
      // Save result
      saveTestResult(result)
      setCurrentResult(result)
      
      await new Promise(r => setTimeout(r, 400))
      addLog({
        type: "success",
        message: `✅ Ghost Score: ${result.score}/100`,
        detail: `${result.issuesFound || 0} friction points identified`,
      })
      
      setSimulationProgress(100)
      setActivePersona(null)
      
    } catch (error) {
      console.error("Simulation failed:", error)
      addLog({
        type: "threat",
        message: `Mission aborted: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsRunning(false)
    }
  }, [isRunning, addLog])

  // Initialize on mount
  useEffect(() => {
    const stored = localStorage.getItem("shopifyStore")
    if (stored) {
      try {
        const store = JSON.parse(stored)
        setShopifyStore(store)
        
        // Check for auto-trigger from OAuth
        const autoParam = searchParams.get("auto")
        if (autoParam === "true" && !hasAutoRun.current) {
          hasAutoRun.current = true
          window.history.replaceState(null, "", "/ghost")
          setTimeout(() => runFullSimulation(store), 500)
        }
        
        // Load latest result if available
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

  // Calculate revenue metrics
  const revenueOpportunity = currentResult ? calculateRevenueOpportunity({
    monthlyVisitors: 50000,
    currentConversionRate: 0.025,
    aov: 85,
    categoryBenchmarkCR: 0.028,
  }) : null

  // Get all threats from current result
  const allThreats = currentResult ? [
    ...currentResult.frictionPoints.critical.map(fp => ({ ...fp, severity: "critical" as const })),
    ...currentResult.frictionPoints.high.map(fp => ({ ...fp, severity: "high" as const })),
    ...currentResult.frictionPoints.medium.map(fp => ({ ...fp, severity: "medium" as const })),
  ] : []

  // Connect Shopify Gate
  if (isConnecting) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#bef264]/30 border-t-[#bef264] animate-spin" />
          <p className="text-[#737373] text-sm">Initializing Ghost OS...</p>
        </div>
      </div>
    )
  }

  if (!shopifyStore) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="ghost-glass rounded-2xl p-8 text-center ghost-glow">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#bef264]/10 border border-[#bef264]/20 flex items-center justify-center">
              <Ghost className="w-8 h-8 text-[#bef264]" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Connect Your Store</h1>
            <p className="text-[#737373] mb-8">
              Ghost needs access to your Shopify store to run the simulation.
            </p>
            <a
              href="/api/auth/shopify"
              className="ghost-fix-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
            >
              <Store className="w-5 h-5" />
              Connect Shopify
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex-shrink-0 h-14 border-b border-white/5 ghost-glass-strong flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Ghost className="w-6 h-6 text-[#bef264]" />
            <span className="font-semibold tracking-tight">Ghost OS</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-sm text-[#737373]">
            <Store className="w-4 h-4" />
            <span>{shopifyStore.shop}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#bef264]/10 border border-[#bef264]/20">
              <div className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
              <span className="text-xs font-medium text-[#bef264]">SCANNING</span>
            </div>
          )}
          <button
            onClick={() => runFullSimulation(shopifyStore)}
            disabled={isRunning}
            className="ghost-fix-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? "Running..." : "Run Simulation"}
          </button>
        </div>
      </header>

      {/* Main Three-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* PANE 1: Ghost Stream (Left - 25%) */}
        <aside className="w-[25%] border-r border-white/5 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#bef264]" />
                Ghost Stream
              </h2>
              <span className="text-[10px] text-[#737373] ghost-mono">
                {ghostLogs.length} events
              </span>
            </div>
            
            {/* Ghost Avatars */}
            <div className="flex items-center gap-1">
              {GHOST_PERSONAS.map((persona) => (
                <div
                  key={persona.id}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                    activePersona === persona.id
                      ? "ring-2 ring-[#bef264] ring-offset-2 ring-offset-[#050505] scale-110"
                      : "opacity-40"
                  }`}
                  style={{ backgroundColor: `${persona.color}20` }}
                  title={persona.name}
                >
                  {persona.emoji}
                </div>
              ))}
            </div>
          </div>
          
          {/* Log Entries */}
          <div
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-xs backdrop-blur-xl"
          >
            {ghostLogs.length === 0 ? (
              <div className="text-center text-[#525252] py-8">
                <Ghost className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p>Waiting for mission start...</p>
              </div>
            ) : (
              ghostLogs.map((log) => (
                <div
                  key={log.id}
                  className={`ghost-stream-entry ghost-log-enter p-2 rounded-lg ${
                    log.type === "threat" 
                      ? "bg-[#f87171]/10 border-l-[#f87171]" 
                      : log.type === "success"
                        ? "bg-[#4ade80]/10 border-l-[#4ade80]"
                        : ""
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[#525252] flex-shrink-0">
                      [{log.timestamp.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]
                    </span>
                    <span className={`flex-1 ${
                      log.type === "threat" ? "text-[#f87171]" :
                      log.type === "success" ? "text-[#4ade80]" :
                      log.type === "ghost" ? "text-[#bef264]" :
                      "text-[#e5e5e5]"
                    }`}>
                      {log.message}
                    </span>
                  </div>
                  {log.detail && (
                    <p className="text-[#525252] mt-1 ml-[72px] truncate">{log.detail}</p>
                  )}
                </div>
              ))
            )}
            
            {/* Typing indicator */}
            {isRunning && (
              <div className="flex items-center gap-2 text-[#525252] p-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* PANE 2: Simulation Deck (Center - 50%) */}
        <main className="w-[50%] flex flex-col overflow-hidden">
          {/* Status Bar */}
          <div className="flex-shrink-0 p-4 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  isRunning 
                    ? "bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20" 
                    : currentResult
                      ? "bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20"
                      : "bg-white/5 text-[#737373]"
                }`}>
                  {isRunning ? "SIMULATION IN PROGRESS" : currentResult ? "SCAN COMPLETE" : "READY"}
                </div>
                {isRunning && (
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-[#bef264] rounded-full transition-all duration-300"
                        style={{ width: `${simulationProgress}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#737373] ghost-mono">{simulationProgress}%</span>
                  </div>
                )}
              </div>
              {currentResult && (
                <div className="text-sm text-[#737373]">
                  Last scan: {new Date(currentResult.date).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Viewport */}
          <div className="flex-1 p-4 overflow-y-auto">
            {!currentResult && !isRunning ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#bef264]/5 border border-[#bef264]/10 flex items-center justify-center ghost-breathe">
                    <Scan className="w-10 h-10 text-[#bef264]/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Scan Data</h3>
                  <p className="text-[#737373] mb-6">
                    Run a simulation to see Ghost analyze your checkout flow in real-time.
                  </p>
                  <button
                    onClick={() => runFullSimulation(shopifyStore)}
                    className="ghost-fix-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
                  >
                    <Play className="w-5 h-5" />
                    Start First Scan
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Product Preview with HUD */}
                {discoveredProduct && (
                  <div className="ghost-viewport mb-6 relative">
                    <div className="ghost-glass rounded-xl p-4">
                      <div className="flex items-start gap-4">
                        {discoveredProduct.image ? (
                          <img 
                            src={discoveredProduct.image} 
                            alt={discoveredProduct.title}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-white/5 rounded-lg flex items-center justify-center">
                            <Store className="w-8 h-8 text-[#525252]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{discoveredProduct.title}</h3>
                          {discoveredProduct.price && (
                            <p className="text-[#bef264] ghost-mono text-lg">${discoveredProduct.price}</p>
                          )}
                          <a 
                            href={discoveredProduct.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#737373] hover:text-[#bef264] flex items-center gap-1 mt-1"
                          >
                            View on store <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {currentResult && (
                          <div className="text-right">
                            <div className="text-xs text-[#737373] mb-1">Ghost Score</div>
                            <div className={`text-3xl font-bold ghost-mono ${
                              currentResult.score >= 70 ? "text-[#4ade80]" :
                              currentResult.score >= 50 ? "text-[#fbbf24]" :
                              "text-[#f87171]"
                            }`}>
                              {currentResult.score}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* HUD Overlay corners */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-[#bef264]/50 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-[#bef264]/50 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-[#bef264]/50 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#bef264]/50 rounded-br-xl" />
                  </div>
                )}

                {/* Persona Grid */}
                {currentResult && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#bef264]" />
                      Ghost Verdicts
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                      {currentResult.personaResults.map((result, i) => {
                        const persona = GHOST_PERSONAS[i] || { emoji: "👤", color: "#737373" }
                        return (
                          <div 
                            key={result.id}
                            className={`ghost-glass rounded-lg p-3 text-center ghost-card-hover cursor-pointer ${
                              result.verdict === "abandon" ? "border-[#f87171]/30" : "border-[#4ade80]/30"
                            }`}
                            title={result.reasoning}
                          >
                            <div className="text-2xl mb-1">{persona.emoji}</div>
                            <div className={`text-xs font-medium ${
                              result.verdict === "abandon" ? "text-[#f87171]" : "text-[#4ade80]"
                            }`}>
                              {result.verdict === "abandon" ? "ABANDON" : "PURCHASE"}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Threat Cards */}
                {allThreats.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-[#f87171]" />
                      Active Threats ({allThreats.length})
                    </h3>
                    <div className="space-y-2">
                      {allThreats.slice(0, 5).map((threat, i) => (
                        <div 
                          key={threat.id}
                          className={`ghost-glass rounded-lg p-4 ghost-card-hover border-l-2 ${
                            threat.severity === "critical" ? "border-l-[#f87171]" :
                            threat.severity === "high" ? "border-l-[#fbbf24]" :
                            "border-l-[#737373]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                  threat.severity === "critical" ? "bg-[#f87171]/20 text-[#f87171]" :
                                  threat.severity === "high" ? "bg-[#fbbf24]/20 text-[#fbbf24]" :
                                  "bg-white/10 text-[#737373]"
                                }`}>
                                  {threat.severity.toUpperCase()}
                                </span>
                                <span className="text-xs text-[#525252]">{threat.location}</span>
                              </div>
                              <h4 className="font-medium">{threat.title}</h4>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedFix(threat)
                                setShowFixModal(true)
                              }}
                              className="ghost-fix-btn px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              View Fix
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* PANE 3: Recovery Queue (Right - 25%) */}
        <aside className="w-[25%] border-l border-white/5 flex flex-col overflow-hidden">
          {/* Revenue Leak Hero */}
          <div className="flex-shrink-0 p-4 border-b border-white/5">
            <div className="ghost-glass-strong rounded-xl p-4 ghost-glow-danger">
              <div className="text-xs text-[#737373] mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                MONTHLY OPPORTUNITY
              </div>
              <div className="ghost-mono text-3xl font-bold text-[#f87171] ghost-counter">
                {revenueOpportunity 
                  ? formatOpportunityRange(revenueOpportunity.monthlyOpportunity.min, revenueOpportunity.monthlyOpportunity.max)
                  : "—"
                }
              </div>
              <div className="text-xs text-[#525252] mt-1">
                Recoverable revenue at benchmark CR
              </div>
            </div>
          </div>

          {/* Prioritized Fixes */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#bef264]" />
              Recovery Queue
            </h3>
            
            {currentResult?.recommendations && currentResult.recommendations.length > 0 ? (
              <div className="space-y-3">
                {currentResult.recommendations.slice(0, 5).map((rec, i) => (
                  <div 
                    key={i}
                    className="ghost-glass rounded-xl p-4 ghost-card-hover"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="w-6 h-6 rounded-lg bg-[#bef264]/10 text-[#bef264] flex items-center justify-center text-xs font-bold">
                        {rec.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        rec.effort === "low" ? "bg-[#4ade80]/20 text-[#4ade80]" :
                        rec.effort === "medium" ? "bg-[#fbbf24]/20 text-[#fbbf24]" :
                        "bg-[#f87171]/20 text-[#f87171]"
                      }`}>
                        {rec.effort.toUpperCase()} EFFORT
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{rec.title}</h4>
                    <p className="text-xs text-[#737373] line-clamp-2">{rec.description}</p>
                    <button
                      onClick={() => {
                        setSelectedFix(rec)
                        setShowFixModal(true)
                      }}
                      className="ghost-fix-btn w-full mt-3 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                    >
                      Deploy Fix to Theme
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-[#525252] py-8">
                <Target className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Run a scan to see prioritized fixes</p>
              </div>
            )}
          </div>

          {/* Stats Footer */}
          <div className="flex-shrink-0 p-4 border-t border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <div className="ghost-glass rounded-lg p-3">
                <div className="text-xs text-[#525252] mb-1">Scans Used</div>
                <div className="font-semibold ghost-mono">
                  {stats.testsThisMonth}/{stats.testsLimit}
                </div>
              </div>
              <div className="ghost-glass rounded-lg p-3">
                <div className="text-xs text-[#525252] mb-1">Plan</div>
                <div className="font-semibold capitalize">{stats.plan}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Fix Modal */}
      <Dialog open={showFixModal} onOpenChange={setShowFixModal}>
        <DialogContent className="bg-[#0d1117] border-white/10 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedFix?.title}</DialogTitle>
            <DialogDescription className="text-[#737373]">
              {selectedFix?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {/* Fix Details */}
            <div className="ghost-glass rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#bef264]" />
                Implementation Steps
              </h4>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-[#bef264]">1.</span>
                  <span>Navigate to your Shopify theme editor</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#bef264]">2.</span>
                  <span>Locate the relevant Liquid template</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#bef264]">3.</span>
                  <span>Apply the suggested changes</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#bef264]">4.</span>
                  <span>Preview and publish changes</span>
                </div>
              </div>
            </div>

            {/* Impact Estimate */}
            <div className="ghost-glass rounded-lg p-4">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#4ade80]" />
                Expected Impact
              </h4>
              <p className="text-sm text-[#737373]">{selectedFix?.impact || "Improved conversion rate"}</p>
            </div>

            <button
              className="ghost-fix-btn w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2"
              onClick={() => setShowFixModal(false)}
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Applied
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

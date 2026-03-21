"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Palette,
  Scan,
  ShoppingCart,
  Zap,
} from "lucide-react"
import { format } from "date-fns"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { useLatestTest } from "@/hooks/use-latest-test"

type ToggleCard = {
  id: "analyzeTheme" | "analyzeCheckout" | "analyzeSpeed"
  icon: typeof Palette
  label: string
  description: string
}

const toggleCards: ToggleCard[] = [
  {
    id: "analyzeTheme",
    icon: Palette,
    label: "Analyze Theme",
    description: "Scan storefront UX friction and conversion blockers.",
  },
  {
    id: "analyzeCheckout",
    icon: ShoppingCart,
    label: "Analyze Checkout",
    description: "Evaluate checkout path with AI buyer personas.",
  },
  {
    id: "analyzeSpeed",
    icon: Zap,
    label: "Analyze Speed",
    description: "Check load performance and key experience metrics.",
  },
]

export default function ScannerPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const { test } = useLatestTest(userId)

  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeUrl, setStoreUrl] = useState("")
  const [scanConfig, setScanConfig] = useState({
    analyzeTheme: true,
    analyzeCheckout: true,
    analyzeSpeed: true,
  })

  const history = useMemo(() => {
    if (!test) return []

    return [
      {
        id: test.id,
        date: test.date ? format(new Date(test.date), "MMM d, yyyy") : "Unknown",
        score: test.score,
        duration: "~3m",
        status: "completed",
      },
    ]
  }, [test])

  const shouldShowSettingsLink =
    typeof error === "string" && /subscription|shopify store|connect/i.test(error)

  const handleTriggerScan = async () => {
    if (!userId) {
      setError("Please log in to run a scan")
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: scanConfig, ...(storeUrl.trim() ? { url: storeUrl.trim() } : {}) }),
      })

      const data = await response
        .json()
        .catch(() => ({ error: "Unexpected response from analyze API" }))

      if (!response.ok) {
        if (response.status === 402) {
          const message =
            data.message ||
            data.error ||
            "Complete setup required: connect your Shopify store in Settings and activate a billing plan before running scans."
          throw new Error(message)
        }

        if (response.status === 429) {
          const retryAfter = typeof data.retryAfter === "number" ? data.retryAfter : null
          throw new Error(
            retryAfter
              ? `Rate limit exceeded. Try again in ${retryAfter} seconds.`
              : "Rate limit exceeded. Please try again shortly.",
          )
        }

        if (response.status === 401) {
          throw new Error("Your session expired. Please refresh and sign in again.")
        }

        throw new Error(data.error || "Failed to start scan")
      }

      if (!data.jobId) {
        throw new Error("No job ID returned")
      }

      router.push(`/onboarding/scanning?testId=${data.jobId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scan")
      setIsScanning(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <GhostCard className="overflow-hidden border-[#1A1A1A] bg-[#0F0F0F]">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Run Ghost Scan</h2>
            <p className="mt-1 text-sm text-[#71717A]">
              AI-powered analysis of your storefront conversion funnel.
            </p>

            <input
              type="url"
              placeholder="Store URL (e.g. https://your-store.myshopify.com)"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              className="mt-3 w-full max-w-md rounded-lg border border-[#333] bg-[#111] px-3 py-2 text-sm text-white placeholder-[#555] focus:border-[#FBBF24] focus:outline-none"
            />

            {error && (
              <>
                <div className="mt-3 flex items-start gap-2 text-sm text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {shouldShowSettingsLink && (
                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Open{" "}
                    <Link
                      href="/dashboard/settings"
                      className="text-[#FBBF24] underline hover:text-[#F59E0B]"
                    >
                      Settings
                    </Link>{" "}
                    and complete Integrations + Billing first.
                  </p>
                )}
              </>
            )}
          </div>

          <GhostButton onClick={handleTriggerScan} disabled={isScanning} size="lg">
            {isScanning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Scan className="h-4 w-4" />
            )}
            {isScanning ? "Starting..." : "Trigger New Scan"}
          </GhostButton>
        </div>
      </GhostCard>

      <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Scan Configuration</h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {toggleCards.map((card) => {
            const enabled = scanConfig[card.id]
            const Icon = card.icon

            return (
              <button
                key={card.id}
                type="button"
                onClick={() =>
                  setScanConfig((prev) => ({
                    ...prev,
                    [card.id]: !prev[card.id],
                  }))
                }
                className="rounded-xl border p-4 text-left transition-all"
                style={{
                  backgroundColor: enabled ? "rgba(251, 191, 36, 0.06)" : "#111111",
                  borderColor: enabled ? "rgba(251, 191, 36, 0.3)" : "#1A1A1A",
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: enabled ? "rgba(251, 191, 36, 0.15)" : "#1A1A1A",
                    }}
                  >
                    <Icon className="h-4 w-4" color={enabled ? "#FBBF24" : "#71717A"} />
                  </div>
                  <span
                    className="inline-flex h-5 w-10 items-center rounded-full transition-colors"
                    style={{ backgroundColor: enabled ? "#FBBF24" : "#333333" }}
                  >
                    <span
                      className="h-4 w-4 rounded-full bg-white transition-all"
                      style={{ transform: enabled ? "translateX(20px)" : "translateX(2px)" }}
                    />
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">{card.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#71717A]">{card.description}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs text-[#71717A]">
          <Clock className="h-3.5 w-3.5" />
          Manual only
        </div>
      </div>

      <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Scan History</h3>

        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#6B7280]">
            No scans yet. Run your first scan to see history.
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((scan) => (
              <div
                key={scan.id}
                className="flex flex-col gap-3 rounded-xl border border-[#1A1A1A] bg-[#111111] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#FBBF24]/10 p-2">
                    <CheckCircle2 className="h-4 w-4 text-[#FBBF24]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{scan.date}</p>
                    <p className="text-xs text-[#6B7280]">
                      {scan.status} • {scan.duration}
                    </p>
                  </div>
                </div>

                <div className="text-sm font-semibold text-[#FBBF24]">Score {scan.score}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

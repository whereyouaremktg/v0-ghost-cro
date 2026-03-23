"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Lock, Loader2, ShoppingBag, Ghost, CheckCircle2 } from "lucide-react"

import { readFirstNDJSONLine } from "@/lib/utils/ndjson-reader"

/** Normalize input to shop domain: store.myshopify.com */
function normalizeShopInput(input: string): string | null {
  const trimmed = input.trim().toLowerCase()
  if (!trimmed) return null

  const host =
    trimmed.replace(/^https?:\/\//, "").replace(/\/.*$/, "").split("/")[0] || ""
  if (!host) return null

  if (host.endsWith(".myshopify.com")) return host
  if (host.includes(".")) return null

  return `${host}.myshopify.com`
}

export default function ConnectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-[#FBBF24]" />
        </div>
      }
    >
      <ConnectPageContent />
    </Suspense>
  )
}

function ConnectPageContent() {
  const searchParams = useSearchParams()
  const [storeInput, setStoreInput] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [configError, setConfigError] = useState<string | null>(null)
  const [storeConnected, setStoreConnected] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const hasTriggeredScan = useRef(false)

  useEffect(() => {
    if (searchParams.get("error") === "shopify_not_configured") {
      setConfigError(
        "Shopify OAuth is not configured. Add SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET to your environment variables.",
      )
    }
  }, [searchParams])

  // After OAuth callback, auto-trigger the first scan
  useEffect(() => {
    if (searchParams.get("store_connected") !== "1") return
    if (hasTriggeredScan.current) return
    hasTriggeredScan.current = true

    setStoreConnected(true)

    const triggerFirstScan = async () => {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })

        if (!response.ok) {
          // Scan trigger failed (billing, auth, etc.) — go to dashboard instead
          window.location.href = "/dashboard"
          return
        }

        const data = await readFirstNDJSONLine<{ jobId?: string }>(response)

        if (data.jobId) {
          window.location.href = `/onboarding/scanning?testId=${data.jobId}`
        } else {
          window.location.href = "/dashboard"
        }
      } catch {
        // If anything fails, fall back to dashboard
        window.location.href = "/dashboard"
      }
    }

    triggerFirstScan()
  }, [searchParams])

  const normalizedShop = normalizeShopInput(storeInput)

  const handleConnect = () => {
    setValidationError(null)

    if (!normalizedShop) {
      setValidationError("Enter your store name or a valid .myshopify.com URL")
      return
    }

    window.location.href = `/api/auth/shopify/initiate?shop=${encodeURIComponent(normalizedShop)}`
  }

  // Show a transitional state after store is connected
  if (storeConnected) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-[460px] rounded-2xl border border-[#1A1A1A] bg-[#111111] p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)] text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-white">Store connected!</h2>
          <p className="mb-6 text-sm text-[#71717A]">Starting your first scan...</p>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FBBF24]" />
          {connectError && (
            <p className="mt-4 text-sm text-red-400">{connectError}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[460px] rounded-2xl border border-[#1A1A1A] bg-[#111111] p-8 shadow-[0_0_60px_rgba(0,0,0,0.35)]">
        <div className="mb-7 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBBF24]">
            <Ghost size={24} color="#0A0A0A" strokeWidth={2.5} />
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-3">
          {[
            { label: "Connect", active: true },
            { label: "Scan", active: false },
            { label: "Results", active: false },
          ].map((step, index) => (
            <div key={step.label} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor: step.active ? "#FBBF24" : "#333333",
                    boxShadow: step.active ? "0 0 8px rgba(251,191,36,0.4)" : "none",
                  }}
                />
                <span
                  className="text-[11px]"
                  style={{
                    color: step.active ? "#FBBF24" : "#71717A",
                    fontWeight: step.active ? 600 : 400,
                  }}
                >
                  {step.label}
                </span>
              </div>
              {index < 2 && <div className="mb-4 h-px w-12 bg-[#333333]" />}
            </div>
          ))}
        </div>

        <h2 className="mb-2 text-center text-2xl font-semibold text-white">Connect your Shopify store</h2>
        <p className="mb-6 text-center text-sm text-[#71717A]">
          Enter your store URL to start scanning for conversion leaks.
        </p>

        {configError && (
          <div className="mb-4 rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-200">
            {configError}
          </div>
        )}

        <div
          className="mb-4 flex items-center gap-2 rounded-lg border border-[#1A1A1A] bg-[#0A0A0A] px-4 py-3"
          role="group"
          aria-label="Store URL input"
        >
          <ShoppingBag size={18} color="#71717A" />
          <input
            type="text"
            placeholder="yourstore"
            value={storeInput}
            onChange={(event) => setStoreInput(event.target.value)}
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#6B7280]"
            onKeyDown={(event) => event.key === "Enter" && handleConnect()}
          />
          <span className="text-xs text-[#6B7280]">.myshopify.com</span>
        </div>

        {validationError && <p className="mb-3 text-xs text-red-400">{validationError}</p>}

        <button
          type="button"
          onClick={handleConnect}
          disabled={!normalizedShop}
          className="w-full rounded-lg py-3 text-sm font-semibold text-[#0A0A0A] transition-all disabled:cursor-not-allowed"
          style={{
            backgroundColor: normalizedShop ? "#FBBF24" : "#333333",
            opacity: normalizedShop ? 1 : 0.6,
            boxShadow: normalizedShop ? "0 0 20px rgba(251,191,36,0.18)" : "none",
          }}
        >
          Connect Store
        </button>

        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-[#71717A]">
          <Lock className="h-3.5 w-3.5" />
          Read-only access. We never modify your store.
        </div>
      </div>
    </div>
  )
}

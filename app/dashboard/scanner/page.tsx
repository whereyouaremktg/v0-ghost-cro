"use client"

import { useState } from "react"

import { GhostButton } from "@/components/ui/ghost-button"
import { GhostCard } from "@/components/ui/ghost-card"

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(68)
  const [logs, setLogs] = useState([
    "[INIT] Booting mission control modules...",
    "[SYNC] Loading storefront telemetry feeds...",
    "[SCAN] Mapping conversion surface area...",
    "[SCAN] Flagging high-risk friction nodes...",
  ])

  const progressClass =
    progress < 40 ? "w-1/3" : progress < 70 ? "w-2/3" : "w-3/4"

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      {!isScanning ? (
        <GhostCard className="mx-auto w-full max-w-[800px] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#111111] text-2xl">
            📡
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-white">
            Store Scanner
          </h2>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            Mission control is standing by to sweep your storefront for leaks,
            slowdowns, and high-impact conversion gaps.
          </p>
          <GhostButton
            className="mt-8 w-full max-w-xs animate-pulse bg-amber-500 text-black hover:bg-amber-400"
            onClick={() => {
              setIsScanning(true)
              setProgress(68)
              setLogs((current) => [...current, "[AUTH] Uplink secured."])
            }}
          >
            Start Deep Analysis
          </GhostButton>
        </GhostCard>
      ) : (
        <GhostCard className="w-full max-w-[900px] border border-[#27272A] bg-[#000] p-8 text-white shadow-none">
          <div className="space-y-6 font-mono text-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>SCANNING_PROGRESS</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#111111]">
                <div
                  className={`h-full rounded-full bg-amber-400 ${progressClass}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.2em] text-[#71717A]">
                Live telemetry
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-[#27272A] bg-[#050505] p-4">
                {logs.map((line, index) => (
                  <p key={`${line}-${index}`} className="text-[#E5E7EB]">
                    {line}
                  </p>
                ))}
                <p className="text-[#E5E7EB]">
                  [STREAM] Awaiting next signal
                  <span className="ml-1 inline-block animate-pulse text-amber-400">
                    _
                  </span>
                </p>
              </div>
            </div>
          </div>
        </GhostCard>
      )}
    </div>
  )
}

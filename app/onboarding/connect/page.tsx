"use client"

import { Lock, Eye } from "lucide-react"

import { GhostLogo } from "@/components/ghost-logo"
import { GhostButton } from "@/components/ui/ghost-button"
import { GhostInput } from "@/components/ui/ghost-input"
import { GhostCard } from "@/components/ui/ghost-card"

export default function ConnectPage() {
  return (
    <div className="max-w-md mx-auto">
      <GhostLogo size={48} className="mb-6" />

      <h1 className="text-2xl font-bold text-white mb-2">
        Connect your Shopify store
      </h1>

      <p className="text-[#9CA3AF] mb-8">
        Ghost needs access to analyze your theme and identify conversion
        opportunities. We only read — never modify.
      </p>

      <div className="mb-4">
        <label className="text-sm text-[#9CA3AF] mb-2 block">
          Your Shopify store URL
        </label>
        <div className="flex">
          <GhostInput
            placeholder="yourstore"
            className="rounded-r-none"
            aria-label="Store URL"
          />
          <span className="bg-[#111111] border border-l-0 border-[#1F1F1F] rounded-r-lg px-4 py-3 text-[#6B7280] text-sm flex items-center">
            .myshopify.com
          </span>
        </div>
      </div>

      <GhostButton
        className="w-full"
        onClick={() => {
          window.location.href = "/api/auth/shopify/initiate"
        }}
      >
        Connect Store →
      </GhostButton>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3" /> Secure OAuth
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" /> Read-only access
        </span>
      </div>

      <GhostCard className="mt-10 p-4">
        <h2 className="text-sm font-semibold text-white mb-2">
          Permissions requested
        </h2>
        <ul className="text-sm text-[#9CA3AF] space-y-1">
          <li>• Read theme files</li>
          <li>• View products</li>
          <li>• Access analytics</li>
        </ul>
      </GhostCard>
    </div>
  )
}

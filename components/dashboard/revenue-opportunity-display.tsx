"use client"

import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RevenueOpportunityDisplayProps {
  min: number
  max: number
  methodology?: string
  label?: string
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function RevenueOpportunityDisplay({
  min,
  max,
  methodology,
  label = "Revenue Opportunity",
  size = "lg",
  showTooltip = true,
}: RevenueOpportunityDisplayProps) {
  // Format range
  const formatRange = (minVal: number, maxVal: number): string => {
    const roundTo = (value: number): number => {
      if (value >= 1000000) return Math.round(value / 100000) * 100000
      if (value >= 100000) return Math.round(value / 10000) * 10000
      if (value >= 10000) return Math.round(value / 1000) * 1000
      if (value >= 1000) return Math.round(value / 100) * 100
      return Math.round(value / 10) * 10
    }

    const roundedMin = roundTo(minVal)
    const roundedMax = roundTo(maxVal)

    // If min and max are very close, show single value
    if (roundedMax - roundedMin < roundedMin * 0.1) {
      return `$${roundedMin.toLocaleString()}`
    }

    return `$${roundedMin.toLocaleString()} - $${roundedMax.toLocaleString()}`
  }

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-5xl",
  }

  const rangeText = formatRange(min, max)

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          {label}
        </div>
        {showTooltip && methodology && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Info className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs text-gray-600">{methodology}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className={`font-heading font-bold text-orange-600 leading-none ${sizeClasses[size]}`}>
        {rangeText}
        <span className="text-base font-normal text-gray-500 ml-1">/mo</span>
      </div>
      {methodology && !showTooltip && (
        <p className="text-xs text-gray-500 mt-2">{methodology}</p>
      )}
    </div>
  )
}




import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  variant?: "default" | "success"
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-[#1F1F1F] bg-[#111111] p-8 text-center">
      <div
        className={cn(
          "mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full",
          variant === "success" ? "bg-[#10B981]/10" : "bg-[#FBBF24]/10",
        )}
      >
        <Icon
          className={cn(
            "h-6 w-6",
            variant === "success" ? "text-[#10B981]" : "text-[#FBBF24]",
          )}
        />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#9CA3AF]">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

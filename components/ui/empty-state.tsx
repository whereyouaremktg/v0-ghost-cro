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
    <div className="relative rounded-xl border border-[#1F1F1F] bg-[#111111] p-10 text-center ghost-dots overflow-hidden">
      <div className="relative">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center">
          <div
            className={cn(
              "absolute h-16 w-16 rounded-full border border-dashed",
              variant === "success"
                ? "border-[#10B981]/15"
                : "border-[#FBBF24]/15",
            )}
          />
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full",
              variant === "success" ? "bg-[#10B981]/10" : "bg-[#FBBF24]/10",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                variant === "success" ? "text-[#10B981]" : "text-[#FBBF24]",
              )}
            />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#9CA3AF]">
          {description}
        </p>
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  )
}

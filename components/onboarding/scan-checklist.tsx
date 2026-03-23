"use client"

import { CheckCircle } from "lucide-react"

type ChecklistItem = {
  label: string
  done: boolean
}

type ScanChecklistProps = {
  items: ChecklistItem[]
}

export function ScanChecklist({ items }: ScanChecklistProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          {item.done ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <div className="h-5 w-5 rounded-full border-2 border-[var(--ghost-border-hover)] border-t-[var(--ghost-accent-primary)] animate-spin" />
          )}
          <span className={item.done ? "text-white" : "text-[var(--ghost-text-subtle)]"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

import { Suspense } from "react"
import { HistoryContent } from "@/components/dashboard/history-content"

export default function HistoryPage() {
  return (
    <Suspense fallback={null}>
      <HistoryContent />
    </Suspense>
  )
}

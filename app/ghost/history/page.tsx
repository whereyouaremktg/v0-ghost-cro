import { redirect } from "next/navigation"

// Legacy route - redirect to unified Ghost OS timeline
export default function HistoryPage() {
  redirect("/ghost#timeline")
}

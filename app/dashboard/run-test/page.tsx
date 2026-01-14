import { redirect } from "next/navigation"

// Legacy route - redirect to dashboard
export default function RunTestPage() {
  redirect("/dashboard")
}

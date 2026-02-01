import { redirect } from "next/navigation"

// Legacy route - redirect to scanner page
export default function RunTestPage() {
  redirect("/dashboard/scanner")
}

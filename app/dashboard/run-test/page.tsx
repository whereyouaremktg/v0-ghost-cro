import { redirect } from "next/navigation"

// Legacy route - redirect to unified Ghost OS simulation view
export default function RunTestPage() {
  redirect("/ghost#simulation")
}

import { redirect } from "next/navigation"

// Legacy dashboard route - redirect to unified Ghost Mission Control
export default async function DashboardPage() {
  redirect("/ghost")
}

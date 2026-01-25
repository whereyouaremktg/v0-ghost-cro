import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let user = null
  let error: Error | null = null

  if (supabaseUrl && supabaseKey) {
    const supabase = await createClient()
    const {
      data: { user: fetchedUser },
      error: fetchError,
    } = await supabase.auth.getUser()
    user = fetchedUser
    error = fetchError
  }

  // Production Auth Check
  if (process.env.NODE_ENV === "production" && (error || !user)) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Sidebar />
      <div className="pl-[240px] flex flex-col min-h-screen">
        <DashboardHeader lastScan="2 hours ago" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

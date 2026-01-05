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
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Production Auth Check
  if (process.env.NODE_ENV === "production" && (error || !user)) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <DashboardHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-[#020202] text-white">
      {/* Subtle grid background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen relative z-10">
        <DashboardHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

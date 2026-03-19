import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { ErrorBoundary } from "@/components/error-boundary"

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

  // Auth Check - redirect to login if not authenticated
  if (error || !user) {
    redirect("/login")
  }

  // If user is authenticated, require a connected store before showing dashboard
  if (user && supabaseUrl && supabaseKey) {
    const supabase = await createClient()
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (!store) {
      redirect("/onboarding/connect")
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Sidebar />
      <div className="min-h-screen pl-14">
        <DashboardHeader />
        <main className="min-h-[calc(100vh-72px)] p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  )
}

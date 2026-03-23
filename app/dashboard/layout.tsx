import type React from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
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

  // If user is authenticated, require a connected store before showing dashboard.
  // Exception: if the store_just_connected cookie is set, skip this check — the
  // OAuth callback just wrote the store to the DB but it may not be visible yet
  // due to replication lag or caching. The cookie is short-lived (120s) and
  // one-time use, so by the next navigation the store will be queryable.
  const cookieStore = await cookies()
  const justConnected = cookieStore.get("store_just_connected")?.value === "1"

  if (justConnected) {
    cookieStore.delete("store_just_connected")
  }

  if (!justConnected && user && supabaseUrl && supabaseKey) {
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
    <div className="min-h-screen bg-[var(--ghost-bg-primary)] text-white">
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

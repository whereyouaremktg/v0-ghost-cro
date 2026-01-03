import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/dashboard/sidebar"

export default async function GhostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // In development, allow access without auth for demo
  if (process.env.NODE_ENV === "production" && (error || !user)) {
    redirect("/login")
  }

  // Fetch user data if authenticated
  let profile = null
  let subscription = null

  if (user) {
    const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    const { data: subData } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

    profile = profileData
    subscription = subData
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        user={
          user
            ? {
                name: profile?.full_name || user.email?.split("@")[0] || "User",
                email: user.email || "",
              }
            : undefined
        }
        subscription={
          subscription
            ? {
                plan: subscription.plan,
                tests_used: subscription.tests_used,
                tests_limit: subscription.tests_limit,
              }
            : undefined
        }
      />
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  )
}



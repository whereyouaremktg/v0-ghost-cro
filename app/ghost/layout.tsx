import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

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

  // In development with DEMO_MODE, allow access without auth
  const demoMode = process.env.DEMO_MODE === "true"
  
  if (!demoMode && (error || !user)) {
    redirect("/login")
  }

  return (
    <div className="ghost-os min-h-screen bg-[#050505] text-[#e5e5e5] overflow-hidden">
      {/* Background Effects - Subtle grid for texture */}
      <div className="fixed inset-0 ghost-grid opacity-5 pointer-events-none" />
      
      {/* Ambient Glow - Very subtle for depth without distraction */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#0070F3]/2 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[#0070F3]/2 rounded-full blur-[128px] pointer-events-none" />
      
      {/* Main Content */}
      <main className="relative z-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}

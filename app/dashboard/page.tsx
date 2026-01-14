import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { GhostOS } from "@/components/dashboard/ghost-os"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [testsRes, subRes] = await Promise.all([
    supabase.from("tests").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
  ])

  const tests = testsRes.data || []
  const subscription = subRes.data

  const stats = {
    currentScore: tests[0]?.overall_score || 0,
    previousScore: tests[1]?.overall_score || 0,
    testsThisMonth: tests.length,
    testsRemaining: subscription?.tests_limit ? Math.max(0, subscription.tests_limit - tests.length) : 1,
    testsLimit: subscription?.tests_limit || 1,
    plan: subscription?.plan || "free",
  }

  return (
    <GhostOS
      user={{
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || "Merchant",
      }}
      stats={stats}
      tests={tests}
      latestTestResult={tests[0]?.results || null}
    />
  )
}

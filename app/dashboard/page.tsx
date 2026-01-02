import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // In development, show demo data
  if (process.env.NODE_ENV !== "production" && (error || !user)) {
    return (
      <DashboardContent
        user={{
          id: "demo",
          email: "demo@ghostcro.com",
          name: "Demo User",
        }}
        stats={{
          currentScore: 72,
          previousScore: 65,
          testsThisMonth: 2,
          testsRemaining: 3,
          testsLimit: 5,
          plan: "starter",
        }}
        tests={[]}
      />
    )
  }

  if (error || !user) {
    redirect("/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch subscription
  const { data: subscription } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).single()

  // Fetch recent tests
  const { data: tests } = await supabase
    .from("tests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  // Calculate stats
  const completedTests = tests?.filter((t) => t.status === "completed") || []
  const currentScore = completedTests[0]?.overall_score || 0
  const previousScore = completedTests[1]?.overall_score || 0
  const testsThisMonth =
    tests?.filter((t) => {
      const testDate = new Date(t.created_at)
      const now = new Date()
      return testDate.getMonth() === now.getMonth() && testDate.getFullYear() === now.getFullYear()
    }).length || 0

  const stats = {
    currentScore,
    previousScore,
    testsThisMonth,
    testsRemaining: (subscription?.tests_limit || 1) - (subscription?.tests_used || 0),
    testsLimit: subscription?.tests_limit || 1,
    plan: subscription?.plan || "free",
  }

  return (
    <DashboardContent
      user={{
        id: user.id,
        email: user.email || "",
        name: profile?.full_name || user.email?.split("@")[0] || "User",
      }}
      stats={stats}
      tests={tests || []}
    />
  )
}

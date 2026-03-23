"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuthUserId } from "@/hooks/use-auth-user-id"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function DashboardOnboardingPage() {
  const router = useRouter()
  const { userId } = useAuthUserId()
  const [revenueGoal, setRevenueGoal] = useState("")
  const [techEmail, setTechEmail] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    setSaving(true)

    try {
      const supabase = createClient()
      await supabase
        .from("profiles")
        .update({
          monthly_revenue_goal: revenueGoal ? parseInt(revenueGoal) : null,
          technical_contact_email: techEmail || null,
        })
        .eq("id", userId)

      // Sync to CRM
      try {
        await fetch("/api/crm/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "onboarding.completed" }),
        })
      } catch {}

      toast.success("Setup complete!")
      router.push("/dashboard")
    } catch {
      toast.error("Failed to save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center mx-auto mb-3">
            <Rocket className="h-6 w-6 text-[hsl(var(--accent))]" />
          </div>
          <CardTitle>Almost there!</CardTitle>
          <CardDescription>A couple more details to personalize your experience.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Monthly revenue goal ($)</Label>
              <Input
                type="number"
                placeholder="50000"
                value={revenueGoal}
                onChange={(e) => setRevenueGoal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Technical contact email (optional)</Label>
              <Input
                type="email"
                placeholder="dev@company.com"
                value={techEmail}
                onChange={(e) => setTechEmail(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4" />
                  Launch Dashboard
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

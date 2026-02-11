import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsContent } from "@/components/dashboard/settings/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle()

  const { data: ga4 } = await supabase
    .from("ga4_connections")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const connections = {
    shopify: !!store,
    shopifyShop: store?.shop || null,
    ga4: !!ga4,
    ga4Property: ga4?.selected_property_id || null,
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-[#71717A]">Manage integrations, billing, and alerts.</p>
      </div>

      <div className="rounded-xl border border-[#1A1A1A] bg-[#0F0F0F] p-4 md:p-6">
        <SettingsContent connections={connections} subscription={subscription} />
      </div>
    </div>
  )
}

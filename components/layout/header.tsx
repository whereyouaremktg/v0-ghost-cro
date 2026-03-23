"use client"

import { usePathname, useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const pathTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/scanner": "Scanner",
  "/dashboard/issues": "Issues",
  "/dashboard/history": "History",
  "/dashboard/insights": "Insights",
  "/dashboard/settings": "Settings",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()

  // Find the matching title - check exact match first, then prefix match
  const title =
    pathTitles[pathname] ??
    Object.entries(pathTitles).find(([path]) => pathname.startsWith(path + "/"))?.[1] ??
    "Dashboard"

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[hsl(var(--border-default))] bg-[hsl(var(--surface-0))]/80 backdrop-blur-md px-6">
      <h1 className="text-sm font-semibold text-[hsl(var(--text-primary))]">
        {title}
      </h1>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            <User className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

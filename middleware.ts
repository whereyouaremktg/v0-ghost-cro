import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Check for demo mode - allow /ghost routes without auth
  const demoMode = process.env.DEMO_MODE === "true"
  
  if (demoMode && request.nextUrl.pathname.startsWith("/ghost")) {
    // Skip auth check for /ghost routes in demo mode
    return NextResponse.next()
  }
  
  // Otherwise, use the normal auth middleware
  return await updateSession(request)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

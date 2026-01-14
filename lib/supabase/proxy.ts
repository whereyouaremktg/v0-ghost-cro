import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check for demo mode - allow /ghost routes without auth
  const demoMode = process.env.DEMO_MODE === "true"
  if (demoMode && request.nextUrl.pathname.startsWith("/ghost")) {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase env vars missing:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      allEnvKeys: Object.keys(process.env).filter((k) => k.includes("SUPABASE")),
    })
    // Allow access in development when env vars aren't loaded yet
    // But still protect /dashboard routes
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Auth check:", {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userEmail: user?.email,
  })

  // Redirect to login if accessing dashboard without auth
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Check if user needs onboarding (logged in but no Shopify store)
  if (user && request.nextUrl.pathname.startsWith("/dashboard") && request.nextUrl.pathname !== "/dashboard/onboarding") {
    // Check if user has connected a Shopify store
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    if (!store) {
      // No store connected - redirect to onboarding
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard/onboarding"
      return NextResponse.redirect(url)
    }
  }

  // Redirect to dashboard/onboarding if accessing login/signup while authenticated
  if ((request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup") && user) {
    // Check if user has connected a Shopify store
    const { data: store } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle()

    const url = request.nextUrl.clone()
    url.pathname = store ? "/dashboard" : "/dashboard/onboarding"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

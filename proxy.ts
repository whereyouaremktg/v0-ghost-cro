import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for session cookie
  const sessionCookie = request.cookies.get("ghost-session")
  const isLoggedIn = !!sessionCookie?.value

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    // In development/preview, allow access for demo purposes
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.next()
    }

    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}

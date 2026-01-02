// Mock auth for v0 preview - replace with real NextAuth in production
import { cookies } from "next/headers"

export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface Session {
  user: User | null
}

// Get session from cookie (works in both server and API routes)
export async function getSession(): Promise<Session> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("ghost-session")

  if (sessionCookie?.value) {
    try {
      const user = JSON.parse(sessionCookie.value) as User
      return { user }
    } catch {
      return { user: null }
    }
  }

  return { user: null }
}

// For v0 preview - auto-login with mock user
export async function getSessionWithFallback(): Promise<Session> {
  const session = await getSession()

  // In v0 preview, provide a mock user if not logged in
  if (!session.user && process.env.NODE_ENV !== "production") {
    return {
      user: {
        id: "preview-user",
        email: "demo@ghostcro.com",
        name: "Demo User",
      },
    }
  }

  return session
}

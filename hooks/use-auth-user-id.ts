"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function useAuthUserId() {
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (!isMounted) {
          return
        }
        if (error) {
          console.error("Failed to load user", error)
        }
        setUserId(data.user?.id ?? null)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      isMounted = false
    }
  }, [])

  return { userId, isLoading }
}

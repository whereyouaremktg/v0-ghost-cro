import type { TestResult } from "./types"

const STORAGE_KEY = "ghost-cro-test-results"

export function saveTestResult(result: TestResult): void {
  if (typeof window === "undefined") return

  const existing = getAllTestResults()
  existing.push(result)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

export function getTestResult(id: string): TestResult | null {
  if (typeof window === "undefined") return null

  const results = getAllTestResults()
  return results.find((r) => r.id === id) || null
}

export function getAllTestResults(): TestResult[] {
  if (typeof window === "undefined") return []

  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []

  try {
    const results = JSON.parse(data) as TestResult[]
    // Sort by date, newest first
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch {
    return []
  }
}

export function deleteTestResult(id: string): boolean {
  if (typeof window === "undefined") return false

  const results = getAllTestResults()
  const filtered = results.filter((r) => r.id !== id)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return filtered.length < results.length
}

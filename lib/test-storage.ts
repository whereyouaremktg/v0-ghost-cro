import type { TestResult } from "./types"

// In-memory storage for test results
// In production, you would use a database
const testResults = new Map<string, TestResult>()

export function saveTestResult(result: TestResult): void {
  testResults.set(result.id, result)
}

export function getTestResult(id: string): TestResult | undefined {
  return testResults.get(id)
}

export function getAllTestResults(): TestResult[] {
  return Array.from(testResults.values()).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export function deleteTestResult(id: string): boolean {
  return testResults.delete(id)
}

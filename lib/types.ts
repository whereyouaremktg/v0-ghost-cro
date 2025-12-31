export interface FrictionPoint {
  id: string
  title: string
  location: string
  impact: string
  affected: string
  fix: string
}

export interface PersonaResult {
  id: string
  name: string
  demographics: string
  verdict: "purchase" | "abandon"
  reasoning: string
  abandonPoint: string | null
}

export interface Recommendation {
  priority: number
  title: string
  impact: string
  effort: "low" | "medium" | "high"
  description: string
}

export interface FunnelData {
  landed: number
  cart: number
  checkout: number
  purchased: number
}

export interface TestResult {
  id: string
  date: string
  url: string
  personaMix: string
  score: number
  previousScore?: number
  change?: number
  issuesFound: number
  status: "completed" | "running" | "failed"
  frictionPoints: {
    critical: FrictionPoint[]
    high: FrictionPoint[]
    medium: FrictionPoint[]
    working: string[]
  }
  personaResults: PersonaResult[]
  recommendations: Recommendation[]
  funnelData: FunnelData
}

export interface AnalyzeRequest {
  url: string
  personaMix: string
}

export interface AnalyzeResponse {
  result: TestResult
}

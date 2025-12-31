import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import type { TestResult } from "@/lib/types"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const PERSONA_MIXES = {
  balanced: [
    "Budget-Conscious Parent (Age 34, $65K, Mobile)",
    "Impulse Buyer (Age 26, $85K, Mobile)",
    "Skeptical Researcher (Age 45, $120K, Desktop)",
    "Busy Professional (Age 38, $150K, Mobile)",
    "First-Time Visitor (Age 29, $55K, Mobile)",
  ],
  "price-sensitive": [
    "Budget-Conscious Parent (Age 34, $65K, Mobile)",
    "Discount Hunter (Age 28, $45K, Mobile)",
    "Value Seeker (Age 42, $70K, Desktop)",
    "College Student (Age 21, $20K, Mobile)",
    "Thrifty Shopper (Age 55, $50K, Desktop)",
  ],
  skeptical: [
    "Skeptical Researcher (Age 45, $120K, Desktop)",
    "Privacy-Conscious Buyer (Age 38, $95K, Desktop)",
    "First-Time Visitor (Age 29, $55K, Mobile)",
    "Cautious Senior (Age 62, $85K, Desktop)",
    "Fraud-Wary Shopper (Age 35, $75K, Mobile)",
  ],
  "mobile-heavy": [
    "Mobile-First Millennial (Age 27, $70K, Mobile)",
    "Impulse Buyer (Age 26, $85K, Mobile)",
    "Commuter Shopper (Age 33, $80K, Mobile)",
    "Social Media Browser (Age 24, $55K, Mobile)",
    "On-the-Go Parent (Age 36, $90K, Mobile)",
  ],
}

function getPersonas(personaMix: string): string[] {
  const normalizedMix = personaMix.toLowerCase().replace(/\s+/g, "-")
  return PERSONA_MIXES[normalizedMix as keyof typeof PERSONA_MIXES] || PERSONA_MIXES.balanced
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, personaMix = "balanced" } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const personas = getPersonas(personaMix)

    const prompt = `You are an expert e-commerce conversion optimization analyst. Analyze the checkout experience at this URL: ${url}

Evaluate the checkout from the perspective of these 5 different shopper personas:
${personas.map((p, i) => `${i + 1}. ${p}`).join("\n")}

For each persona, determine:
1. Would they complete the purchase or abandon? (purchase/abandon)
2. Their reasoning in first-person (a direct quote from them)
3. If they abandon, at what point? (e.g., "Shipping page", "Payment page", "Account page")

Then, analyze the checkout for:
- Overall score (0-100) based on conversion best practices
- Critical friction points (high impact issues causing abandonment)
- High priority issues (significant but not critical)
- Medium priority issues (minor improvements)
- Things working well (positive elements)
- Prioritized fix recommendations with estimated conversion impact

Return your analysis as a JSON object with this EXACT structure:
{
  "score": <number 0-100>,
  "personaResults": [
    {
      "name": "<persona name>",
      "demographics": "<age, income, device>",
      "verdict": "<purchase or abandon>",
      "reasoning": "<first-person quote explaining their decision>",
      "abandonPoint": "<where they left, or null if purchased>"
    }
  ],
  "frictionPoints": {
    "critical": [
      {
        "title": "<issue title>",
        "location": "<where in checkout>",
        "impact": "<% abandonment or impact metric>",
        "affected": "<which shopper types>",
        "fix": "<specific actionable fix>"
      }
    ],
    "high": [...same structure...],
    "medium": [...same structure...],
    "working": ["<positive element 1>", "<positive element 2>", ...]
  },
  "recommendations": [
    {
      "priority": <1, 2, 3, etc>,
      "title": "<fix title>",
      "impact": "<conversion improvement estimate>",
      "effort": "<low, medium, or high>",
      "description": "<detailed implementation guidance>"
    }
  ],
  "funnelData": {
    "landed": 1000,
    "cart": <estimated number>,
    "checkout": <estimated number>,
    "purchased": <estimated number based on score>
  }
}

IMPORTANT:
- Return ONLY valid JSON, no markdown formatting, no code blocks, no explanations
- Be specific and actionable in your feedback
- Base the score on real conversion optimization principles
- Persona reasoning should sound authentic and human
- Prioritize fixes by impact vs effort`

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    // Extract the text content from Claude's response
    const responseText = message.content[0].type === "text" ? message.content[0].text : ""

    // Parse the JSON response
    let analysisData
    try {
      analysisData = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Claude response:", responseText)
      throw new Error("Invalid JSON response from Claude")
    }

    // Generate unique ID for this test
    const testId = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Add IDs to friction points and persona results
    const frictionPoints = {
      critical: analysisData.frictionPoints.critical.map((fp: any, i: number) => ({
        id: `critical_${i}`,
        ...fp,
      })),
      high: analysisData.frictionPoints.high.map((fp: any, i: number) => ({
        id: `high_${i}`,
        ...fp,
      })),
      medium: analysisData.frictionPoints.medium.map((fp: any, i: number) => ({
        id: `medium_${i}`,
        ...fp,
      })),
      working: analysisData.frictionPoints.working,
    }

    const personaResults = analysisData.personaResults.map((pr: any, i: number) => ({
      id: `persona_${i}`,
      ...pr,
    }))

    // Calculate issues found
    const issuesFound =
      frictionPoints.critical.length + frictionPoints.high.length + frictionPoints.medium.length

    // Build the complete test result
    const result: TestResult = {
      id: testId,
      date: new Date().toISOString(),
      url,
      personaMix,
      score: analysisData.score,
      issuesFound,
      status: "completed",
      frictionPoints,
      personaResults,
      recommendations: analysisData.recommendations,
      funnelData: analysisData.funnelData,
    }

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze checkout" },
      { status: 500 },
    )
  }
}

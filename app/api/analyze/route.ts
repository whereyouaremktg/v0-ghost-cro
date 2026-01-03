import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import type { TestResult } from "@/lib/types"
import type { StoreAnalysis } from "@/lib/analysis/schema"
import { buildStoreAnalysisPrompt } from "@/lib/analysis/prompts/store-analysis"

/**
 * Extract JSON from Claude's response
 * Handles cases where JSON is wrapped in markdown code blocks or has extra text
 */
function extractJSON(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.trim()
  
  // Remove ```json and ``` markers
  cleaned = cleaned.replace(/^```json\s*/i, "")
  cleaned = cleaned.replace(/^```\s*/i, "")
  cleaned = cleaned.replace(/\s*```$/i, "")
  
  // Try to find JSON object boundaries
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  
  // If no match, return cleaned text (will fail gracefully in JSON.parse)
  return cleaned
}

// Lazy initialize Anthropic to avoid build errors and validate key
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please add it to your .env.local file.")
  }
  return new Anthropic({
    apiKey,
  })
}

interface ScrapedData {
  title: string
  price: string
  description: string
  images: string[]
  trustSignals: string[]
  shippingInfo: string
  reviews: {
    count: string
    rating: string
  }
  paymentMethods: string[]
  cartInfo: string
}

async function scrapeURL(url: string): Promise<ScrapedData> {
  try {
    // Fetch the page with a user agent to avoid blocking
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract product title
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "No title found"

    // Extract price
    const price =
      $('meta[property="og:price:amount"]').attr("content") ||
      $('[itemprop="price"]').attr("content") ||
      $('.price, .product-price, [class*="price"]')
        .first()
        .text()
        .trim() ||
      "Price not found"

    // Extract description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('.product-description, .description, [itemprop="description"]').first().text().trim() ||
      "No description found"

    // Extract images
    const images: string[] = []
    $('meta[property="og:image"]').each((_, el) => {
      const img = $(el).attr("content")
      if (img) images.push(img)
    })
    if (images.length === 0) {
      $(".product-image img, .product-gallery img").each((_, el) => {
        const src = $(el).attr("src")
        if (src) images.push(src)
      })
    }

    // Extract trust signals
    const trustSignals: string[] = []
    $(
      '.trust-badge, [class*="trust"], [class*="secure"], [class*="guarantee"], .reviews, [class*="rating"]',
    ).each((_, el) => {
      const text = $(el).text().trim()
      if (text && text.length < 200) trustSignals.push(text)
    })

    // Extract shipping info
    const shippingInfo =
      $('.shipping-info, [class*="shipping"], [class*="delivery"]').first().text().trim() ||
      "No shipping info visible"

    // Extract reviews/ratings
    const reviewCount =
      $('[itemprop="reviewCount"]').text().trim() ||
      $('.review-count, [class*="review-count"]').first().text().trim() ||
      "0"
    const rating =
      $('[itemprop="ratingValue"]').attr("content") ||
      $('.rating, [class*="rating"]').first().text().trim() ||
      "No rating"

    // Extract payment methods
    const paymentMethods: string[] = []
    $(
      '.payment-methods img, [class*="payment"] img, [alt*="pay"], [alt*="visa"], [alt*="mastercard"], [alt*="PayPal"]',
    ).each((_, el) => {
      const alt = $(el).attr("alt")
      if (alt) paymentMethods.push(alt)
    })

    // Extract cart-specific info
    const cartInfo =
      $('.cart-total, .subtotal, [class*="cart-summary"]').text().trim() ||
      "No cart information visible"

    return {
      title,
      price,
      description: description.slice(0, 500), // Limit length
      images: images.slice(0, 3), // First 3 images
      trustSignals: trustSignals.slice(0, 5),
      shippingInfo,
      reviews: {
        count: reviewCount,
        rating,
      },
      paymentMethods: paymentMethods.slice(0, 5),
      cartInfo,
    }
  } catch (error) {
    console.error("Scraping error:", error)
    return {
      title: "Unable to scrape",
      price: "Unknown",
      description: "Could not fetch page data",
      images: [],
      trustSignals: [],
      shippingInfo: "Unknown",
      reviews: { count: "0", rating: "Unknown" },
      paymentMethods: [],
      cartInfo: "Unknown",
    }
  }
}

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

    // Validate Anthropic API key before proceeding
    let anthropic
    try {
      anthropic = getAnthropicClient()
    } catch (error) {
      console.error("Anthropic API key error:", error)
      return NextResponse.json(
        {
          error: "Anthropic API key is not configured",
          message: error instanceof Error ? error.message : "Please add ANTHROPIC_API_KEY to your .env.local file",
        },
        { status: 500 }
      )
    }

    const personas = getPersonas(personaMix)

    // Scrape the URL to get real data
    const scrapedData = await scrapeURL(url)

    // Build the structured store analysis prompt
    const storeAnalysisPrompt = buildStoreAnalysisPrompt(url, scrapedData)

    // First, get the detailed structured analysis
    const storeAnalysisMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: storeAnalysisPrompt,
        },
      ],
    })

    const storeAnalysisText =
      storeAnalysisMessage.content[0].type === "text" ? storeAnalysisMessage.content[0].text : ""

    let storeAnalysis: StoreAnalysis
    try {
      const jsonText = extractJSON(storeAnalysisText)
      storeAnalysis = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse store analysis response:")
      console.error("Raw response:", storeAnalysisText.substring(0, 500))
      console.error("Parse error:", parseError)
      // Return a more helpful error
      return NextResponse.json(
        {
          error: "Failed to parse AI analysis response",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          hint: "The AI response may not be in valid JSON format. Please try again.",
        },
        { status: 500 }
      )
    }

    // Now get the persona-based analysis and friction points
    const personaPrompt = `You are an expert Shopify conversion optimization analyst specializing in cart-to-checkout flow analysis.

URL PROVIDED: ${url}

STRUCTURED STORE ANALYSIS (from detailed review):
${JSON.stringify(storeAnalysis, null, 2)}

Use this detailed analysis to inform your persona evaluation and friction point identification.

ANALYSIS SCOPE:
Analyze the ENTIRE cart-to-checkout experience for this Shopify store. This includes:
1. **Product Page** → Add to Cart experience
2. **Cart Page** → Where customers see their items, shipping costs preview, and proceed to checkout
3. **Checkout Flow** → Account/guest checkout, shipping, payment, and final purchase

Focus heavily on the CART PAGE as this is where most friction and abandonment happens in Shopify stores.

Evaluate this cart-to-checkout journey from the perspective of these 5 different shopper personas:
${personas.map((p, i) => `${i + 1}. ${p}`).join("\n")}

For each persona, determine:
1. Would they complete the purchase or abandon? (purchase/abandon)
2. Their reasoning in first-person as they go through the cart → checkout flow (a direct quote from them)
3. If they abandon, at what specific point in the journey? (e.g., "Cart page - saw shipping costs", "Checkout - no Apple Pay", "Checkout - forced account creation")

Then, provide a comprehensive analysis including:
- Overall score (0-100) based on Shopify cart-to-checkout best practices
- Critical friction points (high impact issues causing abandonment) - use the issues from the structured analysis
- High priority issues (significant but not critical)
- Medium priority issues (minor improvements)
- Things working well (positive elements)
- Prioritized fix recommendations with estimated conversion impact

IMPORTANT: Base your analysis on the STRUCTURED ANALYSIS provided above. Reference specific issues found in the storeAnalysis.overallIssues array.

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
- **CRITICAL: Return ONLY valid JSON, no markdown formatting, no code blocks, no explanations, no text before or after the JSON**
- The response must start with { and end with }
- Do not wrap the JSON in \`\`\`json\`\`\` code blocks
- Be specific and actionable in your feedback
- Base the score on real conversion optimization principles
- Persona reasoning should sound authentic and human
- Prioritize fixes by impact vs effort
- Reference the structured analysis issues when identifying friction points`

    // Get persona-based analysis
    const personaMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: personaPrompt,
        },
      ],
    })

    // Extract the text content from Claude's response
    const responseText = personaMessage.content[0].type === "text" ? personaMessage.content[0].text : ""

    // Parse the JSON response
    let analysisData
    try {
      const jsonText = extractJSON(responseText)
      analysisData = JSON.parse(jsonText)
    } catch (parseError) {
      console.error("Failed to parse Claude persona analysis response:")
      console.error("Raw response:", responseText.substring(0, 500))
      console.error("Parse error:", parseError)
      // Return a more helpful error
      return NextResponse.json(
        {
          error: "Failed to parse AI analysis response",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          hint: "The AI response may not be in valid JSON format. Please try again.",
        },
        { status: 500 }
      )
    }

    // Merge the structured analysis into the result
    // The storeAnalysis is already available from the first API call

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
      // Store the detailed analysis for future reference
      storeAnalysis: storeAnalysis,
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

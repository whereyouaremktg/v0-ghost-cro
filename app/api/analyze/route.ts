import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import * as cheerio from "cheerio"
import type { TestResult, PersonaResult } from "@/lib/types"
import type { StoreAnalysis } from "@/lib/analysis/schema"
import { buildStoreAnalysisPrompt } from "@/lib/analysis/prompts/store-analysis"
import { scrapeSandboxTheme, compareSandboxToOriginal } from "@/lib/shopify/sandbox-scraper"
import { createClient } from "@/lib/supabase/server"
import { 
  hasGA4Connection, 
  getSelectedPropertyId, 
  createGA4ClientWithOAuth 
} from "@/lib/analytics/ga4-oauth"
import { 
  fetchGA4Demographics, 
  generatePersonasFromGA4Demographics,
  type GA4Metrics 
} from "@/lib/analytics/ga4-client"

/**
 * Raw analysis data structure from Claude's JSON response
 */
interface RawAnalysisData {
  score: number
  personaResults: Array<{
    name: string
    demographics: string
    verdict: "purchase" | "abandon"
    reasoning: string
    abandonPoint: string | null
  }>
  frictionPoints: {
    critical: Array<{ title: string; location: string; impact: string; affected: string; fix: string }>
    high: Array<{ title: string; location: string; impact: string; affected: string; fix: string }>
    medium: Array<{ title: string; location: string; impact: string; affected: string; fix: string }>
    working: string[]
  }
  recommendations: Array<{
    priority: number
    title: string
    impact: string
    effort: "low" | "medium" | "high"
    description: string
  }>
  funnelData: {
    landed: number
    cart: number
    checkout: number
    purchased: number
  }
}

/**
 * Extract JSON from Claude's response
 * Handles cases where JSON is wrapped in markdown code blocks or has extra text
 * Improved to handle truncated/malformed JSON responses
 */
function extractJSON(text: string): string {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid input: text must be a non-empty string')
  }
  
  // Remove markdown code blocks
  let cleaned = text.trim()
  
  // Remove ```json and ``` markers (handles multiple cases)
  cleaned = cleaned.replace(/^```json\s*/i, "")
  cleaned = cleaned.replace(/^```\s*/i, "")
  cleaned = cleaned.replace(/\s*```$/i, "")
  cleaned = cleaned.replace(/\s*```\s*/g, "") // Remove any remaining ```
  
  // Try to find JSON object boundaries
  // Use a more careful approach to find balanced braces
  let braceCount = 0
  let startIndex = -1
  let endIndex = -1
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (startIndex === -1) startIndex = i
      braceCount++
    } else if (cleaned[i] === '}') {
      braceCount--
      if (braceCount === 0 && startIndex !== -1) {
        endIndex = i
        break
      }
    }
  }
  
  // If we found balanced braces, extract that section
  if (startIndex !== -1 && endIndex !== -1) {
    return cleaned.substring(startIndex, endIndex + 1)
  }
  
  // Fallback: try regex match (might not be balanced)
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  
  // Last resort: return cleaned text
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

export interface ScrapedData {
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
    const { url, personaMix = "balanced", validationMode = false, originalTestId, sandboxPreviewUrl } = body

    console.log('=== ANALYZE API START ===')
    console.log('Input:', { url, personaMix, validationMode, originalTestId })

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validation Mode: Compare sandbox against original test
    if (validationMode && sandboxPreviewUrl) {
      return await handleValidationMode(url, sandboxPreviewUrl, originalTestId, personaMix)
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

    // Try to fetch GA4 demographics and generate personas from real data
    let personas: string[] = []
    let ga4Demographics: GA4Metrics['demographics'] | null = null
    let usingGA4Personas = false

    try {
      // Get authenticated user to check for GA4 connection
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const hasConnection = await hasGA4Connection(user.id)
        
        if (hasConnection) {
          const propertyId = await getSelectedPropertyId(user.id)
          
          if (propertyId) {
            try {
              // Create GA4 client with OAuth
              const analyticsClient = await createGA4ClientWithOAuth(user.id)
              
              // Fetch demographics for last 30 days
              const endDate = new Date()
              const startDate = new Date()
              startDate.setDate(startDate.getDate() - 30)
              
              ga4Demographics = await fetchGA4Demographics(
                analyticsClient,
                propertyId,
                startDate,
                endDate
              )

              if (ga4Demographics) {
                // Generate personas from GA4 data
                personas = generatePersonasFromGA4Demographics(ga4Demographics, 5)
                
                if (personas.length > 0) {
                  usingGA4Personas = true
                  console.log('✓ Using GA4 demographics for persona generation')
                  console.log(`  - Age groups: ${ga4Demographics.ageGroups.length}`)
                  console.log(`  - Devices: ${ga4Demographics.devices.length}`)
                  console.log(`  - Generated personas: ${personas.length}`)
                }
              }
            } catch (ga4Error) {
              console.warn('GA4 demographics fetch failed, falling back to Expert CRO defaults:', ga4Error)
              // Fall through to use defaults
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error checking GA4 connection, using defaults:', error)
      // Fall through to use defaults
    }

    // Fallback to Expert CRO defaults if GA4 personas weren't generated
    if (personas.length === 0) {
      personas = getPersonas(personaMix)
      console.log('✓ Using Expert CRO default personas (GA4 demographics not available)')
    }

    // Scrape the URL to get real data
    const scrapedData = await scrapeURL(url)

    // Build the structured store analysis prompt
    const storeAnalysisPrompt = buildStoreAnalysisPrompt(url, scrapedData)

    // First, get the detailed structured analysis
    const storeAnalysisMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192, // Increased to handle longer JSON responses
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
      
      // Validate JSON structure before parsing
      if (!jsonText.trim().startsWith('{')) {
        throw new Error('Extracted text does not start with JSON object')
      }
      
      storeAnalysis = JSON.parse(jsonText)
      console.log('✓ Store Analysis parsed successfully')
      console.log('  - Issues found:', storeAnalysis.overallIssues?.length || 0)
    } catch (parseError) {
      console.error("Failed to parse store analysis response:")
      console.error("Response length:", storeAnalysisText.length)
      console.error("Response preview (first 1000 chars):", storeAnalysisText.substring(0, 1000))
      console.error("Response preview (last 500 chars):", storeAnalysisText.substring(Math.max(0, storeAnalysisText.length - 500)))
      console.error("Parse error:", parseError)
      console.error("Parse error details:", parseError instanceof Error ? parseError.message : String(parseError))
      
      // Return a more helpful error with retry suggestion
      return NextResponse.json(
        {
          error: "Failed to parse AI analysis response",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
          hint: "The AI response may contain malformed JSON. This can happen with very long responses or special characters. Please try again with a different URL or contact support if the issue persists.",
          responseLength: storeAnalysisText.length,
        },
        { status: 500 }
      )
    }

    // Now get the persona-based analysis and friction points
    // Build Digital Twin ICP context if GA4 demographics are available
    const digitalTwinContext = ga4Demographics ? `
DIGITAL TWIN ICP (Real Customer Demographics from GA4 Analytics):
This analysis uses actual customer data from Google Analytics 4 to create authentic "Digital Twin" personas.

Age Distribution:
${ga4Demographics.ageGroups.map(g => `- ${g.ageRange}: ${g.percentage.toFixed(1)}% (${g.sessions} sessions)`).join('\n')}

Gender Distribution:
${ga4Demographics.genders.map(g => `- ${g.gender}: ${g.percentage.toFixed(1)}% (${g.sessions} sessions)`).join('\n')}

Device Category:
${ga4Demographics.devices.map(d => `- ${d.deviceCategory}: ${d.percentage.toFixed(1)}% (${d.sessions} sessions)`).join('\n')}

Top Locations:
${ga4Demographics.locations.slice(0, 3).map(l => `- ${l.city ? l.city + ', ' : ''}${l.country}: ${l.percentage.toFixed(1)}% (${l.sessions} sessions)`).join('\n')}

Use this real demographic data to create authentic personas that match the actual customer base. The personas below are generated from this data.

` : `
Note: Using Expert CRO default personas (GA4 demographics not available or not connected).

`

    const personaPrompt = `You are an expert Shopify conversion optimization analyst specializing in cart-to-checkout flow analysis.

URL PROVIDED: ${url}

STRUCTURED STORE ANALYSIS (from detailed review):
${JSON.stringify(storeAnalysis, null, 2)}

Use this detailed analysis to inform your persona evaluation and friction point identification.
${digitalTwinContext}
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
      max_tokens: 8192, // Increased to handle longer JSON responses
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
    let analysisData: RawAnalysisData
    try {
      const jsonText = extractJSON(responseText)
      analysisData = JSON.parse(jsonText) as RawAnalysisData
      console.log('✓ Persona Analysis parsed successfully')
      console.log('  - Score:', analysisData.score)
      console.log('  - Persona results:', analysisData.personaResults?.length || 0)
      console.log('  - Critical threats:', analysisData.frictionPoints?.critical?.length || 0)
      console.log('  - High threats:', analysisData.frictionPoints?.high?.length || 0)
      console.log('  - Medium threats:', analysisData.frictionPoints?.medium?.length || 0)
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
      critical: analysisData.frictionPoints.critical.map((fp, i) => ({
        id: `critical_${i}`,
        ...fp,
      })),
      high: analysisData.frictionPoints.high.map((fp, i) => ({
        id: `high_${i}`,
        ...fp,
      })),
      medium: analysisData.frictionPoints.medium.map((fp, i) => ({
        id: `medium_${i}`,
        ...fp,
      })),
      working: analysisData.frictionPoints.working,
    }

    const personaResults = analysisData.personaResults.map((pr, i) => ({
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

    console.log('=== ANALYSIS COMPLETE ===')
    console.log('Result ID:', testId)
    console.log('Total threats:', issuesFound)
    console.log('Personas:', personaResults.length)
    console.log('  - Would purchase:', personaResults.filter((p: PersonaResult) => p.verdict === 'purchase').length)
    console.log('  - Would abandon:', personaResults.filter((p: PersonaResult) => p.verdict === 'abandon').length)
    console.log('Funnel data:', {
      landed: analysisData.funnelData.landed,
      cart: analysisData.funnelData.cart,
      checkout: analysisData.funnelData.checkout,
      purchased: analysisData.funnelData.purchased
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to analyze checkout" },
      { status: 500 },
    )
  }
}

/**
 * Handle Validation Mode: Compare sandbox theme against original test results
 */
async function handleValidationMode(
  url: string,
  sandboxPreviewUrl: string,
  originalTestId: string | undefined,
  personaMix: string
) {
  try {
    console.log('=== VALIDATION MODE START ===')
    console.log('Sandbox URL:', sandboxPreviewUrl)
    console.log('Original Test ID:', originalTestId)

    // Scrape the sandbox theme
    const sandboxScrape = await scrapeSandboxTheme(sandboxPreviewUrl)
    
    if (!sandboxScrape.success || !sandboxScrape.data) {
      return NextResponse.json(
        { error: `Failed to scrape sandbox: ${sandboxScrape.error}` },
        { status: 500 }
      )
    }

    // Get original test results if provided
    let originalTest: TestResult | null = null
    if (originalTestId && typeof window === "undefined") {
      // Server-side: We can't access localStorage, so we'll need to get from database
      // For now, we'll proceed without original comparison
      console.warn("Original test ID provided but cannot access client storage on server")
    }

    // Scrape the original URL for comparison
    const originalScrape = await scrapeURL(url)

    // Compare sandbox to original
    const comparison = compareSandboxToOriginal(originalScrape, sandboxScrape.data)

    // Get Anthropic client for validation analysis
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

    // Run validation analysis on the sandbox
    const personas = getPersonas(personaMix)
    
    // Build validation prompt
    const validationPrompt = `You are validating a Ghost CRO optimized Shopify theme sandbox.

ORIGINAL STORE ANALYSIS:
URL: ${url}
Original Scraped Data: ${JSON.stringify(originalScrape, null, 2)}

SANDBOX STORE ANALYSIS:
Sandbox URL: ${sandboxPreviewUrl}
Sandbox Scraped Data: ${JSON.stringify(sandboxScrape.data, null, 2)}

FIXES DETECTED IN SANDBOX:
${comparison.fixesDetected.map(fix => `- ${fix}`).join("\n")}

IMPROVEMENTS DETECTED:
- Trust Signals: ${comparison.improvements.trustSignals ? "✅ Improved" : "❌ No change"}
- Shipping Transparency: ${comparison.improvements.shippingTransparency ? "✅ Improved" : "❌ No change"}
- Express Checkout: ${comparison.improvements.expressCheckout ? "✅ Improved" : "❌ No change"}

Your task is to:
1. Re-run the same 5 persona simulations on the SANDBOX theme
2. Compare results against the original test
3. Calculate the conversion lift improvement
4. Identify which threats were resolved

Return a JSON object with this structure:
{
  "score": <new score 0-100>,
  "originalScore": <original score if available, or null>,
  "scoreImprovement": <score difference>,
  "personaResults": [
    {
      "name": "<persona name>",
      "demographics": "<age, income, device>",
      "verdict": "<purchase or abandon>",
      "originalVerdict": "<purchase or abandon from original test, or null>",
      "improved": <true if changed from abandon to purchase>,
      "reasoning": "<first-person quote explaining their decision on sandbox>",
      "abandonPoint": "<where they left, or null if purchased>"
    }
  ],
  "threatsResolved": [
    {
      "threatId": "<id of resolved threat>",
      "title": "<threat title>",
      "status": "<resolved|partially-resolved|not-resolved>",
      "impact": "<estimated conversion improvement>"
    }
  ],
  "conversionLift": {
    "estimatedCRLift": <percentage point improvement>,
    "monthlyRevenueLift": <estimated monthly revenue increase>,
    "confidence": "<high|medium|low>"
  },
  "validationStatus": "<success|partial|failed>"
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no code blocks.`

    const validationMessage = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192, // Increased to handle longer JSON responses
      messages: [
        {
          role: "user",
          content: validationPrompt,
        },
      ],
    })

    const validationText =
      validationMessage.content[0].type === "text" ? validationMessage.content[0].text : ""

    let validationData
    try {
      const jsonText = extractJSON(validationText)
      validationData = JSON.parse(jsonText)
      console.log('✓ Validation Analysis parsed successfully')
    } catch (parseError) {
      console.error("Failed to parse validation response:", parseError)
      return NextResponse.json(
        {
          error: "Failed to parse validation analysis response",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error",
        },
        { status: 500 }
      )
    }

    // Build validation result
    const validationResult = {
      validationMode: true,
      sandboxUrl: sandboxPreviewUrl,
      originalUrl: url,
      comparison,
      validationData,
      timestamp: new Date().toISOString(),
    }

    console.log('=== VALIDATION COMPLETE ===')
    console.log('Threats Resolved:', validationData.threatsResolved?.length || 0)
    console.log('Score Improvement:', validationData.scoreImprovement || 0)
    console.log('Conversion Lift:', validationData.conversionLift?.estimatedCRLift || 0)

    return NextResponse.json({ validationResult })
  } catch (error) {
    console.error("Validation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to validate sandbox" },
      { status: 500 }
    )
  }
}

import * as cheerio from "cheerio"

export type StoreCategory =
  | "apparel"
  | "beauty"
  | "electronics"
  | "home"
  | "health"
  | "general"

const CATEGORY_KEYWORDS: Record<Exclude<StoreCategory, "general">, string[]> = {
  apparel: [
    "apparel",
    "clothing",
    "fashion",
    "dress",
    "shirt",
    "hoodie",
    "jacket",
    "pants",
    "jeans",
    "activewear",
    "athleisure",
    "footwear",
    "shoe",
    "sneaker",
  ],
  beauty: [
    "beauty",
    "skincare",
    "skin care",
    "cosmetic",
    "cosmetics",
    "makeup",
    "fragrance",
    "perfume",
    "serum",
    "moisturizer",
    "cleanser",
    "haircare",
    "hair care",
  ],
  electronics: [
    "electronics",
    "tech",
    "gadget",
    "device",
    "smartphone",
    "laptop",
    "headphones",
    "charger",
    "bluetooth",
    "camera",
    "monitor",
    "gaming",
  ],
  home: [
    "home",
    "furniture",
    "decor",
    "kitchen",
    "bedding",
    "bath",
    "garden",
    "household",
    "organization",
    "lighting",
    "sofa",
    "table",
    "chair",
  ],
  health: [
    "health",
    "wellness",
    "supplement",
    "supplements",
    "vitamin",
    "protein",
    "nutrition",
    "fitness",
    "self care",
    "self-care",
    "medical",
    "recovery",
    "immune",
  ],
}

const ALLOWED_CATEGORIES: StoreCategory[] = [
  "apparel",
  "beauty",
  "electronics",
  "home",
  "health",
  "general",
]

function getCategoryFromText(text: string): StoreCategory {
  const normalized = text.toLowerCase()
  const scores: Record<Exclude<StoreCategory, "general">, number> = {
    apparel: 0,
    beauty: 0,
    electronics: 0,
    home: 0,
    health: 0,
  }

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as Array<
    [Exclude<StoreCategory, "general">, string[]]
  >) {
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        scores[category] += 1
      }
    }
  }

  let bestCategory: Exclude<StoreCategory, "general"> | null = null
  let bestScore = 0

  for (const [category, score] of Object.entries(scores) as Array<
    [Exclude<StoreCategory, "general">, number]
  >) {
    if (score > bestScore) {
      bestScore = score
      bestCategory = category
    }
  }

  return bestCategory && bestScore > 0 ? bestCategory : "general"
}

export function normalizeStoreCategory(value?: string | null): StoreCategory {
  if (!value || typeof value !== "string") {
    return "general"
  }

  const normalized = value.trim().toLowerCase()
  return ALLOWED_CATEGORIES.includes(normalized as StoreCategory)
    ? (normalized as StoreCategory)
    : "general"
}

export async function detectStoreCategory(url: string): Promise<StoreCategory> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return "general"
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const title = $("title").text()
    const metaDescription =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      ""
    const categoryMeta =
      $('meta[property="product:category"]').attr("content") ||
      $('meta[property="og:type"]').attr("content") ||
      ""
    const headings = $("h1, h2, h3")
      .map((_, el) => $(el).text())
      .get()
      .join(" ")
    const navText = $("nav a, header a, [role='navigation'] a")
      .map((_, el) => $(el).text())
      .get()
      .join(" ")
    const productHints = $("[class*='product'], [data-product-type], [itemprop='category']")
      .map((_, el) => $(el).text())
      .get()
      .join(" ")
    const bodyExcerpt = $("body")
      .text()
      .replace(/\s+/g, " ")
      .slice(0, 7000)

    const weightedText = [
      `${categoryMeta} ${categoryMeta}`,
      `${title} ${title}`,
      `${metaDescription} ${metaDescription}`,
      headings,
      navText,
      productHints,
      bodyExcerpt,
    ].join(" ")

    return getCategoryFromText(weightedText)
  } catch (error) {
    console.warn("Store category detection failed:", error)
    return "general"
  }
}

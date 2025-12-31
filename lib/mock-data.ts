export const mockUser = {
  name: "Alex Chen",
  email: "alex@luxebrand.com",
  plan: "Growth",
  testsUsed: 7,
  testsLimit: 10,
}

export const mockStats = {
  currentScore: 67,
  previousScore: 62,
  moneyAtRisk: 8420,
  previousMoneyAtRisk: 10520,
  testsThisMonth: 7,
  testsRemaining: 3,
  issuesFixed: 8,
}

export const mockScoreHistory = [
  { date: "Nov 2", score: 45 },
  { date: "Nov 9", score: 48 },
  { date: "Nov 16", score: 52 },
  { date: "Nov 23", score: 55 },
  { date: "Nov 30", score: 58 },
  { date: "Dec 7", score: 58 },
  { date: "Dec 14", score: 62 },
  { date: "Dec 21", score: 62 },
  { date: "Dec 28", score: 67 },
]

export const mockTests = [
  {
    id: "1",
    date: "2024-12-28T14:30:00Z",
    url: "https://luxebrand.com/checkout",
    personaMix: "Balanced",
    score: 67,
    previousScore: 62,
    change: 5,
    issuesFound: 4,
    status: "completed" as const,
  },
  {
    id: "2",
    date: "2024-12-21T10:15:00Z",
    url: "https://luxebrand.com/checkout",
    personaMix: "Price Sensitive",
    score: 62,
    previousScore: 58,
    change: 4,
    issuesFound: 6,
    status: "completed" as const,
  },
  {
    id: "3",
    date: "2024-12-14T09:00:00Z",
    url: "https://luxebrand.com/checkout",
    personaMix: "Balanced",
    score: 58,
    previousScore: 55,
    change: 3,
    issuesFound: 5,
    status: "completed" as const,
  },
  {
    id: "4",
    date: "2024-12-07T16:45:00Z",
    url: "https://luxebrand.com/checkout",
    personaMix: "Mobile Heavy",
    score: 55,
    previousScore: 52,
    change: 3,
    issuesFound: 7,
    status: "completed" as const,
  },
  {
    id: "5",
    date: "2024-11-30T11:20:00Z",
    url: "https://luxebrand.com/checkout",
    personaMix: "Skeptical",
    score: 52,
    previousScore: 48,
    change: 4,
    issuesFound: 8,
    status: "completed" as const,
  },
]

export const mockFrictionPoints = {
  critical: [
    {
      id: "f1",
      title: "Shipping costs hidden until checkout",
      location: "Checkout → Shipping",
      impact: "~23% abandonment",
      affected: "Price-sensitive shoppers",
      fix: "Add a shipping calculator on the product page so customers know the total cost before reaching checkout.",
    },
  ],
  high: [
    {
      id: "f2",
      title: "No Apple Pay or Shop Pay",
      location: "Checkout → Payment",
      impact: "~15% mobile abandonment",
      affected: "Mobile impulse buyers",
      fix: "Enable Apple Pay and Shop Pay to reduce friction for mobile users who don't want to type card details.",
    },
    {
      id: "f3",
      title: "Guest checkout buried",
      location: "Checkout → Account",
      impact: "~12% abandonment",
      affected: "First-time visitors",
      fix: "Make guest checkout the default option, with account creation as an optional step after purchase.",
    },
  ],
  medium: [
    {
      id: "f4",
      title: "Return policy not visible",
      location: "Checkout → Review",
      impact: "~8% hesitation",
      affected: "Skeptical shoppers",
      fix: "Add a clear return policy summary near the purchase button to build trust.",
    },
  ],
  working: [
    "Clear product images in cart",
    "Trust badges visible above fold",
    "Mobile responsive checkout",
    "Progress indicator present",
    "Order summary always visible",
  ],
}

export const mockPersonaResults = [
  {
    id: "p1",
    name: "Budget-Conscious Parent",
    demographics: "Age 34 • $65K • Mobile",
    verdict: "abandon" as const,
    reasoning:
      "I was ready to buy until I saw $12 shipping on a $49 item. That's 24% more than expected. I'll look elsewhere.",
    abandonPoint: "Shipping page",
  },
  {
    id: "p2",
    name: "Impulse Buyer",
    demographics: "Age 26 • $85K • Mobile",
    verdict: "abandon" as const,
    reasoning: "No Apple Pay? I'm not typing my card number on this tiny screen. Too slow, moving on.",
    abandonPoint: "Payment page",
  },
  {
    id: "p3",
    name: "Skeptical Researcher",
    demographics: "Age 45 • $120K • Desktop",
    verdict: "purchase" as const,
    reasoning:
      "Reviews look legitimate. Return policy is clear once I found it. Trust badges helped. I'd complete this purchase.",
    abandonPoint: null,
  },
  {
    id: "p4",
    name: "Busy Professional",
    demographics: "Age 38 • $150K • Mobile",
    verdict: "purchase" as const,
    reasoning: "It's not perfect but the product is what I need. Shipping is annoying but acceptable for the quality.",
    abandonPoint: null,
  },
  {
    id: "p5",
    name: "First-Time Visitor",
    demographics: "Age 29 • $55K • Mobile",
    verdict: "abandon" as const,
    reasoning: "Why do I need to create an account just to buy one thing? I'll find this product somewhere else.",
    abandonPoint: "Account page",
  },
]

export const mockRecommendations = [
  {
    priority: 1,
    title: "Add shipping calculator to product page",
    impact: "+12-18% conversion",
    effort: "low" as const,
    description:
      "Display estimated shipping costs on the product page before customers add to cart. Use their detected location or let them enter a zip code.",
  },
  {
    priority: 2,
    title: "Enable Apple Pay and Shop Pay",
    impact: "+8-15% mobile conversion",
    effort: "low" as const,
    description: "Integrate accelerated checkout options. Most Shopify themes support this with minimal configuration.",
  },
  {
    priority: 3,
    title: "Make guest checkout default",
    impact: "+5-10% conversion",
    effort: "low" as const,
    description:
      "Remove the account creation wall. Offer account creation as an optional step after purchase completion.",
  },
  {
    priority: 4,
    title: "Add return policy to checkout",
    impact: "+3-6% conversion",
    effort: "low" as const,
    description: "Display a concise return policy summary near the purchase button. Link to full policy for details.",
  },
]

export const mockFunnelData = {
  landed: 1000,
  cart: 680,
  checkout: 450,
  purchased: 302,
}

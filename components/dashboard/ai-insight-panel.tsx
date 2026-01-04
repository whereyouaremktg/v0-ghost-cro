"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { TestResult } from "@/lib/types"
import type { RevenueLeakResult } from "@/lib/ghostEngine"

interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIInsightPanelProps {
  latestTestResult?: TestResult | null
  revenueLeak: RevenueLeakResult
}

const SUGGESTED_QUESTIONS = [
  "Why are shoppers dropping at shipping?",
  "What are my top 3 friction points?",
  "How do I reduce my money leak?",
]

export function AIInsightPanel({ latestTestResult, revenueLeak }: AIInsightPanelProps) {
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase()

    // Shipping keyword matching
    if (lowerQuestion.includes("shipping")) {
      const shippingIssues = latestTestResult?.frictionPoints.critical
        .concat(latestTestResult?.frictionPoints.high || [])
        .filter((fp) => fp.location.toLowerCase().includes("shipping") || fp.title.toLowerCase().includes("shipping"))

      if (shippingIssues && shippingIssues.length > 0) {
        return `Based on your latest scan, I found ${shippingIssues.length} shipping-related friction point${shippingIssues.length > 1 ? "s" : ""}:\n\n${shippingIssues
          .slice(0, 3)
          .map((issue, i) => `${i + 1}. **${issue.title}**\n   - Location: ${issue.location}\n   - Impact: ${issue.impact}\n   - Fix: ${issue.fix}`)
          .join("\n\n")}\n\n**Quick wins:** Add a shipping calculator on product pages, show estimated costs early, and offer free shipping thresholds. These changes typically reduce shipping-related abandonment by 15-25%.`
      }
      return `Shipping friction is a common checkout killer. Based on industry data, 23% of shoppers abandon when shipping costs are hidden until checkout.\n\n**Recommended fixes:**\n1. Add shipping calculator to product pages\n2. Show estimated shipping costs in cart\n3. Offer free shipping thresholds (e.g., "Free shipping over $50")\n4. Display shipping options early in the checkout flow\n\nThese changes can reduce shipping abandonment by 15-25%.`
    }

    // Trust/reviews keyword matching
    if (lowerQuestion.includes("trust") || lowerQuestion.includes("review")) {
      const trustIssues = latestTestResult?.frictionPoints.critical
        .concat(latestTestResult?.frictionPoints.high || [])
        .filter((fp) => fp.title.toLowerCase().includes("trust") || fp.title.toLowerCase().includes("review") || fp.title.toLowerCase().includes("security"))

      if (trustIssues && trustIssues.length > 0) {
        return `I found ${trustIssues.length} trust-related issue${trustIssues.length > 1 ? "s" : ""} in your checkout:\n\n${trustIssues
          .slice(0, 3)
          .map((issue, i) => `${i + 1}. **${issue.title}**\n   - ${issue.fix}`)
          .join("\n\n")}\n\n**Trust signal best practices:**\n- Display security badges (SSL, payment icons) above the fold\n- Show customer reviews/ratings on product pages\n- Add a clear return policy link near checkout\n- Display trust badges (money-back guarantee, secure checkout)\n- Show social proof (recent purchases, customer count)\n\nThese signals can increase conversion by 8-15%.`
      }
      return `Trust signals are critical for converting first-time visitors. Based on your checkout analysis:\n\n**Essential trust elements:**\n1. **Security badges** - Display SSL, payment method icons (Visa, Mastercard, etc.)\n2. **Customer reviews** - Show ratings and review counts on product pages\n3. **Return policy** - Make it visible and clear (30-day returns, free exchanges)\n4. **Social proof** - "Join 10,000+ happy customers" or recent purchase notifications\n5. **Guarantees** - Money-back guarantee, satisfaction promise\n\n**Impact:** Adding these trust signals typically increases conversion by 8-15%, especially for new visitors.`
    }

    // Top friction points
    if (lowerQuestion.includes("friction") || lowerQuestion.includes("top") || lowerQuestion.includes("issue")) {
      if (latestTestResult) {
        const critical = latestTestResult.frictionPoints.critical
        const high = latestTestResult.frictionPoints.high
        const topIssues = [...critical, ...high].slice(0, 3)

        if (topIssues.length > 0) {
          return `Here are your top ${topIssues.length} friction points from your latest scan:\n\n${topIssues
            .map((issue, i) => `${i + 1}. **${issue.title}**\n   - Severity: ${critical.includes(issue) ? "Critical" : "High"}\n   - Location: ${issue.location}\n   - Impact: ${issue.impact}\n   - Fix: ${issue.fix}`)
            .join("\n\n")}\n\n**Priority order:** Start with critical issues first, as they have the highest abandonment impact. Fixing these can reduce your money leak by 20-40%.`
        }
      }
      return `I don't have your latest scan results yet. Run a scan to get personalized friction point analysis.\n\n**Common top friction points:**\n1. Hidden shipping costs\n2. Forced account creation\n3. Missing payment options (Apple Pay, Shop Pay)\n4. Unclear return policy\n5. Mobile checkout friction\n\nRun a scan to see which ones affect your store specifically.`
    }

    // Money leak question
    if (lowerQuestion.includes("money leak") || lowerQuestion.includes("revenue") || lowerQuestion.includes("leak")) {
      if (revenueLeak.daily > 0) {
        return `Based on your latest scan and current metrics, you're losing:\n\n**Daily:** $${revenueLeak.daily.toLocaleString()}\n**Weekly:** $${revenueLeak.weekly.toLocaleString()}\n**Monthly:** $${revenueLeak.monthly.toLocaleString()}\n\n**To reduce your money leak:**\n1. Fix critical friction points first (highest impact)\n2. Add trust signals to reduce hesitation\n3. Optimize shipping transparency\n4. Enable accelerated checkout (Apple Pay, Shop Pay)\n5. Simplify the checkout flow\n\n**Expected impact:** Fixing your top 3 friction points could reduce leak by 30-50%, saving you $${Math.round(revenueLeak.monthly * 0.4).toLocaleString()}-$${Math.round(revenueLeak.monthly * 0.5).toLocaleString()} per month.`
      }
      return `Your money leak calculation requires scan data. Once you run a scan, I'll show you:\n\n- Daily revenue lost to friction\n- Weekly and monthly projections\n- Specific fixes to reduce the leak\n\n**Typical leaks:** Most stores lose 15-30% of potential revenue to checkout friction. Common culprits include hidden shipping costs, forced account creation, and missing payment options.`
    }

    // General summary (default response)
    if (latestTestResult) {
      const score = latestTestResult.score
      const criticalCount = latestTestResult.frictionPoints.critical.length
      const highCount = latestTestResult.frictionPoints.high.length
      const totalIssues = criticalCount + highCount + latestTestResult.frictionPoints.medium.length

      return `Based on your latest scan:\n\n**Checkout Score:** ${score}/100\n**Friction Points Found:** ${totalIssues} (${criticalCount} critical, ${highCount} high priority)\n\n**Current Money Leak:**\n- Daily: $${revenueLeak.daily.toLocaleString()}\n- Monthly: $${revenueLeak.monthly.toLocaleString()}\n\n**Top Priority:** Focus on your ${criticalCount} critical issue${criticalCount !== 1 ? "s" : ""} first. These have the highest abandonment impact.\n\n**Quick Wins:**\n1. Fix critical friction points\n2. Add trust signals\n3. Improve shipping transparency\n\nWant to dive deeper? Ask me about specific friction points, shipping, trust signals, or how to reduce your money leak.`
    }

    return `Hi! I'm Ghost, your checkout optimization assistant.\n\nI can help you:\n- Understand your checkout friction points\n- Identify revenue leaks\n- Get specific fix recommendations\n- Answer questions about shipping, trust signals, and more\n\n**Get started:** Run a scan to get personalized insights, or ask me a question using the suggested prompts below.`
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content)
      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 500)
  }

  const handleSuggestedQuestion = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-card/30 border border-border/20 rounded-2xl shadow-sm animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-4 border-b border-border/20">
        <div className="p-1.5 bg-muted/50 border border-border/30 rounded-lg">
          <Sparkles className="h-4 w-4 text-muted-foreground" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-medium tracking-tight">Ask Ghost</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-muted/50 border border-border/30 rounded-full mb-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">Ask me about your checkout</p>
            <div className="space-y-1.5">
              {SUGGESTED_QUESTIONS.map((question, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="block w-full text-left px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground border border-border/30"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-muted/50 border border-border/30 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions (when messages exist) */}
      {messages.length > 0 && (
        <div className="px-4 pb-2 border-t border-border/20 pt-3 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestion(question)}
                className="text-xs px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/20">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your checkout..."
            disabled={isLoading}
            className="flex-1 bg-muted/30 border-border/30 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-blue-500/50 dark:focus-visible:ring-blue-400/50 transition-all"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="default"
            className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 text-black rounded-full transition-all"
          >
            <Send className="h-4 w-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}


import { z } from "zod"

export const AnalyzeRequestSchema = z.object({
  url: z.string().url().optional(),
  personaMix: z
    .enum(["balanced", "price-sensitive", "skeptical", "mobile-heavy"])
    .optional(),
  category: z.string().optional(),
  config: z
    .object({
      analyzeTheme: z.boolean().default(true),
      analyzeCheckout: z.boolean().default(false),
      analyzeSpeed: z.boolean().default(true),
    })
    .optional(),
})

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>

import { z } from "zod"

export const BillingRequestSchema = z.object({
  plan: z.enum(["starter", "growth", "scale"]),
})

export type BillingRequest = z.infer<typeof BillingRequestSchema>

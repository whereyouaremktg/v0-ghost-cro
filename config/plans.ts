/**
 * Billing plan definitions.
 */

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    testsLimit: 1,
    trialDays: 0,
  },
  starter: {
    name: "Starter",
    price: 49,
    testsLimit: 5,
    trialDays: 7,
  },
  growth: {
    name: "Growth",
    price: 99,
    testsLimit: 15,
    trialDays: 7,
  },
  scale: {
    name: "Scale",
    price: 150,
    testsLimit: 999,
    trialDays: 7,
  },
} as const

export type PlanKey = keyof typeof PLANS

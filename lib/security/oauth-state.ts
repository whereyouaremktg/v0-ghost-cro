import crypto from "crypto"

/**
 * Generate a cryptographically secure OAuth state parameter.
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Validate OAuth state using timing-safe comparison.
 */
export function validateOAuthState(stored: string, received: string): boolean {
  if (!stored || !received || stored.length !== received.length) {
    return false
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(stored, "utf8"),
      Buffer.from(received, "utf8")
    )
  } catch {
    return false
  }
}

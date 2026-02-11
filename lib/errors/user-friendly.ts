/**
 * Map technical error messages to user-friendly strings.
 */

const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials":
    "Incorrect email or password. Please try again.",
  "User already registered":
    "An account with this email already exists. Try logging in.",
  "Email not confirmed":
    "Please check your email and click the confirmation link.",
  "Password should be at least 6 characters":
    "Password must be at least 6 characters.",
  "Email rate limit exceeded":
    "Too many attempts. Please wait a minute and try again.",
  "For security purposes, you can only request this once every 60 seconds":
    "Too many attempts. Please wait a minute and try again.",
}

export function mapAuthError(error: { message: string; code?: string }): string {
  if (
    error.code === "over_request_rate_limit" ||
    error.code === "over_email_send_rate_limit" ||
    error.code === "too_many_requests"
  ) {
    return "Too many attempts. Please wait a minute and try again."
  }

  if (!error.message) return "Something went wrong. Please try again."

  // Check exact matches
  if (AUTH_ERROR_MAP[error.message]) {
    return AUTH_ERROR_MAP[error.message]
  }

  // Check partial matches
  for (const [key, value] of Object.entries(AUTH_ERROR_MAP)) {
    if (error.message.toLowerCase().includes(key.toLowerCase())) {
      return value
    }
  }

  // Default
  return "Something went wrong. Please try again."
}

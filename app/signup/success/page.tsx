import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border-2 border-border brutal-shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 border-2 border-primary flex items-center justify-center">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">Check Your Email</h1>
          <p className="text-muted-foreground mb-6">
            We sent you a confirmation link. Please check your email to verify your account before signing in.
          </p>

          <Link
            href="/login"
            className="inline-block w-full py-4 bg-primary text-primary-foreground font-bold uppercase tracking-wide text-sm border-2 border-border brutal-shadow brutal-hover"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

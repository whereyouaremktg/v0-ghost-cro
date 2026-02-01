import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { SupabaseSetupPrompt } from "@/components/supabase-setup-prompt"
import "./globals.css"

export const metadata: Metadata = {
  title: "Ghost CRO — AI Checkout Analysis for Shopify",
  description:
    "AI analyzes your checkout like 1,000 real shoppers would. Get actionable fixes in 5 minutes, not 5 weeks.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  if (!isSupabaseConfigured()) {
    return (
      <html lang="en">
        <body className="font-sans antialiased" suppressHydrationWarning>
          <SupabaseSetupPrompt />
          <Analytics />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

import type { Metadata } from "next"
import localFont from "next/font/local"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ghost CRO — Silent Optimization for Shopify",
  description: "AI-powered conversion rate optimization for Shopify stores. Find revenue leaks, get production-ready fixes, and monitor your store health.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[hsl(var(--surface-0))] text-[hsl(var(--text-primary))] antialiased`}
      >
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "hsl(var(--surface-1))",
              border: "1px solid hsl(var(--border-default))",
              color: "hsl(var(--text-primary))",
            },
          }}
        />
      </body>
    </html>
  )
}

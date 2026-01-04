"use client"

import Link from "next/link"
import { Ghost, Twitter, Linkedin, Github } from "lucide-react"

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "API", href: "#" },
    { label: "Status", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Customers", href: "#social-proof" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-gray-50">
                <Ghost className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-semibold text-gray-900 tracking-tight">
                Ghost<span className="text-gray-500">CRO</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 mb-4">AI-powered CRO for Shopify</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Twitter className="h-5 w-5" strokeWidth={2} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Linkedin className="h-5 w-5" strokeWidth={2} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                <Github className="h-5 w-5" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Company */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © 2026 Ghost CRO. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}





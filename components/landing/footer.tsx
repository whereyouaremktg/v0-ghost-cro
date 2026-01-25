import Link from 'next/link'
import { GhostLogo } from '@/components/ghost-logo'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Integrations', href: '#integrations' },
    { label: 'Enterprise', href: '#enterprise' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Security', href: '/security' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-bg)]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <GhostLogo size="sm" />
              <span className="font-bold text-[var(--landing-text-primary)]">GhostCRO</span>
            </Link>
            <p className="text-sm text-[var(--landing-text-muted)] max-w-xs leading-relaxed">
              The silent revenue optimization engine for Shopify. Find and fix conversion leaks without slowing down your store.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-xs uppercase tracking-widest text-[var(--landing-text-secondary)] mb-4">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--landing-border)] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[var(--landing-text-muted)]">
            &copy; {new Date().getFullYear()} GhostCRO Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors text-sm"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors text-sm"
            >
              LinkedIn
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--landing-text-muted)] hover:text-[var(--landing-text-primary)] transition-colors text-sm"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

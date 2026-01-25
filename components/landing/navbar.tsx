'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GhostLogo } from '@/components/ghost-logo'
import { GhostButton } from '@/components/ui/ghost-button'
import { Menu, X, ArrowRight } from 'lucide-react'

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it Works' },
  { href: '#pricing', label: 'Pricing' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 h-20',
        'transition-all duration-300',
        isScrolled
          ? 'bg-[var(--landing-bg)]/80 backdrop-blur-xl border-b border-[var(--landing-border)]'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <GhostLogo size="md" />
          <span className="text-xl font-bold text-[var(--landing-text-primary)]">
            GhostCRO
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <GhostButton variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </GhostButton>
          <GhostButton size="sm" asChild>
            <Link href="/signup">
              Start Optimizing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </GhostButton>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[var(--landing-text-secondary)]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[var(--landing-surface)] border-b border-[var(--landing-border)]"
          >
            <div className="px-6 py-4 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-4 space-y-2">
                <GhostButton variant="outline" className="w-full" asChild>
                  <Link href="/login">Log in</Link>
                </GhostButton>
                <GhostButton className="w-full" asChild>
                  <Link href="/signup">Start Optimizing</Link>
                </GhostButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

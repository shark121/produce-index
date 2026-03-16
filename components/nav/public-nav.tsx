'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Leaf, Menu, X } from 'lucide-react'

const links = [
  { href: '/for-institutions', label: 'For Institutions' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/for-farmers', label: 'For Farmers' },
  { href: '/for-partners', label: 'For Produce Buyers' },
  { href: '/marketplace', label: 'Marketplace' },
]

export function PublicNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 glass border-b border-[rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#1C1C1E]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#34C759]">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-base">PRI</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-sm transition-colors',
                active
                  ? 'bg-[rgba(0,0,0,0.06)] text-[#1C1C1E] font-medium'
                  : 'text-[#48484A] hover:text-[#1C1C1E] hover:bg-[rgba(0,0,0,0.04)]',
              )}
            >
              {label}
            </Link>
            )
          })}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/apply">Request Pilot Access</Link>
          </Button>
        </div>

        {/* Mobile: Log in + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[#48484A] hover:bg-[rgba(0,0,0,0.06)] transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="md:hidden border-t border-[rgba(0,0,0,0.06)] px-4 py-3 space-y-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'block px-3 py-2.5 rounded-[10px] text-sm transition-colors',
                active
                  ? 'bg-[rgba(0,0,0,0.06)] text-[#1C1C1E] font-medium'
                  : 'text-[#48484A] hover:bg-[rgba(0,0,0,0.04)]',
              )}
            >
              {label}
            </Link>
            )
          })}
          <div className="pt-2 pb-1">
            <Button size="sm" className="w-full" asChild>
              <Link href="/apply" onClick={() => setOpen(false)}>Request Pilot Access</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

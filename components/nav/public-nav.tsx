'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Leaf } from 'lucide-react'

const links = [
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/for-farmers', label: 'For Farmers' },
  { href: '/for-partners', label: 'For Partners' },
]

export function PublicNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 glass border-b border-[rgba(0,0,0,0.08)]">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-[#1C1C1E]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#34C759]">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <span className="text-base">PRI</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-[8px] text-sm transition-colors',
                pathname === href
                  ? 'bg-[rgba(0,0,0,0.06)] text-[#1C1C1E] font-medium'
                  : 'text-[#48484A] hover:text-[#1C1C1E] hover:bg-[rgba(0,0,0,0.04)]',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/apply">Apply to Pilot</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Leaf } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface SidebarProps {
  items: NavItem[]
  role: 'farmer' | 'partner' | 'admin'
  userName?: string
}

export function Sidebar({ items, role, userName }: SidebarProps) {
  const pathname = usePathname()

  const roleLabel = {
    farmer: 'Farmer Portal',
    partner: 'Partner Portal',
    admin: 'Admin Console',
  }[role]

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-60 flex-col glass border-r border-[rgba(0,0,0,0.08)]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[rgba(0,0,0,0.06)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#34C759] shrink-0">
            <Leaf className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1C1C1E] leading-none">PRI</p>
            <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-none truncate">{roleLabel}</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm transition-all duration-150',
                  active
                    ? 'bg-[rgba(52,199,89,0.12)] text-[#1A7A32] font-medium'
                    : 'text-[#48484A] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1C1C1E]',
                )}
              >
                <Icon
                  className={cn('h-4 w-4 shrink-0', active ? 'text-[#34C759]' : 'text-[#8E8E93]')}
                />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        {userName && (
          <div className="px-4 py-4 border-t border-[rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-[rgba(52,199,89,0.20)] flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-[#1A7A32]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-[#1C1C1E] font-medium truncate">{userName}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 glass border-b border-[rgba(0,0,0,0.08)] h-14 flex items-center px-4 gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#34C759] shrink-0">
          <Leaf className="h-3.5 w-3.5 text-white" />
        </div>
        <p className="text-sm font-semibold text-[#1C1C1E] flex-1">PRI · {roleLabel}</p>
        {userName && (
          <div className="h-7 w-7 rounded-full bg-[rgba(52,199,89,0.20)] flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-[#1A7A32]">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around h-16 px-1 pb-[env(safe-area-inset-bottom)]">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-2 px-3 min-w-0"
              >
                <Icon
                  className={cn('h-5 w-5 shrink-0', active ? 'text-[#34C759]' : 'text-[#8E8E93]')}
                />
                <span
                  className={cn(
                    'text-[10px] leading-none truncate max-w-[56px] text-center',
                    active ? 'text-[#1A7A32] font-semibold' : 'text-[#8E8E93]',
                  )}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}

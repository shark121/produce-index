'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Leaf, Menu, X } from 'lucide-react'
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
  const [mobileOpen, setMobileOpen] = useState(false)

  const roleLabel = {
    farmer: 'Farmer Portal',
    partner: 'Partner Portal',
    admin: 'Admin Console',
  }[role]

  useEffect(() => {
    if (!mobileOpen) return undefined

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [mobileOpen])

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
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-[rgba(0,0,0,0.08)] bg-white/70 text-[#1C1C1E] transition-colors hover:bg-white"
          aria-label={mobileOpen ? 'Collapse side panel' : 'Expand side panel'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar-panel"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
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

      {/* Mobile side panel */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 transition-opacity duration-200',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!mobileOpen}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[rgba(15,23,42,0.28)]"
          onClick={() => setMobileOpen(false)}
          aria-label="Close side panel"
        />

        <aside
          id="mobile-sidebar-panel"
          className={cn(
            'absolute inset-y-0 left-0 flex w-[min(86vw,20rem)] flex-col border-r border-[rgba(0,0,0,0.08)] bg-[rgba(255,255,255,0.96)] shadow-[0_24px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center gap-3 border-b border-[rgba(0,0,0,0.06)] px-4 h-14">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#34C759] shrink-0">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#1C1C1E] leading-none">PRI</p>
              <p className="mt-0.5 truncate text-[11px] leading-none text-[#8E8E93]">{roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-[9px] text-[#48484A] transition-colors hover:bg-[rgba(0,0,0,0.05)]"
              aria-label="Collapse side panel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-[10px] px-3 py-3 text-sm transition-all duration-150',
                    active
                      ? 'bg-[rgba(52,199,89,0.12)] text-[#1A7A32] font-medium'
                      : 'text-[#48484A] hover:bg-[rgba(0,0,0,0.05)] hover:text-[#1C1C1E]',
                  )}
                >
                  <Icon
                    className={cn('h-4 w-4 shrink-0', active ? 'text-[#34C759]' : 'text-[#8E8E93]')}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              )
            })}
          </nav>

          {userName && (
            <div className="border-t border-[rgba(0,0,0,0.06)] px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(52,199,89,0.20)]">
                  <span className="text-xs font-semibold text-[#1A7A32]">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-[#1C1C1E]">{userName}</p>
              </div>
            </div>
          )}
        </aside>
      </div>

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

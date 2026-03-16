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
    <aside className="fixed inset-y-0 left-0 z-30 w-60 flex flex-col glass border-r border-[rgba(0,0,0,0.08)]">
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
  )
}

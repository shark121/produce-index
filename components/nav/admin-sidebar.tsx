'use client'

import { Sidebar } from './sidebar'
import { ClipboardList, MapPin, SlidersHorizontal, TrendingUp } from 'lucide-react'

const adminNav = [
  { href: '/admin',            label: 'Review Queue', icon: ClipboardList },
  { href: '/admin/benchmarks', label: 'Benchmarks',   icon: MapPin },
  { href: '/admin/scoring',    label: 'Scoring',      icon: SlidersHorizontal },
  { href: '/admin/analytics',  label: 'Analytics',    icon: TrendingUp },
]

export function AdminSidebar({ userName }: { userName: string }) {
  return <Sidebar items={adminNav} role="admin" userName={userName} />
}

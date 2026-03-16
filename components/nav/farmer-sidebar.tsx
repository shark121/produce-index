'use client'

import { Sidebar } from './sidebar'
import { LayoutDashboard, Sprout, FileText, BarChart3, Lightbulb, Store } from 'lucide-react'

const farmerNav = [
  { href: '/farmer',                 label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/farmer/farm',            label: 'My Farm',         icon: Sprout },
  { href: '/farmer/marketplace',     label: 'Marketplace',     icon: Store },
  { href: '/farmer/submissions',     label: 'Submissions',     icon: FileText },
  { href: '/farmer/score',           label: 'PRI Score',       icon: BarChart3 },
  { href: '/farmer/recommendations', label: 'Recommendations', icon: Lightbulb },
]

export function FarmerSidebar({ userName }: { userName: string }) {
  return <Sidebar items={farmerNav} role="farmer" userName={userName} />
}

'use client'

import { Sidebar } from './sidebar'
import { BookOpen, Star, FileBarChart, Handshake } from 'lucide-react'

const partnerNav = [
  { href: '/partner',           label: 'Directory',    icon: BookOpen },
  { href: '/partner/compare',   label: 'Compare',      icon: Star },
  { href: '/partner/reports',   label: 'Reports',      icon: FileBarChart },
  { href: '/partner/interests', label: 'My Interests', icon: Handshake },
]

export function PartnerSidebar({ userName }: { userName: string }) {
  return <Sidebar items={partnerNav} role="partner" userName={userName} />
}

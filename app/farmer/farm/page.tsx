import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Sprout, DollarSign, Truck, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'My Farm' }

const sections = [
  {
    href: '/farmer/farm/crops',
    icon: Sprout,
    label: 'Crops',
    desc: 'Crop varieties, annual yield, certifications, and seasonal availability',
  },
  {
    href: '/farmer/farm/pricing',
    icon: DollarSign,
    label: 'Pricing',
    desc: 'Price per unit, SNAP acceptance, sliding scale options',
  },
  {
    href: '/farmer/farm/distribution',
    icon: Truck,
    label: 'Distribution',
    desc: 'Sales channels, distances, percentage of sales by channel',
  },
  {
    href: '/farmer/farm/safety',
    icon: ShieldCheck,
    label: 'Safety Practices',
    desc: 'Pesticide use, water handling, certifications, and documentation',
  },
]

export default function MyFarmPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">My Farm</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Keep your farm profile complete and up to date. This data feeds directly into your PRI score.
        </p>
      </div>

      {/* Farm profile form — basic info */}
      <div className="surface-elevated rounded-[20px] p-6">
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Basic Information</h2>
        {/* TODO: FarmProfileForm component */}
        <p className="text-sm text-[#8E8E93]">Farm profile form coming in Sprint 2.</p>
      </div>

      {/* Section links */}
      <div>
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Profile sections</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {sections.map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="surface-elevated rounded-[14px] p-5 flex items-start gap-4 group hover:border-[rgba(52,199,89,0.30)] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[8px] bg-[rgba(52,199,89,0.10)] shrink-0">
                <Icon className="h-4 w-4 text-[#34C759]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1C1C1E]">{label}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#C7C7CC] group-hover:text-[#34C759] mt-0.5 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNav } from '@/components/nav/public-nav'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, Filter, GitCompare, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'For Partners' }

export default function ForPartnersPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-4xl font-bold text-[#1C1C1E] tracking-tight mb-4">For Partners</h1>
        <p className="text-xl text-[#48484A] leading-relaxed mb-16 max-w-2xl">
          Source confidently from farms you can trust. PRI gives you a standardized, independently
          verified lens on the farms in your region.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mb-16">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified farms only',
              body: 'The partner directory only shows farms that have completed manual evidence review. No self-reported scores.',
            },
            {
              icon: Filter,
              title: 'Filter by what matters to you',
              body: 'Search by region, score tier, crop type, certifications, and distribution channels.',
            },
            {
              icon: GitCompare,
              title: 'Compare side by side',
              body: 'Select multiple farms and see their full scorecard breakdown in a comparison table.',
            },
            {
              icon: Download,
              title: 'Export reports',
              body: 'Generate PDF and CSV reports of farm scorecards for internal procurement and compliance workflows.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface-elevated rounded-[16px] p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(0,122,255,0.10)] mb-4">
                <Icon className="h-5 w-5 text-[#007AFF]" />
              </div>
              <h3 className="text-base font-semibold text-[#1C1C1E] mb-1.5">{title}</h3>
              <p className="text-sm text-[#48484A] leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        <div className="surface-elevated rounded-[20px] p-8 text-center">
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Join the pilot</h2>
          <p className="text-[#48484A] mb-6">
            Partner access is free during the pilot. Apply and we will get you set up with a
            verified account.
          </p>
          <Button size="lg" variant="blue" asChild>
            <Link href="/apply">
              Apply as Partner <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  )
}

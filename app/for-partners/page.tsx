import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicNav } from '@/components/nav/public-nav'
import { Button } from '@/components/ui/button'
import { ArrowRight, Download, Filter, GitCompare, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = { title: 'For Produce Buyers' }

export default function ForPartnersPage() {
  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-4xl px-4 md:px-6 py-12 md:py-20">
        <h1 className="text-4xl font-bold text-[#1C1C1E] tracking-tight mb-4">For Produce Buyers</h1>
        <p className="text-xl text-[#48484A] leading-relaxed mb-16 max-w-2xl">
          PRI helps buyers source from farms with clearer verification, stronger local-access
          signals, and more transparent score provenance.
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
              title: 'Search with smart buyer matching',
              body: 'Filter by PRI score, nutrient profile, fulfillment method, and affordability signals to shortlist relevant verified farms.',
            },
            {
              icon: GitCompare,
              title: 'Compare scorecards side by side',
              body: 'Put multiple verified farms in one comparison view and review category scores, confidence, and financing readiness together.',
            },
            {
              icon: Download,
              title: 'See what is coming next',
              body: 'Export workflows are on the roadmap. Today the strongest buyer tools are live search, compare, and detailed farm scorecards.',
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
          <h2 className="text-2xl font-bold text-[#1C1C1E] mb-2">Request buyer access</h2>
          <p className="text-[#48484A] mb-6">
            Buyer access is free during the pilot. Apply and we will get you set up with verified
            scorecards, smart match filters, and the Health-Aware Produce Exchange.
          </p>
          <Button size="lg" variant="blue" asChild>
            <Link href="/apply">
              Request Buyer Access <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock3, FileStack, GitCompare, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Export Roadmap</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Search, compare, and detailed scorecards are live now. Export workflows are explicitly
          staged for a later milestone.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="surface-elevated rounded-[18px] p-5">
          <Badge variant="green">Live now</Badge>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(52,199,89,0.12)]">
              <Search className="h-4 w-4 text-[#34C759]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1C1C1E]">Verified farm search</p>
              <p className="text-xs text-[#8E8E93]">Find farms by name, region, crop, and score threshold.</p>
            </div>
          </div>
          <Button className="mt-5" variant="secondary" asChild>
            <Link href="/partner">Open directory</Link>
          </Button>
        </div>

        <div className="surface-elevated rounded-[18px] p-5">
          <Badge variant="green">Live now</Badge>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(0,122,255,0.10)]">
              <GitCompare className="h-4 w-4 text-[#007AFF]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1C1C1E]">Side-by-side comparison</p>
              <p className="text-xs text-[#8E8E93]">Compare category scores, evidence coverage, and financing readiness.</p>
            </div>
          </div>
          <Button className="mt-5" variant="secondary" asChild>
            <Link href="/partner/compare">Open compare view</Link>
          </Button>
        </div>

        <div className="surface-elevated rounded-[18px] p-5">
          <Badge variant="orange">Coming soon</Badge>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(255,149,0,0.12)]">
              <FileStack className="h-4 w-4 text-[#FF9500]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1C1C1E]">Institution lender brief export</p>
              <p className="text-xs text-[#8E8E93]">PDF packet with score trend, benchmark delta, and verification confidence.</p>
            </div>
          </div>
        </div>

        <div className="surface-elevated rounded-[18px] p-5">
          <Badge variant="orange">Coming soon</Badge>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[rgba(255,149,0,0.12)]">
              <Clock3 className="h-4 w-4 text-[#FF9500]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1C1C1E]">Cohort export packages</p>
              <p className="text-xs text-[#8E8E93]">Program-wide CSV and PDF exports once live partner reporting is enabled.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-elevated rounded-[18px] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#1C1C1E]">Need a printable packet sooner?</p>
          <p className="text-sm text-[#48484A] mt-1">
            Start with the detailed farm scorecard and compare views while export generation is being finalized.
          </p>
        </div>
        <Button asChild>
          <Link href="/partner">
            Go to live tools <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

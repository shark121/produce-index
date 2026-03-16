import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, ArrowRight, Building2, FileCheck2, Map, ShieldCheck } from 'lucide-react'
import { PublicNav } from '@/components/nav/public-nav'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModeNotice } from '@/components/ui/mode-notice'
import { ScoreRing } from '@/components/ui/score-ring'
import { isMockMode } from '@/lib/is-mock-mode'
import { getVerifiedFarmScorecards } from '@/lib/scorecards'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'For Institutions' }

export default function ForInstitutionsPage() {
  const mockMode = isMockMode()
  const featured = getVerifiedFarmScorecards()[0]
  if (!featured) return null

  return (
    <>
      <PublicNav />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-20">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <Badge variant="blue">Institution brief</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[#1C1C1E] md:text-5xl">
              PRI helps institutions decide which farms are truly ready to finance, source from,
              and scale.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#48484A]">
              The platform combines verified farm evidence, versioned regional benchmarks, and a
              transparent PRI score into an institution-facing brief that supports underwriting,
              procurement, and community-health strategy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/apply">
                  Request Pilot Access <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/partner">Browse verified farms</Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/marketplace">Explore the exchange</Link>
              </Button>
            </div>
          </div>

          <div className="surface-elevated rounded-[28px] p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8E8E93]">Featured lender packet</p>
                <h2 className="mt-2 text-2xl font-bold text-[#1C1C1E]">{featured.farm.name}</h2>
                <p className="mt-1 text-sm text-[#48484A]">
                  Reviewed {formatDate(featured.scoreProvenance.reviewedAt)} · {featured.scoreProvenance.benchmarkVersion}
                </p>
              </div>
              <ScoreRing score={featured.score.overallScore} size="lg" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[rgba(0,122,255,0.08)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Financing readiness</p>
                <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">{featured.financingReadiness.label}</p>
                <p className="mt-1 text-sm text-[#48484A]">{featured.financingReadiness.benchmarkDelta}</p>
              </div>
              <div className="rounded-[18px] bg-[rgba(52,199,89,0.08)] p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Verification confidence</p>
                <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">
                  {featured.verificationConfidence.score}/100
                </p>
                <p className="mt-1 text-sm text-[#48484A]">
                  {featured.verificationConfidence.evidenceCoveragePct}% evidence coverage
                </p>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[#48484A]">
              {featured.financingReadiness.lenderSummary}
            </p>
          </div>
        </section>

        {mockMode && (
          <section className="mt-8">
            <ModeNotice
              title="This institution brief is fully navigable in demo mode."
              body="The featured scorecards, compare flow, and intake form all persist or render against explicit demo records until Supabase is configured."
            />
          </section>
        )}

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: FileCheck2,
              title: 'Use PRI in underwriting',
              body: 'Bring one verified packet into diligence: PRI score, evidence coverage, category notes, and benchmark context.',
            },
            {
              icon: Building2,
              title: 'Use PRI in procurement',
              body: 'Find farms with stronger safety, local-access reach, seasonality confidence, and smart nutrient-profile matching before contract conversations start.',
            },
            {
              icon: Activity,
              title: 'Use PRI in health strategy',
              body: 'Track how verified produce supply maps to healthy-servings estimates and low-income-serving distribution channels.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="surface-elevated rounded-[22px] p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-[rgba(52,199,89,0.12)]">
                <Icon className="h-5 w-5 text-[#34C759]" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#1C1C1E]">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#48484A]">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface-elevated rounded-[24px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#34C759]">Verification proof</p>
            <div className="mt-5 space-y-4">
              {[
                'Category scores are manually reviewed and versioned.',
                'Regional benchmark version is shown with every published scorecard.',
                'Evidence coverage is exposed instead of hidden behind a single score.',
                'Health-impact and financing-readiness signals are derived from the same record.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(52,199,89,0.12)]">
                    <ShieldCheck className="h-4 w-4 text-[#34C759]" />
                  </div>
                  <p className="text-sm leading-relaxed text-[#48484A]">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-elevated rounded-[24px] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007AFF]">Near-term unique features</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                'Financing readiness packet',
                'Community coverage map',
                'Health impact ledger',
                'Seasonal reliability forecast',
              ].map((item) => (
                <div key={item} className="rounded-[18px] bg-[rgba(0,0,0,0.03)] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1C1E]">
                    <Map className="h-4 w-4 text-[#007AFF]" />
                    {item}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
                    Designed to give institutions a clearer “why this farm matters” signal than a
                    score alone can provide.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

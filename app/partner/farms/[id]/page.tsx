import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, MapPin, Sprout, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExpressInterestCard } from '@/components/partner/express-interest-card'
import { ModeNotice } from '@/components/ui/mode-notice'
import { ScoreRing } from '@/components/ui/score-ring'
import { isMockMode } from '@/lib/is-mock-mode'
import { getFarmScorecardById } from '@/lib/scorecards'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Farm Scorecard' }

interface Props {
  params: Promise<{ id: string }>
}

const CATEGORIES = [
  { key: 'nutritionalValue' as const, label: 'Nutritional Value', color: '#34C759' },
  { key: 'foodSafety' as const, label: 'Food Safety', color: '#007AFF' },
  { key: 'supplyReliability' as const, label: 'Supply Reliability', color: '#AF52DE' },
  { key: 'localAccessibility' as const, label: 'Local Accessibility', color: '#FF9500' },
  { key: 'affordability' as const, label: 'Affordability', color: '#FF3B30' },
]

const distributionLabel: Record<string, string> = {
  farmers_market: 'Farmers market',
  grocery: 'Grocery',
  food_bank: 'Food bank',
  restaurant: 'Restaurant',
  csa: 'CSA',
  wholesale: 'Wholesale',
  direct_consumer: 'Direct',
}

export default async function FarmScorecardPage({ params }: Props) {
  const { id } = await params
  const scorecard = isMockMode() ? getFarmScorecardById(id) : null

  if (!scorecard) notFound()

  return (
    <div className="space-y-6 animate-fade-up">
      {isMockMode() && (
        <ModeNotice
          title="This institution packet is rendered from explicit demo pilot records."
          body="The confidence, benchmark, and health-impact sections are live so stakeholders can review the complete decision flow even before production data is connected."
        />
      )}

      <div className="surface-elevated rounded-[24px] p-6 md:p-7">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1C1C1E]">{scorecard.farm.name}</h1>
              <Badge variant="green">{scorecard.financingReadiness.label}</Badge>
              <Badge variant="blue">
                Confidence {scorecard.verificationConfidence.score}/100
              </Badge>
            </div>
            <p className="flex items-center gap-1 text-sm text-[#8E8E93]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {scorecard.farm.city}, {scorecard.farm.state} · {scorecard.farm.region}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#48484A]">
              {scorecard.farm.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="orange">
                Evidence {scorecard.verificationConfidence.evidenceCoveragePct}%
              </Badge>
              <Badge>
                Benchmark {scorecard.scoreProvenance.benchmarkVersion}
              </Badge>
              <Badge variant="purple">
                Next season {scorecard.financingReadiness.nextSeasonConfidence}
              </Badge>
            </div>
          </div>
          <ScoreRing score={scorecard.score.overallScore} size="lg" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface-elevated rounded-[18px] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Financing readiness</p>
          <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">{scorecard.financingReadiness.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#48484A]">{scorecard.financingReadiness.lenderSummary}</p>
        </div>
        <div className="surface-elevated rounded-[18px] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Health impact ledger</p>
          <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">
            {scorecard.healthImpactSummary.estimatedHealthyServings.toLocaleString()}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#48484A]">estimated healthy servings annually</p>
        </div>
        <div className="surface-elevated rounded-[18px] p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Verification confidence</p>
          <p className="mt-2 text-lg font-semibold text-[#1C1C1E]">{scorecard.verificationConfidence.label}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#48484A]">
            {scorecard.verificationConfidence.auditedAssets} audited evidence checkpoints reviewed on{' '}
            {formatDate(scorecard.verificationConfidence.lastReviewedAt)}.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface-elevated rounded-[20px] p-5">
          <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Score breakdown</h2>
          <div className="space-y-4">
            {CATEGORIES.map(({ key, label, color }) => {
              const value = scorecard.score[key]
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#1C1C1E]">{label}</span>
                    <span className="font-semibold text-[#1C1C1E]">{value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[rgba(0,0,0,0.06)]">
                    <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="surface-elevated rounded-[20px] p-5">
          <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Score provenance</h2>
          <div className="space-y-3 text-sm text-[#48484A]">
            <div className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Review method</p>
              <p className="mt-1 font-medium text-[#1C1C1E]">{scorecard.scoreProvenance.reviewMethod}</p>
            </div>
            <div className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Versioning</p>
              <p className="mt-1 font-medium text-[#1C1C1E]">
                {scorecard.scoreProvenance.weightsVersion} · {scorecard.scoreProvenance.benchmarkVersion}
              </p>
            </div>
            <div className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Benchmark region</p>
              <p className="mt-1 font-medium text-[#1C1C1E]">{scorecard.scoreProvenance.benchmarkRegion}</p>
              <p className="mt-1">{scorecard.financingReadiness.benchmarkDelta}</p>
            </div>
            <p className="text-xs text-[#8E8E93]">
              Reviewed {formatDate(scorecard.scoreProvenance.reviewedAt)} · Evidence coverage {scorecard.scoreProvenance.evidenceCoveragePct}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface-elevated rounded-[20px] p-5">
          <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Community coverage map</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-[16px] bg-[rgba(52,199,89,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Local share</p>
              <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">{scorecard.healthImpactSummary.localDistributionPct}%</p>
            </div>
            <div className="rounded-[16px] bg-[rgba(255,149,0,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Low-income reach</p>
              <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">{scorecard.healthImpactSummary.lowIncomeReachPct}%</p>
            </div>
            <div className="rounded-[16px] bg-[rgba(0,122,255,0.08)] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Access points</p>
              <p className="mt-2 text-2xl font-semibold text-[#1C1C1E]">{scorecard.healthImpactSummary.nearbyAccessPoints}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[#48484A]">
            {scorecard.healthImpactSummary.narrative}
          </p>
        </div>

        <div className="surface-elevated rounded-[20px] p-5">
          <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Crops and distribution channels</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            {scorecard.crops.map((crop) => (
              <Badge key={crop.id} variant="green">
                <Sprout className="h-2.5 w-2.5" />
                {crop.name}
              </Badge>
            ))}
          </div>
          <div className="space-y-2">
            {scorecard.distributionChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex flex-col gap-1 rounded-[14px] border border-[rgba(0,0,0,0.05)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <Truck className="h-3.5 w-3.5 text-[#8E8E93]" />
                  <span className="text-sm text-[#1C1C1E]">{channel.name}</span>
                  {channel.servesLowIncomeArea && <Badge variant="blue">Low-income area</Badge>}
                </div>
                <div className="flex items-center gap-3 pl-5 sm:pl-0 text-xs text-[#8E8E93]">
                  <span>{distributionLabel[channel.type] ?? channel.type}</span>
                  <span>{channel.distanceMiles} mi</span>
                  <span className="font-medium text-[#1C1C1E]">{channel.percentageOfSales}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-elevated rounded-[20px] p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm font-semibold text-[#1C1C1E]">Next actions</p>
          <p className="text-sm text-[#48484A] mt-1">Use compare for shortlist decisions and capture intent directly from this verified packet.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" asChild>
            <Link href={`/partner?compare=${scorecard.farm.id}`}>Add to compare set</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/marketplace/farms/${scorecard.farm.id}`}>Open exchange storefront</Link>
          </Button>
          <Button asChild>
            <Link href="/partner/reports">
              Export roadmap <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <ExpressInterestCard farmId={scorecard.farm.id} farmName={scorecard.farm.name} />
    </div>
  )
}

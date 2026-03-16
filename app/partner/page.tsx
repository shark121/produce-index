import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Search, Sprout } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ModeNotice } from '@/components/ui/mode-notice'
import { ScoreRing } from '@/components/ui/score-ring'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  BUYER_TYPE_OPTIONS,
  MARKETPLACE_FULFILLMENT_OPTIONS,
  NUTRIENT_TAG_OPTIONS,
  rankFarmScorecardsForBuyer,
} from '@/lib/marketplace'
import { getMarketplaceFarmMatchInputs } from '@/lib/marketplace-server'
import { filterFarmScorecards, getVerifiedFarmScorecards } from '@/lib/scorecards'
import { scoreLabel } from '@/lib/types'
import type { NutrientProfileTag } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Farm Directory' }

interface SearchParams {
  q?: string
  minScore?: string
  compare?: string
  buyerType?: 'hospital' | 'school' | 'community_org' | 'individual'
  nutrientTag?: NutrientProfileTag
  fulfillmentMethod?: 'pickup' | 'delivery'
  affordabilityNeeded?: string
  sort?: 'score' | 'smart_match'
}

interface Props {
  searchParams: Promise<SearchParams>
}

function buildDirectoryHref(params: SearchParams, compareIds: string[]) {
  const query = new URLSearchParams()

  if (params.q) query.set('q', params.q)
  if (params.minScore) query.set('minScore', params.minScore)
  if (params.buyerType) query.set('buyerType', params.buyerType)
  if (params.nutrientTag) query.set('nutrientTag', params.nutrientTag)
  if (params.fulfillmentMethod) query.set('fulfillmentMethod', params.fulfillmentMethod)
  if (params.affordabilityNeeded === 'true') query.set('affordabilityNeeded', 'true')
  if (params.sort) query.set('sort', params.sort)
  if (compareIds.length > 0) query.set('compare', compareIds.join(','))

  const suffix = query.toString()
  return suffix ? `/partner?${suffix}` : '/partner'
}

export default async function PartnerDirectoryPage({ searchParams }: Props) {
  const params = await searchParams
  const mockMode = isMockMode()
  const compareIds = params.compare?.split(',').filter(Boolean) ?? []
  const minScore = params.minScore ? Number(params.minScore) : undefined
  const useSmartMatch =
    params.sort === 'smart_match' ||
    Boolean(params.nutrientTag) ||
    Boolean(params.fulfillmentMethod) ||
    params.affordabilityNeeded === 'true' ||
    Boolean(params.buyerType)

  const allScorecards = mockMode ? getVerifiedFarmScorecards() : []
  const smartMatches = mockMode
    ? rankFarmScorecardsForBuyer(getMarketplaceFarmMatchInputs(), {
        buyerType: params.buyerType ?? 'hospital',
        q: params.q,
        minPriScore: Number.isFinite(minScore) ? minScore : undefined,
        nutrientTags: params.nutrientTag ? [params.nutrientTag] : undefined,
        fulfillmentMethod: params.fulfillmentMethod,
        affordabilityNeeded: params.affordabilityNeeded === 'true',
      })
    : []

  const matchMap = new Map(smartMatches.map((match) => [match.scorecard.farm.id, match]))

  const scorecards = useSmartMatch
    ? smartMatches.map((match) => match.scorecard)
    : filterFarmScorecards(allScorecards, {
        query: params.q,
        minScore: Number.isFinite(minScore) ? minScore : undefined,
      })

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Verified Farm Directory</h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            {scorecards.length} verified farm{scorecards.length !== 1 ? 's' : ''} matching your filters
          </p>
        </div>
        {compareIds.length >= 2 && (
          <Button asChild>
            <Link href={`/partner/compare?ids=${compareIds.join(',')}`}>
              Compare {compareIds.length} Farms <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      {mockMode && (
        <ModeNotice
          title="Directory results are intentionally marked as demo pilot records."
          body="Search, compare, provenance fields, and the new smart match layer are live in demo mode so institutions can evaluate the procurement workflow before Supabase-backed data is connected."
        />
      )}

      <form className="surface-elevated rounded-[14px] p-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.8fr_0.8fr_0.8fr_auto]">
        <input type="hidden" name="compare" value={compareIds.join(',')} />
        <div className="flex items-center gap-3 rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-4 py-3">
          <Search className="h-4 w-4 text-[#AEAEB2] shrink-0" />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search by farm, region, or crop"
            className="flex-1 bg-transparent text-sm text-[#1C1C1E] placeholder:text-[#AEAEB2] outline-none"
          />
        </div>
        <select
          name="buyerType"
          defaultValue={params.buyerType ?? 'hospital'}
          className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
        >
          {BUYER_TYPE_OPTIONS.filter((option) => option.value !== 'individual').map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="nutrientTag"
          defaultValue={params.nutrientTag ?? ''}
          className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
        >
          <option value="">Any nutrient profile</option>
          {NUTRIENT_TAG_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="fulfillmentMethod"
          defaultValue={params.fulfillmentMethod ?? ''}
          className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
        >
          <option value="">Pickup or delivery</option>
          {MARKETPLACE_FULFILLMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="minScore"
          defaultValue={params.minScore ?? ''}
          className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
        >
          <option value="">Any score</option>
          <option value="65">65+ PRI score</option>
          <option value="75">75+ PRI score</option>
          <option value="85">85+ PRI score</option>
        </select>
        <select
          name="sort"
          defaultValue={params.sort ?? 'score'}
          className="h-[50px] rounded-[12px] border border-[rgba(0,0,0,0.08)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
        >
          <option value="score">Sort by score</option>
          <option value="smart_match">Sort by smart match</option>
        </select>
        <Button type="submit" variant="secondary">Apply filters</Button>
        <label className="flex items-center gap-2 text-sm text-[#48484A] lg:col-span-full">
          <input type="checkbox" name="affordabilityNeeded" value="true" defaultChecked={params.affordabilityNeeded === 'true'} />
          Prioritize affordability and SNAP/community pricing
        </label>
      </form>

      {scorecards.length === 0 ? (
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93]">No verified farms matched those filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {scorecards.map((scorecard) => {
            const isSelected = compareIds.includes(scorecard.farm.id)
            const nextCompareIds = isSelected
              ? compareIds.filter((id) => id !== scorecard.farm.id)
              : [...compareIds, scorecard.farm.id].slice(0, 4)
            const match = matchMap.get(scorecard.farm.id)

            return (
              <div key={scorecard.farm.id} className="surface-elevated rounded-[20px] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-semibold text-[#1C1C1E]">{scorecard.farm.name}</h2>
                      <Badge variant="green">{scorecard.financingReadiness.label}</Badge>
                      {match ? <Badge variant="blue">Match {match.matchScore}</Badge> : null}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-[#8E8E93]">
                      <MapPin className="h-3 w-3" />
                      {scorecard.farm.city}, {scorecard.farm.state} · {scorecard.farm.region}
                    </p>
                  </div>
                  <ScoreRing score={scorecard.score.overallScore} size="sm" showLabel={false} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {scorecard.crops.slice(0, 3).map((crop) => (
                    <Badge key={crop.id} variant="green">
                      <Sprout className="h-2.5 w-2.5" /> {crop.name}
                    </Badge>
                  ))}
                  <Badge variant="blue">
                    Confidence {scorecard.verificationConfidence.score}
                  </Badge>
                  <Badge variant="orange">
                    Evidence {scorecard.verificationConfidence.evidenceCoveragePct}%
                  </Badge>
                  {match?.sellerSignals.acceptsSnap ? <Badge variant="blue">SNAP</Badge> : null}
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#48484A]">
                  {scorecard.healthImpactSummary.narrative}
                </p>

                {match ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {match.nutrientTags.map((tag) => (
                      <Badge key={tag} variant="green">
                        <Sprout className="h-2.5 w-2.5" /> {NUTRIENT_TAG_OPTIONS.find((option) => option.value === tag)?.label ?? tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {match ? (
                  <ul className="mt-4 flex flex-wrap gap-2 text-xs text-[#48484A]">
                    {match.reasons.map((reason) => (
                      <li key={reason} className="rounded-full bg-[rgba(0,122,255,0.08)] px-3 py-1.5">{reason}</li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Score provenance</p>
                    <p className="mt-1 text-sm font-medium text-[#1C1C1E]">
                      {scorecard.scoreProvenance.weightsVersion} · {scorecard.scoreProvenance.benchmarkVersion}
                    </p>
                  </div>
                  <div className="rounded-[14px] bg-[rgba(0,0,0,0.03)] p-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Local reach</p>
                    <p className="mt-1 text-sm font-medium text-[#1C1C1E]">
                      {scorecard.healthImpactSummary.localDistributionPct}% within 30 miles
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-xs text-[#8E8E93]">
                    {scoreLabel(scorecard.score.overallScore)} · Verified {formatDate(scorecard.verifiedAt)}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={buildDirectoryHref(params, nextCompareIds)}>
                        {isSelected ? 'Remove from compare' : 'Add to compare'}
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/partner/farms/${scorecard.farm.id}`}>Open scorecard</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

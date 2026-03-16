import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { isMockMode } from '@/lib/is-mock-mode'
import { filterFarmScorecards, getVerifiedFarmScorecards } from '@/lib/scorecards'

export const metadata: Metadata = { title: 'Compare Farms' }

const CATEGORIES = [
  { key: 'overallScore', label: 'Overall PRI' },
  { key: 'nutritionalValue', label: 'Nutritional Value' },
  { key: 'foodSafety', label: 'Food Safety' },
  { key: 'supplyReliability', label: 'Supply Reliability' },
  { key: 'localAccessibility', label: 'Local Accessibility' },
  { key: 'affordability', label: 'Affordability' },
]

interface SearchParams {
  ids?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

export default async function ComparePage({ searchParams }: Props) {
  const { ids } = await searchParams
  const farmIds = ids?.split(',').filter(Boolean) ?? []
  const scorecards = isMockMode()
    ? filterFarmScorecards(getVerifiedFarmScorecards(), { ids: farmIds })
    : []

  function scoreValue(scorecard: (typeof scorecards)[number], key: (typeof CATEGORIES)[number]['key']) {
    const value = scorecard.score[key as keyof typeof scorecard.score]
    return typeof value === 'number' ? value.toFixed(1) : scorecard.score.overallScore.toFixed(1)
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Compare Verified Farms</h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            Review score, provenance, confidence, and readiness side by side.
          </p>
        </div>
        <Button variant="secondary" asChild>
          <Link href="/partner">Back to directory</Link>
        </Button>
      </div>

      {scorecards.length < 2 ? (
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93]">
            Select at least 2 farms from the directory to compare.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            {scorecards.map((scorecard) => (
              <div key={scorecard.farm.id} className="surface-elevated rounded-[18px] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-[#1C1C1E]">{scorecard.farm.name}</h2>
                    <p className="text-xs text-[#8E8E93] mt-1">{scorecard.farm.region}</p>
                  </div>
                  <Badge variant="green">{scorecard.financingReadiness.label}</Badge>
                </div>
                <div className="mt-4 space-y-1 text-sm text-[#48484A]">
                  <p>Confidence {scorecard.verificationConfidence.score}/100</p>
                  <p>Evidence {scorecard.verificationConfidence.evidenceCoveragePct}%</p>
                  <p>{scorecard.financingReadiness.benchmarkDelta}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="surface-elevated rounded-[20px] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left px-5 py-4 text-[#8E8E93] font-medium w-56">Metric</th>
                  {scorecards.map((scorecard) => (
                    <th key={scorecard.farm.id} className="text-right px-5 py-4 text-[#1C1C1E] font-semibold">
                      {scorecard.farm.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIES.map(({ key, label }) => (
                  <tr key={key} className="border-b border-[rgba(0,0,0,0.05)] last:border-0">
                    <td className="px-5 py-3 text-[#48484A]">{label}</td>
                    {scorecards.map((scorecard) => (
                    <td key={scorecard.farm.id} className="text-right px-5 py-3 font-medium text-[#1C1C1E]">
                        {scoreValue(scorecard, key)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="border-b border-[rgba(0,0,0,0.05)]">
                  <td className="px-5 py-3 text-[#48484A]">Verification confidence</td>
                  {scorecards.map((scorecard) => (
                    <td key={scorecard.farm.id} className="text-right px-5 py-3 font-medium text-[#1C1C1E]">
                      {scorecard.verificationConfidence.score}/100
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(0,0,0,0.05)]">
                  <td className="px-5 py-3 text-[#48484A]">Evidence coverage</td>
                  {scorecards.map((scorecard) => (
                    <td key={scorecard.farm.id} className="text-right px-5 py-3 font-medium text-[#1C1C1E]">
                      {scorecard.verificationConfidence.evidenceCoveragePct}%
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(0,0,0,0.05)]">
                  <td className="px-5 py-3 text-[#48484A]">Financing readiness</td>
                  {scorecards.map((scorecard) => (
                    <td key={scorecard.farm.id} className="text-right px-5 py-3 font-medium text-[#1C1C1E]">
                      {scorecard.financingReadiness.label}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-[rgba(0,0,0,0.05)]">
                  <td className="px-5 py-3 text-[#48484A]">Healthy servings estimate</td>
                  {scorecards.map((scorecard) => (
                    <td key={scorecard.farm.id} className="text-right px-5 py-3 font-medium text-[#1C1C1E]">
                      {scorecard.healthImpactSummary.estimatedHealthyServings.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-5 py-3 text-[#48484A]">Next-season confidence</td>
                  {scorecards.map((scorecard) => (
                    <td key={scorecard.farm.id} className="text-right px-5 py-3 font-medium text-[#1C1C1E]">
                      {scorecard.financingReadiness.nextSeasonConfidence} ({scorecard.financingReadiness.seasonalityRisk})
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

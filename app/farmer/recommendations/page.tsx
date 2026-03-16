import type { Metadata } from 'next'
import { Lightbulb, TrendingUp } from 'lucide-react'
import { getScoreForFarm } from '@/lib/mock'

export const metadata: Metadata = { title: 'Recommendations' }

const RUBRIC_GUIDANCE: Record<string, { label: string; threshold: number; tips: string[] }> = {
  nutritionalValue: {
    label: 'Nutritional Value',
    threshold: 85,
    tips: [
      'Add lab test results for your top 3 crops to raise your evidence score',
      'Diversify into leafy greens and legumes — both score highly on nutrient density',
      'Document USDA nutrient baseline comparisons for crops you already grow',
    ],
  },
  foodSafety: {
    label: 'Food Safety',
    threshold: 92,
    tips: [
      'Annual water source testing documentation would strengthen this score',
      'Update your pesticide application records for the current season',
    ],
  },
  supplyReliability: {
    label: 'Supply Reliability',
    threshold: 82,
    tips: [
      'Provide delivery logs covering at least 12 months to establish a fulfillment rate',
      'A written production schedule for the upcoming season strengthens this score',
      'Document buffer stock practices or secondary supplier relationships',
    ],
  },
  localAccessibility: {
    label: 'Local Accessibility',
    threshold: 90,
    tips: [
      'Serving SNAP-eligible markets in low-income ZIP codes is heavily weighted here',
      'Document the percentage of sales going to buyers within 30 miles',
    ],
  },
  affordability: {
    label: 'Affordability',
    threshold: 80,
    tips: [
      'A community sliding scale or reduced-price program adds direct points',
      'Your prices are compared to regional benchmarks — check with your admin',
    ],
  },
}

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function RecommendationsPage() {
  const snapshot = MOCK_MODE ? getScoreForFarm('farm-1') : null

  const scoreMap: Record<string, number> = snapshot ? {
    nutritionalValue:   snapshot.nutritionalValue,
    foodSafety:         snapshot.foodSafety,
    supplyReliability:  snapshot.supplyReliability,
    localAccessibility: snapshot.localAccessibility,
    affordability:      snapshot.affordability,
  } : {}

  const improvements = Object.entries(RUBRIC_GUIDANCE).filter(
    ([key, { threshold }]) => scoreMap[key] !== undefined && scoreMap[key] < threshold,
  )

  const strengths = Object.entries(RUBRIC_GUIDANCE).filter(
    ([key, { threshold }]) => scoreMap[key] !== undefined && scoreMap[key] >= threshold,
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Recommendations</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Targeted guidance based on your latest verified PRI score.
        </p>
      </div>

      {!snapshot ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center">
          <p className="text-sm text-[#8E8E93]">Recommendations appear once you have a verified PRI score.</p>
        </div>
      ) : (
        <>
          {/* Strengths */}
          {strengths.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#1C1C1E] mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#34C759]" /> Strengths
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {strengths.map(([key, { label }]) => (
                  <div key={key} className="surface-elevated rounded-[12px] px-4 py-3 flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-[rgba(52,199,89,0.12)] flex items-center justify-center shrink-0">
                      <span className="text-[#34C759] text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C1C1E]">{label}</p>
                      <p className="text-xs text-[#8E8E93]">{scoreMap[key].toFixed(1)} / 100</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas to improve */}
          {improvements.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[#1C1C1E] mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-[#FF9500]" /> Areas to improve
              </h2>
              <div className="space-y-4">
                {improvements.map(([key, { label, threshold, tips }]) => (
                  <div key={key} className="surface-elevated rounded-[16px] p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[rgba(255,149,0,0.12)] shrink-0">
                        <Lightbulb className="h-4 w-4 text-[#FF9500]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1C1C1E]">{label}</p>
                        <p className="text-xs text-[#8E8E93]">
                          Current: {scoreMap[key].toFixed(1)} · Target: {threshold}+
                          <span className="ml-2 text-[#FF9500]">+{(threshold - scoreMap[key]).toFixed(1)} points needed</span>
                        </p>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full rounded-full bg-[rgba(0,0,0,0.06)] mb-4">
                      <div
                        className="h-full rounded-full bg-[#FF9500]"
                        style={{ width: `${scoreMap[key]}%` }}
                      />
                    </div>
                    <ul className="space-y-2">
                      {tips.map((tip) => (
                        <li key={tip} className="flex items-start gap-2 text-sm text-[#48484A]">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#FF9500] shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

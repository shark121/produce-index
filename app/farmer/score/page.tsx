import type { Metadata } from 'next'
import { ScoreRing } from '@/components/ui/score-ring'
import { VerificationStatusBadge } from '@/components/ui/status-badge'
import { formatDateTime } from '@/lib/utils'
import { getScoreForFarm } from '@/lib/mock'

export const metadata: Metadata = { title: 'PRI Score' }

const CATEGORIES = [
  { key: 'nutritionalValue' as const,   label: 'Nutritional Value',   weight: 30, color: '#34C759' },
  { key: 'foodSafety' as const,         label: 'Food Safety',         weight: 20, color: '#007AFF' },
  { key: 'supplyReliability' as const,  label: 'Supply Reliability',  weight: 20, color: '#AF52DE' },
  { key: 'localAccessibility' as const, label: 'Local Accessibility', weight: 15, color: '#FF9500' },
  { key: 'affordability' as const,      label: 'Affordability',       weight: 15, color: '#FF3B30' },
]

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function ScorePage() {
  const snapshot = MOCK_MODE ? getScoreForFarm('farm-1') : null

  if (!snapshot) {
    return (
      <div className="space-y-6 animate-fade-up">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">PRI Score</h1>
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93] mb-2">No verified score yet.</p>
          <p className="text-xs text-[#C7C7CC]">Complete a submission and have it verified to see your score.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-bold text-[#1C1C1E]">PRI Score</h1>
        <VerificationStatusBadge status={snapshot.verificationStatus} />
      </div>

      {/* Hero */}
      <div className="surface-elevated rounded-[24px] p-8 flex flex-col md:flex-row items-center gap-8">
        <ScoreRing score={snapshot.overallScore} size="lg" />
        <div className="flex-1 w-full">
          <p className="text-sm text-[#8E8E93]">Overall PRI Score</p>
          <p className="text-xs text-[#C7C7CC] mt-0.5">
            Verified {formatDateTime(snapshot.calculatedAt)} · Weights {snapshot.weightsVersion}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-2.5 rounded-full bg-[rgba(0,0,0,0.06)]">
              <div
                className="h-full rounded-full bg-[#34C759] transition-all"
                style={{ width: `${snapshot.overallScore}%` }}
              />
            </div>
            <span className="text-lg font-bold text-[#1C1C1E]">{snapshot.overallScore.toFixed(1)}</span>
          </div>
          <p className="text-xs text-[#8E8E93] mt-2">
            Data completeness: {Math.round(snapshot.dataCompleteness * 100)}%
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Category breakdown</h2>
        <div className="space-y-3">
          {CATEGORIES.map(({ key, label, weight, color }) => {
            const subscore = snapshot[key]
            return (
              <div key={key} className="surface-elevated rounded-[14px] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium text-[#1C1C1E]">{label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#8E8E93]">{weight}% weight</span>
                    <span className="text-sm font-bold text-[#1C1C1E]">{subscore.toFixed(1)}</span>
                  </div>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[rgba(0,0,0,0.06)]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${subscore}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

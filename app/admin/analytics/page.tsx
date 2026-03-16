import type { Metadata } from 'next'
import { MOCK_SUBMISSIONS, MOCK_SCORES, MOCK_FARMS } from '@/lib/mock'

export const metadata: Metadata = { title: 'Analytics' }

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function AnalyticsPage() {
  const submissions = MOCK_MODE ? MOCK_SUBMISSIONS : []
  const scores = MOCK_MODE ? MOCK_SCORES.filter(s => s.verificationStatus === 'verified') : []
  const farms = MOCK_MODE ? MOCK_FARMS : []

  const avgScore = scores.length > 0
    ? scores.reduce((a, b) => a + b.overallScore, 0) / scores.length
    : null

  const buckets = [
    { range: '0–20',  count: scores.filter(s => s.overallScore < 20).length },
    { range: '20–40', count: scores.filter(s => s.overallScore >= 20 && s.overallScore < 40).length },
    { range: '40–60', count: scores.filter(s => s.overallScore >= 40 && s.overallScore < 60).length },
    { range: '60–80', count: scores.filter(s => s.overallScore >= 60 && s.overallScore < 80).length },
    { range: '80–100',count: scores.filter(s => s.overallScore >= 80).length },
  ]
  const maxBucket = Math.max(...buckets.map(b => b.count), 1)

  const funnel = [
    { status: 'Applied',        count: farms.length },
    { status: 'Draft started',  count: submissions.filter(s => s.status === 'draft').length },
    { status: 'Submitted',      count: submissions.filter(s => ['submitted','under_review','verified','needs_changes'].includes(s.status)).length },
    { status: 'Under review',   count: submissions.filter(s => ['under_review','verified'].includes(s.status)).length },
    { status: 'Verified',       count: submissions.filter(s => s.status === 'verified').length },
  ]
  const maxFunnel = Math.max(...funnel.map(f => f.count), 1)

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Pilot Analytics</h1>
        <p className="text-sm text-[#8E8E93] mt-1">High-level metrics across the pilot program.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Farms enrolled',    value: farms.length,               unit: '' },
          { label: 'Total submissions', value: submissions.length,          unit: '' },
          { label: 'Verified',          value: submissions.filter(s => s.status === 'verified').length, unit: '' },
          { label: 'Avg PRI score',     value: avgScore ? avgScore.toFixed(1) : '—', unit: avgScore ? '/100' : '' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="surface-elevated rounded-[14px] px-4 py-4">
            <p className="text-2xl font-bold text-[#1C1C1E]">{value}{unit}</p>
            <p className="text-xs text-[#8E8E93] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      <div className="surface-elevated rounded-[20px] p-6">
        <h2 className="text-sm font-semibold text-[#1C1C1E] mb-5">Score distribution</h2>
        <div className="flex items-end gap-3 h-36">
          {buckets.map(({ range, count }) => (
            <div key={range} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-[#1C1C1E]">{count || ''}</span>
              <div
                className="w-full rounded-t-[6px] bg-[#34C759] transition-all"
                style={{ height: `${Math.max((count / maxBucket) * 100, count > 0 ? 8 : 0)}px`, opacity: count > 0 ? 1 : 0.15 }}
              />
              <span className="text-[10px] text-[#8E8E93]">{range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel */}
      <div className="surface-elevated rounded-[20px] p-6">
        <h2 className="text-sm font-semibold text-[#1C1C1E] mb-4">Submission funnel</h2>
        <div className="space-y-3">
          {funnel.map(({ status, count }) => (
            <div key={status} className="flex items-center gap-3">
              <span className="text-sm text-[#48484A] w-32 shrink-0">{status}</span>
              <div className="flex-1 h-2 rounded-full bg-[rgba(0,0,0,0.06)]">
                <div
                  className="h-full rounded-full bg-[#34C759] transition-all"
                  style={{ width: `${(count / maxFunnel) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-[#1C1C1E] w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-farm score breakdown */}
      {scores.length > 0 && (
        <div className="surface-elevated rounded-[20px] p-6">
          <h2 className="text-sm font-semibold text-[#1C1C1E] mb-4">Verified farm scores</h2>
          <div className="space-y-4">
            {scores.map((score) => {
              const farm = farms.find(f => f.id === score.farmId)
              return (
                <div key={score.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#1C1C1E]">{farm?.name ?? score.farmId}</span>
                    <span className="text-sm font-bold text-[#1C1C1E]">{score.overallScore.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[rgba(0,0,0,0.06)]">
                    <div
                      className="h-full rounded-full bg-[#34C759]"
                      style={{ width: `${score.overallScore}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, FileText, RefreshCcw, Sparkles, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AutoScoringRun, CategoryRecommendation, EvidenceAsset, EvidenceCategory, EvidenceExtraction } from '@/lib/types'

const CATEGORIES = [
  { key: 'nutritional_value' as const, label: 'Nutritional Value', weight: '30%' },
  { key: 'food_safety' as const, label: 'Food Safety', weight: '20%' },
  { key: 'supply_reliability' as const, label: 'Supply Reliability', weight: '20%' },
  { key: 'local_accessibility' as const, label: 'Local Accessibility', weight: '15%' },
  { key: 'affordability' as const, label: 'Affordability', weight: '15%' },
]

interface Props {
  submissionId: string
  initialRun: AutoScoringRun | null
  initialAssets: EvidenceAsset[]
  initialExtractions: EvidenceExtraction[]
}

interface CategoryScore {
  subscore: number
  notes: string
  evidenceCoveragePct: number
  overrideReason: string
}

function buildScoreState(run: AutoScoringRun | null) {
  return Object.fromEntries(
    CATEGORIES.map(({ key }) => [
      key,
      {
        subscore: run?.recommendedScores[key]?.score ?? 0,
        notes: '',
        evidenceCoveragePct: run?.recommendedScores[key]?.evidenceCoveragePct ?? 0,
        overrideReason: '',
      },
    ]),
  ) as Record<EvidenceCategory, CategoryScore>
}

export function ReviewPanel({ submissionId, initialRun, initialAssets, initialExtractions }: Props) {
  const router = useRouter()
  const [run, setRun] = useState<AutoScoringRun | null>(initialRun)
  const [assets] = useState<EvidenceAsset[]>(initialAssets)
  const [extractions, setExtractions] = useState<EvidenceExtraction[]>(initialExtractions)
  const [scores, setScores] = useState<Record<EvidenceCategory, CategoryScore>>(buildScoreState(initialRun))
  const [adminNotes, setAdminNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [rerunning, setRerunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function rerunModel() {
    setRerunning(true)
    setError(null)
    const response = await fetch(`/api/submissions/${submissionId}/auto-score`, { method: 'POST' })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to rerun scoring model')
      setRerunning(false)
      return
    }

    setRun(payload.data.run)
    setExtractions(payload.data.extractions ?? [])
    setScores(buildScoreState(payload.data.run))
    setRerunning(false)
  }

  async function submitDecision(decision: 'verified' | 'needs_changes') {
    setSaving(true)
    setError(null)

    const response = await fetch('/api/admin/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionId,
        decision,
        scores,
        adminNotes,
        recommendedScores: run?.recommendedScores ?? {},
        autoScoringRunId: run?.id ?? null,
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save review decision')
      setSaving(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  const groupedEvidence = useMemo(() => Object.fromEntries(
    CATEGORIES.map(({ key }) => [
      key,
      {
        assets: assets.filter((asset) => asset.category === key),
        extractions: extractions.filter((extraction) => extraction.category === key),
      },
    ]),
  ) as Record<EvidenceCategory, { assets: EvidenceAsset[]; extractions: EvidenceExtraction[] }>, [assets, extractions])

  return (
    <div className="space-y-5">
      <div className="surface-elevated rounded-[16px] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1C1C1E] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#007AFF]" />
              Recommended by hybrid PRI scorecard model
            </p>
            <p className="mt-1 text-sm text-[#48484A]">
              Overall recommendation {run?.overallScore ?? 0} · Confidence {run?.confidenceSummary ?? 0}/100 · {run?.modelVersion ?? 'No model run'}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => void rerunModel()} disabled={rerunning}>
            <RefreshCcw className="h-3.5 w-3.5" />
            {rerunning ? 'Rerunning...' : 'Rerun model'}
          </Button>
        </div>
        {run?.warnings?.length ? (
          <div className="mt-4 rounded-[12px] border border-[rgba(255,149,0,0.18)] bg-[rgba(255,149,0,0.08)] p-4">
            <p className="text-sm font-medium text-[#9C6400]">Warnings</p>
            <ul className="mt-2 space-y-1 text-sm text-[#6E4D00]">
              {run.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {CATEGORIES.map(({ key, label, weight }) => {
        const recommendation = run?.recommendedScores[key] as CategoryRecommendation | undefined
        const currentScore = scores[key]
        const grouped = groupedEvidence[key]
        const isOverride = recommendation ? recommendation.score !== currentScore.subscore : false

        return (
          <div key={key} className="surface-elevated rounded-[16px] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1C1C1E]">{label}</p>
                <p className="text-xs text-[#8E8E93]">{weight} of overall score</p>
                <p className="mt-2 text-sm text-[#48484A]">{recommendation?.summary ?? 'No recommendation available yet.'}</p>
              </div>
              <div className="rounded-[14px] bg-[rgba(0,0,0,0.03)] px-4 py-3 min-w-[220px]">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Recommendation</p>
                <p className="mt-1 text-2xl font-semibold text-[#1C1C1E]">{recommendation?.score ?? 0}</p>
                <p className="mt-1 text-xs text-[#8E8E93]">
                  Confidence {recommendation?.confidence ?? 0}/100 · Evidence {recommendation?.evidenceCoveragePct ?? 0}%
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[12px] bg-[rgba(0,0,0,0.03)] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Evidence and extraction notes</p>
                <div className="mt-3 space-y-3">
                  {grouped.assets.length === 0 ? (
                    <p className="text-sm text-[#8E8E93]">No uploaded evidence for this category.</p>
                  ) : (
                    grouped.assets.map((asset) => {
                      const extraction = grouped.extractions.find((entry) => entry.evidenceAssetId === asset.id)
                      return (
                        <div key={asset.id} className="rounded-[12px] border border-[rgba(0,0,0,0.06)] bg-white px-4 py-3">
                          <p className="text-sm font-medium text-[#1C1C1E] flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-[#8E8E93]" />
                            {asset.fileName}
                          </p>
                          <p className="mt-1 text-xs text-[#8E8E93]">{asset.description ?? 'No description provided'}</p>
                          {extraction ? (
                            <div className="mt-2 space-y-1.5">
                              <p className="text-xs font-medium text-[#1C1C1E]">
                                {extraction.provider === 'openai' ? 'OpenAI-normalized' : 'Fallback-normalized'} · Confidence {extraction.confidence}
                              </p>
                              <p className="text-xs text-[#48484A]">{extraction.summary}</p>
                              {extraction.normalizedObservations.map((observation) => (
                                <p key={`${asset.id}-${observation.label}-${observation.value}`} className="text-xs text-[#48484A]">
                                  {observation.label}: {observation.value}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[12px] bg-[rgba(0,122,255,0.06)] p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-[#1C1C1E]">Final score</label>
                    <span className="text-xs text-[#8E8E93]">0-100</span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={currentScore.subscore}
                    onChange={(event) => setScores((current) => ({
                      ...current,
                      [key]: {
                        ...current[key],
                        subscore: Number(event.target.value),
                      },
                    }))}
                    className="mt-3 h-11 w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-lg font-semibold text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div className="rounded-[12px] bg-[rgba(0,0,0,0.03)] p-4">
                  <div className="flex items-center justify-between text-xs text-[#8E8E93] mb-2">
                    <span>Evidence coverage</span>
                    <span>{currentScore.evidenceCoveragePct}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentScore.evidenceCoveragePct}
                    onChange={(event) => setScores((current) => ({
                      ...current,
                      [key]: {
                        ...current[key],
                        evidenceCoveragePct: Number(event.target.value),
                      },
                    }))}
                    className="w-full accent-[#34C759]"
                  />
                </div>

                {recommendation?.reasonCodes?.length ? (
                  <div className="rounded-[12px] bg-[rgba(0,0,0,0.03)] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Reason codes</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {recommendation.reasonCodes.map((reasonCode) => (
                        <span key={reasonCode} className="rounded-full bg-white px-3 py-1 text-xs text-[#48484A] border border-[rgba(0,0,0,0.06)]">
                          {reasonCode}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <textarea
                  rows={3}
                  placeholder="Reviewer notes for this category..."
                  value={currentScore.notes}
                  onChange={(event) => setScores((current) => ({
                    ...current,
                    [key]: {
                      ...current[key],
                      notes: event.target.value,
                    },
                  }))}
                  className="w-full rounded-[10px] border border-[rgba(0,0,0,0.10)] bg-white px-3 py-2 text-xs text-[#48484A] placeholder:text-[#AEAEB2] resize-none focus:outline-none focus:border-[#007AFF]"
                />

                {isOverride ? (
                  <textarea
                    rows={2}
                    placeholder="Required: why are you overriding the model recommendation?"
                    value={currentScore.overrideReason}
                    onChange={(event) => setScores((current) => ({
                      ...current,
                      [key]: {
                        ...current[key],
                        overrideReason: event.target.value,
                      },
                    }))}
                    className="w-full rounded-[10px] border border-[rgba(255,149,0,0.28)] bg-[rgba(255,149,0,0.06)] px-3 py-2 text-xs text-[#48484A] placeholder:text-[#AEAEB2] resize-none focus:outline-none focus:border-[#FF9500]"
                  />
                ) : null}
              </div>
            </div>
          </div>
        )
      })}

      <div className="surface-elevated rounded-[16px] p-5">
        <label className="block text-sm font-medium text-[#1C1C1E] mb-2">
          Admin notes
        </label>
        <textarea
          rows={3}
          placeholder="Explain what was verified or what the farmer needs to fix..."
          value={adminNotes}
          onChange={(event) => setAdminNotes(event.target.value)}
          className="w-full rounded-[10px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#48484A] placeholder:text-[#AEAEB2] resize-none focus:outline-none focus:border-[#007AFF]"
        />
        {error && <p className="mt-3 text-sm text-[#FF3B30]">{error}</p>}
      </div>

      <div className="flex gap-3">
        <Button
          variant="destructive"
          size="lg"
          className="flex-1"
          disabled={saving}
          onClick={() => void submitDecision('needs_changes')}
        >
          <XCircle className="h-4 w-4" /> Needs Changes
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={saving}
          onClick={() => void submitDecision('verified')}
        >
          <CheckCircle2 className="h-4 w-4" /> Verify & Publish Score
        </Button>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { DEFAULT_WEIGHTS } from '@/lib/types'
import { ScoringConfigForm } from './scoring-config-form'

export const metadata: Metadata = { title: 'Scoring Config' }

export default async function ScoringConfigPage() {
  // TODO: fetch current ScoringWeights from Supabase (admin_config table)
  const currentWeights = DEFAULT_WEIGHTS

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Scoring Configuration</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Adjust category weights and rubric thresholds. Changes are versioned — existing score
          snapshots are never modified.
        </p>
      </div>
      <ScoringConfigForm weights={currentWeights} />
    </div>
  )
}

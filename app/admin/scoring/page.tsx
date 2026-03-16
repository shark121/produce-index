import type { Metadata } from 'next'
import { getCurrentScoringConfig } from '@/lib/scoring-config'
import { ScoringConfigForm } from './scoring-config-form'

export const metadata: Metadata = { title: 'Scoring Config' }

export default async function ScoringConfigPage() {
  const currentConfig = await getCurrentScoringConfig()

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Scoring Configuration</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Adjust category weights and review metadata. Changes are versioned, and previously issued
          score snapshots remain untouched.
        </p>
      </div>
      <ScoringConfigForm config={currentConfig} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ScoringConfig } from '@/lib/types'
import { formatDateTime } from '@/lib/utils'

const LABELS: Record<keyof ScoringConfig['weights'], string> = {
  nutritionalValue:   'Nutritional Value',
  foodSafety:         'Food Safety',
  supplyReliability:  'Supply Reliability',
  localAccessibility: 'Local Accessibility',
  affordability:      'Affordability',
  version:            'Version',
}

interface Props {
  config: ScoringConfig
}

export function ScoringConfigForm({ config }: Props) {
  const keys = (Object.keys(LABELS) as (keyof typeof LABELS)[]).filter((key) => key !== 'version')
  const [values, setValues] = useState(
    Object.fromEntries(keys.map((key) => [key, Math.round(config.weights[key] * 100)])),
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const total = Object.values(values).reduce((a, b) => a + b, 0)
  const valid = total === 100

  async function handleSave() {
    if (!valid) return
    setSaving(true)
    await fetch('/api/admin/scoring', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(keys.map((k) => [k, values[k] / 100]))),
    })
    setSaved(true)
    setSaving(false)
  }

  return (
    <div className="space-y-5">
      <div className="surface-elevated rounded-[20px] p-6">
        <div className="grid gap-3 md:grid-cols-3 mb-5">
          <div className="rounded-[12px] bg-[rgba(52,199,89,0.10)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Weights version</p>
            <p className="mt-1 text-sm font-semibold text-[#1C1C1E]">{config.weights.version}</p>
          </div>
          <div className="rounded-[12px] bg-[rgba(0,122,255,0.08)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Benchmark version</p>
            <p className="mt-1 text-sm font-semibold text-[#1C1C1E]">{config.benchmarkVersion}</p>
          </div>
          <div className="rounded-[12px] bg-[rgba(0,0,0,0.04)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8E8E93]">Last updated</p>
            <p className="mt-1 text-sm font-semibold text-[#1C1C1E]">{formatDateTime(config.updatedAt)}</p>
          </div>
        </div>
        <p className="text-sm text-[#48484A] mb-4">
          {config.reviewMethod}. Benchmark source: {config.benchmarkSource}.
        </p>
        <div className="space-y-4">
          {keys.map((key) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-48 text-sm text-[#1C1C1E]">{LABELS[key]}</label>
              <input
                type="range"
                min={0}
                max={50}
                value={values[key]}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="flex-1 accent-[#34C759]"
              />
              <span className="w-12 text-right text-sm font-bold text-[#1C1C1E]">
                {values[key]}%
              </span>
            </div>
          ))}
        </div>

        <div
          className={`mt-5 p-3 rounded-[10px] text-sm font-medium text-center ${
            valid
              ? 'bg-[rgba(52,199,89,0.10)] text-[#1A7A32]'
              : 'bg-[rgba(255,59,48,0.10)] text-[#FF3B30]'
          }`}
        >
          Total: {total}% {valid ? '✓ Valid' : `— must equal 100% (off by ${total - 100}%)`}
        </div>
      </div>

      <Button size="lg" disabled={!valid || saving} onClick={handleSave}>
        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save New Version'}
      </Button>

      <p className="text-xs text-[#C7C7CC]">
        Saving creates a new scoring configuration version. Past score snapshots remain unchanged.
      </p>
    </div>
  )
}

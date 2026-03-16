'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, FileText } from 'lucide-react'

const CATEGORIES = [
  { key: 'nutritional_value',   label: 'Nutritional Value',   weight: '30%' },
  { key: 'food_safety',         label: 'Food Safety',         weight: '20%' },
  { key: 'supply_reliability',  label: 'Supply Reliability',  weight: '20%' },
  { key: 'local_accessibility', label: 'Local Accessibility', weight: '15%' },
  { key: 'affordability',       label: 'Affordability',       weight: '15%' },
]

interface Props {
  submissionId: string
}

interface CategoryScore {
  subscore: number
  notes: string
}

export function ReviewPanel({ submissionId }: Props) {
  const router = useRouter()
  const [scores, setScores] = useState<Record<string, CategoryScore>>(
    Object.fromEntries(CATEGORIES.map(({ key }) => [key, { subscore: 0, notes: '' }])),
  )
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function submitDecision(decision: 'verified' | 'needs_changes') {
    setLoading(true)
    const mockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
    if (mockMode) {
      await new Promise(r => setTimeout(r, 800))
      router.push('/admin')
      return
    }
    await fetch('/api/admin/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, decision, scores, adminNotes }),
    })
    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      {/* Evidence review + scoring per category */}
      {CATEGORIES.map(({ key, label, weight }) => (
        <div key={key} className="surface-elevated rounded-[16px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-[#1C1C1E]">{label}</p>
              <p className="text-xs text-[#8E8E93]">{weight} of overall score</p>
            </div>
            {/* Subscore input */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8E8E93]">Subscore (0–100)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={scores[key].subscore}
                onChange={(e) =>
                  setScores((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], subscore: Number(e.target.value) },
                  }))
                }
                className="w-20 h-9 text-center rounded-[8px] border border-[rgba(0,0,0,0.12)] bg-white text-sm font-bold text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>

          {/* Evidence list — TODO: load real evidence assets */}
          <div className="rounded-[10px] bg-[rgba(0,0,0,0.03)] p-3 mb-3">
            <p className="text-xs text-[#8E8E93] flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Evidence files load here
            </p>
          </div>

          <textarea
            rows={2}
            placeholder="Reviewer notes for this category (optional)…"
            value={scores[key].notes}
            onChange={(e) =>
              setScores((prev) => ({
                ...prev,
                [key]: { ...prev[key], notes: e.target.value },
              }))
            }
            className="w-full rounded-[8px] border border-[rgba(0,0,0,0.10)] bg-white px-3 py-2 text-xs text-[#48484A] placeholder:text-[#AEAEB2] resize-none focus:outline-none focus:border-[#007AFF]"
          />
        </div>
      ))}

      {/* Admin notes */}
      <div className="surface-elevated rounded-[16px] p-5">
        <label className="text-sm font-medium text-[#1C1C1E] block mb-2">
          Admin notes (required if returning for changes)
        </label>
        <textarea
          rows={3}
          placeholder="Explain what the farmer needs to fix or add…"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="w-full rounded-[10px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#48484A] placeholder:text-[#AEAEB2] resize-none focus:outline-none focus:border-[#007AFF]"
        />
      </div>

      {/* Decision buttons */}
      <div className="flex gap-3">
        <Button
          variant="destructive"
          size="lg"
          className="flex-1"
          disabled={loading}
          onClick={() => submitDecision('needs_changes')}
        >
          <XCircle className="h-4 w-4" /> Needs Changes
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={loading}
          onClick={() => submitDecision('verified')}
        >
          <CheckCircle2 className="h-4 w-4" /> Verify & Publish Score
        </Button>
      </div>
    </div>
  )
}

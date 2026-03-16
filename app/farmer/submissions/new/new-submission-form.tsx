'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, FileText, Upload } from 'lucide-react'

const categories = [
  { key: 'nutritional_value',   label: 'Nutritional Value',   weight: '30%', required: ['Lab test results or USDA nutrient data', 'Crop variety list'] },
  { key: 'food_safety',         label: 'Food Safety',         weight: '20%', required: ['Pesticide use records', 'Certifications (GAP, organic, etc.)'] },
  { key: 'supply_reliability',  label: 'Supply Reliability',  weight: '20%', required: ['Delivery records (past 12 months)', 'Production schedule'] },
  { key: 'local_accessibility', label: 'Local Accessibility', weight: '15%', required: ['Distribution channel documentation', 'Market receipts or invoices'] },
  { key: 'affordability',       label: 'Affordability',       weight: '15%', required: ['Price list', 'SNAP acceptance documentation'] },
]

export function NewSubmissionForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleCreate() {
    setLoading(true)
    const mockMode = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
    if (mockMode) {
      await new Promise(r => setTimeout(r, 600))
      router.push('/farmer/submissions/sub-5/evidence')
      return
    }
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      const { data } = await res.json()
      router.push(`/farmer/submissions/${data.id}/evidence`)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-5">
      {/* Checklist preview */}
      <div className="surface-elevated rounded-[20px] p-6">
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">
          Evidence required per category
        </h2>
        <div className="space-y-4">
          {categories.map(({ key, label, weight, required }) => (
            <div key={key} className="border-b border-[rgba(0,0,0,0.05)] pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#1C1C1E]">{label}</span>
                <span className="text-xs font-semibold text-[#8E8E93]">{weight}</span>
              </div>
              <ul className="space-y-1">
                {required.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#48484A]">
                    <FileText className="h-3.5 w-3.5 text-[#C7C7CC] mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Confirm and create */}
      <div className="surface-elevated rounded-[20px] p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded accent-[#34C759]"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <span className="text-sm text-[#48484A]">
            I confirm my farm profile is complete and I have the evidence documents ready to upload.
          </span>
        </label>
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!confirmed || loading}
        onClick={handleCreate}
      >
        <Upload className="h-4 w-4" />
        {loading ? 'Creating...' : 'Create Submission & Upload Evidence'}
      </Button>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

export function ApplyForm() {
  const [role, setRole] = useState<'farmer' | 'partner'>('farmer')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // TODO: wire to Supabase waitlist table
    await new Promise((r) => setTimeout(r, 800))
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="surface-elevated rounded-[20px] p-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(52,199,89,0.12)] mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-[#34C759]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1C1C1E] mb-2">Application received</h2>
        <p className="text-sm text-[#48484A]">
          We will be in touch within 3–5 business days with next steps.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="surface-elevated rounded-[20px] p-8 space-y-5">
      {/* Role selector */}
      <div>
        <p className="text-sm font-medium text-[#1C1C1E] mb-2">I am applying as a</p>
        <div className="grid grid-cols-2 gap-2">
          {(['farmer', 'partner'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`h-10 rounded-[10px] text-sm font-medium transition-all ${
                role === r
                  ? 'bg-[#34C759] text-white shadow-sm'
                  : 'bg-[rgba(0,0,0,0.04)] text-[#48484A] hover:bg-[rgba(0,0,0,0.07)]'
              }`}
            >
              {r === 'farmer' ? 'Farmer' : 'Partner / Buyer'}
            </button>
          ))}
        </div>
      </div>

      <Input label="Full name" name="fullName" required placeholder="Jane Smith" />
      <Input label="Email" name="email" type="email" required placeholder="jane@example.com" />
      <Input
        label={role === 'farmer' ? 'Farm name' : 'Organization name'}
        name="orgName"
        required
        placeholder={role === 'farmer' ? 'Sunny Acres Farm' : 'Regional Health Network'}
      />
      <Input
        label="Region / County"
        name="region"
        required
        placeholder="e.g. Fresno County, CA"
      />

      {role === 'farmer' && (
        <Input
          label="Approximate acreage"
          name="acreage"
          type="number"
          min={0}
          placeholder="50"
        />
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  )
}

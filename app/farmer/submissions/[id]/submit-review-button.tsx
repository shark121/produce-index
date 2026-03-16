'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface SubmitReviewButtonProps {
  submissionId: string
}

export function SubmitReviewButton({ submissionId }: SubmitReviewButtonProps) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const response = await fetch(`/api/submissions/${submissionId}/submit`, { method: 'POST' })
    const payload = await response.json()

    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to submit for review')
      setSubmitting(false)
      return
    }

    router.refresh()
    setSubmitting(false)
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button size="sm" className="self-start sm:self-auto shrink-0" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit for Review'}
      </Button>
      {error && <p className="text-xs text-[#FF3B30]">{error}</p>}
    </div>
  )
}

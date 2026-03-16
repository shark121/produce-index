'use client'

import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExpressInterestCardProps {
  farmId: string
  farmName: string
}

export function ExpressInterestCard({ farmId, farmName }: ExpressInterestCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [message, setMessage] = useState(`We would like to discuss a supply relationship with ${farmName}.`)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitInterest() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const response = await fetch('/api/partners/interests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmId, message }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to submit interest')
      setSaving(false)
      return
    }

    setSuccess('Interest recorded. PRI can now facilitate the next conversation.')
    setExpanded(false)
    setSaving(false)
  }

  return (
    <div className="surface-elevated rounded-[20px] p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1C1C1E]">Express Interest</p>
          <p className="mt-1 text-sm text-[#48484A]">
            Send a short note so PRI can log demand and help coordinate an introduction.
          </p>
        </div>
        <Button variant={expanded ? 'secondary' : 'primary'} size="sm" onClick={() => setExpanded((current) => !current)}>
          {expanded ? 'Close composer' : 'Express Interest'}
        </Button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3">
          <textarea
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full rounded-[10px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#48484A] focus:outline-none focus:border-[#007AFF]"
          />
          <div className="flex gap-2">
            <Button onClick={() => void submitInterest()} disabled={saving}>
              <SendHorizonal className="h-4 w-4" />
              {saving ? 'Sending...' : 'Send interest'}
            </Button>
            <Button variant="secondary" onClick={() => setExpanded(false)} disabled={saving}>Cancel</Button>
          </div>
        </div>
      ) : null}

      {success && <p className="mt-4 text-sm text-[#1A7A32]">{success}</p>}
      {error && <p className="mt-4 text-sm text-[#FF3B30]">{error}</p>}
    </div>
  )
}

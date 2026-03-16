'use client'

import { useState } from 'react'
import { SendHorizonal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BUYER_TYPE_OPTIONS, MARKETPLACE_FULFILLMENT_OPTIONS, MARKETPLACE_VOLUME_OPTIONS } from '@/lib/marketplace'
import type { BuyerType } from '@/lib/types'

interface SourcingInquiryCardProps {
  farmId: string
  listingId: string | null
  defaultRegion: string
}

export function SourcingInquiryCard({ farmId, listingId, defaultRegion }: SourcingInquiryCardProps) {
  const [buyerType, setBuyerType] = useState<Exclude<BuyerType, 'individual'>>('hospital')
  const [organizationName, setOrganizationName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [volumeTier, setVolumeTier] = useState('medium')
  const [timingWindow, setTimingWindow] = useState('')
  const [region, setRegion] = useState(defaultRegion)
  const [fulfillmentPreference, setFulfillmentPreference] = useState('either')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitInquiry() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const response = await fetch('/api/marketplace/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmId,
        listingId,
        buyerType,
        organizationName,
        contactName,
        email,
        phone,
        volumeTier,
        timingWindow,
        region,
        fulfillmentPreference,
        notes,
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to submit sourcing inquiry right now.')
      setSaving(false)
      return
    }

    setSuccess('Sourcing inquiry recorded. PRI can now route the request into the verified procurement workflow.')
    setSaving(false)
  }

  return (
    <div className="surface-elevated rounded-[20px] p-5">
      <p className="text-sm font-semibold text-[#1C1C1E]">Request institutional sourcing</p>
      <p className="mt-1 text-sm leading-relaxed text-[#48484A]">
        Hospitals, schools, and community organizations can send a lightweight sourcing brief instead of using a cart checkout.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <select
          value={buyerType}
          onChange={(event) => setBuyerType(event.target.value as Exclude<BuyerType, 'individual'>)}
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        >
          {BUYER_TYPE_OPTIONS.filter((option) => option.value !== 'individual').map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={volumeTier}
          onChange={(event) => setVolumeTier(event.target.value)}
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        >
          {MARKETPLACE_VOLUME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
          placeholder="Organization name"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        />
        <input
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
          placeholder="Contact name"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="Email"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        />
        <input
          value={timingWindow}
          onChange={(event) => setTimingWindow(event.target.value)}
          placeholder="Timing window"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        />
        <input
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          placeholder="Region"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
        />
      </div>

      <select
        value={fulfillmentPreference}
        onChange={(event) => setFulfillmentPreference(event.target.value)}
        className="mt-4 h-11 w-full rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
      >
        <option value="either">Pickup or delivery</option>
        {MARKETPLACE_FULFILLMENT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <textarea
        rows={4}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Describe the nutrient goals, volume, and use case"
        className="mt-4 w-full rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#007AFF]"
      />

      <div className="mt-4 flex justify-end">
        <Button variant="blue" onClick={() => void submitInquiry()} disabled={saving}>
          <SendHorizonal className="h-4 w-4" />
          {saving ? 'Sending...' : 'Send sourcing inquiry'}
        </Button>
      </div>

      {success && <p className="mt-4 text-sm text-[#1A7A32]">{success}</p>}
      {error && <p className="mt-4 text-sm text-[#FF3B30]">{error}</p>}
    </div>
  )
}

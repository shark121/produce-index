'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DISTRIBUTION_CHANNEL_OPTIONS } from '@/lib/farm-section-data'
import type { DistributionChannel, DistributionChannelType } from '@/lib/types'

const LABELS: Record<DistributionChannelType, string> = {
  farmers_market: 'Farmers market',
  grocery: 'Grocery',
  food_bank: 'Food bank',
  restaurant: 'Restaurant',
  csa: 'CSA',
  wholesale: 'Wholesale',
  direct_consumer: 'Direct consumer',
}

const EMPTY_FORM = {
  type: 'farmers_market' as DistributionChannelType,
  name: '',
  distanceMiles: '0',
  percentageOfSales: '0',
  servesLowIncomeArea: false,
}

export function DistributionManager({ initialChannels }: { initialChannels: DistributionChannel[] }) {
  const [channels, setChannels] = useState<DistributionChannel[]>(initialChannels)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadChannels() {
    const response = await fetch('/api/distribution')
    const payload = await response.json()
    setChannels(payload.data ?? [])
    setLoading(false)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  function beginEdit(channel: DistributionChannel) {
    setForm({
      type: channel.type,
      name: channel.name,
      distanceMiles: String(channel.distanceMiles),
      percentageOfSales: String(channel.percentageOfSales),
      servesLowIncomeArea: channel.servesLowIncomeArea,
    })
    setEditingId(channel.id)
    setShowForm(true)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const response = await fetch(editingId ? `/api/distribution/${editingId}` : '/api/distribution', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        distanceMiles: Number(form.distanceMiles),
        percentageOfSales: Number(form.percentageOfSales),
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save channel')
      setSaving(false)
      return
    }

    await loadChannels()
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/distribution/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setChannels((current) => current.filter((channel) => channel.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Distribution Channels</h1>
          <p className="mt-1 text-sm text-[#8E8E93]">
            Where and how far your produce travels. Local distribution to underserved areas improves your Local Accessibility subscore.
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowForm((current) => !current); if (showForm) resetForm() }}>
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add channel'}
        </Button>
      </div>

      {showForm && (
        <div className="surface-elevated rounded-[18px] p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1C1C1E]">Channel type</label>
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as DistributionChannelType }))}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
              >
                {DISTRIBUTION_CHANNEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>{LABELS[option]}</option>
                ))}
              </select>
            </div>
            <Input label="Channel name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Input label="Distance (miles)" type="number" min={0} value={form.distanceMiles} onChange={(event) => setForm((current) => ({ ...current, distanceMiles: event.target.value }))} />
            <Input label="% of sales" type="number" min={0} max={100} value={form.percentageOfSales} onChange={(event) => setForm((current) => ({ ...current, percentageOfSales: event.target.value }))} />
          </div>

          <label className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm text-[#48484A] w-fit">
            <input
              type="checkbox"
              className="accent-[#34C759]"
              checked={form.servesLowIncomeArea}
              onChange={(event) => setForm((current) => ({ ...current, servesLowIncomeArea: event.target.checked }))}
            />
            Serves low-income area
          </label>

          {error && <p className="text-sm text-[#FF3B30]">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create channel'}</Button>
            <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center text-sm text-[#8E8E93]">Loading channels...</div>
      ) : channels.length === 0 ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center">
          <p className="text-sm text-[#8E8E93]">No distribution channels added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {channels.map((channel) => (
            <div key={channel.id} className="surface-elevated rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#1C1C1E]">{channel.name}</p>
                  <p className="mt-1 text-sm text-[#8E8E93]">
                    {LABELS[channel.type]} · {channel.distanceMiles} miles · {channel.percentageOfSales}% of sales
                  </p>
                  <p className="mt-2 text-sm text-[#48484A]">
                    Low-income area coverage: {channel.servesLowIncomeArea ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon-sm" onClick={() => beginEdit(channel)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon-sm" onClick={() => void handleDelete(channel.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

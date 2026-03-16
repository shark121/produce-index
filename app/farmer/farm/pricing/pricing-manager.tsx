'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CropProfile, PricingProfile } from '@/lib/types'

const EMPTY_FORM = {
  cropId: '',
  cropName: '',
  pricePerUnit: '0',
  unit: 'lb',
  acceptsSnap: false,
  offersSlideScale: false,
  communityDiscountPct: '',
}

export function PricingManager({ initialPricing, initialCrops }: { initialPricing: PricingProfile[]; initialCrops: CropProfile[] }) {
  const [pricingProfiles, setPricingProfiles] = useState<PricingProfile[]>(initialPricing)
  const [crops] = useState<CropProfile[]>(initialCrops)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPricing() {
    const response = await fetch('/api/pricing')
    const payload = await response.json()
    setPricingProfiles(payload.data ?? [])
    setLoading(false)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  function beginEdit(profile: PricingProfile) {
    setForm({
      cropId: profile.cropId,
      cropName: profile.cropName,
      pricePerUnit: String(profile.pricePerUnit),
      unit: profile.unit,
      acceptsSnap: profile.acceptsSnap,
      offersSlideScale: profile.offersSlideScale,
      communityDiscountPct: profile.communityDiscountPct == null ? '' : String(profile.communityDiscountPct),
    })
    setEditingId(profile.id)
    setShowForm(true)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const response = await fetch(editingId ? `/api/pricing/${editingId}` : '/api/pricing', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        pricePerUnit: Number(form.pricePerUnit),
        communityDiscountPct: form.communityDiscountPct === '' ? null : Number(form.communityDiscountPct),
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save pricing profile')
      setSaving(false)
      return
    }

    await loadPricing()
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/pricing/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setPricingProfiles((current) => current.filter((profile) => profile.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Pricing</h1>
          <p className="mt-1 text-sm text-[#8E8E93]">
            Pricing data is compared against regional benchmarks to calculate your Affordability subscore.
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowForm((current) => !current); if (showForm) resetForm() }}>
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add pricing entry'}
        </Button>
      </div>

      {showForm && (
        <div className="surface-elevated rounded-[18px] p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1C1C1E]">Crop</label>
              <select
                value={form.cropId}
                onChange={(event) => {
                  const selected = crops.find((crop) => crop.id === event.target.value)
                  setForm((current) => ({
                    ...current,
                    cropId: event.target.value,
                    cropName: selected?.name ?? '',
                  }))
                }}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
              >
                <option value="">Select crop</option>
                {crops.map((crop) => (
                  <option key={crop.id} value={crop.id}>{crop.name}</option>
                ))}
              </select>
            </div>
            <Input label="Unit" value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} />
            <Input
              label="Price per unit"
              type="number"
              min={0}
              step="0.01"
              value={form.pricePerUnit}
              onChange={(event) => setForm((current) => ({ ...current, pricePerUnit: event.target.value }))}
            />
            <Input
              label="Community discount %"
              type="number"
              min={0}
              step="1"
              value={form.communityDiscountPct}
              onChange={(event) => setForm((current) => ({ ...current, communityDiscountPct: event.target.value }))}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm text-[#48484A]">
              <input
                type="checkbox"
                className="accent-[#34C759]"
                checked={form.acceptsSnap}
                onChange={(event) => setForm((current) => ({ ...current, acceptsSnap: event.target.checked }))}
              />
              Accepts SNAP
            </label>
            <label className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm text-[#48484A]">
              <input
                type="checkbox"
                className="accent-[#34C759]"
                checked={form.offersSlideScale}
                onChange={(event) => setForm((current) => ({ ...current, offersSlideScale: event.target.checked }))}
              />
              Offers sliding scale
            </label>
          </div>

          {error && <p className="text-sm text-[#FF3B30]">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create pricing entry'}</Button>
            <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center text-sm text-[#8E8E93]">Loading pricing...</div>
      ) : pricingProfiles.length === 0 ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center">
          <p className="text-sm text-[#8E8E93]">No pricing entries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pricingProfiles.map((profile) => (
            <div key={profile.id} className="surface-elevated rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#1C1C1E]">{profile.cropName}</p>
                  <p className="mt-1 text-sm text-[#8E8E93]">${profile.pricePerUnit.toFixed(2)} / {profile.unit}</p>
                  <p className="mt-2 text-sm text-[#48484A]">
                    SNAP: {profile.acceptsSnap ? 'Yes' : 'No'} · Sliding scale: {profile.offersSlideScale ? 'Yes' : 'No'}
                  </p>
                  <p className="mt-1 text-sm text-[#48484A]">
                    Community discount: {profile.communityDiscountPct == null ? 'None' : `${profile.communityDiscountPct}%`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon-sm" onClick={() => beginEdit(profile)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon-sm" onClick={() => void handleDelete(profile.id)}>
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

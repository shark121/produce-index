'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PRIMARY_USE_OPTIONS, SEASON_OPTIONS } from '@/lib/farm-section-data'
import type { CropProfile } from '@/lib/types'

const EMPTY_FORM = {
  name: '',
  variety: '',
  seasonalAvailability: [] as string[],
  annualYieldLbs: '0',
  certifications: '',
  primaryUse: 'fresh' as CropProfile['primaryUse'],
}

export function CropsManager({ initialCrops }: { initialCrops: CropProfile[] }) {
  const [crops, setCrops] = useState<CropProfile[]>(initialCrops)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadCrops() {
    setLoading(true)
    const response = await fetch('/api/crops')
    const payload = await response.json()
    setCrops(payload.data ?? [])
    setLoading(false)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  function beginEdit(crop: CropProfile) {
    setForm({
      name: crop.name,
      variety: crop.variety ?? '',
      seasonalAvailability: crop.seasonalAvailability,
      annualYieldLbs: String(crop.annualYieldLbs),
      certifications: crop.certifications.join(', '),
      primaryUse: crop.primaryUse,
    })
    setEditingId(crop.id)
    setShowForm(true)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const response = await fetch(editingId ? `/api/crops/${editingId}` : '/api/crops', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        annualYieldLbs: Number(form.annualYieldLbs),
        certifications: form.certifications,
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save crop')
      setSaving(false)
      return
    }

    await loadCrops()
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/crops/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setCrops((current) => current.filter((crop) => crop.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Crops</h1>
          <p className="mt-1 text-sm text-[#8E8E93]">
            List all crops you grow. Nutrient density and certifications feed into your Nutritional Value score.
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowForm((current) => !current); if (showForm) resetForm() }}>
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add crop'}
        </Button>
      </div>

      {showForm && (
        <div className="surface-elevated rounded-[18px] p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Crop name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            <Input label="Variety" value={form.variety} onChange={(event) => setForm((current) => ({ ...current, variety: event.target.value }))} />
            <Input
              label="Annual yield (lbs)"
              type="number"
              min={0}
              value={form.annualYieldLbs}
              onChange={(event) => setForm((current) => ({ ...current, annualYieldLbs: event.target.value }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1C1C1E]">Primary use</label>
              <select
                value={form.primaryUse}
                onChange={(event) => setForm((current) => ({ ...current, primaryUse: event.target.value as CropProfile['primaryUse'] }))}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
              >
                {PRIMARY_USE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Certifications"
            hint="Use commas for multiple certifications."
            value={form.certifications}
            onChange={(event) => setForm((current) => ({ ...current, certifications: event.target.value }))}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-[#1C1C1E]">Seasonal availability</p>
            <div className="flex flex-wrap gap-2">
              {SEASON_OPTIONS.map((season) => {
                const checked = form.seasonalAvailability.includes(season)
                return (
                  <label
                    key={season}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${checked ? 'border-[#34C759] bg-[rgba(52,199,89,0.12)] text-[#1A7A32]' : 'border-[rgba(0,0,0,0.08)] bg-white text-[#48484A]'}`}
                  >
                    <input
                      type="checkbox"
                      className="accent-[#34C759]"
                      checked={checked}
                      onChange={(event) => setForm((current) => ({
                        ...current,
                        seasonalAvailability: event.target.checked
                          ? [...current.seasonalAvailability, season]
                          : current.seasonalAvailability.filter((entry) => entry !== season),
                      }))}
                    />
                    {season}
                  </label>
                )
              })}
            </div>
          </div>

          {error && <p className="text-sm text-[#FF3B30]">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create crop'}
            </Button>
            <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center text-sm text-[#8E8E93]">Loading crops...</div>
      ) : crops.length === 0 ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center">
          <p className="text-sm text-[#8E8E93]">No crops added yet. Add your first crop to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {crops.map((crop) => (
            <div key={crop.id} className="surface-elevated rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#1C1C1E]">{crop.name}</p>
                  <p className="mt-1 text-sm text-[#8E8E93]">
                    {crop.variety ?? 'No variety listed'} · {crop.annualYieldLbs.toLocaleString()} lbs · {crop.primaryUse}
                  </p>
                  <p className="mt-2 text-sm text-[#48484A]">
                    Seasons: {crop.seasonalAvailability.join(', ') || 'None'}
                  </p>
                  <p className="mt-1 text-sm text-[#48484A]">
                    Certifications: {crop.certifications.join(', ') || 'None'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon-sm" onClick={() => beginEdit(crop)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon-sm" onClick={() => void handleDelete(crop.id)}>
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

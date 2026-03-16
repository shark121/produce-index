'use client'

import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SAFETY_CATEGORY_OPTIONS } from '@/lib/farm-section-data'
import type { SafetyPractice } from '@/lib/types'

const LABELS: Record<SafetyPractice['category'], string> = {
  pesticide: 'Pesticide',
  water: 'Water',
  handling: 'Handling',
  certification: 'Certification',
  soil: 'Soil',
}

const EMPTY_FORM = {
  category: 'handling' as SafetyPractice['category'],
  practiceDescription: '',
  hasDocumentation: true,
  certificationBody: '',
  expiresAt: '',
}

export function SafetyManager({ initialPractices }: { initialPractices: SafetyPractice[] }) {
  const [practices, setPractices] = useState<SafetyPractice[]>(initialPractices)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadPractices() {
    const response = await fetch('/api/safety-practices')
    const payload = await response.json()
    setPractices(payload.data ?? [])
    setLoading(false)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowForm(false)
    setError(null)
  }

  function beginEdit(practice: SafetyPractice) {
    setForm({
      category: practice.category,
      practiceDescription: practice.practiceDescription,
      hasDocumentation: practice.hasDocumentation,
      certificationBody: practice.certificationBody ?? '',
      expiresAt: practice.expiresAt ? practice.expiresAt.slice(0, 10) : '',
    })
    setEditingId(practice.id)
    setShowForm(true)
    setError(null)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)

    const response = await fetch(editingId ? `/api/safety-practices/${editingId}` : '/api/safety-practices', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save safety practice')
      setSaving(false)
      return
    }

    await loadPractices()
    resetForm()
    setSaving(false)
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/safety-practices/${id}`, { method: 'DELETE' })
    if (response.ok) {
      setPractices((current) => current.filter((practice) => practice.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Safety Practices</h1>
          <p className="mt-1 text-sm text-[#8E8E93]">
            Pesticide use, water handling, and certifications feed into your Food Safety subscore. Documentation is required for verification.
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowForm((current) => !current); if (showForm) resetForm() }}>
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? 'Close' : 'Add practice'}
        </Button>
      </div>

      {showForm && (
        <div className="surface-elevated rounded-[18px] p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1C1C1E]">Practice category</label>
              <select
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as SafetyPractice['category'] }))}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
              >
                {SAFETY_CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{LABELS[option]}</option>
                ))}
              </select>
            </div>
            <Input label="Certification body" value={form.certificationBody} onChange={(event) => setForm((current) => ({ ...current, certificationBody: event.target.value }))} />
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-[#1C1C1E]">Practice description</label>
              <textarea
                rows={4}
                value={form.practiceDescription}
                onChange={(event) => setForm((current) => ({ ...current, practiceDescription: event.target.value }))}
                className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF]"
              />
            </div>
            <Input label="Expiration date" type="date" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} />
          </div>

          <label className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.08)] bg-white px-3 py-2 text-sm text-[#48484A] w-fit">
            <input
              type="checkbox"
              className="accent-[#34C759]"
              checked={form.hasDocumentation}
              onChange={(event) => setForm((current) => ({ ...current, hasDocumentation: event.target.checked }))}
            />
            Documentation available
          </label>

          {error && <p className="text-sm text-[#FF3B30]">{error}</p>}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Create practice'}</Button>
            <Button variant="secondary" onClick={resetForm} disabled={saving}>Cancel</Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center text-sm text-[#8E8E93]">Loading safety practices...</div>
      ) : practices.length === 0 ? (
        <div className="surface-elevated rounded-[16px] p-10 text-center">
          <p className="text-sm text-[#8E8E93]">No safety practices recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {practices.map((practice) => (
            <div key={practice.id} className="surface-elevated rounded-[16px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-[#1C1C1E]">{LABELS[practice.category]}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#48484A]">{practice.practiceDescription}</p>
                  <p className="mt-2 text-sm text-[#8E8E93]">
                    Documentation: {practice.hasDocumentation ? 'Yes' : 'No'}
                    {practice.certificationBody ? ` · ${practice.certificationBody}` : ''}
                    {practice.expiresAt ? ` · Expires ${new Date(practice.expiresAt).toLocaleDateString()}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon-sm" onClick={() => beginEdit(practice)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="destructive" size="icon-sm" onClick={() => void handleDelete(practice.id)}>
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

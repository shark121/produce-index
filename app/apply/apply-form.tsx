'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ModeNotice } from '@/components/ui/mode-notice'
import {
  ESTIMATED_VOLUME_OPTIONS,
  INSTITUTION_TYPE_OPTIONS,
  INSTITUTION_USE_CASE_OPTIONS,
} from '@/lib/pilot-applications'
import { isMockMode } from '@/lib/is-mock-mode'
import type {
  EstimatedVolumeRange,
  InstitutionType,
  InstitutionUseCase,
  PilotApplicationRecord,
  PilotApplicationType,
} from '@/lib/types'

type FieldErrors = Record<string, string>

const initialState = {
  type: 'institution' as PilotApplicationType,
  fullName: '',
  email: '',
  organizationName: '',
  region: '',
  notes: '',
  acreage: '',
  primaryCrops: '',
  organizationType: 'lender' as InstitutionType,
  useCase: 'underwriting' as InstitutionUseCase,
  estimatedVolume: '250k_to_1m' as EstimatedVolumeRange,
}

export function ApplyForm() {
  const [values, setValues] = useState(initialState)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitted, setSubmitted] = useState<PilotApplicationRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const mockMode = isMockMode()

  function updateField<K extends keyof typeof initialState>(key: K, value: (typeof initialState)[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setServerError('')
    setFieldErrors({})

    const payload =
      values.type === 'farmer'
        ? {
            type: values.type,
            fullName: values.fullName,
            email: values.email,
            organizationName: values.organizationName,
            region: values.region,
            notes: values.notes,
            acreage: values.acreage,
            primaryCrops: values.primaryCrops,
          }
        : {
            type: values.type,
            fullName: values.fullName,
            email: values.email,
            organizationName: values.organizationName,
            region: values.region,
            notes: values.notes,
            organizationType: values.organizationType,
            useCase: values.useCase,
            estimatedVolume: values.estimatedVolume,
          }

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => null)

    if (!res.ok) {
      let nextErrors: FieldErrors = {}
      if (json?.error?.code) {
        try {
          nextErrors = JSON.parse(json.error.code)
        } catch {
          nextErrors = {}
        }
      }
      setFieldErrors(nextErrors)
      setServerError(json?.error?.message ?? 'We could not save your request. Please try again.')
      setLoading(false)
      return
    }

    setSubmitted(json.data as PilotApplicationRecord)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="space-y-5">
        <div className="surface-elevated rounded-[20px] p-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(52,199,89,0.12)]">
            <CheckCircle2 className="h-7 w-7 text-[#34C759]" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-[#1C1C1E]">Request saved</h2>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-[#48484A]">
            Your {submitted.type === 'institution' ? 'institution' : 'farmer'} pilot request was
            stored successfully. We will follow up with next steps and any onboarding requirements.
          </p>
          <p className="mt-4 text-xs text-[#8E8E93]">
            Reference ID: <span className="font-medium text-[#1C1C1E]">{submitted.id}</span>
          </p>
        </div>
        {submitted.storageMode === 'mock-file' && (
          <ModeNotice
            title="The request was saved into local demo storage."
            body="While Supabase is not configured, pilot applications are persisted to a local project file so the intake flow still behaves like a real submission."
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {mockMode && (
        <ModeNotice
          title="Demo mode persists this form locally instead of sending it to live infrastructure."
          body="You should only see a success state after the request is actually written. Once Supabase is configured, the same form can write to the pilot intake table."
        />
      )}

      <form onSubmit={handleSubmit} className="surface-elevated rounded-[20px] p-5 md:p-8 space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-[#1C1C1E]">I am requesting access as a</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              ['institution', 'Institution'],
              ['farmer', 'Farmer'],
            ] as const).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() => updateField('type', type)}
                className={`h-10 rounded-[10px] text-sm font-medium transition-all ${
                  values.type === type
                    ? 'bg-[#34C759] text-white shadow-sm'
                    : 'bg-[rgba(0,0,0,0.04)] text-[#48484A] hover:bg-[rgba(0,0,0,0.07)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Full name"
          name="fullName"
          required
          placeholder="Jane Smith"
          value={values.fullName}
          onChange={(e) => updateField('fullName', e.target.value)}
          error={fieldErrors.fullName}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="jane@example.com"
          value={values.email}
          onChange={(e) => updateField('email', e.target.value)}
          error={fieldErrors.email}
        />
        <Input
          label={values.type === 'farmer' ? 'Farm name' : 'Organization name'}
          name="organizationName"
          required
          placeholder={values.type === 'farmer' ? 'Sunny Acres Farm' : 'Regional Health Network'}
          value={values.organizationName}
          onChange={(e) => updateField('organizationName', e.target.value)}
          error={fieldErrors.organizationName}
        />
        <Input
          label="Region / County"
          name="region"
          required
          placeholder="e.g. Fresno County, CA"
          value={values.region}
          onChange={(e) => updateField('region', e.target.value)}
          error={fieldErrors.region}
        />

        {values.type === 'farmer' ? (
          <>
            <Input
              label="Approximate acreage"
              name="acreage"
              required
              placeholder="50"
              value={values.acreage}
              onChange={(e) => updateField('acreage', e.target.value)}
              error={fieldErrors.acreage}
            />
            <Input
              label="Primary crops"
              name="primaryCrops"
              required
              placeholder="Kale, tomatoes, peppers"
              value={values.primaryCrops}
              onChange={(e) => updateField('primaryCrops', e.target.value)}
              error={fieldErrors.primaryCrops}
            />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="organizationType" className="text-sm font-medium text-[#1C1C1E]">
                Organization type
              </label>
              <select
                id="organizationType"
                value={values.organizationType}
                onChange={(e) => updateField('organizationType', e.target.value as InstitutionType)}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF] focus:ring-3 focus:ring-[rgba(0,122,255,0.12)]"
              >
                {INSTITUTION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {fieldErrors.organizationType && (
                <p className="text-xs text-[#FF3B30]">{fieldErrors.organizationType}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="useCase" className="text-sm font-medium text-[#1C1C1E]">
                Primary use case
              </label>
              <select
                id="useCase"
                value={values.useCase}
                onChange={(e) => updateField('useCase', e.target.value as InstitutionUseCase)}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF] focus:ring-3 focus:ring-[rgba(0,122,255,0.12)]"
              >
                {INSTITUTION_USE_CASE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {fieldErrors.useCase && <p className="text-xs text-[#FF3B30]">{fieldErrors.useCase}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="estimatedVolume" className="text-sm font-medium text-[#1C1C1E]">
                Estimated buying or financing volume
              </label>
              <select
                id="estimatedVolume"
                value={values.estimatedVolume}
                onChange={(e) => updateField('estimatedVolume', e.target.value as EstimatedVolumeRange)}
                className="h-11 rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 text-sm text-[#1C1C1E] focus:outline-none focus:border-[#007AFF] focus:ring-3 focus:ring-[rgba(0,122,255,0.12)]"
              >
                {ESTIMATED_VOLUME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {fieldErrors.estimatedVolume && (
                <p className="text-xs text-[#FF3B30]">{fieldErrors.estimatedVolume}</p>
              )}
            </div>
          </>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium text-[#1C1C1E]">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            placeholder={
              values.type === 'institution'
                ? 'Tell us what region, program, or diligence workflow you want PRI to support.'
                : 'Tell us anything useful about your current buyers, certifications, or financing goals.'
            }
            value={values.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            className="w-full rounded-[10px] border border-[rgba(0,0,0,0.12)] bg-white px-3.5 py-3 text-sm text-[#1C1C1E] placeholder:text-[#AEAEB2] focus:outline-none focus:border-[#007AFF] focus:ring-3 focus:ring-[rgba(0,122,255,0.12)]"
          />
        </div>

        {serverError && (
          <div className="rounded-[12px] border border-[rgba(255,59,48,0.18)] bg-[rgba(255,59,48,0.08)] px-4 py-3 text-sm text-[#C0392B]">
            {serverError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Saving Request...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  )
}

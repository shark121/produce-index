import { NextResponse } from 'next/server'
import { validatePilotApplicationInput } from '@/lib/pilot-applications'
import { saveMockPilotApplication } from '@/lib/pilot-application-store'
import { isMockMode } from '@/lib/is-mock-mode'
import type { PilotApplicationInput, PilotApplicationRecord } from '@/lib/types'

export const runtime = 'nodejs'

function toSupabaseInsert(record: PilotApplicationInput) {
  return {
    application_type: record.type,
    full_name: record.fullName,
    email: record.email,
    organization_name: record.organizationName,
    region: record.region,
    notes: record.notes,
    acreage: record.type === 'farmer' ? record.acreage : null,
    primary_crops: record.type === 'farmer' ? record.primaryCrops : null,
    organization_type: record.type === 'institution' ? record.organizationType : null,
    use_case: record.type === 'institution' ? record.useCase : null,
    estimated_volume: record.type === 'institution' ? record.estimatedVolume : null,
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { data: null, error: { message: 'A valid application payload is required.' } },
      { status: 400 },
    )
  }

  const { data, errors } = validatePilotApplicationInput(body as Record<string, unknown>)

  if (!data) {
    return NextResponse.json(
      { data: null, error: { message: 'Please fix the highlighted application fields.', code: JSON.stringify(errors) } },
      { status: 400 },
    )
  }

  if (isMockMode()) {
    const record = await saveMockPilotApplication(data)
    return NextResponse.json({ data: record, error: null }, { status: 201 })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data: inserted, error } = await supabase
    .from('pilot_intake_applications')
    .insert(toSupabaseInsert(data))
    .select('id, created_at')
    .single()

  if (error || !inserted) {
    return NextResponse.json(
      { data: null, error: { message: error?.message ?? 'Could not store the application.' } },
      { status: 500 },
    )
  }

  const record: PilotApplicationRecord = {
    ...data,
    id: String(inserted.id),
    createdAt: String(inserted.created_at ?? new Date().toISOString()),
    storageMode: 'supabase',
  }

  return NextResponse.json({ data: record, error: null }, { status: 201 })
}

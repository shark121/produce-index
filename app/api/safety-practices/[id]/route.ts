import { NextResponse } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { deleteMockRecord, getSafetyPracticesForFarm, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { normalizeSafetyInput, normalizeSafetyRow, safetyToSupabaseInsert } from '@/lib/farm-section-data'

interface Context {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    const existing = getSafetyPracticesForFarm('farm-1').find((item) => item.id === id)
    if (!existing) {
      return NextResponse.json({ data: null, error: { message: 'Safety practice not found' } }, { status: 404 })
    }

    const practice = normalizeSafetyInput(await request.json(), existing.farmId, existing)
    return NextResponse.json({ data: upsertMockRecord('safetyPractices', practice), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: existingRow, error: existingError } = await supabase
    .from('safety_practices')
    .select('*')
    .eq('id', id)
    .single()

  if (existingError || !existingRow) {
    return NextResponse.json({ data: null, error: { message: 'Safety practice not found' } }, { status: 404 })
  }

  const practice = normalizeSafetyInput(await request.json(), String(existingRow.farm_id), normalizeSafetyRow(existingRow))
  const { data, error } = await supabase
    .from('safety_practices')
    .update(safetyToSupabaseInsert(practice))
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizeSafetyRow(data), error: null })
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    deleteMockRecord('safetyPractices', id)
    return NextResponse.json({ data: { deleted: true }, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { error } = await supabase.from('safety_practices').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: { deleted: true }, error: null })
}

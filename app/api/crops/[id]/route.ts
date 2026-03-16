import { NextResponse } from 'next/server'
import { cropToSupabaseInsert, normalizeCropInput, normalizeCropRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { deleteMockRecord, getCropsForFarm, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

interface Context { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    const existing = getCropsForFarm('farm-1').find((crop) => crop.id === id)
    if (!existing) {
      return NextResponse.json({ data: null, error: { message: 'Crop not found' } }, { status: 404 })
    }

    const body = await request.json()
    const crop = normalizeCropInput(body, existing.farmId, existing)
    return NextResponse.json({ data: upsertMockRecord('crops', crop), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const body = await request.json()
  const { data: existingRow, error: existingError } = await supabase
    .from('crop_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (existingError || !existingRow) {
    return NextResponse.json({ data: null, error: { message: 'Crop not found' } }, { status: 404 })
  }

  const crop = normalizeCropInput(body, String(existingRow.farm_id), normalizeCropRow(existingRow))
  const { data, error } = await supabase
    .from('crop_profiles')
    .update(cropToSupabaseInsert(crop))
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizeCropRow(data), error: null })
}

export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    deleteMockRecord('crops', id)
    return NextResponse.json({ data: { deleted: true }, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { error } = await supabase.from('crop_profiles').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: { deleted: true }, error: null })
}

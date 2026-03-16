import { NextResponse } from 'next/server'
import { normalizeCropInput, normalizeCropRow, cropToSupabaseInsert } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { getCropsForFarm, getFarmById, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')

  if (isMockMode()) {
    const resolvedFarmId = farmId ?? 'farm-1'
    return NextResponse.json({ data: getCropsForFarm(resolvedFarmId), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  let query = supabase.from('crop_profiles').select('*').order('name')
  if (farmId) query = query.eq('farm_id', farmId)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: (data ?? []).map((row) => normalizeCropRow(row)), error: null })
}

export async function POST(request: Request) {
  if (isMockMode()) {
    const body = await request.json()
    const farm = getFarmById('farm-1')
    if (!farm) {
      return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
    }

    const crop = normalizeCropInput(body, farm.id)
    if (!crop.name || crop.seasonalAvailability.length === 0) {
      return NextResponse.json({ data: null, error: { message: 'Crop name and seasonal availability are required' } }, { status: 400 })
    }

    return NextResponse.json({ data: upsertMockRecord('crops', crop), error: null }, { status: 201 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const body = await request.json()
  const { data: farm } = await supabase
    .from('farm_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!farm) {
    return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
  }

  const crop = normalizeCropInput(body, farm.id)
  const { data, error } = await supabase
    .from('crop_profiles')
    .insert(cropToSupabaseInsert(crop))
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizeCropRow(data), error: null }, { status: 201 })
}

import { NextResponse } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { getFarmById, getSafetyPracticesForFarm, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { normalizeSafetyInput, normalizeSafetyRow, safetyToSupabaseInsert } from '@/lib/farm-section-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')

  if (isMockMode()) {
    return NextResponse.json({ data: getSafetyPracticesForFarm(farmId ?? 'farm-1'), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  let query = supabase.from('safety_practices').select('*').order('category')
  if (farmId) query = query.eq('farm_id', farmId)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: (data ?? []).map((row) => normalizeSafetyRow(row)), error: null })
}

export async function POST(request: Request) {
  if (isMockMode()) {
    const farm = getFarmById('farm-1')
    if (!farm) {
      return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
    }

    const practice = normalizeSafetyInput(await request.json(), farm.id)
    if (!practice.practiceDescription) {
      return NextResponse.json({ data: null, error: { message: 'Practice description is required' } }, { status: 400 })
    }

    return NextResponse.json({ data: upsertMockRecord('safetyPractices', practice), error: null }, { status: 201 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: farm } = await supabase
    .from('farm_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!farm) {
    return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
  }

  const practice = normalizeSafetyInput(await request.json(), farm.id)
  const { data, error } = await supabase
    .from('safety_practices')
    .insert(safetyToSupabaseInsert(practice))
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizeSafetyRow(data), error: null }, { status: 201 })
}

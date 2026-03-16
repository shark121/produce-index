import { NextResponse } from 'next/server'
import { normalizePricingInput, normalizePricingRow, pricingToSupabaseInsert } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { getFarmById, getPricingForFarm, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')

  if (isMockMode()) {
    return NextResponse.json({ data: getPricingForFarm(farmId ?? 'farm-1'), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  let query = supabase.from('pricing_profiles').select('*').order('crop_name')
  if (farmId) query = query.eq('farm_id', farmId)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: (data ?? []).map((row) => normalizePricingRow(row)), error: null })
}

export async function POST(request: Request) {
  if (isMockMode()) {
    const farm = getFarmById('farm-1')
    if (!farm) {
      return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
    }

    const pricing = normalizePricingInput(await request.json(), farm.id)
    if (!pricing.cropName || !pricing.cropId) {
      return NextResponse.json({ data: null, error: { message: 'Crop is required' } }, { status: 400 })
    }

    return NextResponse.json({ data: upsertMockRecord('pricingProfiles', pricing), error: null }, { status: 201 })
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

  const pricing = normalizePricingInput(await request.json(), farm.id)
  const { data, error } = await supabase
    .from('pricing_profiles')
    .insert(pricingToSupabaseInsert(pricing))
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizePricingRow(data), error: null }, { status: 201 })
}

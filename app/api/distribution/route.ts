import { NextResponse } from 'next/server'
import { distributionToSupabaseInsert, normalizeDistributionInput, normalizeDistributionRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { getDistributionForFarm, getFarmById, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')

  if (isMockMode()) {
    return NextResponse.json({ data: getDistributionForFarm(farmId ?? 'farm-1'), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  let query = supabase.from('distribution_channels').select('*').order('name')
  if (farmId) query = query.eq('farm_id', farmId)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: (data ?? []).map((row) => normalizeDistributionRow(row)), error: null })
}

export async function POST(request: Request) {
  if (isMockMode()) {
    const farm = getFarmById('farm-1')
    if (!farm) {
      return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
    }

    const channel = normalizeDistributionInput(await request.json(), farm.id)
    if (!channel.name) {
      return NextResponse.json({ data: null, error: { message: 'Channel name is required' } }, { status: 400 })
    }

    return NextResponse.json({ data: upsertMockRecord('distributionChannels', channel), error: null }, { status: 201 })
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

  const channel = normalizeDistributionInput(await request.json(), farm.id)
  const { data, error } = await supabase
    .from('distribution_channels')
    .insert(distributionToSupabaseInsert(channel))
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizeDistributionRow(data), error: null }, { status: 201 })
}

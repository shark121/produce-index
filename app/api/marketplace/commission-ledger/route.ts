import { NextResponse } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { getMarketplaceCommissionsForFarm } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

function mockFarmId() {
  return 'farm-1'
}

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ data: getMarketplaceCommissionsForFarm(mockFarmId()), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
  if (!farm) {
    return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('marketplace_commission_ledger')
    .select('*')
    .eq('farm_id', farm.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: data ?? [], error: null })
}

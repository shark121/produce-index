import { NextResponse } from 'next/server'
import { distributionToSupabaseInsert, normalizeDistributionInput, normalizeDistributionRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import { deleteMockRecord, getDistributionForFarm, upsertMockRecord } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    const existing = getDistributionForFarm('farm-1').find((item) => item.id === id)
    if (!existing) {
      return NextResponse.json({ data: null, error: { message: 'Distribution record not found' } }, { status: 404 })
    }

    const channel = normalizeDistributionInput(await request.json(), existing.farmId, existing)
    return NextResponse.json({ data: upsertMockRecord('distributionChannels', channel), error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: existingRow, error: existingError } = await supabase
    .from('distribution_channels')
    .select('*')
    .eq('id', id)
    .single()

  if (existingError || !existingRow) {
    return NextResponse.json({ data: null, error: { message: 'Distribution record not found' } }, { status: 404 })
  }

  const channel = normalizeDistributionInput(await request.json(), String(existingRow.farm_id), normalizeDistributionRow(existingRow))
  const { data, error } = await supabase
    .from('distribution_channels')
    .update(distributionToSupabaseInsert(channel))
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: normalizeDistributionRow(data), error: null })
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    deleteMockRecord('distributionChannels', id)
    return NextResponse.json({ data: { deleted: true }, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { error } = await supabase.from('distribution_channels').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: { deleted: true }, error: null })
}

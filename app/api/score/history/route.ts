import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  // Farmers can only view their own farm's history
  if (user.user_metadata?.role === 'farmer') {
    const { data: farm } = await supabase
      .from('farm_profiles').select('id').eq('user_id', user.id).single()
    if (!farm || (farmId && farm.id !== farmId)) {
      return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
    }
  }

  let query = supabase
    .from('pri_score_snapshots')
    .select('*')
    .order('calculated_at', { ascending: false })

  if (farmId) query = query.eq('farm_id', farmId)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

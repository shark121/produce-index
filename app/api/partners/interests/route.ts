import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  let query = supabase
    .from('partner_interests')
    .select('*')
    .order('created_at', { ascending: false })

  if (user.user_metadata?.role === 'partner') {
    query = query.eq('partner_id', user.id)
  } else if (user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'partner') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const body = await request.json()
  const { farmId, message } = body

  if (!farmId) {
    return NextResponse.json({ data: null, error: { message: 'farmId is required' } }, { status: 400 })
  }

  // Verify the farm is actually verified before allowing interest
  const { data: submission } = await supabase
    .from('pri_submissions')
    .select('farm_id, farm_name')
    .eq('farm_id', farmId)
    .eq('status', 'verified')
    .single()

  if (!submission) {
    return NextResponse.json(
      { data: null, error: { message: 'Farm is not yet verified' } },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('partner_interests')
    .insert({
      partner_id: user.id,
      partner_name: user.user_metadata?.full_name ?? user.email,
      farm_id: farmId,
      farm_name: submission.farm_name,
      message: message ?? '',
      status: 'pending',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

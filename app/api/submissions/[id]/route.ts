import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Context { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  const { data, error } = await supabase
    .from('pri_submissions')
    .select('*, evidence_assets(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 404 })

  // Farmers may only fetch their own farm's submission
  if (user.user_metadata?.role === 'farmer') {
    const { data: farm } = await supabase
      .from('farm_profiles').select('id').eq('user_id', user.id).single()
    if (!farm || data.farm_id !== farm.id) {
      return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
    }
  }

  return NextResponse.json({ data, error: null })
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  const body = await request.json()
  const { data, error } = await supabase
    .from('pri_submissions')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data, error: null })
}

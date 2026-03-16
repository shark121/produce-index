import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canTransition } from '@/lib/types'

interface Context { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  // Fetch submission and verify ownership
  const { data: submission, error: fetchError } = await supabase
    .from('pri_submissions')
    .select('id, status, farm_id')
    .eq('id', id)
    .single()

  if (fetchError || !submission) {
    return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
  }

  const { data: farm } = await supabase
    .from('farm_profiles').select('id').eq('user_id', user.id).single()

  if (!farm || submission.farm_id !== farm.id) {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  // Enforce state machine
  if (!canTransition(submission.status, 'submitted')) {
    return NextResponse.json(
      { data: null, error: { message: `Cannot transition from ${submission.status} to submitted` } },
      { status: 409 },
    )
  }

  const { data, error } = await supabase
    .from('pri_submissions')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

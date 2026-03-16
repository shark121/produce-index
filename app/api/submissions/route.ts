import { NextResponse } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { getAllSubmissions, getFarmById } from '@/lib/mock'
import { persistMockSubmission } from '@/lib/submission-scoring-store'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  if (isMockMode()) {
    const submissions = getAllSubmissions().filter((submission) => submission.farmId === 'farm-1')
    return NextResponse.json({ data: submissions, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  const role = user.user_metadata?.role

  let query = supabase.from('pri_submissions').select('*').order('created_at', { ascending: false })

  if (role === 'farmer') {
    // Farmers only see their own submissions
    const { data: farm } = await supabase
      .from('farm_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!farm) return NextResponse.json({ data: [], error: null })
    query = query.eq('farm_id', farm.id)
  } else if (role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

export async function POST() {
  if (isMockMode()) {
    const farm = getFarmById('farm-1')
    if (!farm) {
      return NextResponse.json(
        { data: null, error: { message: 'Complete your farm profile before creating a submission' } },
        { status: 400 },
      )
    }

    const now = new Date().toISOString()
    const submission = persistMockSubmission({
      id: crypto.randomUUID(),
      farmId: farm.id,
      farmName: farm.name,
      status: 'draft',
      submittedAt: null,
      reviewStartedAt: null,
      reviewedAt: null,
      verifiedAt: null,
      adminNotes: null,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ data: submission, error: null }, { status: 201 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: farm } = await supabase
    .from('farm_profiles')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!farm) {
    return NextResponse.json(
      { data: null, error: { message: 'Complete your farm profile before creating a submission' } },
      { status: 400 },
    )
  }

  const { data, error } = await supabase
    .from('pri_submissions')
    .insert({ farm_id: farm.id, farm_name: farm.name, status: 'draft' })
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

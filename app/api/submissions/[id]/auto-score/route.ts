import { NextResponse } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { createClient } from '@/lib/supabase/server'
import { getAutoScoringContext, rerunAutoScoring } from '@/lib/submission-scoring-store'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    let context = await getAutoScoringContext(id)
    if (!context?.run) {
      await rerunAutoScoring(id)
      context = await getAutoScoringContext(id)
    }

    if (!context) {
      return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
    }

    return NextResponse.json({ data: context, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !['admin', 'farmer'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  let context = await getAutoScoringContext(id, supabase as never)
  if (!context?.run) {
    await rerunAutoScoring(id, supabase as never)
    context = await getAutoScoringContext(id, supabase as never)
  }

  if (!context) {
    return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
  }

  return NextResponse.json({ data: context, error: null })
}

export async function POST(_request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    const result = await rerunAutoScoring(id)
    if (!result) {
      return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
    }

    return NextResponse.json({ data: result, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const result = await rerunAutoScoring(id, supabase as never)
  if (!result) {
    return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
  }

  return NextResponse.json({ data: result, error: null })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { getVerifiedFarmScorecards } from '@/lib/scorecards'

/**
 * GET /api/partners/reports
 * Returns structured report data. Export rendering remains a later milestone.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'directory'
  const region = searchParams.get('region')

  if (isMockMode()) {
    const scorecards = getVerifiedFarmScorecards().filter(
      (scorecard) => !region || scorecard.farm.region === region,
    )

    if (type === 'directory' || type === 'scores' || type === 'crops') {
      return NextResponse.json({ data: scorecards, error: null })
    }

    return NextResponse.json({ data: null, error: { message: 'Unknown report type' } }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !['partner', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  return NextResponse.json(
    {
      data: null,
      error: { message: 'Report export endpoints are not live yet. Use search and compare workflows for now.' },
    },
    { status: 501 },
  )
}

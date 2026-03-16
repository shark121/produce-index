import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/partners/reports
 * Returns JSON data for report generation.
 * Frontend handles CSV/PDF rendering client-side (Sprint 4).
 *
 * Query params:
 *   type: 'directory' | 'scores' | 'crops'
 *   region?: string
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'directory'
  const region = searchParams.get('region')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !['partner', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  if (type === 'directory') {
    let query = supabase
      .from('pri_submissions')
      .select(`
        farm_id,
        verified_at,
        farm_profiles (name, region, city, state),
        pri_score_snapshots (
          overall_score, nutritional_value, food_safety, supply_reliability,
          local_accessibility, affordability, calculated_at
        )
      `)
      .eq('status', 'verified')

    if (region) query = query.eq('farm_profiles.region' as never, region)

    const { data, error } = await query
    if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
    return NextResponse.json({ data, error: null })
  }

  return NextResponse.json({ data: null, error: { message: 'Unknown report type' } }, { status: 400 })
}

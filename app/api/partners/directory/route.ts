import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/partners/directory
 * Returns verified farms with their latest PRIScoreSnapshot.
 * Partner-scoped: only verified submissions visible. No evidence data exposed.
 *
 * Query params:
 *   region?: string
 *   minScore?: number
 *   farmId?: string  (single farm scorecard)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !['partner', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const region = searchParams.get('region')
  const minScore = searchParams.get('minScore')
  const farmId = searchParams.get('farmId')

  // Fetch verified submissions with latest score snapshots and farm profiles
  let query = supabase
    .from('pri_submissions')
    .select(`
      id,
      farm_id,
      verified_at,
      farm_profiles (
        id, name, region, city, state, acreage_tilled, years_in_operation, description
      ),
      pri_score_snapshots (
        overall_score, nutritional_value, food_safety, supply_reliability,
        local_accessibility, affordability, verification_status, calculated_at
      ),
      crop_profiles (
        id, name, seasonal_availability, certifications
      ),
      distribution_channels (
        id, type, distance_miles, percentage_of_sales, serves_low_income_area
      )
    `)
    .eq('status', 'verified')
    .order('verified_at', { ascending: false })

  if (farmId) query = query.eq('farm_id', farmId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (region) query = (query as any).eq('farm_profiles.region', region)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })

  // Filter by minScore in application layer
  const filtered = minScore
    ? data.filter((row: Record<string, unknown>) => {
        const snaps = row.pri_score_snapshots as { overall_score: number }[] | null
        const latest = snaps?.[0]?.overall_score ?? 0
        return latest >= Number(minScore)
      })
    : data

  return NextResponse.json({ data: filtered, error: null })
}

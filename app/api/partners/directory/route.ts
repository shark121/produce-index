import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { rankFarmScorecardsForBuyer } from '@/lib/marketplace'
import { getMarketplaceFarmMatchInputs } from '@/lib/marketplace-server'
import { buildFarmScorecard, filterFarmScorecards, getVerifiedFarmScorecards } from '@/lib/scorecards'
import type { CropProfile, DistributionChannel, FarmProfile, PRIScoreSnapshot } from '@/lib/types'

function arrayValue<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value
  if (value) return [value]
  return []
}

function mapRowToScorecard(row: Record<string, unknown>) {
  const farm = arrayValue(row.farm_profiles)[0] as Record<string, unknown> | undefined
  const snapshots = arrayValue(row.pri_score_snapshots) as Array<Record<string, unknown>>
  const latestSnapshot = snapshots
    .sort(
      (a, b) =>
        new Date(String(b.calculated_at ?? 0)).getTime() -
        new Date(String(a.calculated_at ?? 0)).getTime(),
    )[0]

  if (!farm || !latestSnapshot) return null

  const mappedFarm: Pick<FarmProfile, 'id' | 'name' | 'region' | 'city' | 'state' | 'acreageTilled' | 'yearsInOperation' | 'description'> = {
    id: String(farm.id),
    name: String(farm.name ?? ''),
    region: String(farm.region ?? ''),
    city: String(farm.city ?? ''),
    state: String(farm.state ?? ''),
    acreageTilled: Number(farm.acreage_tilled ?? 0),
    yearsInOperation: Number(farm.years_in_operation ?? 0),
    description: String(farm.description ?? ''),
  }

  const mappedScore: PRIScoreSnapshot = {
    id: String(latestSnapshot.id ?? `${row.farm_id}-snapshot`),
    submissionId: String(row.id),
    farmId: String(row.farm_id),
    nutritionalValue: Number(latestSnapshot.nutritional_value ?? 0),
    foodSafety: Number(latestSnapshot.food_safety ?? 0),
    supplyReliability: Number(latestSnapshot.supply_reliability ?? 0),
    localAccessibility: Number(latestSnapshot.local_accessibility ?? 0),
    affordability: Number(latestSnapshot.affordability ?? 0),
    overallScore: Number(latestSnapshot.overall_score ?? 0),
    dataCompleteness: Number(latestSnapshot.data_completeness ?? 0.8),
    verificationStatus: 'verified',
    weightsVersion: String(latestSnapshot.weights_version ?? 'v1'),
    benchmarkVersion: String(latestSnapshot.benchmark_version ?? '2026-pilot-v1'),
    calculatedAt: String(latestSnapshot.calculated_at ?? row.verified_at ?? new Date().toISOString()),
    calculatedBy: String(latestSnapshot.calculated_by ?? 'system'),
  }

  const crops = arrayValue(row.crop_profiles).map((crop) => {
    const value = crop as Record<string, unknown>
    return {
      id: String(value.id),
      farmId: String(row.farm_id),
      name: String(value.name ?? ''),
      variety: null,
      seasonalAvailability: (value.seasonal_availability as string[] | null) ?? [],
      annualYieldLbs: Number(value.annual_yield_lbs ?? 0),
      certifications: (value.certifications as string[] | null) ?? [],
      primaryUse: 'fresh' as const,
      createdAt: String(value.created_at ?? new Date().toISOString()),
    } satisfies CropProfile
  })

  const distributionChannels = arrayValue(row.distribution_channels).map((channel) => {
    const value = channel as Record<string, unknown>
    return {
      id: String(value.id),
      farmId: String(row.farm_id),
      type: String(value.type ?? 'direct_consumer') as DistributionChannel['type'],
      name: String(value.name ?? value.type ?? 'Distribution channel'),
      distanceMiles: Number(value.distance_miles ?? 0),
      percentageOfSales: Number(value.percentage_of_sales ?? 0),
      servesLowIncomeArea: Boolean(value.serves_low_income_area),
    } satisfies DistributionChannel
  })

  return buildFarmScorecard(
    mappedFarm,
    mappedScore,
    crops,
    distributionChannels,
    String(row.verified_at ?? mappedScore.calculatedAt),
  )
}

/**
 * GET /api/partners/directory
 * Returns verified farms with institution-facing scorecard fields.
 *
 * Query params:
 *   q?: string
 *   region?: string
 *   minScore?: number
 *   farmId?: string
 *   buyerType?: string
 *   nutrientTag?: string
 *   fulfillmentMethod?: string
 *   affordabilityNeeded?: boolean
 *   smartMatch?: boolean
 *   sort?: 'smart_match'
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') ?? undefined
  const region = searchParams.get('region')
  const minScore = searchParams.get('minScore')
  const farmId = searchParams.get('farmId')
  const buyerType = searchParams.get('buyerType')
  const nutrientTag = searchParams.get('nutrientTag')
  const fulfillmentMethod = searchParams.get('fulfillmentMethod')
  const affordabilityNeeded = searchParams.get('affordabilityNeeded') === 'true'
  const useSmartMatch =
    searchParams.get('smartMatch') === 'true' ||
    searchParams.get('sort') === 'smart_match' ||
    Boolean(buyerType) ||
    Boolean(nutrientTag) ||
    Boolean(fulfillmentMethod) ||
    affordabilityNeeded

  if (isMockMode()) {
    const filtered = useSmartMatch
      ? rankFarmScorecardsForBuyer(getMarketplaceFarmMatchInputs(), {
          buyerType: (buyerType as 'hospital' | 'school' | 'community_org' | 'individual' | null) ?? 'hospital',
          q,
          minPriScore: minScore ? Number(minScore) : undefined,
          nutrientTags: nutrientTag ? [nutrientTag as never] : undefined,
          fulfillmentMethod: fulfillmentMethod as 'pickup' | 'delivery' | undefined,
          affordabilityNeeded,
          region: region ?? undefined,
        })
          .filter((match) => !farmId || match.scorecard.farm.id === farmId)
      : filterFarmScorecards(getVerifiedFarmScorecards(), {
          query: q,
          minScore: minScore ? Number(minScore) : undefined,
          ids: farmId ? [farmId] : undefined,
        }).filter((scorecard) => !region || scorecard.farm.region === region)

    return NextResponse.json({ data: useSmartMatch ? filtered : filtered, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !['partner', 'admin'].includes(user.user_metadata?.role)) {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

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
        id, overall_score, nutritional_value, food_safety, supply_reliability,
        local_accessibility, affordability, data_completeness, verification_status,
        weights_version, benchmark_version, calculated_at, calculated_by
      ),
      crop_profiles (
        id, name, seasonal_availability, certifications, annual_yield_lbs, created_at
      ),
      distribution_channels (
        id, name, type, distance_miles, percentage_of_sales, serves_low_income_area
      )
    `)
    .eq('status', 'verified')
    .order('verified_at', { ascending: false })

  if (farmId) query = query.eq('farm_id', farmId)
  if (region) query = query.eq('farm_profiles.region' as never, region)

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })

  const mapped = ((data ?? []) as Array<Record<string, unknown>>)
    .map(mapRowToScorecard)
    .filter((scorecard): scorecard is NonNullable<ReturnType<typeof mapRowToScorecard>> => Boolean(scorecard))

  const filtered = filterFarmScorecards(mapped, {
    query: q,
    minScore: minScore ? Number(minScore) : undefined,
  })

  return NextResponse.json({ data: filtered, error: null })
}

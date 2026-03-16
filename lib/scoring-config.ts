import type { ScoringConfig, ScoringWeights } from '@/lib/types'
import { DEFAULT_WEIGHTS } from '@/lib/types'

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: DEFAULT_WEIGHTS,
  benchmarkVersion: '2026-pilot-v1',
  benchmarkSource: 'PRI pilot regional market and affordability baselines',
  reviewMethod: 'Hybrid rules engine with AI-assisted evidence normalization and admin verification',
  updatedAt: '2026-03-16T00:00:00.000Z',
}

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

export function computeDataCompleteness(
  scores: Record<string, { evidenceCoveragePct?: number }>,
): number {
  const values = Object.values(scores)
    .map(({ evidenceCoveragePct }) => clampPercentage(evidenceCoveragePct ?? 0))

  if (values.length === 0) return 0

  const averagePct = values.reduce((sum, value) => sum + value, 0) / values.length
  return Math.round((averagePct / 100) * 100) / 100
}

export async function getCurrentScoringConfig(
  supabase?: {
    from: (table: string) => {
      select: (columns: string) => {
        order: (
          column: string,
          options: { ascending: boolean },
        ) => {
          limit: (count: number) => {
            maybeSingle: () => PromiseLike<{ data: Record<string, unknown> | null; error: { message: string } | null }>
          }
        }
      }
    }
  },
): Promise<ScoringConfig> {
  if (!supabase) return DEFAULT_SCORING_CONFIG

  try {
    const { data, error } = await supabase
      .from('admin_config')
      .select(`
        nutritional_value,
        food_safety,
        supply_reliability,
        local_accessibility,
        affordability,
        version,
        benchmark_version,
        benchmark_source,
        review_method,
        updated_at
      `)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error || !data) return DEFAULT_SCORING_CONFIG

    const weights: ScoringWeights = {
      nutritionalValue: Number(data.nutritional_value ?? DEFAULT_WEIGHTS.nutritionalValue),
      foodSafety: Number(data.food_safety ?? DEFAULT_WEIGHTS.foodSafety),
      supplyReliability: Number(data.supply_reliability ?? DEFAULT_WEIGHTS.supplyReliability),
      localAccessibility: Number(data.local_accessibility ?? DEFAULT_WEIGHTS.localAccessibility),
      affordability: Number(data.affordability ?? DEFAULT_WEIGHTS.affordability),
      version: String(data.version ?? DEFAULT_WEIGHTS.version),
    }

    return {
      weights,
      benchmarkVersion: String(data.benchmark_version ?? DEFAULT_SCORING_CONFIG.benchmarkVersion),
      benchmarkSource: String(data.benchmark_source ?? DEFAULT_SCORING_CONFIG.benchmarkSource),
      reviewMethod: String(data.review_method ?? DEFAULT_SCORING_CONFIG.reviewMethod),
      updatedAt: String(data.updated_at ?? DEFAULT_SCORING_CONFIG.updatedAt),
    }
  } catch {
    return DEFAULT_SCORING_CONFIG
  }
}

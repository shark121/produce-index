import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateOverallScore, DEFAULT_WEIGHTS } from '@/lib/types'
import { getCurrentScoringConfig } from '@/lib/scoring-config'

/**
 * POST /api/score/calculate
 * Body: {
 *   submissionId: string
 *   subscores: {
 *     nutritionalValue: number
 *     foodSafety: number
 *     supplyReliability: number
 *     localAccessibility: number
 *     affordability: number
 *   }
 *   dataCompleteness: number  // 0–1
 *   verificationStatus: 'self_reported' | 'reviewed' | 'verified'
 * }
 *
 * Admin-only. Creates an immutable PRIScoreSnapshot.
 * Score inputs come from the admin review decision — never from the farmer.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const body = await request.json()
  const {
    submissionId,
    subscores,
    dataCompleteness = 1,
    verificationStatus = 'verified',
  } = body

  if (!submissionId || !subscores) {
    return NextResponse.json(
      { data: null, error: { message: 'submissionId and subscores are required' } },
      { status: 400 },
    )
  }

  // Validate all subscores are 0–100
  const keys = ['nutritionalValue', 'foodSafety', 'supplyReliability', 'localAccessibility', 'affordability'] as const
  for (const key of keys) {
    const val = subscores[key]
    if (typeof val !== 'number' || val < 0 || val > 100) {
      return NextResponse.json(
        { data: null, error: { message: `${key} must be a number between 0 and 100` } },
        { status: 400 },
      )
    }
  }

  // Fetch submission to get farmId
  const { data: submission, error: subError } = await supabase
    .from('pri_submissions')
    .select('id, farm_id, status')
    .eq('id', submissionId)
    .single()

  if (subError || !submission) {
    return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
  }

  const config = await getCurrentScoringConfig(supabase)
  const overallScore = calculateOverallScore(subscores, config.weights ?? DEFAULT_WEIGHTS)
  const normalizedCompleteness = Math.min(1, Math.max(0, Number(dataCompleteness) || 0))

  const snapshot = {
    submission_id: submissionId,
    farm_id: submission.farm_id,
    nutritional_value: subscores.nutritionalValue,
    food_safety: subscores.foodSafety,
    supply_reliability: subscores.supplyReliability,
    local_accessibility: subscores.localAccessibility,
    affordability: subscores.affordability,
    overall_score: Math.round(overallScore * 10) / 10,
    data_completeness: normalizedCompleteness,
    verification_status: verificationStatus,
    weights_version: config.weights.version,
    benchmark_version: config.benchmarkVersion,
    calculated_at: new Date().toISOString(),
    calculated_by: user.id,
  }

  const { data, error } = await supabase
    .from('pri_score_snapshots')
    .insert(snapshot)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })

  // Write audit log
  await supabase.from('score_audit_log').insert({
    snapshot_id: data.id,
    submission_id: submissionId,
    farm_id: submission.farm_id,
    triggered_by: user.id,
    input_hash: Buffer.from(JSON.stringify(subscores)).toString('base64'),
    weights_version: config.weights.version,
    created_at: new Date().toISOString(),
  })

  return NextResponse.json({ data, error: null }, { status: 201 })
}

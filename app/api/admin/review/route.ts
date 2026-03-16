import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { canTransition, calculateOverallScore, DEFAULT_WEIGHTS } from '@/lib/types'

/**
 * POST /api/admin/review
 * Body: {
 *   submissionId: string
 *   decision: 'verified' | 'needs_changes'
 *   scores: Record<category, { subscore: number; notes: string }>
 *   adminNotes: string
 * }
 *
 * This is the single endpoint that:
 * 1. Validates state transition
 * 2. Calculates and writes a PRIScoreSnapshot (if verified)
 * 3. Writes a ReviewDecision record
 * 4. Updates submission status
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const body = await request.json()
  const { submissionId, decision, scores, adminNotes } = body

  if (!submissionId || !decision || !scores) {
    return NextResponse.json(
      { data: null, error: { message: 'submissionId, decision, and scores are required' } },
      { status: 400 },
    )
  }

  const { data: submission, error: fetchError } = await supabase
    .from('pri_submissions')
    .select('id, status, farm_id')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
  }

  if (!canTransition(submission.status, decision === 'verified' ? 'verified' : 'needs_changes')) {
    return NextResponse.json(
      { data: null, error: { message: `Cannot transition from ${submission.status} to ${decision}` } },
      { status: 409 },
    )
  }

  let scoreSnapshot = null

  if (decision === 'verified') {
    // Build subscores from admin review inputs
    const subscores = {
      nutritionalValue:   scores.nutritional_value?.subscore ?? 0,
      foodSafety:         scores.food_safety?.subscore ?? 0,
      supplyReliability:  scores.supply_reliability?.subscore ?? 0,
      localAccessibility: scores.local_accessibility?.subscore ?? 0,
      affordability:      scores.affordability?.subscore ?? 0,
    }

    const weights = DEFAULT_WEIGHTS  // TODO: fetch current config version
    const overallScore = calculateOverallScore(subscores, weights)

    const { data: snap, error: snapError } = await supabase
      .from('pri_score_snapshots')
      .insert({
        submission_id: submissionId,
        farm_id: submission.farm_id,
        nutritional_value: subscores.nutritionalValue,
        food_safety: subscores.foodSafety,
        supply_reliability: subscores.supplyReliability,
        local_accessibility: subscores.localAccessibility,
        affordability: subscores.affordability,
        overall_score: Math.round(overallScore * 10) / 10,
        data_completeness: 1,
        verification_status: 'verified',
        weights_version: weights.version,
        benchmark_version: 'v1',
        calculated_at: new Date().toISOString(),
        calculated_by: user.id,
      })
      .select()
      .single()

    if (snapError) {
      return NextResponse.json({ data: null, error: { message: snapError.message } }, { status: 500 })
    }

    scoreSnapshot = snap

    // Audit log
    await supabase.from('score_audit_log').insert({
      snapshot_id: snap.id,
      submission_id: submissionId,
      farm_id: submission.farm_id,
      triggered_by: user.id,
      input_hash: Buffer.from(JSON.stringify(subscores)).toString('base64'),
      weights_version: weights.version,
      created_at: new Date().toISOString(),
    })
  }

  // Write review decision record
  await supabase.from('review_decisions').insert({
    submission_id: submissionId,
    admin_id: user.id,
    decision,
    notes: adminNotes ?? '',
    score_snapshot_id: scoreSnapshot?.id ?? null,
    created_at: new Date().toISOString(),
  })

  // Update submission status
  const now = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('pri_submissions')
    .update({
      status: decision,
      admin_notes: adminNotes ?? null,
      reviewed_at: now,
      ...(decision === 'verified' ? { verified_at: now } : {}),
      updated_at: now,
    })
    .eq('id', submissionId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ data: null, error: { message: updateError.message } }, { status: 500 })
  }

  return NextResponse.json({ data: { submission: updated, scoreSnapshot }, error: null })
}

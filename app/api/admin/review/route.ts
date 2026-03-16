import { NextResponse } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'
import { createClient } from '@/lib/supabase/server'
import { calculateOverallScore, canTransition, type CategoryRecommendation, type EvidenceCategory } from '@/lib/types'
import { computeDataCompleteness, getCurrentScoringConfig } from '@/lib/scoring-config'
import { getMockDatabase, getSubmissionById, saveMockDatabase } from '@/lib/mock'

interface ReviewScoreInput {
  subscore: number
  notes: string
  evidenceCoveragePct: number
  overrideReason?: string
}

function buildSubscores(scores: Record<string, ReviewScoreInput>) {
  return {
    nutritionalValue: scores.nutritional_value?.subscore ?? 0,
    foodSafety: scores.food_safety?.subscore ?? 0,
    supplyReliability: scores.supply_reliability?.subscore ?? 0,
    localAccessibility: scores.local_accessibility?.subscore ?? 0,
    affordability: scores.affordability?.subscore ?? 0,
  }
}

function buildOverrides(
  scores: Record<string, ReviewScoreInput>,
  recommendedScores: Partial<Record<EvidenceCategory, CategoryRecommendation>>,
) {
  return (Object.entries(scores) as Array<[EvidenceCategory, ReviewScoreInput]>)
    .filter(([category, score]) => (recommendedScores[category]?.score ?? score.subscore) !== score.subscore)
    .map(([category, score]) => ({
      category,
      recommendedScore: recommendedScores[category]?.score ?? score.subscore,
      finalScore: score.subscore,
      reason: score.overrideReason?.trim() ?? '',
    }))
}

function validateOverrides(
  scores: Record<string, ReviewScoreInput>,
  recommendedScores: Partial<Record<EvidenceCategory, CategoryRecommendation>>,
) {
  for (const [category, score] of Object.entries(scores) as Array<[EvidenceCategory, ReviewScoreInput]>) {
    const recommended = recommendedScores[category]?.score
    if (typeof recommended === 'number' && recommended !== score.subscore && !score.overrideReason?.trim()) {
      return `Override reason is required for ${category.replaceAll('_', ' ')}`
    }
  }

  return null
}

export async function POST(request: Request) {
  const body = await request.json()
  const {
    submissionId,
    decision,
    scores,
    adminNotes,
    recommendedScores = {},
    autoScoringRunId = null,
  } = body as {
    submissionId?: string
    decision?: 'verified' | 'needs_changes'
    scores?: Record<string, ReviewScoreInput>
    adminNotes?: string
    recommendedScores?: Partial<Record<EvidenceCategory, CategoryRecommendation>>
    autoScoringRunId?: string | null
  }

  if (!submissionId || !decision || !scores) {
    return NextResponse.json(
      { data: null, error: { message: 'submissionId, decision, and scores are required' } },
      { status: 400 },
    )
  }

  const overrideError = validateOverrides(scores, recommendedScores)
  if (overrideError) {
    return NextResponse.json({ data: null, error: { message: overrideError } }, { status: 400 })
  }

  if (decision === 'needs_changes' && !adminNotes?.trim()) {
    return NextResponse.json(
      { data: null, error: { message: 'Admin notes are required when requesting changes' } },
      { status: 400 },
    )
  }

  if (isMockMode()) {
    const submission = getSubmissionById(submissionId)
    if (!submission) {
      return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
    }

    if (!canTransition(submission.status, decision)) {
      return NextResponse.json(
        { data: null, error: { message: `Cannot transition from ${submission.status} to ${decision}` } },
        { status: 409 },
      )
    }

    const config = await getCurrentScoringConfig()
    const subscores = buildSubscores(scores)
    const overallScore = calculateOverallScore(subscores, config.weights)
    const dataCompleteness = computeDataCompleteness(scores)
    const now = new Date().toISOString()
    const database = getMockDatabase()
    let scoreSnapshot: typeof database.scoreSnapshots[number] | null = null

    if (decision === 'verified') {
      scoreSnapshot = {
        id: crypto.randomUUID(),
        submissionId,
        farmId: submission.farmId,
        nutritionalValue: subscores.nutritionalValue,
        foodSafety: subscores.foodSafety,
        supplyReliability: subscores.supplyReliability,
        localAccessibility: subscores.localAccessibility,
        affordability: subscores.affordability,
        overallScore: Math.round(overallScore * 10) / 10,
        dataCompleteness,
        verificationStatus: 'verified',
        weightsVersion: config.weights.version,
        benchmarkVersion: config.benchmarkVersion,
        calculatedAt: now,
        calculatedBy: 'user-admin-1',
      }

      database.scoreSnapshots = [scoreSnapshot, ...database.scoreSnapshots.filter((snapshot) => snapshot.id !== scoreSnapshot?.id)]
    }

    database.reviewDecisions = [
      {
        id: crypto.randomUUID(),
        submissionId,
        adminId: 'user-admin-1',
        decision,
        notes: adminNotes?.trim() ?? '',
        scoreSnapshotId: scoreSnapshot?.id ?? null,
        autoScoringRunId,
        recommendedScores,
        finalScores: scores,
        overrideReasons: Object.fromEntries(
          Object.entries(scores)
            .filter(([, value]) => value.overrideReason?.trim())
            .map(([key, value]) => [key, value.overrideReason?.trim()]),
        ),
        overrides: buildOverrides(scores, recommendedScores),
        createdAt: now,
      },
      ...database.reviewDecisions,
    ]

    database.submissions = database.submissions.map((entry) => entry.id === submissionId
      ? {
        ...entry,
        status: decision,
        adminNotes: adminNotes?.trim() ?? null,
        reviewedAt: now,
        verifiedAt: decision === 'verified' ? now : entry.verifiedAt,
        updatedAt: now,
      }
      : entry)

    saveMockDatabase(database)

    const updatedSubmission = database.submissions.find((entry) => entry.id === submissionId) ?? null
    return NextResponse.json({ data: { submission: updatedSubmission, scoreSnapshot }, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: submission, error: fetchError } = await supabase
    .from('pri_submissions')
    .select('id, status, farm_id')
    .eq('id', submissionId)
    .single()

  if (fetchError || !submission) {
    return NextResponse.json({ data: null, error: { message: 'Submission not found' } }, { status: 404 })
  }

  if (!canTransition(submission.status, decision)) {
    return NextResponse.json(
      { data: null, error: { message: `Cannot transition from ${submission.status} to ${decision}` } },
      { status: 409 },
    )
  }

  let scoreSnapshot = null

  if (decision === 'verified') {
    const config = await getCurrentScoringConfig(supabase as never)
    const subscores = buildSubscores(scores)
    const overallScore = calculateOverallScore(subscores, config.weights)
    const dataCompleteness = computeDataCompleteness(scores)

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
        data_completeness: dataCompleteness,
        verification_status: 'verified',
        weights_version: config.weights.version,
        benchmark_version: config.benchmarkVersion,
        calculated_at: new Date().toISOString(),
        calculated_by: user.id,
      })
      .select()
      .single()

    if (snapError) {
      return NextResponse.json({ data: null, error: { message: snapError.message } }, { status: 500 })
    }

    scoreSnapshot = snap
  }

  const reviewDecisionPayload = {
    submission_id: submissionId,
    admin_id: user.id,
    decision,
    notes: adminNotes?.trim() ?? '',
    score_snapshot_id: scoreSnapshot?.id ?? null,
    auto_scoring_run_id: autoScoringRunId,
    recommended_scores: recommendedScores,
    final_scores: scores,
    override_reasons: Object.fromEntries(
      Object.entries(scores)
        .filter(([, value]) => value.overrideReason?.trim())
        .map(([key, value]) => [key, value.overrideReason?.trim()]),
    ),
    created_at: new Date().toISOString(),
  }

  let reviewInsert = await supabase.from('review_decisions').insert(reviewDecisionPayload)
  if (reviewInsert.error) {
    reviewInsert = await supabase.from('review_decisions').insert({
      submission_id: submissionId,
      admin_id: user.id,
      decision,
      notes: adminNotes?.trim() ?? '',
      score_snapshot_id: scoreSnapshot?.id ?? null,
      created_at: new Date().toISOString(),
    })
  }

  if (reviewInsert.error) {
    return NextResponse.json({ data: null, error: { message: reviewInsert.error.message } }, { status: 500 })
  }

  const now = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from('pri_submissions')
    .update({
      status: decision,
      admin_notes: adminNotes?.trim() ?? null,
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

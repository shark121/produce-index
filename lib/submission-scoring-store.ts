import { buildAutoScoringRun, type SubmissionScoringBundle } from '@/lib/auto-scoring'
import { normalizeCropRow, normalizeDistributionRow, normalizePricingRow, normalizeSafetyRow } from '@/lib/farm-section-data'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  getCropsForFarm,
  getDistributionForFarm,
  getEvidenceForSubmission,
  getExtractionsForSubmission,
  getFarmById,
  getLatestAutoScoringRun,
  getMockDatabase,
  getPricingForFarm,
  getSafetyPracticesForFarm,
  getSubmissionById,
  saveMockDatabase,
  upsertMockRecord,
} from '@/lib/mock'
import { getCurrentScoringConfig } from '@/lib/scoring-config'
import type {
  AutoScoringRun,
  EvidenceAsset,
  EvidenceCategory,
  EvidenceExtraction,
  PRISubmission,
  ReviewDecision,
} from '@/lib/types'

function normalizeEvidenceAssetRow(row: Record<string, unknown>): EvidenceAsset {
  return {
    id: String(row.id),
    submissionId: String(row.submission_id ?? row.submissionId),
    category: String(row.category) as EvidenceCategory,
    type: String(row.type) as EvidenceAsset['type'],
    fileName: String(row.file_name ?? row.fileName),
    storageKey: String(row.storage_key ?? row.storageKey),
    mimeType: String(row.mime_type ?? row.mimeType),
    sizeBytes: Number(row.size_bytes ?? row.sizeBytes ?? 0),
    description: typeof row.description === 'string' ? row.description : null,
    uploadedAt: String(row.uploaded_at ?? row.uploadedAt ?? new Date().toISOString()),
  }
}

function normalizeExtractionRow(row: Record<string, unknown>): EvidenceExtraction {
  return {
    id: String(row.id),
    evidenceAssetId: String(row.evidence_asset_id ?? row.evidenceAssetId),
    submissionId: String(row.submission_id ?? row.submissionId),
    provider: (row.provider === 'openai' ? 'openai' : 'heuristic'),
    model: String(row.model ?? 'metadata-fallback-v1'),
    category: String(row.category) as EvidenceCategory,
    confidence: Number(row.confidence ?? 0),
    status: (row.status === 'completed' || row.status === 'partial' || row.status === 'failed' ? row.status : 'partial') as EvidenceExtraction['status'],
    summary: String(row.summary ?? ''),
    extractedJson: (row.extracted_json ?? row.extractedJson ?? {}) as Record<string, unknown>,
    normalizedObservations: Array.isArray(row.normalized_observations ?? row.normalizedObservations)
      ? ((row.normalized_observations ?? row.normalizedObservations) as EvidenceExtraction['normalizedObservations'])
      : [],
    warnings: Array.isArray(row.warnings) ? row.warnings.map((warning) => String(warning)) : [],
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  }
}

function normalizeScoringRunRow(row: Record<string, unknown>): AutoScoringRun {
  return {
    id: String(row.id),
    submissionId: String(row.submission_id ?? row.submissionId),
    farmId: String(row.farm_id ?? row.farmId),
    modelVersion: String(row.model_version ?? row.modelVersion),
    benchmarkVersion: String(row.benchmark_version ?? row.benchmarkVersion),
    scoringMethod: 'hybrid',
    status: (row.status === 'completed' || row.status === 'partial' || row.status === 'failed' ? row.status : 'partial') as AutoScoringRun['status'],
    featureVector: (row.feature_vector ?? row.featureVector ?? {}) as Record<string, boolean | number | string | null>,
    recommendedScores: (row.recommended_scores ?? row.recommendedScores ?? {}) as AutoScoringRun['recommendedScores'],
    overallScore: Number(row.overall_score ?? row.overallScore ?? 0),
    confidenceSummary: Number(row.confidence_summary ?? row.confidenceSummary ?? 0),
    warnings: Array.isArray(row.warnings) ? row.warnings.map((warning) => String(warning)) : [],
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  }
}

function normalizeSubmissionRow(row: Record<string, unknown>): PRISubmission {
  return {
    id: String(row.id),
    farmId: String(row.farm_id ?? row.farmId),
    farmName: String(row.farm_name ?? row.farmName),
    status: String(row.status) as PRISubmission['status'],
    submittedAt: typeof row.submitted_at === 'string' ? row.submitted_at : (typeof row.submittedAt === 'string' ? row.submittedAt : null),
    reviewStartedAt: typeof row.review_started_at === 'string' ? row.review_started_at : (typeof row.reviewStartedAt === 'string' ? row.reviewStartedAt : null),
    reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : (typeof row.reviewedAt === 'string' ? row.reviewedAt : null),
    verifiedAt: typeof row.verified_at === 'string' ? row.verified_at : (typeof row.verifiedAt === 'string' ? row.verifiedAt : null),
    adminNotes: typeof row.admin_notes === 'string' ? row.admin_notes : (typeof row.adminNotes === 'string' ? row.adminNotes : null),
    createdAt: String(row.created_at ?? row.createdAt ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString()),
  }
}

export async function loadSubmissionScoringBundle(
  submissionId: string,
  supabase?: {
    from: (table: string) => any
  },
): Promise<SubmissionScoringBundle | null> {
  if (isMockMode() || !supabase) {
    const submission = getSubmissionById(submissionId)
    if (!submission) return null
    const farm = getFarmById(submission.farmId)
    if (!farm) return null

    return {
      submissionId,
      farmId: farm.id,
      farmName: farm.name,
      region: farm.region,
      crops: getCropsForFarm(farm.id),
      pricingProfiles: getPricingForFarm(farm.id),
      distributionChannels: getDistributionForFarm(farm.id),
      safetyPractices: getSafetyPracticesForFarm(farm.id),
      evidenceAssets: getEvidenceForSubmission(submissionId),
      benchmarks: getMockDatabase().benchmarks,
      config: await getCurrentScoringConfig(),
    }
  }

  const { data: submissionRow, error: submissionError } = await supabase
    .from('pri_submissions')
    .select('id, farm_id, farm_name, status, submitted_at, review_started_at, reviewed_at, verified_at, admin_notes, created_at, updated_at')
    .eq('id', submissionId)
    .single()

  if (submissionError || !submissionRow) return null
  const submission = normalizeSubmissionRow(submissionRow)

  const { data: farmRow, error: farmError } = await supabase
    .from('farm_profiles')
    .select('id, name, region')
    .eq('id', submission.farmId)
    .single()

  if (farmError || !farmRow) return null

  const [cropsResult, pricingResult, distributionResult, safetyResult, evidenceResult, benchmarkResult] = await Promise.all([
    supabase.from('crop_profiles').select('*').order('name', { ascending: true }).eq('farm_id', submission.farmId),
    supabase.from('pricing_profiles').select('*').order('crop_name', { ascending: true }).eq('farm_id', submission.farmId),
    supabase.from('distribution_channels').select('*').order('name', { ascending: true }).eq('farm_id', submission.farmId),
    supabase.from('safety_practices').select('*').order('category', { ascending: true }).eq('farm_id', submission.farmId),
    supabase.from('evidence_assets').select('*').order('uploaded_at', { ascending: false }).eq('submission_id', submissionId),
    supabase.from('regional_benchmarks').select('*').order('effective_from', { ascending: false }).eq('region', String(farmRow.region)),
  ])

  return {
    submissionId,
    farmId: String(farmRow.id),
    farmName: String(farmRow.name),
    region: String(farmRow.region),
    crops: ((cropsResult.data ?? []) as Array<Record<string, unknown>>).map((row) => normalizeCropRow(row)),
    pricingProfiles: ((pricingResult.data ?? []) as Array<Record<string, unknown>>).map((row) => normalizePricingRow(row)),
    distributionChannels: ((distributionResult.data ?? []) as Array<Record<string, unknown>>).map((row) => normalizeDistributionRow(row)),
    safetyPractices: ((safetyResult.data ?? []) as Array<Record<string, unknown>>).map((row) => normalizeSafetyRow(row)),
    evidenceAssets: ((evidenceResult.data ?? []) as Array<Record<string, unknown>>).map((row) => normalizeEvidenceAssetRow(row)),
    benchmarks: ((benchmarkResult.data ?? []) as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      region: String(row.region),
      category: String(row.category) as ReviewDecision['decision'] extends never ? never : 'affordability' | 'local_accessibility',
      metricKey: String(row.metric_key ?? row.metricKey),
      label: String(row.label),
      baselineValue: Number(row.baseline_value ?? row.baselineValue ?? 0),
      unit: String(row.unit),
      thresholdGood: Number(row.threshold_good ?? row.thresholdGood ?? 0),
      thresholdFair: Number(row.threshold_fair ?? row.thresholdFair ?? 0),
      effectiveFrom: String(row.effective_from ?? row.effectiveFrom ?? new Date().toISOString()),
      version: String(row.version ?? 'v1'),
    })),
    config: await getCurrentScoringConfig(supabase as unknown as Parameters<typeof getCurrentScoringConfig>[0]),
  }
}

export async function rerunAutoScoring(
  submissionId: string,
  supabase?: {
    from: (table: string) => any
  },
) {
  const bundle = await loadSubmissionScoringBundle(submissionId, supabase)
  if (!bundle) return null

  const { run, extractions } = await buildAutoScoringRun(bundle)

  if (isMockMode() || !supabase) {
    const database = getMockDatabase()
    database.evidenceExtractions = [
      ...database.evidenceExtractions.filter((extraction) => extraction.submissionId !== submissionId),
      ...extractions,
    ]
    database.autoScoringRuns = [
      ...database.autoScoringRuns.filter((existingRun) => existingRun.submissionId !== submissionId),
      run,
    ]
    saveMockDatabase(database)
    return { run, extractions }
  }

  try {
    await supabase.from('evidence_extractions').delete().eq('submission_id', submissionId)
    if (extractions.length > 0) {
      await supabase.from('evidence_extractions').insert(
        extractions.map((extraction) => ({
          id: extraction.id,
          evidence_asset_id: extraction.evidenceAssetId,
          submission_id: extraction.submissionId,
          provider: extraction.provider,
          model: extraction.model,
          category: extraction.category,
          confidence: extraction.confidence,
          status: extraction.status,
          summary: extraction.summary,
          extracted_json: extraction.extractedJson,
          normalized_observations: extraction.normalizedObservations,
          warnings: extraction.warnings,
          created_at: extraction.createdAt,
          updated_at: extraction.updatedAt,
        })),
      )
    }

    await supabase.from('auto_scoring_runs').delete().eq('submission_id', submissionId)
    await supabase.from('auto_scoring_runs').insert({
      id: run.id,
      submission_id: run.submissionId,
      farm_id: run.farmId,
      model_version: run.modelVersion,
      benchmark_version: run.benchmarkVersion,
      scoring_method: run.scoringMethod,
      status: run.status,
      feature_vector: run.featureVector,
      recommended_scores: run.recommendedScores,
      overall_score: run.overallScore,
      confidence_summary: run.confidenceSummary,
      warnings: run.warnings,
      created_at: run.createdAt,
      updated_at: run.updatedAt,
    })
  } catch {
    // If the optional auto-scoring tables are not present yet, we still return the computed run.
  }

  return { run, extractions }
}

export async function getAutoScoringContext(
  submissionId: string,
  supabase?: {
    from: (table: string) => any
  },
) {
  if (isMockMode() || !supabase) {
    const submission = getSubmissionById(submissionId)
    if (!submission) return null
    const farm = getFarmById(submission.farmId)
    if (!farm) return null

    return {
      submission,
      farm,
      evidenceAssets: getEvidenceForSubmission(submissionId),
      evidenceExtractions: getExtractionsForSubmission(submissionId),
      run: getLatestAutoScoringRun(submissionId),
    }
  }

  const bundle = await loadSubmissionScoringBundle(submissionId, supabase)
  if (!bundle) return null

  let run: AutoScoringRun | null = null
  let evidenceExtractions: EvidenceExtraction[] = []
  try {
    const runRow = await supabase
      .from('auto_scoring_runs')
      .select('*')
      .eq('submission_id', submissionId)
      .order('updated_at', { ascending: false })
      .maybeSingle()

    run = runRow.data ? normalizeScoringRunRow(runRow.data) : null
  } catch {
    run = null
  }

  try {
    const extractionRows = await supabase
      .from('evidence_extractions')
      .select('*')
      .eq('submission_id', submissionId)
      .order('updated_at', { ascending: false })

    evidenceExtractions = ((extractionRows.data ?? []) as Array<Record<string, unknown>>).map((row) => normalizeExtractionRow(row))
  } catch {
    evidenceExtractions = []
  }

  return {
    submission: normalizeSubmissionRow({
      id: bundle.submissionId,
      farm_id: bundle.farmId,
      farm_name: bundle.farmName,
      status: 'submitted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    farm: { id: bundle.farmId, name: bundle.farmName, region: bundle.region },
    evidenceAssets: bundle.evidenceAssets,
    evidenceExtractions,
    run,
  }
}

export function persistMockSubmission(submission: PRISubmission) {
  upsertMockRecord('submissions', submission)
  return submission
}

import {
  MOCK_BENCHMARKS,
  MOCK_DECISIONS,
  getCropsForFarm,
  getDistributionForFarm,
  getFarmById,
  getScoreForFarm,
  getVerifiedFarms,
} from '@/lib/mock'
import { DEFAULT_SCORING_CONFIG } from '@/lib/scoring-config'
import type {
  DistributionChannel,
  FarmProfile,
  FarmScorecard,
  PRIScoreSnapshot,
  ReviewDecision,
  CropProfile,
} from '@/lib/types'

function getReviewDecisionForScore(score: PRIScoreSnapshot): ReviewDecision | null {
  return MOCK_DECISIONS
    .filter((decision) => decision.scoreSnapshotId === score.id || decision.submissionId === score.submissionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
}

function localAccessShare(distribution: DistributionChannel[]): number {
  return distribution
    .filter((channel) => channel.distanceMiles <= 30)
    .reduce((sum, channel) => sum + channel.percentageOfSales, 0)
}

function lowIncomeShare(distribution: DistributionChannel[]): number {
  return distribution
    .filter((channel) => channel.servesLowIncomeArea)
    .reduce((sum, channel) => sum + channel.percentageOfSales, 0)
}

function estimatedHealthyServings(crops: CropProfile[]): number {
  const totalYield = crops.reduce((sum, crop) => sum + crop.annualYieldLbs, 0)
  return Math.round(totalYield * 3.1)
}

function nextSeasonConfidence(
  score: PRIScoreSnapshot,
  crops: CropProfile[],
): number {
  const seasonalCoverage = new Set(crops.flatMap((crop) => crop.seasonalAvailability)).size
  return Math.min(
    99,
    Math.round((score.supplyReliability * 0.7) + (seasonalCoverage * 4) + (score.localAccessibility * 0.15)),
  )
}

function seasonalityRiskLabel(confidence: number): 'Low' | 'Moderate' | 'High' {
  if (confidence >= 82) return 'Low'
  if (confidence >= 65) return 'Moderate'
  return 'High'
}

function benchmarkDeltaText(
  farm: Pick<FarmProfile, 'region'>,
  score: PRIScoreSnapshot,
): string {
  const accessibilityBenchmark = MOCK_BENCHMARKS.find(
    (benchmark) =>
      benchmark.region === farm.region &&
      benchmark.category === 'local_accessibility',
  )

  if (!accessibilityBenchmark) {
    return 'Regional benchmark package is still being finalized.'
  }

  const delta = Math.round(score.localAccessibility - accessibilityBenchmark.thresholdGood)
  if (delta >= 0) {
    return `+${delta} points above the pilot local-access threshold`
  }

  return `${delta} points below the pilot local-access threshold`
}

function financingTier(score: PRIScoreSnapshot): {
  tier: FarmScorecard['financingReadiness']['tier']
  label: string
  lenderSummary: string
} {
  if (score.overallScore >= 80 && score.dataCompleteness >= 0.9) {
    return {
      tier: 'ready',
      label: 'Underwriting Ready',
      lenderSummary: 'Strong candidate for preferred terms and shorter diligence cycles.',
    }
  }

  if (score.overallScore >= 68) {
    return {
      tier: 'watchlist',
      label: 'Monitor With Conditions',
      lenderSummary: 'Promising profile with a few documentation or consistency gaps to close.',
    }
  }

  return {
    tier: 'emerging',
    label: 'Build Evidence First',
    lenderSummary: 'Needs stronger evidence coverage before PRI should be used in a financing packet.',
  }
}

function verificationLabel(score: number): FarmScorecard['verificationConfidence']['label'] {
  if (score >= 85) return 'High'
  if (score >= 65) return 'Moderate'
  return 'Developing'
}

export function buildFarmScorecard(
  farm: Pick<FarmProfile, 'id' | 'name' | 'region' | 'city' | 'state' | 'acreageTilled' | 'yearsInOperation' | 'description'>,
  score: PRIScoreSnapshot,
  crops: CropProfile[],
  distributionChannels: DistributionChannel[],
  verifiedAt: string,
): FarmScorecard {
  const reviewDecision = getReviewDecisionForScore(score)
  const evidenceCoveragePct = Math.round(score.dataCompleteness * 100)
  const verificationScore = Math.round(
    Math.min(99, (score.verificationStatus === 'verified' ? 28 : 12) + (evidenceCoveragePct * 0.72)),
  )
  const auditedAssets = Math.max(6, crops.length * 2 + distributionChannels.length + 2)
  const localDistributionPct = localAccessShare(distributionChannels)
  const lowIncomeReachPct = lowIncomeShare(distributionChannels)
  const nearbyAccessPoints = distributionChannels.length
  const seasonalConfidence = nextSeasonConfidence(score, crops)
  const financing = financingTier(score)

  return {
    farm,
    score,
    crops: crops.map((crop) => ({
      id: crop.id,
      name: crop.name,
      seasonalAvailability: crop.seasonalAvailability,
      certifications: crop.certifications,
    })),
    distributionChannels,
    verifiedAt,
    verificationConfidence: {
      score: verificationScore,
      label: verificationLabel(verificationScore),
      auditedAssets,
      evidenceCoveragePct,
      lastReviewedAt: reviewDecision?.createdAt ?? verifiedAt,
    },
    healthImpactSummary: {
      estimatedHealthyServings: estimatedHealthyServings(crops),
      lowIncomeReachPct,
      localDistributionPct,
      nearbyAccessPoints,
      narrative: `${farm.name} directs ${localDistributionPct}% of sales within 30 miles and reaches ${lowIncomeReachPct}% low-income-serving channels.`,
    },
    financingReadiness: {
      tier: financing.tier,
      label: financing.label,
      lenderSummary: financing.lenderSummary,
      benchmarkDelta: benchmarkDeltaText(farm, score),
      nextSeasonConfidence: seasonalConfidence,
      seasonalityRisk: seasonalityRiskLabel(seasonalConfidence),
    },
    scoreProvenance: {
      weightsVersion: score.weightsVersion,
      benchmarkVersion: score.benchmarkVersion || DEFAULT_SCORING_CONFIG.benchmarkVersion,
      benchmarkSource: DEFAULT_SCORING_CONFIG.benchmarkSource,
      benchmarkRegion: farm.region,
      reviewMethod: DEFAULT_SCORING_CONFIG.reviewMethod,
      reviewedAt: reviewDecision?.createdAt ?? verifiedAt,
      evidenceCoveragePct,
    },
  }
}

export function getVerifiedFarmScorecards(): FarmScorecard[] {
  return getVerifiedFarms()
    .map(({ farm, score, crops, distribution, verifiedAt }) =>
      buildFarmScorecard(farm, score, crops, distribution, verifiedAt),
    )
    .sort((a, b) => b.score.overallScore - a.score.overallScore)
}

export function getFarmScorecardById(id: string): FarmScorecard | null {
  const farm = getFarmById(id)
  const score = getScoreForFarm(id)

  if (!farm || !score) return null

  const verified = getVerifiedFarms().find((item) => item.farm.id === id)

  return buildFarmScorecard(
    farm,
    score,
    getCropsForFarm(id),
    getDistributionForFarm(id),
    verified?.verifiedAt ?? score.calculatedAt,
  )
}

export function filterFarmScorecards(
  scorecards: FarmScorecard[],
  options: { query?: string; minScore?: number; ids?: string[] },
): FarmScorecard[] {
  const normalizedQuery = options.query?.trim().toLowerCase()
  const requestedIds = options.ids?.length ? new Set(options.ids) : null

  return scorecards.filter((scorecard) => {
    if (requestedIds && !requestedIds.has(scorecard.farm.id)) return false
    if (typeof options.minScore === 'number' && scorecard.score.overallScore < options.minScore) {
      return false
    }

    if (!normalizedQuery) return true

    const haystack = [
      scorecard.farm.name,
      scorecard.farm.region,
      scorecard.farm.city,
      scorecard.farm.state,
      ...scorecard.crops.map((crop) => crop.name),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })
}

export function getPilotMetrics() {
  const scorecards = getVerifiedFarmScorecards()
  if (scorecards.length === 0) {
    return {
      verifiedFarms: 0,
      regions: 0,
      averageScore: 0,
      totalHealthyServings: 0,
      averageLowIncomeReach: 0,
    }
  }

  const averageScore = scorecards.reduce((sum, card) => sum + card.score.overallScore, 0) / scorecards.length
  const totalHealthyServings = scorecards.reduce(
    (sum, card) => sum + card.healthImpactSummary.estimatedHealthyServings,
    0,
  )
  const averageLowIncomeReach = scorecards.reduce(
    (sum, card) => sum + card.healthImpactSummary.lowIncomeReachPct,
    0,
  ) / scorecards.length

  return {
    verifiedFarms: scorecards.length,
    regions: new Set(scorecards.map((card) => card.farm.region)).size,
    averageScore: Math.round(averageScore * 10) / 10,
    totalHealthyServings,
    averageLowIncomeReach: Math.round(averageLowIncomeReach),
  }
}

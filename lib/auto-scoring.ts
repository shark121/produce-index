import { calculateOverallScore, type AutoScoringRun, type CategoryRecommendation, type CropProfile, type DistributionChannel, type EvidenceAsset, type EvidenceCategory, type EvidenceExtraction, type PricingProfile, type RegionalBenchmark, type SafetyPractice, type ScoringConfig } from '@/lib/types'

export interface SubmissionScoringBundle {
  submissionId: string
  farmId: string
  farmName: string
  region: string
  crops: CropProfile[]
  pricingProfiles: PricingProfile[]
  distributionChannels: DistributionChannel[]
  safetyPractices: SafetyPractice[]
  evidenceAssets: EvidenceAsset[]
  benchmarks: RegionalBenchmark[]
  config: ScoringConfig
}

const AUTO_SCORING_MODEL_VERSION = 'pri-hybrid-scorecard-v1'
const OPENAI_MODEL = process.env.OPENAI_EVIDENCE_MODEL ?? 'gpt-5-mini'

const CATEGORIES: EvidenceCategory[] = [
  'nutritional_value',
  'food_safety',
  'supply_reliability',
  'local_accessibility',
  'affordability',
]

const NUTRIENT_DENSE_CROPS = new Set([
  'kale',
  'spinach',
  'swiss chard',
  'carrots',
  'tomatoes',
  'sweet peppers',
  'lentils',
  'quinoa',
  'broccoli',
  'beans',
])

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)))
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function ratio(numerator: number, denominator: number) {
  if (denominator <= 0) return 0
  return numerator / denominator
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10
}

function seasonCoverage(crops: CropProfile[]) {
  return new Set(crops.flatMap((crop) => crop.seasonalAvailability.map((season) => season.toLowerCase()))).size
}

function localShare(distributionChannels: DistributionChannel[]) {
  return distributionChannels
    .filter((channel) => channel.distanceMiles <= 30)
    .reduce((sum, channel) => sum + channel.percentageOfSales, 0)
}

function lowIncomeShare(distributionChannels: DistributionChannel[]) {
  return distributionChannels
    .filter((channel) => channel.servesLowIncomeArea)
    .reduce((sum, channel) => sum + channel.percentageOfSales, 0)
}

function positiveObservationCount(extractions: EvidenceExtraction[]) {
  return extractions.flatMap((extraction) => extraction.normalizedObservations)
    .filter((observation) => observation.signal === 'positive').length
}

function warningObservationCount(extractions: EvidenceExtraction[]) {
  return extractions.flatMap((extraction) => extraction.normalizedObservations)
    .filter((observation) => observation.signal === 'warning').length
}

function evidenceCoverage(assets: EvidenceAsset[], extractions: EvidenceExtraction[]) {
  if (assets.length === 0) return 0
  const extractionConfidence = average(extractions.map((extraction) => extraction.confidence))
  const completionPct = ratio(
    extractions.filter((extraction) => extraction.status !== 'failed').length,
    assets.length,
  ) * 100

  return clamp((assets.length * 22) + (completionPct * 0.4) + (extractionConfidence * 0.35))
}

function categoryConfidence(
  structuredCompleteness: number,
  coveragePct: number,
  warningCount: number,
) {
  return clamp((structuredCompleteness * 0.55) + (coveragePct * 0.45) - (warningCount * 4))
}

function buildHeuristicExtraction(
  asset: EvidenceAsset,
  context: Pick<SubmissionScoringBundle, 'farmName' | 'region'>,
): EvidenceExtraction {
  const name = asset.fileName.toLowerCase()
  const observations: EvidenceExtraction['normalizedObservations'] = []
  const warnings: string[] = []

  if (name.includes('cert') || name.includes('gap')) {
    observations.push({ label: 'Certification signal', value: 'Documentation references an active certification.', signal: 'positive' })
  }
  if (name.includes('delivery') || name.includes('invoice') || name.includes('log')) {
    observations.push({ label: 'Operational records', value: 'File name suggests transaction or delivery history.', signal: 'positive' })
  }
  if (name.includes('price') || name.includes('snap') || name.includes('discount')) {
    observations.push({ label: 'Affordability evidence', value: 'Pricing or affordability documentation detected.', signal: 'positive' })
  }
  if (asset.category === 'food_safety' && !name.includes('cert') && !name.includes('inspection')) {
    warnings.push('Food safety asset looks generic; reviewer should confirm documentation quality.')
  }
  if (observations.length === 0) {
    observations.push({ label: 'File metadata only', value: `Using filename and description metadata for ${context.farmName}.`, signal: 'neutral' })
  }

  const confidence = clamp(48 + (observations.length * 12) - (warnings.length * 8))
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    evidenceAssetId: asset.id,
    submissionId: asset.submissionId,
    provider: 'heuristic',
    model: 'metadata-fallback-v1',
    category: asset.category,
    confidence,
    status: warnings.length > 0 ? 'partial' : 'completed',
    summary: `${asset.fileName} was interpreted using metadata heuristics for ${context.region}.`,
    extractedJson: {
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      description: asset.description,
    },
    normalizedObservations: observations,
    warnings,
    createdAt: now,
    updatedAt: now,
  }
}

async function buildOpenAIExtraction(
  asset: EvidenceAsset,
  context: SubmissionScoringBundle,
): Promise<EvidenceExtraction | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'You normalize agricultural evidence metadata for a deterministic scoring engine.',
                  'Return concise JSON only.',
                  `Farm: ${context.farmName}`,
                  `Region: ${context.region}`,
                  `Category: ${asset.category}`,
                  `File name: ${asset.fileName}`,
                  `File type: ${asset.mimeType}`,
                  `Description: ${asset.description ?? 'None provided'}`,
                ].join('\n'),
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'evidence_extraction',
            schema: {
              type: 'object',
              additionalProperties: false,
              required: ['summary', 'confidence', 'observations', 'warnings', 'facts'],
              properties: {
                summary: { type: 'string' },
                confidence: { type: 'number' },
                warnings: {
                  type: 'array',
                  items: { type: 'string' },
                },
                observations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['label', 'value', 'signal'],
                    properties: {
                      label: { type: 'string' },
                      value: { type: 'string' },
                      signal: {
                        type: 'string',
                        enum: ['positive', 'neutral', 'warning'],
                      },
                    },
                  },
                },
                facts: {
                  type: 'object',
                  additionalProperties: true,
                },
              },
            },
          },
        },
        max_output_tokens: 400,
      }),
    })

    if (!response.ok) return null

    const payload = await response.json()
    const raw = typeof payload.output_text === 'string' ? payload.output_text : ''
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      summary?: string
      confidence?: number
      warnings?: string[]
      observations?: EvidenceExtraction['normalizedObservations']
      facts?: Record<string, unknown>
    }

    const now = new Date().toISOString()
    return {
      id: crypto.randomUUID(),
      evidenceAssetId: asset.id,
      submissionId: asset.submissionId,
      provider: 'openai',
      model: OPENAI_MODEL,
      category: asset.category,
      confidence: clamp(Number(parsed.confidence ?? 0)),
      status: (parsed.warnings?.length ?? 0) > 0 ? 'partial' : 'completed',
      summary: parsed.summary?.trim() || `AI-normalized evidence metadata for ${asset.fileName}.`,
      extractedJson: parsed.facts ?? {},
      normalizedObservations: Array.isArray(parsed.observations) ? parsed.observations : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      createdAt: now,
      updatedAt: now,
    }
  } catch {
    return null
  }
}

async function buildEvidenceExtraction(
  asset: EvidenceAsset,
  context: SubmissionScoringBundle,
) {
  const aiExtraction = await buildOpenAIExtraction(asset, context)
  return aiExtraction ?? buildHeuristicExtraction(asset, context)
}

function getAffordabilityBenchmark(
  benchmarks: RegionalBenchmark[],
  region: string,
  pricingProfiles: PricingProfile[],
) {
  const preferredMetric = pricingProfiles.some((profile) => profile.cropName.toLowerCase().includes('quinoa') || profile.cropName.toLowerCase().includes('lentil'))
    ? 'price_per_lb_grains'
    : 'price_per_lb_vegetables'

  return benchmarks.find((benchmark) => benchmark.region === region && benchmark.category === 'affordability' && benchmark.metricKey === preferredMetric)
    ?? benchmarks.find((benchmark) => benchmark.region === region && benchmark.category === 'affordability')
    ?? null
}

function recommendCategoryScores(bundle: SubmissionScoringBundle, extractions: EvidenceExtraction[]) {
  const nutrientDenseCount = bundle.crops.filter((crop) => NUTRIENT_DENSE_CROPS.has(crop.name.toLowerCase())).length
  const certifiedCropCount = bundle.crops.filter((crop) => crop.certifications.length > 0).length
  const documentedSafetyCount = bundle.safetyPractices.filter((practice) => practice.hasDocumentation).length
  const activeCertCount = bundle.safetyPractices.filter((practice) => practice.category === 'certification' || Boolean(practice.certificationBody)).length
  const localDistributionPct = localShare(bundle.distributionChannels)
  const lowIncomeDistributionPct = lowIncomeShare(bundle.distributionChannels)
  const affordabilityBenchmark = getAffordabilityBenchmark(bundle.benchmarks, bundle.region, bundle.pricingProfiles)
  const averagePrice = average(bundle.pricingProfiles.map((profile) => profile.pricePerUnit))
  const snapParticipationShare = ratio(bundle.pricingProfiles.filter((profile) => profile.acceptsSnap).length, bundle.pricingProfiles.length) * 100
  const slidingScaleShare = ratio(bundle.pricingProfiles.filter((profile) => profile.offersSlideScale).length, bundle.pricingProfiles.length) * 100
  const averageDiscount = average(bundle.pricingProfiles.map((profile) => profile.communityDiscountPct ?? 0))

  const groupedExtractions = Object.fromEntries(
    CATEGORIES.map((category) => [category, extractions.filter((extraction) => extraction.category === category)]),
  ) as Record<EvidenceCategory, EvidenceExtraction[]>
  const groupedAssets = Object.fromEntries(
    CATEGORIES.map((category) => [category, bundle.evidenceAssets.filter((asset) => asset.category === category)]),
  ) as Record<EvidenceCategory, EvidenceAsset[]>

  const nutritionalCoverage = evidenceCoverage(groupedAssets.nutritional_value, groupedExtractions.nutritional_value)
  const foodSafetyCoverage = evidenceCoverage(groupedAssets.food_safety, groupedExtractions.food_safety)
  const reliabilityCoverage = evidenceCoverage(groupedAssets.supply_reliability, groupedExtractions.supply_reliability)
  const accessibilityCoverage = evidenceCoverage(groupedAssets.local_accessibility, groupedExtractions.local_accessibility)
  const affordabilityCoverage = evidenceCoverage(groupedAssets.affordability, groupedExtractions.affordability)

  const nutritionalStructured = clamp(
    (ratio(bundle.crops.length, 4) * 38) +
    (ratio(certifiedCropCount, Math.max(bundle.crops.length, 1)) * 32) +
    (ratio(nutrientDenseCount, Math.max(bundle.crops.length, 1)) * 30),
  )
  const nutritionalWarnings = warningObservationCount(groupedExtractions.nutritional_value)
  const nutritionalScore = clamp(
    40 +
    (bundle.crops.length >= 4 ? 8 : bundle.crops.length >= 2 ? 4 : 0) +
    (ratio(nutrientDenseCount, Math.max(bundle.crops.length, 1)) >= 0.5 ? 14 : ratio(nutrientDenseCount, Math.max(bundle.crops.length, 1)) >= 0.25 ? 8 : 0) +
    (ratio(certifiedCropCount, Math.max(bundle.crops.length, 1)) >= 0.5 ? 10 : certifiedCropCount > 0 ? 5 : 0) +
    (bundle.crops.reduce((sum, crop) => sum + crop.annualYieldLbs, 0) >= 30000 ? 8 : 0) +
    (nutritionalCoverage * 0.16) +
    (positiveObservationCount(groupedExtractions.nutritional_value) * 2) -
    (nutritionalWarnings * 5),
  )

  const foodSafetyStructured = clamp(
    (ratio(bundle.safetyPractices.length, 3) * 30) +
    (ratio(documentedSafetyCount, Math.max(bundle.safetyPractices.length, 1)) * 40) +
    (ratio(activeCertCount, Math.max(bundle.safetyPractices.length, 1)) * 30),
  )
  const foodSafetyWarnings = warningObservationCount(groupedExtractions.food_safety)
  const foodSafetyScore = clamp(
    42 +
    (bundle.safetyPractices.length >= 2 ? 10 : bundle.safetyPractices.length === 1 ? 5 : 0) +
    (ratio(documentedSafetyCount, Math.max(bundle.safetyPractices.length, 1)) === 1 ? 18 : documentedSafetyCount > 0 ? 10 : 0) +
    (activeCertCount > 0 ? 12 : 0) +
    (foodSafetyCoverage * 0.18) +
    (positiveObservationCount(groupedExtractions.food_safety) * 2) -
    (foodSafetyWarnings * 6),
  )

  const reliabilityStructured = clamp(
    (ratio(bundle.crops.length, 4) * 30) +
    (ratio(seasonCoverage(bundle.crops), 4) * 35) +
    (ratio(bundle.distributionChannels.length, 3) * 15) +
    (Math.min(bundle.crops.reduce((sum, crop) => sum + crop.annualYieldLbs, 0), 40000) / 40000 * 20),
  )
  const reliabilityWarnings = warningObservationCount(groupedExtractions.supply_reliability)
  const reliabilityScore = clamp(
    38 +
    (bundle.crops.length >= 3 ? 9 : bundle.crops.length >= 2 ? 5 : 0) +
    (seasonCoverage(bundle.crops) >= 3 ? 12 : seasonCoverage(bundle.crops) >= 2 ? 6 : 0) +
    (bundle.distributionChannels.length >= 2 ? 6 : 0) +
    (bundle.crops.reduce((sum, crop) => sum + crop.annualYieldLbs, 0) >= 25000 ? 8 : 0) +
    (reliabilityCoverage * 0.2) +
    (positiveObservationCount(groupedExtractions.supply_reliability) * 2) -
    (reliabilityWarnings * 5),
  )

  const accessibilityStructured = clamp(
    (Math.min(localDistributionPct, 100) * 0.5) +
    (Math.min(lowIncomeDistributionPct, 100) * 0.3) +
    (ratio(bundle.distributionChannels.length, 4) * 20),
  )
  const accessibilityWarnings = warningObservationCount(groupedExtractions.local_accessibility)
  const accessibilityScore = clamp(
    34 +
    (localDistributionPct >= 65 ? 18 : localDistributionPct >= 50 ? 12 : localDistributionPct >= 30 ? 6 : 0) +
    (lowIncomeDistributionPct >= 35 ? 18 : lowIncomeDistributionPct >= 15 ? 10 : 0) +
    (bundle.distributionChannels.length >= 2 ? 6 : 0) +
    (accessibilityCoverage * 0.18) +
    (positiveObservationCount(groupedExtractions.local_accessibility) * 2) -
    (accessibilityWarnings * 5),
  )

  const affordabilityStructured = clamp(
    (bundle.pricingProfiles.length > 0 ? 25 : 0) +
    (snapParticipationShare * 0.25) +
    (slidingScaleShare * 0.15) +
    (Math.min(averageDiscount, 20) * 2),
  )
  let affordabilityBenchmarkPoints = 0
  if (affordabilityBenchmark && averagePrice > 0) {
    if (averagePrice <= affordabilityBenchmark.thresholdGood) affordabilityBenchmarkPoints = 20
    else if (averagePrice <= affordabilityBenchmark.thresholdFair) affordabilityBenchmarkPoints = 12
    else if (averagePrice <= affordabilityBenchmark.baselineValue) affordabilityBenchmarkPoints = 6
  }
  const affordabilityWarnings = warningObservationCount(groupedExtractions.affordability)
  const affordabilityScore = clamp(
    34 +
    affordabilityBenchmarkPoints +
    (snapParticipationShare > 0 ? 12 : 0) +
    (slidingScaleShare > 0 ? 8 : 0) +
    (averageDiscount >= 10 ? 8 : averageDiscount >= 5 ? 4 : 0) +
    (affordabilityCoverage * 0.16) +
    (positiveObservationCount(groupedExtractions.affordability) * 2) -
    (affordabilityWarnings * 5),
  )

  const recommendations: Record<EvidenceCategory, CategoryRecommendation> = {
    nutritional_value: {
      category: 'nutritional_value',
      score: nutritionalScore,
      confidence: categoryConfidence(nutritionalStructured, nutritionalCoverage, nutritionalWarnings),
      evidenceCoveragePct: nutritionalCoverage,
      reasonCodes: [
        bundle.crops.length >= 3 ? 'crop-diversity' : 'limited-crop-diversity',
        certifiedCropCount > 0 ? 'certified-production' : 'no-certification-signal',
        nutrientDenseCount > 0 ? 'nutrient-dense-crops' : 'nutrient-density-unknown',
      ],
      summary: `Recommended from crop diversity, certification mix, and nutrition evidence coverage across ${bundle.crops.length} crops.`,
      warnings: nutritionalWarnings > 0 ? ['Nutrition evidence has unresolved metadata warnings.'] : [],
      features: {
        cropCount: bundle.crops.length,
        nutrientDenseCount,
        certifiedCropCount,
        totalYieldLbs: bundle.crops.reduce((sum, crop) => sum + crop.annualYieldLbs, 0),
      },
    },
    food_safety: {
      category: 'food_safety',
      score: foodSafetyScore,
      confidence: categoryConfidence(foodSafetyStructured, foodSafetyCoverage, foodSafetyWarnings),
      evidenceCoveragePct: foodSafetyCoverage,
      reasonCodes: [
        documentedSafetyCount > 0 ? 'documented-practices' : 'missing-documented-practices',
        activeCertCount > 0 ? 'active-certification' : 'no-active-certification',
      ],
      summary: `Recommended from ${bundle.safetyPractices.length} safety practices, documentation coverage, and food safety evidence.`,
      warnings: foodSafetyWarnings > 0 ? ['Food safety evidence needs a manual spot check.'] : [],
      features: {
        safetyPracticeCount: bundle.safetyPractices.length,
        documentedSafetyCount,
        activeCertCount,
      },
    },
    supply_reliability: {
      category: 'supply_reliability',
      score: reliabilityScore,
      confidence: categoryConfidence(reliabilityStructured, reliabilityCoverage, reliabilityWarnings),
      evidenceCoveragePct: reliabilityCoverage,
      reasonCodes: [
        seasonCoverage(bundle.crops) >= 3 ? 'multi-season-coverage' : 'narrow-season-window',
        bundle.distributionChannels.length >= 2 ? 'channel-diversity' : 'single-channel-risk',
      ],
      summary: `Recommended from seasonal coverage, delivery footprint, and structured yield signals.`,
      warnings: reliabilityWarnings > 0 ? ['Delivery or production evidence is incomplete.'] : [],
      features: {
        cropCount: bundle.crops.length,
        seasonalCoverage: seasonCoverage(bundle.crops),
        distributionChannelCount: bundle.distributionChannels.length,
        totalYieldLbs: bundle.crops.reduce((sum, crop) => sum + crop.annualYieldLbs, 0),
      },
    },
    local_accessibility: {
      category: 'local_accessibility',
      score: accessibilityScore,
      confidence: categoryConfidence(accessibilityStructured, accessibilityCoverage, accessibilityWarnings),
      evidenceCoveragePct: accessibilityCoverage,
      reasonCodes: [
        localDistributionPct >= 50 ? 'local-delivery-footprint' : 'limited-local-footprint',
        lowIncomeDistributionPct >= 15 ? 'serves-low-income-areas' : 'low-income-coverage-gap',
      ],
      summary: `Recommended from ${localDistributionPct}% local share and ${lowIncomeDistributionPct}% low-income-area reach.`,
      warnings: accessibilityWarnings > 0 ? ['Distribution evidence should be rechecked for underserved-area coverage.'] : [],
      features: {
        localDistributionPct,
        lowIncomeDistributionPct,
        distributionChannelCount: bundle.distributionChannels.length,
      },
    },
    affordability: {
      category: 'affordability',
      score: affordabilityScore,
      confidence: categoryConfidence(affordabilityStructured, affordabilityCoverage, affordabilityWarnings),
      evidenceCoveragePct: affordabilityCoverage,
      reasonCodes: [
        affordabilityBenchmarkPoints >= 12 ? 'competitive-pricing' : 'pricing-above-benchmark',
        snapParticipationShare > 0 ? 'snap-enabled' : 'no-snap-program',
        averageDiscount >= 5 ? 'community-discount' : 'no-community-discount',
      ],
      summary: `Recommended from price positioning${affordabilityBenchmark ? ` against ${affordabilityBenchmark.label.toLowerCase()}` : ''}, SNAP participation, and community discounting.`,
      warnings: affordabilityWarnings > 0 ? ['Affordability evidence is partially inferred and needs verification.'] : [],
      features: {
        averagePrice: roundOne(averagePrice),
        snapParticipationShare: roundOne(snapParticipationShare),
        slidingScaleShare: roundOne(slidingScaleShare),
        averageDiscount: roundOne(averageDiscount),
        benchmarkBaseline: affordabilityBenchmark?.baselineValue ?? null,
      },
    },
  }

  return recommendations
}

export async function buildAutoScoringRun(bundle: SubmissionScoringBundle): Promise<{
  run: AutoScoringRun
  extractions: EvidenceExtraction[]
}> {
  const extractions = await Promise.all(
    bundle.evidenceAssets.map((asset) => buildEvidenceExtraction(asset, bundle)),
  )

  const recommendedScores = recommendCategoryScores(bundle, extractions)
  const warnings = [
    ...CATEGORIES.flatMap((category) => recommendedScores[category].warnings),
    ...(bundle.pricingProfiles.length === 0 ? ['Affordability inputs are incomplete because no pricing entries were found.'] : []),
    ...(bundle.safetyPractices.length === 0 ? ['Food safety inputs are incomplete because no safety practices were found.'] : []),
  ]

  const overallScore = calculateOverallScore({
    nutritionalValue: recommendedScores.nutritional_value.score,
    foodSafety: recommendedScores.food_safety.score,
    supplyReliability: recommendedScores.supply_reliability.score,
    localAccessibility: recommendedScores.local_accessibility.score,
    affordability: recommendedScores.affordability.score,
  }, bundle.config.weights)

  const runStatus: AutoScoringRun['status'] = warnings.length > 0 ? 'partial' : 'completed'
  const now = new Date().toISOString()

  const run: AutoScoringRun = {
    id: crypto.randomUUID(),
    submissionId: bundle.submissionId,
    farmId: bundle.farmId,
    modelVersion: AUTO_SCORING_MODEL_VERSION,
    benchmarkVersion: bundle.config.benchmarkVersion,
    scoringMethod: 'hybrid',
    status: runStatus,
    featureVector: {
      cropCount: bundle.crops.length,
      pricingProfileCount: bundle.pricingProfiles.length,
      distributionChannelCount: bundle.distributionChannels.length,
      safetyPracticeCount: bundle.safetyPractices.length,
      evidenceAssetCount: bundle.evidenceAssets.length,
      localDistributionPct: roundOne(localShare(bundle.distributionChannels)),
      lowIncomeDistributionPct: roundOne(lowIncomeShare(bundle.distributionChannels)),
      seasonCoverage: seasonCoverage(bundle.crops),
      averagePrice: roundOne(average(bundle.pricingProfiles.map((profile) => profile.pricePerUnit))),
    },
    recommendedScores,
    overallScore: roundOne(overallScore),
    confidenceSummary: roundOne(average(CATEGORIES.map((category) => recommendedScores[category].confidence))),
    warnings,
    createdAt: now,
    updatedAt: now,
  }

  return { run, extractions }
}

export function recommendedScoresToSnapshotValues(recommendedScores: Record<EvidenceCategory, CategoryRecommendation>) {
  return {
    nutritionalValue: recommendedScores.nutritional_value.score,
    foodSafety: recommendedScores.food_safety.score,
    supplyReliability: recommendedScores.supply_reliability.score,
    localAccessibility: recommendedScores.local_accessibility.score,
    affordability: recommendedScores.affordability.score,
  }
}

export function averageEvidenceCoverage(recommendedScores: Record<EvidenceCategory, CategoryRecommendation>) {
  return roundOne(average(CATEGORIES.map((category) => recommendedScores[category].evidenceCoveragePct)) / 100)
}

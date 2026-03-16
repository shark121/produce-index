// ─── Roles ───────────────────────────────────────────────────────────────────

export type UserRole = 'farmer' | 'partner' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  fullName: string
  createdAt: string
}

// ─── Farm ────────────────────────────────────────────────────────────────────

export interface FarmProfile {
  id: string
  userId: string
  name: string
  region: string
  address: string
  city: string
  state: string
  zipCode: string
  acreageTilled: number
  totalAcreage: number
  yearsInOperation: number
  description: string
  websiteUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CropProfile {
  id: string
  farmId: string
  name: string
  variety: string | null
  seasonalAvailability: string[]
  annualYieldLbs: number
  certifications: string[]
  primaryUse: 'fresh' | 'processed' | 'both'
  createdAt: string
}

export type DistributionChannelType =
  | 'farmers_market'
  | 'grocery'
  | 'food_bank'
  | 'restaurant'
  | 'csa'
  | 'wholesale'
  | 'direct_consumer'

export interface DistributionChannel {
  id: string
  farmId: string
  type: DistributionChannelType
  name: string
  distanceMiles: number
  percentageOfSales: number
  servesLowIncomeArea: boolean
}

export interface PricingProfile {
  id: string
  farmId: string
  cropId: string
  cropName: string
  pricePerUnit: number
  unit: string
  acceptsSnap: boolean
  offersSlideScale: boolean
  communityDiscountPct: number | null
}

export interface SafetyPractice {
  id: string
  farmId: string
  category: 'pesticide' | 'water' | 'handling' | 'certification' | 'soil'
  practiceDescription: string
  hasDocumentation: boolean
  certificationBody: string | null
  expiresAt: string | null
}

// ─── Evidence ────────────────────────────────────────────────────────────────

export type EvidenceCategory =
  | 'nutritional_value'
  | 'food_safety'
  | 'supply_reliability'
  | 'local_accessibility'
  | 'affordability'

export type EvidenceAssetType =
  | 'certification'
  | 'lab_test_result'
  | 'photo'
  | 'invoice'
  | 'inspection_report'
  | 'delivery_log'
  | 'price_list'
  | 'other'

export interface EvidenceAsset {
  id: string
  submissionId: string
  category: EvidenceCategory
  type: EvidenceAssetType
  fileName: string
  storageKey: string
  mimeType: string
  sizeBytes: number
  description: string | null
  uploadedAt: string
}

// ─── Submissions ─────────────────────────────────────────────────────────────

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'needs_changes'

export type VerificationStatus = 'self_reported' | 'reviewed' | 'verified'

export interface PRISubmission {
  id: string
  farmId: string
  farmName: string
  status: SubmissionStatus
  submittedAt: string | null
  reviewStartedAt: string | null
  reviewedAt: string | null
  verifiedAt: string | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

export interface PRIScoreSnapshot {
  id: string
  submissionId: string
  farmId: string
  // Category subscores (0–100)
  nutritionalValue: number
  foodSafety: number
  supplyReliability: number
  localAccessibility: number
  affordability: number
  // Derived
  overallScore: number
  dataCompleteness: number       // 0–1 fraction
  verificationStatus: VerificationStatus
  weightsVersion: string
  benchmarkVersion: string
  calculatedAt: string
  calculatedBy: string           // admin user id
}

export interface ScoringWeights {
  nutritionalValue: number       // 0.30
  foodSafety: number             // 0.20
  supplyReliability: number      // 0.20
  localAccessibility: number     // 0.15
  affordability: number          // 0.15
  version: string
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  nutritionalValue: 0.30,
  foodSafety: 0.20,
  supplyReliability: 0.20,
  localAccessibility: 0.15,
  affordability: 0.15,
  version: 'v1',
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface ReviewDecision {
  id: string
  submissionId: string
  adminId: string
  decision: 'verified' | 'needs_changes'
  notes: string
  scoreSnapshotId: string | null
  createdAt: string
}

// ─── Benchmarks ──────────────────────────────────────────────────────────────

export interface RegionalBenchmark {
  id: string
  region: string
  category: 'affordability' | 'local_accessibility'
  metricKey: string
  label: string
  baselineValue: number
  unit: string
  thresholdGood: number
  thresholdFair: number
  effectiveFrom: string
  version: string
}

// ─── Partner ─────────────────────────────────────────────────────────────────

export type PartnerInterestStatus = 'pending' | 'acknowledged' | 'connected'

export interface PartnerInterest {
  id: string
  partnerId: string
  partnerName: string
  farmId: string
  farmName: string
  message: string
  status: PartnerInterestStatus
  createdAt: string
}

// ─── Public scorecard (partner-visible) ──────────────────────────────────────

export interface FarmScorecard {
  farm: Pick<FarmProfile, 'id' | 'name' | 'region' | 'city' | 'state' | 'acreageTilled' | 'yearsInOperation' | 'description'>
  score: PRIScoreSnapshot
  crops: Pick<CropProfile, 'id' | 'name' | 'seasonalAvailability' | 'certifications'>[]
  distributionChannels: DistributionChannel[]
  verifiedAt: string
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  error: null
}

export interface ApiError {
  data: null
  error: { message: string; code?: string }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Score helpers ────────────────────────────────────────────────────────────

export function calculateOverallScore(
  subscores: Omit<PRIScoreSnapshot, 'id' | 'submissionId' | 'farmId' | 'overallScore' | 'dataCompleteness' | 'verificationStatus' | 'weightsVersion' | 'benchmarkVersion' | 'calculatedAt' | 'calculatedBy'>,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
): number {
  return (
    subscores.nutritionalValue * weights.nutritionalValue +
    subscores.foodSafety * weights.foodSafety +
    subscores.supplyReliability * weights.supplyReliability +
    subscores.localAccessibility * weights.localAccessibility +
    subscores.affordability * weights.affordability
  )
}

export function scoreTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 75) return 'high'
  if (score >= 50) return 'medium'
  return 'low'
}

export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 35) return 'Developing'
  return 'Needs Work'
}

export const VALID_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['verified', 'needs_changes'],
  verified: [],
  needs_changes: ['draft'],
}

export function canTransition(from: SubmissionStatus, to: SubmissionStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

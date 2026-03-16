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

export interface EvidenceObservation {
  label: string
  value: string
  signal: 'positive' | 'neutral' | 'warning'
}

export interface EvidenceExtraction {
  id: string
  evidenceAssetId: string
  submissionId: string
  provider: 'openai' | 'heuristic'
  model: string
  category: EvidenceCategory
  confidence: number
  status: 'completed' | 'partial' | 'failed'
  summary: string
  extractedJson: Record<string, unknown>
  normalizedObservations: EvidenceObservation[]
  warnings: string[]
  createdAt: string
  updatedAt: string
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

export interface ScoringConfig {
  weights: ScoringWeights
  benchmarkVersion: string
  benchmarkSource: string
  reviewMethod: string
  updatedAt: string
}

export interface CategoryRecommendation {
  category: EvidenceCategory
  score: number
  confidence: number
  evidenceCoveragePct: number
  reasonCodes: string[]
  summary: string
  warnings: string[]
  features: Record<string, boolean | number | string | null>
}

export interface AutoScoringRun {
  id: string
  submissionId: string
  farmId: string
  modelVersion: string
  benchmarkVersion: string
  scoringMethod: 'hybrid'
  status: 'completed' | 'partial' | 'failed'
  featureVector: Record<string, boolean | number | string | null>
  recommendedScores: Record<EvidenceCategory, CategoryRecommendation>
  overallScore: number
  confidenceSummary: number
  warnings: string[]
  createdAt: string
  updatedAt: string
}

export interface ScoreOverride {
  category: EvidenceCategory
  recommendedScore: number
  finalScore: number
  reason: string
}

// ─── Review ───────────────────────────────────────────────────────────────────

export interface ReviewDecision {
  id: string
  submissionId: string
  adminId: string
  decision: 'verified' | 'needs_changes'
  notes: string
  scoreSnapshotId: string | null
  autoScoringRunId?: string | null
  recommendedScores?: Partial<Record<EvidenceCategory, CategoryRecommendation>>
  finalScores?: Partial<Record<EvidenceCategory, { subscore: number; notes: string; evidenceCoveragePct: number }>>
  overrideReasons?: Partial<Record<EvidenceCategory, string>>
  overrides?: ScoreOverride[]
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

export interface VerificationConfidence {
  score: number
  label: 'High' | 'Moderate' | 'Developing'
  auditedAssets: number
  evidenceCoveragePct: number
  lastReviewedAt: string
}

export interface HealthImpactSummary {
  estimatedHealthyServings: number
  lowIncomeReachPct: number
  localDistributionPct: number
  nearbyAccessPoints: number
  narrative: string
}

export interface FinancingReadiness {
  tier: 'ready' | 'watchlist' | 'emerging'
  label: string
  lenderSummary: string
  benchmarkDelta: string
  nextSeasonConfidence: number
  seasonalityRisk: 'Low' | 'Moderate' | 'High'
}

export interface ScoreProvenance {
  weightsVersion: string
  benchmarkVersion: string
  benchmarkSource: string
  benchmarkRegion: string
  reviewMethod: string
  reviewedAt: string
  evidenceCoveragePct: number
}

// ─── Marketplace / Exchange ──────────────────────────────────────────────────

export type BuyerType = 'hospital' | 'school' | 'community_org' | 'individual'
export type FulfillmentMethod = 'pickup' | 'delivery'
export type MarketplaceListingType = 'weekly_offer' | 'catalog_item'
export type MarketplaceListingStatus = 'draft' | 'published' | 'paused' | 'sold_out'
export type MarketplaceOrderStatus = 'pending' | 'confirmed' | 'ready' | 'completed' | 'canceled'
export type MarketplacePaymentStatus = 'pay_on_fulfillment'
export type MarketplaceInquiryStatus = 'new' | 'reviewed'
export type MarketplaceCommissionStatus = 'accrued' | 'invoiced'
export type MarketplaceVolumeTier = 'small' | 'medium' | 'large' | 'enterprise'

export type NutrientProfileTag =
  | 'leafy_greens'
  | 'fiber_rich'
  | 'protein_legumes'
  | 'vitamin_c_rich'
  | 'iron_supporting'
  | 'potassium_supporting'
  | 'antioxidant_rich'

export interface MarketplacePickupLocation {
  id: string
  farmId: string
  sellerProfileId: string
  label: string
  address: string
  pickupWindow: string
  notes: string | null
}

export interface MarketplaceDeliveryZone {
  id: string
  farmId: string
  sellerProfileId: string
  label: string
  areaSummary: string
  deliveryFee: number
  deliveryDays: string[]
  notes: string | null
}

export interface MarketplaceSellerProfile {
  id: string
  farmId: string
  publicDescription: string
  contactEmail: string
  contactPhone: string
  orderInstructions: string
  serviceDays: string[]
  acceptsCommunityOrders: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface MarketplaceListing {
  id: string
  farmId: string
  sellerProfileId: string
  title: string
  description: string
  listingType: MarketplaceListingType
  status: MarketplaceListingStatus
  cropNames: string[]
  nutrientTags: NutrientProfileTag[]
  pricePerUnit: number
  unit: string
  quantityAvailable: number
  minimumOrderQuantity: number
  availabilityStart: string | null
  availabilityEnd: string | null
  acceptsBulkInquiries: boolean
  acceptsSnap: boolean
  offersSlidingScale: boolean
  communityDiscountPct: number | null
  pickupEnabled: boolean
  deliveryEnabled: boolean
  pickupLocationIds: string[]
  deliveryZoneIds: string[]
  createdAt: string
  updatedAt: string
}

export interface MarketplaceOrderItem {
  id: string
  orderId: string
  listingId: string
  listingTitle: string
  quantity: number
  unit: string
  unitPrice: number
  lineTotal: number
}

export interface MarketplaceOrder {
  id: string
  farmId: string
  buyerType: Extract<BuyerType, 'individual' | 'community_org'>
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  fulfillmentMethod: FulfillmentMethod
  pickupLocationId: string | null
  deliveryZoneId: string | null
  notes: string
  subtotal: number
  deliveryFee: number
  total: number
  status: MarketplaceOrderStatus
  paymentStatus: MarketplacePaymentStatus
  referenceCode: string
  createdAt: string
  updatedAt: string
}

export interface MarketplaceInquiry {
  id: string
  farmId: string
  listingId: string | null
  buyerType: Exclude<BuyerType, 'individual'>
  organizationName: string
  contactName: string
  email: string
  phone: string
  volumeTier: MarketplaceVolumeTier
  timingWindow: string
  region: string
  fulfillmentPreference: FulfillmentMethod | 'either'
  notes: string
  status: MarketplaceInquiryStatus
  createdAt: string
}

export interface MarketplaceCommissionLedgerEntry {
  id: string
  farmId: string
  orderId: string
  ratePct: number
  produceSubtotal: number
  commissionAmount: number
  status: MarketplaceCommissionStatus
  createdAt: string
}

export interface BuyerMatchRequest {
  buyerType: BuyerType
  q?: string
  region?: string
  minPriScore?: number
  nutrientTags?: NutrientProfileTag[]
  fulfillmentMethod?: FulfillmentMethod
  affordabilityNeeded?: boolean
  snapPreferred?: boolean
  volumeTier?: MarketplaceVolumeTier
  availabilityWindow?: string
}

export interface MarketplaceSellerSignals {
  hasPublishedListings: boolean
  acceptsSnap: boolean
  communityDiscountPct: number | null
  supportsPickup: boolean
  supportsDelivery: boolean
}

export interface MarketplaceListingView {
  listing: MarketplaceListing
  sellerProfile: MarketplaceSellerProfile
  scorecard: FarmScorecard
  pickupLocations: MarketplacePickupLocation[]
  deliveryZones: MarketplaceDeliveryZone[]
  nutrientTags: NutrientProfileTag[]
  sellerSignals: MarketplaceSellerSignals
}

export interface MarketplaceMatchResult {
  listingView: MarketplaceListingView
  matchScore: number
  reasons: string[]
}

export interface MarketplaceFarmMatchResult {
  scorecard: FarmScorecard
  sellerSignals: MarketplaceSellerSignals
  nutrientTags: NutrientProfileTag[]
  matchScore: number
  reasons: string[]
}

// ─── Public scorecard (partner-visible) ──────────────────────────────────────

export interface FarmScorecard {
  farm: Pick<FarmProfile, 'id' | 'name' | 'region' | 'city' | 'state' | 'acreageTilled' | 'yearsInOperation' | 'description'>
  score: PRIScoreSnapshot
  crops: Pick<CropProfile, 'id' | 'name' | 'seasonalAvailability' | 'certifications'>[]
  distributionChannels: DistributionChannel[]
  verifiedAt: string
  verificationConfidence: VerificationConfidence
  healthImpactSummary: HealthImpactSummary
  financingReadiness: FinancingReadiness
  scoreProvenance: ScoreProvenance
}

export type PilotApplicationType = 'farmer' | 'institution'

export type InstitutionType =
  | 'lender'
  | 'health_system'
  | 'grocery_partner'
  | 'public_agency'
  | 'nonprofit'

export type InstitutionUseCase =
  | 'underwriting'
  | 'procurement'
  | 'nutrition_program'
  | 'community_health'
  | 'impact_reporting'

export type EstimatedVolumeRange =
  | 'under_250k'
  | '250k_to_1m'
  | '1m_to_5m'
  | 'over_5m'

export interface PilotApplicationBase {
  fullName: string
  email: string
  organizationName: string
  region: string
  notes: string
}

export interface FarmerPilotApplicationInput extends PilotApplicationBase {
  type: 'farmer'
  acreage: string
  primaryCrops: string
}

export interface InstitutionPilotApplicationInput extends PilotApplicationBase {
  type: 'institution'
  organizationType: InstitutionType
  useCase: InstitutionUseCase
  estimatedVolume: EstimatedVolumeRange
}

export type PilotApplicationInput =
  | FarmerPilotApplicationInput
  | InstitutionPilotApplicationInput

export type PilotApplicationRecord = PilotApplicationInput & {
  id: string
  createdAt: string
  storageMode: 'mock-file' | 'supabase'
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
  submitted: ['under_review', 'verified', 'needs_changes'],
  under_review: ['verified', 'needs_changes'],
  verified: [],
  needs_changes: ['draft'],
}

export function canTransition(from: SubmissionStatus, to: SubmissionStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

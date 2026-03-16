import type {
  FarmProfile,
  CropProfile,
  DistributionChannel,
  PricingProfile,
  SafetyPractice,
  PRISubmission,
  PRIScoreSnapshot,
  RegionalBenchmark,
  PartnerInterest,
  ReviewDecision,
  User,
} from '@/lib/types'

// ─── Mock users ──────────────────────────────────────────────────────────────

export const MOCK_USERS: Record<'farmer' | 'partner' | 'admin', User> = {
  farmer: {
    id: 'user-farmer-1',
    email: 'jane@sunrisevalley.com',
    role: 'farmer',
    fullName: 'Jane Okafor',
    createdAt: '2024-01-15T10:00:00Z',
  },
  partner: {
    id: 'user-partner-1',
    email: 'procurement@reghealth.org',
    role: 'partner',
    fullName: 'Marcus Webb',
    createdAt: '2024-02-01T09:00:00Z',
  },
  admin: {
    id: 'user-admin-1',
    email: 'admin@pri.org',
    role: 'admin',
    fullName: 'Priya Nair',
    createdAt: '2023-12-01T08:00:00Z',
  },
}

// ─── Farms ───────────────────────────────────────────────────────────────────

export const MOCK_FARMS: FarmProfile[] = [
  {
    id: 'farm-1',
    userId: 'user-farmer-1',
    name: 'Sunrise Valley Farm',
    region: 'Central Valley',
    address: '4820 N Cedar Ave',
    city: 'Fresno',
    state: 'CA',
    zipCode: '93701',
    acreageTilled: 85,
    totalAcreage: 120,
    yearsInOperation: 14,
    description:
      'Family-owned diversified vegetable farm specializing in heirloom varieties and certified organic production. We supply three Fresno food banks and two farmers markets year-round.',
    websiteUrl: null,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-11-20T14:30:00Z',
  },
  {
    id: 'farm-2',
    userId: 'user-farmer-2',
    name: 'Green Meadows Cooperative',
    region: 'Sacramento Delta',
    address: '1100 W Hammer Ln',
    city: 'Stockton',
    state: 'CA',
    zipCode: '95201',
    acreageTilled: 45,
    totalAcreage: 60,
    yearsInOperation: 7,
    description:
      'Worker-owned cooperative growing leafy greens and root vegetables for urban food banks and community markets. All produce sold within 40 miles.',
    websiteUrl: null,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-12-05T09:15:00Z',
  },
  {
    id: 'farm-3',
    userId: 'user-farmer-3',
    name: 'Holloway Heritage Grains',
    region: 'San Joaquin Valley',
    address: '8200 Ave 256',
    city: 'Visalia',
    state: 'CA',
    zipCode: '93291',
    acreageTilled: 210,
    totalAcreage: 310,
    yearsInOperation: 22,
    description:
      'Third-generation grain farm transitioning to diversified heirloom grains and legumes. GAP certified, pesticide-free since 2019.',
    websiteUrl: null,
    createdAt: '2024-04-10T11:00:00Z',
    updatedAt: '2024-12-01T16:00:00Z',
  },
]

// ─── Crops ───────────────────────────────────────────────────────────────────

export const MOCK_CROPS: CropProfile[] = [
  // Sunrise Valley
  { id: 'crop-1', farmId: 'farm-1', name: 'Kale',        variety: 'Lacinato',       seasonalAvailability: ['Spring', 'Fall', 'Winter'],    annualYieldLbs: 12000, certifications: ['USDA Organic', 'GAP'], primaryUse: 'fresh', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-2', farmId: 'farm-1', name: 'Tomatoes',    variety: 'Heirloom mix',   seasonalAvailability: ['Summer', 'Fall'],               annualYieldLbs: 35000, certifications: ['USDA Organic'],         primaryUse: 'both',  createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-3', farmId: 'farm-1', name: 'Sweet Peppers',variety: 'Bell/Italian',  seasonalAvailability: ['Summer', 'Fall'],               annualYieldLbs: 18000, certifications: ['USDA Organic'],         primaryUse: 'fresh', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-4', farmId: 'farm-1', name: 'Squash',      variety: 'Butternut',      seasonalAvailability: ['Fall', 'Winter'],               annualYieldLbs: 22000, certifications: ['USDA Organic'],         primaryUse: 'both',  createdAt: '2024-01-20T00:00:00Z' },
  // Green Meadows
  { id: 'crop-5', farmId: 'farm-2', name: 'Spinach',     variety: 'Bloomsdale',     seasonalAvailability: ['Spring', 'Fall', 'Winter'],    annualYieldLbs: 8000,  certifications: ['GAP'],                  primaryUse: 'fresh', createdAt: '2024-03-10T00:00:00Z' },
  { id: 'crop-6', farmId: 'farm-2', name: 'Carrots',     variety: 'Danvers',        seasonalAvailability: ['Spring', 'Fall'],               annualYieldLbs: 14000, certifications: ['GAP'],                  primaryUse: 'both',  createdAt: '2024-03-10T00:00:00Z' },
  { id: 'crop-7', farmId: 'farm-2', name: 'Swiss Chard', variety: 'Rainbow',        seasonalAvailability: ['Spring', 'Summer', 'Fall'],    annualYieldLbs: 6500,  certifications: [],                       primaryUse: 'fresh', createdAt: '2024-03-10T00:00:00Z' },
  // Holloway
  { id: 'crop-8', farmId: 'farm-3', name: 'Quinoa',      variety: 'Colorado White', seasonalAvailability: ['Summer', 'Fall'],               annualYieldLbs: 45000, certifications: ['GAP'],                  primaryUse: 'processed', createdAt: '2024-04-15T00:00:00Z' },
  { id: 'crop-9', farmId: 'farm-3', name: 'Black Lentils',variety: 'Beluga',        seasonalAvailability: ['Fall'],                         annualYieldLbs: 30000, certifications: ['GAP'],                  primaryUse: 'processed', createdAt: '2024-04-15T00:00:00Z' },
]

// ─── Distribution channels ────────────────────────────────────────────────────

export const MOCK_DISTRIBUTION: DistributionChannel[] = [
  { id: 'dist-1', farmId: 'farm-1', type: 'food_bank',    name: 'Fresno Food Bank',            distanceMiles: 8,  percentageOfSales: 35, servesLowIncomeArea: true },
  { id: 'dist-2', farmId: 'farm-1', type: 'farmers_market',name: 'Tower District Market',      distanceMiles: 12, percentageOfSales: 40, servesLowIncomeArea: false },
  { id: 'dist-3', farmId: 'farm-1', type: 'csa',           name: 'Weekly CSA Box (180 members)',distanceMiles: 25, percentageOfSales: 25, servesLowIncomeArea: false },
  { id: 'dist-4', farmId: 'farm-2', type: 'food_bank',    name: 'Second Harvest Food Bank',    distanceMiles: 5,  percentageOfSales: 60, servesLowIncomeArea: true },
  { id: 'dist-5', farmId: 'farm-2', type: 'grocery',      name: 'People\'s Market Coop',       distanceMiles: 18, percentageOfSales: 40, servesLowIncomeArea: false },
  { id: 'dist-6', farmId: 'farm-3', type: 'wholesale',    name: 'Valley Grain Distributors',   distanceMiles: 35, percentageOfSales: 80, servesLowIncomeArea: false },
  { id: 'dist-7', farmId: 'farm-3', type: 'direct_consumer', name: 'Online/direct orders',     distanceMiles: 0,  percentageOfSales: 20, servesLowIncomeArea: false },
]

// ─── Submissions ──────────────────────────────────────────────────────────────

export const MOCK_SUBMISSIONS: PRISubmission[] = [
  {
    id: 'sub-1',
    farmId: 'farm-1',
    farmName: 'Sunrise Valley Farm',
    status: 'verified',
    submittedAt: '2024-10-05T09:00:00Z',
    reviewStartedAt: '2024-10-07T11:00:00Z',
    reviewedAt: '2024-10-09T15:30:00Z',
    verifiedAt: '2024-10-09T15:30:00Z',
    adminNotes: null,
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2024-10-09T15:30:00Z',
  },
  {
    id: 'sub-2',
    farmId: 'farm-2',
    farmName: 'Green Meadows Cooperative',
    status: 'verified',
    submittedAt: '2024-11-12T10:00:00Z',
    reviewStartedAt: '2024-11-14T09:00:00Z',
    reviewedAt: '2024-11-16T14:00:00Z',
    verifiedAt: '2024-11-16T14:00:00Z',
    adminNotes: null,
    createdAt: '2024-11-08T08:00:00Z',
    updatedAt: '2024-11-16T14:00:00Z',
  },
  {
    id: 'sub-3',
    farmId: 'farm-3',
    farmName: 'Holloway Heritage Grains',
    status: 'under_review',
    submittedAt: '2024-12-18T08:30:00Z',
    reviewStartedAt: '2024-12-19T10:00:00Z',
    reviewedAt: null,
    verifiedAt: null,
    adminNotes: null,
    createdAt: '2024-12-15T07:00:00Z',
    updatedAt: '2024-12-19T10:00:00Z',
  },
  {
    id: 'sub-4',
    farmId: 'farm-1',
    farmName: 'Sunrise Valley Farm',
    status: 'needs_changes',
    submittedAt: '2024-08-20T09:00:00Z',
    reviewStartedAt: '2024-08-22T11:00:00Z',
    reviewedAt: '2024-08-24T14:00:00Z',
    verifiedAt: null,
    adminNotes: 'Please upload lab test results for kale and tomatoes. Current nutritional evidence is insufficient for a verified score.',
    createdAt: '2024-08-15T08:00:00Z',
    updatedAt: '2024-08-24T14:00:00Z',
  },
  {
    id: 'sub-5',
    farmId: 'farm-1',
    farmName: 'Sunrise Valley Farm',
    status: 'draft',
    submittedAt: null,
    reviewStartedAt: null,
    reviewedAt: null,
    verifiedAt: null,
    adminNotes: null,
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-01-10T08:00:00Z',
  },
]

// ─── Score snapshots ──────────────────────────────────────────────────────────

export const MOCK_SCORES: PRIScoreSnapshot[] = [
  {
    id: 'score-1',
    submissionId: 'sub-1',
    farmId: 'farm-1',
    nutritionalValue:   82,
    foodSafety:         91,
    supplyReliability:  78,
    localAccessibility: 88,
    affordability:      74,
    overallScore:       82.9,
    dataCompleteness:   0.95,
    verificationStatus: 'verified',
    weightsVersion:     'v1',
    benchmarkVersion:   'v1',
    calculatedAt:       '2024-10-09T15:30:00Z',
    calculatedBy:       'user-admin-1',
  },
  {
    id: 'score-2',
    submissionId: 'sub-2',
    farmId: 'farm-2',
    nutritionalValue:   68,
    foodSafety:         72,
    supplyReliability:  85,
    localAccessibility: 94,
    affordability:      81,
    overallScore:       78.5,
    dataCompleteness:   0.88,
    verificationStatus: 'verified',
    weightsVersion:     'v1',
    benchmarkVersion:   'v1',
    calculatedAt:       '2024-11-16T14:00:00Z',
    calculatedBy:       'user-admin-1',
  },
  {
    id: 'score-3',
    submissionId: 'sub-4',
    farmId: 'farm-1',
    nutritionalValue:   61,
    foodSafety:         88,
    supplyReliability:  72,
    localAccessibility: 84,
    affordability:      70,
    overallScore:       73.7,
    dataCompleteness:   0.72,
    verificationStatus: 'reviewed',
    weightsVersion:     'v1',
    benchmarkVersion:   'v1',
    calculatedAt:       '2024-08-24T14:00:00Z',
    calculatedBy:       'user-admin-1',
  },
]

// ─── Benchmarks ───────────────────────────────────────────────────────────────

export const MOCK_BENCHMARKS: RegionalBenchmark[] = [
  { id: 'bench-1', region: 'Central Valley',    category: 'affordability',        metricKey: 'price_per_lb_vegetables', label: 'Avg. vegetable price / lb', baselineValue: 2.80, unit: '$/lb', thresholdGood: 2.00, thresholdFair: 2.50, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-2', region: 'Central Valley',    category: 'local_accessibility',  metricKey: 'pct_sales_within_30mi',  label: '% sales within 30 miles',   baselineValue: 45,   unit: '%',    thresholdGood: 65,   thresholdFair: 50,   effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-3', region: 'Sacramento Delta',  category: 'affordability',        metricKey: 'price_per_lb_vegetables', label: 'Avg. vegetable price / lb', baselineValue: 3.10, unit: '$/lb', thresholdGood: 2.20, thresholdFair: 2.70, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-4', region: 'Sacramento Delta',  category: 'local_accessibility',  metricKey: 'pct_sales_within_30mi',  label: '% sales within 30 miles',   baselineValue: 50,   unit: '%',    thresholdGood: 70,   thresholdFair: 55,   effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-5', region: 'San Joaquin Valley',category: 'affordability',        metricKey: 'price_per_lb_grains',    label: 'Avg. grain price / lb',     baselineValue: 1.20, unit: '$/lb', thresholdGood: 0.90, thresholdFair: 1.05, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
]

// ─── Partner interests ────────────────────────────────────────────────────────

export const MOCK_INTERESTS: PartnerInterest[] = [
  { id: 'int-1', partnerId: 'user-partner-1', partnerName: 'Regional Health Network', farmId: 'farm-1', farmName: 'Sunrise Valley Farm',       message: 'Interested in sourcing kale and tomatoes for our hospital cafeteria program.', status: 'acknowledged', createdAt: '2024-10-14T10:00:00Z' },
  { id: 'int-2', partnerId: 'user-partner-1', partnerName: 'Regional Health Network', farmId: 'farm-2', farmName: 'Green Meadows Cooperative', message: 'Would like to discuss a supply contract for our community wellness program.',  status: 'pending',      createdAt: '2024-11-20T14:00:00Z' },
]

// ─── Review decisions ─────────────────────────────────────────────────────────

export const MOCK_DECISIONS: ReviewDecision[] = [
  { id: 'dec-1', submissionId: 'sub-1', adminId: 'user-admin-1', decision: 'verified',      notes: 'All evidence complete. Lab results validated against USDA baselines.',         scoreSnapshotId: 'score-1', createdAt: '2024-10-09T15:30:00Z' },
  { id: 'dec-2', submissionId: 'sub-2', adminId: 'user-admin-1', decision: 'verified',      notes: 'Strong local distribution network. Safety certs verified.',                  scoreSnapshotId: 'score-2', createdAt: '2024-11-16T14:00:00Z' },
  { id: 'dec-3', submissionId: 'sub-4', adminId: 'user-admin-1', decision: 'needs_changes', notes: 'Please upload lab test results for kale and tomatoes. Insufficient evidence.', scoreSnapshotId: null,      createdAt: '2024-08-24T14:00:00Z' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getFarmById(id: string) {
  return MOCK_FARMS.find((f) => f.id === id) ?? null
}

export function getScoreForFarm(farmId: string) {
  return MOCK_SCORES.filter((s) => s.farmId === farmId && s.verificationStatus === 'verified')
    .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())[0] ?? null
}

export function getLatestSubmissionForFarm(farmId: string) {
  return MOCK_SUBMISSIONS.filter((s) => s.farmId === farmId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null
}

export function getCropsForFarm(farmId: string) {
  return MOCK_CROPS.filter((c) => c.farmId === farmId)
}

export function getDistributionForFarm(farmId: string) {
  return MOCK_DISTRIBUTION.filter((d) => d.farmId === farmId)
}

export function getSubmissionsForFarm(farmId: string) {
  return MOCK_SUBMISSIONS.filter((s) => s.farmId === farmId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getVerifiedFarms() {
  const verifiedSubmissions = MOCK_SUBMISSIONS.filter((s) => s.status === 'verified')
  return verifiedSubmissions.map((sub) => {
    const farm = getFarmById(sub.farmId)!
    const score = getScoreForFarm(sub.farmId)!
    const crops = getCropsForFarm(sub.farmId)
    const distribution = getDistributionForFarm(sub.farmId)
    return { farm, score, crops, distribution, verifiedAt: sub.verifiedAt! }
  })
}

export function getAdminQueue() {
  return MOCK_SUBMISSIONS.filter((s) => ['submitted', 'under_review'].includes(s.status))
    .sort((a, b) => new Date(a.submittedAt!).getTime() - new Date(b.submittedAt!).getTime())
}

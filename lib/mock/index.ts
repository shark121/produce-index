import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  AutoScoringRun,
  CropProfile,
  DistributionChannel,
  EvidenceAsset,
  EvidenceExtraction,
  FarmProfile,
  MarketplaceCommissionLedgerEntry,
  MarketplaceDeliveryZone,
  MarketplaceInquiry,
  MarketplaceListing,
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplacePickupLocation,
  MarketplaceSellerProfile,
  PartnerInterest,
  PRIScoreSnapshot,
  PRISubmission,
  PricingProfile,
  RegionalBenchmark,
  ReviewDecision,
  SafetyPractice,
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
  {
    id: 'farm-4',
    userId: 'user-farmer-4',
    name: 'Riverbend Produce Hub',
    region: 'Central Valley',
    address: '2140 Mission Ave',
    city: 'Merced',
    state: 'CA',
    zipCode: '95340',
    acreageTilled: 62,
    totalAcreage: 90,
    yearsInOperation: 11,
    description:
      'Regional produce operation growing greens, roots, and tomatoes for school nutrition programs, neighborhood pickup sites, and community clinics across Merced County.',
    websiteUrl: null,
    createdAt: '2024-05-12T10:00:00Z',
    updatedAt: '2025-01-24T13:20:00Z',
  },
  {
    id: 'farm-5',
    userId: 'user-farmer-5',
    name: 'Oak Terrace Organics',
    region: 'Sacramento Delta',
    address: '77 County Road 18A',
    city: 'Woodland',
    state: 'CA',
    zipCode: '95695',
    acreageTilled: 38,
    totalAcreage: 52,
    yearsInOperation: 9,
    description:
      'Small regenerative farm producing greens, peppers, and legumes for school meal pilots, CSA members, and neighborhood food-access programs.',
    websiteUrl: null,
    createdAt: '2024-06-02T09:30:00Z',
    updatedAt: '2025-02-06T15:10:00Z',
  },
]

// ─── Crops ───────────────────────────────────────────────────────────────────

export const MOCK_CROPS: CropProfile[] = [
  { id: 'crop-1', farmId: 'farm-1', name: 'Kale', variety: 'Lacinato', seasonalAvailability: ['Spring', 'Fall', 'Winter'], annualYieldLbs: 12000, certifications: ['USDA Organic', 'GAP'], primaryUse: 'fresh', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-2', farmId: 'farm-1', name: 'Tomatoes', variety: 'Heirloom mix', seasonalAvailability: ['Summer', 'Fall'], annualYieldLbs: 35000, certifications: ['USDA Organic'], primaryUse: 'both', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-3', farmId: 'farm-1', name: 'Sweet Peppers', variety: 'Bell/Italian', seasonalAvailability: ['Summer', 'Fall'], annualYieldLbs: 18000, certifications: ['USDA Organic'], primaryUse: 'fresh', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-4', farmId: 'farm-1', name: 'Squash', variety: 'Butternut', seasonalAvailability: ['Fall', 'Winter'], annualYieldLbs: 22000, certifications: ['USDA Organic'], primaryUse: 'both', createdAt: '2024-01-20T00:00:00Z' },
  { id: 'crop-5', farmId: 'farm-2', name: 'Spinach', variety: 'Bloomsdale', seasonalAvailability: ['Spring', 'Fall', 'Winter'], annualYieldLbs: 8000, certifications: ['GAP'], primaryUse: 'fresh', createdAt: '2024-03-10T00:00:00Z' },
  { id: 'crop-6', farmId: 'farm-2', name: 'Carrots', variety: 'Danvers', seasonalAvailability: ['Spring', 'Fall'], annualYieldLbs: 14000, certifications: ['GAP'], primaryUse: 'both', createdAt: '2024-03-10T00:00:00Z' },
  { id: 'crop-7', farmId: 'farm-2', name: 'Swiss Chard', variety: 'Rainbow', seasonalAvailability: ['Spring', 'Summer', 'Fall'], annualYieldLbs: 6500, certifications: [], primaryUse: 'fresh', createdAt: '2024-03-10T00:00:00Z' },
  { id: 'crop-8', farmId: 'farm-3', name: 'Quinoa', variety: 'Colorado White', seasonalAvailability: ['Summer', 'Fall'], annualYieldLbs: 45000, certifications: ['GAP'], primaryUse: 'processed', createdAt: '2024-04-15T00:00:00Z' },
  { id: 'crop-9', farmId: 'farm-3', name: 'Black Lentils', variety: 'Beluga', seasonalAvailability: ['Fall'], annualYieldLbs: 30000, certifications: ['GAP'], primaryUse: 'processed', createdAt: '2024-04-15T00:00:00Z' },
  { id: 'crop-10', farmId: 'farm-4', name: 'Spinach', variety: 'Tyee', seasonalAvailability: ['Winter', 'Spring', 'Fall'], annualYieldLbs: 9600, certifications: ['GAP'], primaryUse: 'fresh', createdAt: '2024-05-20T00:00:00Z' },
  { id: 'crop-11', farmId: 'farm-4', name: 'Carrots', variety: 'Nantes', seasonalAvailability: ['Spring', 'Summer', 'Fall'], annualYieldLbs: 21000, certifications: ['GAP'], primaryUse: 'both', createdAt: '2024-05-20T00:00:00Z' },
  { id: 'crop-12', farmId: 'farm-4', name: 'Tomatoes', variety: 'Roma', seasonalAvailability: ['Summer', 'Fall'], annualYieldLbs: 26000, certifications: ['GAP'], primaryUse: 'fresh', createdAt: '2024-05-20T00:00:00Z' },
  { id: 'crop-13', farmId: 'farm-5', name: 'Kale', variety: 'Red Russian', seasonalAvailability: ['Winter', 'Spring', 'Fall'], annualYieldLbs: 7800, certifications: ['USDA Organic'], primaryUse: 'fresh', createdAt: '2024-06-12T00:00:00Z' },
  { id: 'crop-14', farmId: 'farm-5', name: 'Sweet Peppers', variety: 'Mini Bell', seasonalAvailability: ['Summer', 'Fall'], annualYieldLbs: 11800, certifications: ['USDA Organic'], primaryUse: 'fresh', createdAt: '2024-06-12T00:00:00Z' },
  { id: 'crop-15', farmId: 'farm-5', name: 'Black Lentils', variety: 'Beluga', seasonalAvailability: ['Fall'], annualYieldLbs: 16400, certifications: ['USDA Organic'], primaryUse: 'processed', createdAt: '2024-06-12T00:00:00Z' },
]

// ─── Pricing ─────────────────────────────────────────────────────────────────

export const MOCK_PRICING: PricingProfile[] = [
  { id: 'price-1', farmId: 'farm-1', cropId: 'crop-1', cropName: 'Kale', pricePerUnit: 2.1, unit: 'lb', acceptsSnap: true, offersSlideScale: false, communityDiscountPct: 12 },
  { id: 'price-2', farmId: 'farm-1', cropId: 'crop-2', cropName: 'Tomatoes', pricePerUnit: 2.75, unit: 'lb', acceptsSnap: true, offersSlideScale: true, communityDiscountPct: 10 },
  { id: 'price-3', farmId: 'farm-1', cropId: 'crop-4', cropName: 'Squash', pricePerUnit: 1.9, unit: 'lb', acceptsSnap: true, offersSlideScale: false, communityDiscountPct: 8 },
  { id: 'price-4', farmId: 'farm-2', cropId: 'crop-5', cropName: 'Spinach', pricePerUnit: 2.15, unit: 'lb', acceptsSnap: true, offersSlideScale: true, communityDiscountPct: 15 },
  { id: 'price-5', farmId: 'farm-2', cropId: 'crop-6', cropName: 'Carrots', pricePerUnit: 1.7, unit: 'lb', acceptsSnap: true, offersSlideScale: true, communityDiscountPct: 12 },
  { id: 'price-6', farmId: 'farm-3', cropId: 'crop-8', cropName: 'Quinoa', pricePerUnit: 1.05, unit: 'lb', acceptsSnap: false, offersSlideScale: false, communityDiscountPct: null },
  { id: 'price-7', farmId: 'farm-3', cropId: 'crop-9', cropName: 'Black Lentils', pricePerUnit: 1.1, unit: 'lb', acceptsSnap: false, offersSlideScale: false, communityDiscountPct: null },
  { id: 'price-8', farmId: 'farm-4', cropId: 'crop-10', cropName: 'Spinach', pricePerUnit: 2.05, unit: 'lb', acceptsSnap: true, offersSlideScale: true, communityDiscountPct: 14 },
  { id: 'price-9', farmId: 'farm-4', cropId: 'crop-11', cropName: 'Carrots', pricePerUnit: 1.6, unit: 'lb', acceptsSnap: true, offersSlideScale: false, communityDiscountPct: 10 },
  { id: 'price-10', farmId: 'farm-4', cropId: 'crop-12', cropName: 'Tomatoes', pricePerUnit: 2.35, unit: 'lb', acceptsSnap: true, offersSlideScale: true, communityDiscountPct: 10 },
  { id: 'price-11', farmId: 'farm-5', cropId: 'crop-13', cropName: 'Kale', pricePerUnit: 2.25, unit: 'lb', acceptsSnap: true, offersSlideScale: true, communityDiscountPct: 12 },
  { id: 'price-12', farmId: 'farm-5', cropId: 'crop-14', cropName: 'Sweet Peppers', pricePerUnit: 2.6, unit: 'lb', acceptsSnap: true, offersSlideScale: false, communityDiscountPct: 9 },
  { id: 'price-13', farmId: 'farm-5', cropId: 'crop-15', cropName: 'Black Lentils', pricePerUnit: 1.2, unit: 'lb', acceptsSnap: false, offersSlideScale: false, communityDiscountPct: null },
]

// ─── Distribution channels ───────────────────────────────────────────────────

export const MOCK_DISTRIBUTION: DistributionChannel[] = [
  { id: 'dist-1', farmId: 'farm-1', type: 'food_bank', name: 'Fresno Food Bank', distanceMiles: 8, percentageOfSales: 35, servesLowIncomeArea: true },
  { id: 'dist-2', farmId: 'farm-1', type: 'farmers_market', name: 'Tower District Market', distanceMiles: 12, percentageOfSales: 40, servesLowIncomeArea: false },
  { id: 'dist-3', farmId: 'farm-1', type: 'csa', name: 'Weekly CSA Box (180 members)', distanceMiles: 25, percentageOfSales: 25, servesLowIncomeArea: false },
  { id: 'dist-4', farmId: 'farm-2', type: 'food_bank', name: 'Second Harvest Food Bank', distanceMiles: 5, percentageOfSales: 60, servesLowIncomeArea: true },
  { id: 'dist-5', farmId: 'farm-2', type: 'grocery', name: "People's Market Coop", distanceMiles: 18, percentageOfSales: 40, servesLowIncomeArea: false },
  { id: 'dist-6', farmId: 'farm-3', type: 'wholesale', name: 'Valley Grain Distributors', distanceMiles: 35, percentageOfSales: 80, servesLowIncomeArea: false },
  { id: 'dist-7', farmId: 'farm-3', type: 'direct_consumer', name: 'Online/direct orders', distanceMiles: 0, percentageOfSales: 20, servesLowIncomeArea: false },
  { id: 'dist-8', farmId: 'farm-4', type: 'wholesale', name: 'Merced School Nutrition Hub', distanceMiles: 20, percentageOfSales: 45, servesLowIncomeArea: true },
  { id: 'dist-9', farmId: 'farm-4', type: 'farmers_market', name: 'Merced Health Market', distanceMiles: 12, percentageOfSales: 30, servesLowIncomeArea: true },
  { id: 'dist-10', farmId: 'farm-4', type: 'grocery', name: 'Community Fresh Depot', distanceMiles: 16, percentageOfSales: 25, servesLowIncomeArea: false },
  { id: 'dist-11', farmId: 'farm-5', type: 'food_bank', name: 'Sacramento Mutual Aid Pantry', distanceMiles: 9, percentageOfSales: 30, servesLowIncomeArea: true },
  { id: 'dist-12', farmId: 'farm-5', type: 'grocery', name: 'Yolo Farm to School Hub', distanceMiles: 24, percentageOfSales: 50, servesLowIncomeArea: true },
  { id: 'dist-13', farmId: 'farm-5', type: 'csa', name: 'Oak Terrace Weekly CSA', distanceMiles: 18, percentageOfSales: 20, servesLowIncomeArea: false },
]

// ─── Safety practices ────────────────────────────────────────────────────────

export const MOCK_SAFETY_PRACTICES: SafetyPractice[] = [
  { id: 'safe-1', farmId: 'farm-1', category: 'certification', practiceDescription: 'Current GAP certification with annual review.', hasDocumentation: true, certificationBody: 'USDA GAP', expiresAt: '2026-08-15T00:00:00Z' },
  { id: 'safe-2', farmId: 'farm-1', category: 'water', practiceDescription: 'Quarterly irrigation water testing with documented remediation protocol.', hasDocumentation: true, certificationBody: null, expiresAt: null },
  { id: 'safe-3', farmId: 'farm-2', category: 'handling', practiceDescription: 'Cold-chain checklist and wash-pack sanitation SOPs for all outbound produce.', hasDocumentation: true, certificationBody: null, expiresAt: null },
  { id: 'safe-4', farmId: 'farm-2', category: 'soil', practiceDescription: 'Compost treatment log and soil amendment testing retained for each season.', hasDocumentation: true, certificationBody: null, expiresAt: null },
  { id: 'safe-5', farmId: 'farm-3', category: 'pesticide', practiceDescription: 'Pesticide-free growing records retained since 2019.', hasDocumentation: true, certificationBody: null, expiresAt: null },
  { id: 'safe-6', farmId: 'farm-4', category: 'certification', practiceDescription: 'GAP certification renewed with annual facility and worker hygiene review.', hasDocumentation: true, certificationBody: 'USDA GAP', expiresAt: '2026-09-01T00:00:00Z' },
  { id: 'safe-7', farmId: 'farm-4', category: 'handling', practiceDescription: 'Wash-pack logs, cooler temperature checks, and lot codes retained for every outbound order.', hasDocumentation: true, certificationBody: null, expiresAt: null },
  { id: 'safe-8', farmId: 'farm-5', category: 'water', practiceDescription: 'Monthly water testing and documented corrective-action process for all irrigation blocks.', hasDocumentation: true, certificationBody: null, expiresAt: null },
  { id: 'safe-9', farmId: 'farm-5', category: 'certification', practiceDescription: 'Organic certification and annual produce-handling training records are current.', hasDocumentation: true, certificationBody: 'CCOF', expiresAt: '2026-07-20T00:00:00Z' },
]

// ─── Submissions ─────────────────────────────────────────────────────────────

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
  {
    id: 'sub-6',
    farmId: 'farm-4',
    farmName: 'Riverbend Produce Hub',
    status: 'verified',
    submittedAt: '2025-01-18T09:00:00Z',
    reviewStartedAt: '2025-01-20T10:00:00Z',
    reviewedAt: '2025-01-22T16:30:00Z',
    verifiedAt: '2025-01-22T16:30:00Z',
    adminNotes: null,
    createdAt: '2025-01-14T08:00:00Z',
    updatedAt: '2025-01-22T16:30:00Z',
  },
  {
    id: 'sub-7',
    farmId: 'farm-5',
    farmName: 'Oak Terrace Organics',
    status: 'verified',
    submittedAt: '2025-02-10T08:45:00Z',
    reviewStartedAt: '2025-02-12T09:30:00Z',
    reviewedAt: '2025-02-14T14:10:00Z',
    verifiedAt: '2025-02-14T14:10:00Z',
    adminNotes: null,
    createdAt: '2025-02-06T08:00:00Z',
    updatedAt: '2025-02-14T14:10:00Z',
  },
]

// ─── Evidence assets ─────────────────────────────────────────────────────────

export const MOCK_EVIDENCE_ASSETS: EvidenceAsset[] = [
  { id: 'asset-1', submissionId: 'sub-1', category: 'nutritional_value', type: 'lab_test_result', fileName: 'kale-lab-results.pdf', storageKey: 'mock/sub-1/kale-lab-results.pdf', mimeType: 'application/pdf', sizeBytes: 231123, description: 'Lab test for micronutrient density.', uploadedAt: '2024-10-04T10:00:00Z' },
  { id: 'asset-2', submissionId: 'sub-1', category: 'food_safety', type: 'certification', fileName: 'gap-certification.pdf', storageKey: 'mock/sub-1/gap-certification.pdf', mimeType: 'application/pdf', sizeBytes: 112331, description: 'Current GAP certification.', uploadedAt: '2024-10-04T10:30:00Z' },
  { id: 'asset-3', submissionId: 'sub-1', category: 'supply_reliability', type: 'delivery_log', fileName: 'delivery-log-q3.pdf', storageKey: 'mock/sub-1/delivery-log-q3.pdf', mimeType: 'application/pdf', sizeBytes: 121300, description: 'Quarterly delivery log.', uploadedAt: '2024-10-04T11:00:00Z' },
  { id: 'asset-4', submissionId: 'sub-1', category: 'local_accessibility', type: 'invoice', fileName: 'food-bank-invoices.pdf', storageKey: 'mock/sub-1/food-bank-invoices.pdf', mimeType: 'application/pdf', sizeBytes: 99112, description: 'Food bank invoices and route summary.', uploadedAt: '2024-10-04T11:30:00Z' },
  { id: 'asset-5', submissionId: 'sub-1', category: 'affordability', type: 'price_list', fileName: 'community-price-sheet.pdf', storageKey: 'mock/sub-1/community-price-sheet.pdf', mimeType: 'application/pdf', sizeBytes: 88112, description: 'Community market price sheet.', uploadedAt: '2024-10-04T12:00:00Z' },
  { id: 'asset-6', submissionId: 'sub-3', category: 'food_safety', type: 'certification', fileName: 'gap-certificate-2025.pdf', storageKey: 'mock/sub-3/gap-certificate-2025.pdf', mimeType: 'application/pdf', sizeBytes: 110020, description: 'Current food safety certificate.', uploadedAt: '2024-12-17T09:00:00Z' },
  { id: 'asset-7', submissionId: 'sub-3', category: 'supply_reliability', type: 'delivery_log', fileName: 'wholesale-delivery-history.pdf', storageKey: 'mock/sub-3/wholesale-delivery-history.pdf', mimeType: 'application/pdf', sizeBytes: 132420, description: 'Delivery history for wholesale contracts.', uploadedAt: '2024-12-17T09:45:00Z' },
  { id: 'asset-8', submissionId: 'sub-3', category: 'affordability', type: 'price_list', fileName: 'grain-price-sheet.pdf', storageKey: 'mock/sub-3/grain-price-sheet.pdf', mimeType: 'application/pdf', sizeBytes: 73340, description: 'Regional grain price list.', uploadedAt: '2024-12-17T10:30:00Z' },
]

// ─── Score snapshots ─────────────────────────────────────────────────────────

export const MOCK_SCORES: PRIScoreSnapshot[] = [
  {
    id: 'score-1',
    submissionId: 'sub-1',
    farmId: 'farm-1',
    nutritionalValue: 82,
    foodSafety: 91,
    supplyReliability: 78,
    localAccessibility: 88,
    affordability: 74,
    overallScore: 82.9,
    dataCompleteness: 0.95,
    verificationStatus: 'verified',
    weightsVersion: 'v1',
    benchmarkVersion: 'v1',
    calculatedAt: '2024-10-09T15:30:00Z',
    calculatedBy: 'user-admin-1',
  },
  {
    id: 'score-2',
    submissionId: 'sub-2',
    farmId: 'farm-2',
    nutritionalValue: 68,
    foodSafety: 72,
    supplyReliability: 85,
    localAccessibility: 94,
    affordability: 81,
    overallScore: 78.5,
    dataCompleteness: 0.88,
    verificationStatus: 'verified',
    weightsVersion: 'v1',
    benchmarkVersion: 'v1',
    calculatedAt: '2024-11-16T14:00:00Z',
    calculatedBy: 'user-admin-1',
  },
  {
    id: 'score-3',
    submissionId: 'sub-4',
    farmId: 'farm-1',
    nutritionalValue: 61,
    foodSafety: 88,
    supplyReliability: 72,
    localAccessibility: 84,
    affordability: 70,
    overallScore: 73.7,
    dataCompleteness: 0.72,
    verificationStatus: 'reviewed',
    weightsVersion: 'v1',
    benchmarkVersion: 'v1',
    calculatedAt: '2024-08-24T14:00:00Z',
    calculatedBy: 'user-admin-1',
  },
  {
    id: 'score-4',
    submissionId: 'sub-6',
    farmId: 'farm-4',
    nutritionalValue: 79,
    foodSafety: 87,
    supplyReliability: 83,
    localAccessibility: 90,
    affordability: 82,
    overallScore: 84.1,
    dataCompleteness: 0.91,
    verificationStatus: 'verified',
    weightsVersion: 'v1',
    benchmarkVersion: 'v1',
    calculatedAt: '2025-01-22T16:30:00Z',
    calculatedBy: 'user-admin-1',
  },
  {
    id: 'score-5',
    submissionId: 'sub-7',
    farmId: 'farm-5',
    nutritionalValue: 85,
    foodSafety: 78,
    supplyReliability: 79,
    localAccessibility: 83,
    affordability: 77,
    overallScore: 80.6,
    dataCompleteness: 0.89,
    verificationStatus: 'verified',
    weightsVersion: 'v1',
    benchmarkVersion: 'v1',
    calculatedAt: '2025-02-14T14:10:00Z',
    calculatedBy: 'user-admin-1',
  },
]

// ─── Benchmarks ──────────────────────────────────────────────────────────────

export const MOCK_BENCHMARKS: RegionalBenchmark[] = [
  { id: 'bench-1', region: 'Central Valley', category: 'affordability', metricKey: 'price_per_lb_vegetables', label: 'Avg. vegetable price / lb', baselineValue: 2.8, unit: '$/lb', thresholdGood: 2, thresholdFair: 2.5, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-2', region: 'Central Valley', category: 'local_accessibility', metricKey: 'pct_sales_within_30mi', label: '% sales within 30 miles', baselineValue: 45, unit: '%', thresholdGood: 65, thresholdFair: 50, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-3', region: 'Sacramento Delta', category: 'affordability', metricKey: 'price_per_lb_vegetables', label: 'Avg. vegetable price / lb', baselineValue: 3.1, unit: '$/lb', thresholdGood: 2.2, thresholdFair: 2.7, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-4', region: 'Sacramento Delta', category: 'local_accessibility', metricKey: 'pct_sales_within_30mi', label: '% sales within 30 miles', baselineValue: 50, unit: '%', thresholdGood: 70, thresholdFair: 55, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
  { id: 'bench-5', region: 'San Joaquin Valley', category: 'affordability', metricKey: 'price_per_lb_grains', label: 'Avg. grain price / lb', baselineValue: 1.2, unit: '$/lb', thresholdGood: 0.9, thresholdFair: 1.05, effectiveFrom: '2024-01-01T00:00:00Z', version: 'v1' },
]

// ─── Partner interests ───────────────────────────────────────────────────────

export const MOCK_INTERESTS: PartnerInterest[] = [
  { id: 'int-1', partnerId: 'user-partner-1', partnerName: 'Regional Health Network', farmId: 'farm-1', farmName: 'Sunrise Valley Farm', message: 'Interested in sourcing kale and tomatoes for our hospital cafeteria program.', status: 'acknowledged', createdAt: '2024-10-14T10:00:00Z' },
  { id: 'int-2', partnerId: 'user-partner-1', partnerName: 'Regional Health Network', farmId: 'farm-2', farmName: 'Green Meadows Cooperative', message: 'Would like to discuss a supply contract for our community wellness program.', status: 'pending', createdAt: '2024-11-20T14:00:00Z' },
]

// ─── Marketplace / exchange ──────────────────────────────────────────────────

export const MOCK_MARKETPLACE_SELLER_PROFILES: MarketplaceSellerProfile[] = [
  {
    id: 'seller-1',
    farmId: 'farm-1',
    publicDescription:
      'Certified organic vegetables with weekly pickup and local Fresno delivery for households, clinics, and institutional wellness programs.',
    contactEmail: 'orders@sunrisevalley.com',
    contactPhone: '(559) 555-0142',
    orderInstructions: 'Reserve by Thursday 5pm. Pickup windows are Saturday mornings or Monday clinic drop-offs.',
    serviceDays: ['Monday', 'Thursday', 'Saturday'],
    acceptsCommunityOrders: true,
    publishedAt: '2025-01-20T09:00:00Z',
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2025-02-02T12:00:00Z',
  },
  {
    id: 'seller-2',
    farmId: 'farm-2',
    publicDescription:
      'Worker-owned cooperative supplying nutrient-dense greens and roots to community kitchens, schools, and neighborhood buyers.',
    contactEmail: 'market@greenmeadows.coop',
    contactPhone: '(209) 555-0109',
    orderInstructions: 'School and community orders can request bulk produce boxes with 72-hour notice.',
    serviceDays: ['Tuesday', 'Friday'],
    acceptsCommunityOrders: true,
    publishedAt: '2025-01-25T09:00:00Z',
    createdAt: '2025-01-14T10:00:00Z',
    updatedAt: '2025-02-04T08:30:00Z',
  },
]

export const MOCK_MARKETPLACE_PICKUP_LOCATIONS: MarketplacePickupLocation[] = [
  {
    id: 'pickup-1',
    farmId: 'farm-1',
    sellerProfileId: 'seller-1',
    label: 'Downtown Fresno Pickup',
    address: '1530 Tulare St, Fresno, CA 93721',
    pickupWindow: 'Saturdays 8:00 AM to 11:00 AM',
    notes: 'Community health market booth near the clinic parking lot.',
  },
  {
    id: 'pickup-2',
    farmId: 'farm-1',
    sellerProfileId: 'seller-1',
    label: 'Farm Gate Pickup',
    address: '4820 N Cedar Ave, Fresno, CA 93701',
    pickupWindow: 'Mondays 2:00 PM to 5:00 PM',
    notes: null,
  },
  {
    id: 'pickup-3',
    farmId: 'farm-2',
    sellerProfileId: 'seller-2',
    label: 'Midtown Stockton Pickup',
    address: '430 E Main St, Stockton, CA 95202',
    pickupWindow: 'Fridays 3:00 PM to 6:00 PM',
    notes: 'Reserved boxes held for 30 minutes after the selected time window.',
  },
]

export const MOCK_MARKETPLACE_DELIVERY_ZONES: MarketplaceDeliveryZone[] = [
  {
    id: 'zone-1',
    farmId: 'farm-1',
    sellerProfileId: 'seller-1',
    label: 'Fresno Community Delivery',
    areaSummary: 'Central Fresno, Tower District, and westside clinic corridor',
    deliveryFee: 6,
    deliveryDays: ['Monday', 'Thursday'],
    notes: 'No-fee delivery for institutional sourcing inquiries above $250.',
  },
  {
    id: 'zone-2',
    farmId: 'farm-2',
    sellerProfileId: 'seller-2',
    label: 'Stockton School Route',
    areaSummary: 'Stockton Unified campuses and nearby community kitchens',
    deliveryFee: 8,
    deliveryDays: ['Tuesday', 'Friday'],
    notes: 'Bulk school cases can be staged by cafeteria door or receiving dock.',
  },
]

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    id: 'listing-1',
    farmId: 'farm-1',
    sellerProfileId: 'seller-1',
    title: 'Central Valley Greens Box',
    description: 'Weekly mixed produce box with kale, tomatoes, peppers, and seasonal squash for families or community meal programs.',
    listingType: 'weekly_offer',
    status: 'published',
    cropNames: ['Kale', 'Tomatoes', 'Sweet Peppers', 'Squash'],
    nutrientTags: ['leafy_greens', 'vitamin_c_rich', 'antioxidant_rich', 'potassium_supporting'],
    pricePerUnit: 28,
    unit: 'box',
    quantityAvailable: 42,
    minimumOrderQuantity: 1,
    availabilityStart: '2026-03-18T00:00:00Z',
    availabilityEnd: '2026-03-25T23:59:59Z',
    acceptsBulkInquiries: true,
    acceptsSnap: true,
    offersSlidingScale: true,
    communityDiscountPct: 12,
    pickupEnabled: true,
    deliveryEnabled: true,
    pickupLocationIds: ['pickup-1', 'pickup-2'],
    deliveryZoneIds: ['zone-1'],
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-03-14T09:30:00Z',
  },
  {
    id: 'listing-2',
    farmId: 'farm-1',
    sellerProfileId: 'seller-1',
    title: 'Organic Kale Bundles',
    description: 'Fresh Lacinato kale for household pickup, clinic pantry programs, or cafeteria sides.',
    listingType: 'catalog_item',
    status: 'published',
    cropNames: ['Kale'],
    nutrientTags: ['leafy_greens', 'iron_supporting', 'fiber_rich', 'antioxidant_rich'],
    pricePerUnit: 2.4,
    unit: 'lb',
    quantityAvailable: 160,
    minimumOrderQuantity: 5,
    availabilityStart: null,
    availabilityEnd: null,
    acceptsBulkInquiries: true,
    acceptsSnap: true,
    offersSlidingScale: false,
    communityDiscountPct: 10,
    pickupEnabled: true,
    deliveryEnabled: true,
    pickupLocationIds: ['pickup-1', 'pickup-2'],
    deliveryZoneIds: ['zone-1'],
    createdAt: '2026-03-08T08:00:00Z',
    updatedAt: '2026-03-13T11:30:00Z',
  },
  {
    id: 'listing-3',
    farmId: 'farm-2',
    sellerProfileId: 'seller-2',
    title: 'School Greens and Roots Crate',
    description: 'Spinach, carrots, and Swiss chard bundled for school kitchens and community meal sites.',
    listingType: 'weekly_offer',
    status: 'published',
    cropNames: ['Spinach', 'Carrots', 'Swiss Chard'],
    nutrientTags: ['leafy_greens', 'vitamin_c_rich', 'fiber_rich', 'iron_supporting'],
    pricePerUnit: 34,
    unit: 'crate',
    quantityAvailable: 28,
    minimumOrderQuantity: 1,
    availabilityStart: '2026-03-19T00:00:00Z',
    availabilityEnd: '2026-03-27T23:59:59Z',
    acceptsBulkInquiries: true,
    acceptsSnap: true,
    offersSlidingScale: true,
    communityDiscountPct: 15,
    pickupEnabled: true,
    deliveryEnabled: true,
    pickupLocationIds: ['pickup-3'],
    deliveryZoneIds: ['zone-2'],
    createdAt: '2026-03-11T08:00:00Z',
    updatedAt: '2026-03-14T10:00:00Z',
  },
  {
    id: 'listing-4',
    farmId: 'farm-2',
    sellerProfileId: 'seller-2',
    title: 'Community Spinach Cases',
    description: 'Washed spinach cases priced for neighborhood kitchens, food access events, and pantry pop-ups.',
    listingType: 'catalog_item',
    status: 'published',
    cropNames: ['Spinach'],
    nutrientTags: ['leafy_greens', 'iron_supporting', 'antioxidant_rich'],
    pricePerUnit: 2.1,
    unit: 'lb',
    quantityAvailable: 120,
    minimumOrderQuantity: 8,
    availabilityStart: null,
    availabilityEnd: null,
    acceptsBulkInquiries: true,
    acceptsSnap: true,
    offersSlidingScale: true,
    communityDiscountPct: 15,
    pickupEnabled: true,
    deliveryEnabled: true,
    pickupLocationIds: ['pickup-3'],
    deliveryZoneIds: ['zone-2'],
    createdAt: '2026-03-09T08:00:00Z',
    updatedAt: '2026-03-14T12:00:00Z',
  },
]

export const MOCK_MARKETPLACE_ORDERS: MarketplaceOrder[] = [
  {
    id: 'order-1',
    farmId: 'farm-1',
    buyerType: 'individual',
    buyerName: 'Diane Foster',
    buyerEmail: 'diane@example.com',
    buyerPhone: '(559) 555-0133',
    fulfillmentMethod: 'pickup',
    pickupLocationId: 'pickup-1',
    deliveryZoneId: null,
    notes: 'Please hold until 10:30am if possible.',
    subtotal: 28,
    deliveryFee: 0,
    total: 28,
    status: 'ready',
    paymentStatus: 'pay_on_fulfillment',
    referenceCode: 'PRI-AX19',
    createdAt: '2026-03-15T14:30:00Z',
    updatedAt: '2026-03-15T16:00:00Z',
  },
]

export const MOCK_MARKETPLACE_ORDER_ITEMS: MarketplaceOrderItem[] = [
  {
    id: 'order-item-1',
    orderId: 'order-1',
    listingId: 'listing-1',
    listingTitle: 'Central Valley Greens Box',
    quantity: 1,
    unit: 'box',
    unitPrice: 28,
    lineTotal: 28,
  },
]

export const MOCK_MARKETPLACE_INQUIRIES: MarketplaceInquiry[] = [
  {
    id: 'inq-1',
    farmId: 'farm-2',
    listingId: 'listing-3',
    buyerType: 'school',
    organizationName: 'Stockton Unified Wellness',
    contactName: 'Leah Kim',
    email: 'leah.kim@stocktonusd.org',
    phone: '(209) 555-0150',
    volumeTier: 'large',
    timingWindow: 'April cafeteria rotation',
    region: 'Sacramento Delta',
    fulfillmentPreference: 'delivery',
    notes: 'Looking for spinach and carrot mixes for 4 campuses.',
    status: 'new',
    createdAt: '2026-03-15T13:00:00Z',
  },
]

export const MOCK_MARKETPLACE_COMMISSIONS: MarketplaceCommissionLedgerEntry[] = [
  {
    id: 'comm-1',
    farmId: 'farm-1',
    orderId: 'order-1',
    ratePct: 8,
    produceSubtotal: 28,
    commissionAmount: 2.24,
    status: 'accrued',
    createdAt: '2026-03-15T16:00:00Z',
  },
]

// ─── Review decisions / scoring runs ─────────────────────────────────────────

export const MOCK_DECISIONS: ReviewDecision[] = [
  { id: 'dec-1', submissionId: 'sub-1', adminId: 'user-admin-1', decision: 'verified', notes: 'All evidence complete. Lab results validated against USDA baselines.', scoreSnapshotId: 'score-1', createdAt: '2024-10-09T15:30:00Z' },
  { id: 'dec-2', submissionId: 'sub-2', adminId: 'user-admin-1', decision: 'verified', notes: 'Strong local distribution network. Safety certs verified.', scoreSnapshotId: 'score-2', createdAt: '2024-11-16T14:00:00Z' },
  { id: 'dec-3', submissionId: 'sub-4', adminId: 'user-admin-1', decision: 'needs_changes', notes: 'Please upload lab test results for kale and tomatoes. Insufficient evidence.', scoreSnapshotId: null, createdAt: '2024-08-24T14:00:00Z' },
]

export const MOCK_EVIDENCE_EXTRACTIONS: EvidenceExtraction[] = []
export const MOCK_AUTO_SCORING_RUNS: AutoScoringRun[] = []

export interface MockDatabase {
  farms: FarmProfile[]
  crops: CropProfile[]
  pricingProfiles: PricingProfile[]
  distributionChannels: DistributionChannel[]
  safetyPractices: SafetyPractice[]
  marketplaceSellerProfiles: MarketplaceSellerProfile[]
  marketplacePickupLocations: MarketplacePickupLocation[]
  marketplaceDeliveryZones: MarketplaceDeliveryZone[]
  marketplaceListings: MarketplaceListing[]
  marketplaceOrders: MarketplaceOrder[]
  marketplaceOrderItems: MarketplaceOrderItem[]
  marketplaceInquiries: MarketplaceInquiry[]
  marketplaceCommissionLedger: MarketplaceCommissionLedgerEntry[]
  submissions: PRISubmission[]
  evidenceAssets: EvidenceAsset[]
  evidenceExtractions: EvidenceExtraction[]
  autoScoringRuns: AutoScoringRun[]
  scoreSnapshots: PRIScoreSnapshot[]
  benchmarks: RegionalBenchmark[]
  partnerInterests: PartnerInterest[]
  reviewDecisions: ReviewDecision[]
}

type MockCollectionKey = keyof MockDatabase
type CollectionRecord<K extends MockCollectionKey> = MockDatabase[K] extends Array<infer T> ? T : never

const storageDir = join(process.cwd(), '.local')
const storagePath = join(storageDir, 'mock-db.json')

function seedMockDatabase(): MockDatabase {
  return structuredClone({
    farms: MOCK_FARMS,
    crops: MOCK_CROPS,
    pricingProfiles: MOCK_PRICING,
    distributionChannels: MOCK_DISTRIBUTION,
    safetyPractices: MOCK_SAFETY_PRACTICES,
    marketplaceSellerProfiles: MOCK_MARKETPLACE_SELLER_PROFILES,
    marketplacePickupLocations: MOCK_MARKETPLACE_PICKUP_LOCATIONS,
    marketplaceDeliveryZones: MOCK_MARKETPLACE_DELIVERY_ZONES,
    marketplaceListings: MOCK_MARKETPLACE_LISTINGS,
    marketplaceOrders: MOCK_MARKETPLACE_ORDERS,
    marketplaceOrderItems: MOCK_MARKETPLACE_ORDER_ITEMS,
    marketplaceInquiries: MOCK_MARKETPLACE_INQUIRIES,
    marketplaceCommissionLedger: MOCK_MARKETPLACE_COMMISSIONS,
    submissions: MOCK_SUBMISSIONS,
    evidenceAssets: MOCK_EVIDENCE_ASSETS,
    evidenceExtractions: MOCK_EVIDENCE_EXTRACTIONS,
    autoScoringRuns: MOCK_AUTO_SCORING_RUNS,
    scoreSnapshots: MOCK_SCORES,
    benchmarks: MOCK_BENCHMARKS,
    partnerInterests: MOCK_INTERESTS,
    reviewDecisions: MOCK_DECISIONS,
  })
}

function readMockDb(): MockDatabase {
  if (!existsSync(storagePath)) {
    return seedMockDatabase()
  }

  try {
    const raw = readFileSync(storagePath, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return seedMockDatabase()
    }

    return {
      ...seedMockDatabase(),
      ...parsed,
    } as MockDatabase
  } catch {
    return seedMockDatabase()
  }
}

function writeMockDb(database: MockDatabase) {
  mkdirSync(storageDir, { recursive: true })
  writeFileSync(storagePath, JSON.stringify(database, null, 2), 'utf8')
}

export function getMockDatabase(): MockDatabase {
  return readMockDb()
}

export function saveMockDatabase(database: MockDatabase) {
  writeMockDb(database)
}

export function upsertMockRecord<K extends MockCollectionKey>(
  collection: K,
  record: CollectionRecord<K>,
): CollectionRecord<K> {
  const database = readMockDb()
  const rows = database[collection] as CollectionRecord<K>[]
  const nextRows = rows.some((row) => (row as { id?: string }).id === (record as { id?: string }).id)
    ? rows.map((row) => ((row as { id?: string }).id === (record as { id?: string }).id ? record : row))
    : [record, ...rows]

  database[collection] = nextRows as MockDatabase[K]
  writeMockDb(database)
  return record
}

export function deleteMockRecord<K extends MockCollectionKey>(collection: K, id: string) {
  const database = readMockDb()
  const rows = database[collection] as Array<{ id?: string }>
  database[collection] = rows.filter((row) => row.id !== id) as MockDatabase[K]
  writeMockDb(database)
}

export function getAllSubmissions() {
  return readMockDb().submissions
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getAllScores() {
  return readMockDb().scoreSnapshots
    .slice()
    .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())
}

export function getFarmById(id: string) {
  return readMockDb().farms.find((farm) => farm.id === id) ?? null
}

export function getSubmissionById(id: string) {
  return readMockDb().submissions.find((submission) => submission.id === id) ?? null
}

export function getScoreForFarm(farmId: string) {
  return readMockDb().scoreSnapshots
    .filter((score) => score.farmId === farmId && score.verificationStatus === 'verified')
    .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())[0] ?? null
}

export function getLatestSubmissionForFarm(farmId: string) {
  return readMockDb().submissions
    .filter((submission) => submission.farmId === farmId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null
}

export function getCropsForFarm(farmId: string) {
  return readMockDb().crops.filter((crop) => crop.farmId === farmId)
}

export function getPricingForFarm(farmId: string) {
  return readMockDb().pricingProfiles.filter((profile) => profile.farmId === farmId)
}

export function getDistributionForFarm(farmId: string) {
  return readMockDb().distributionChannels.filter((channel) => channel.farmId === farmId)
}

export function getSafetyPracticesForFarm(farmId: string) {
  return readMockDb().safetyPractices.filter((practice) => practice.farmId === farmId)
}

export function getEvidenceForSubmission(submissionId: string) {
  return readMockDb().evidenceAssets
    .filter((asset) => asset.submissionId === submissionId)
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
}

export function getExtractionsForSubmission(submissionId: string) {
  return readMockDb().evidenceExtractions
    .filter((extraction) => extraction.submissionId === submissionId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getLatestAutoScoringRun(submissionId: string) {
  return readMockDb().autoScoringRuns
    .filter((run) => run.submissionId === submissionId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0] ?? null
}

export function getReviewDecisionsForSubmission(submissionId: string) {
  return readMockDb().reviewDecisions
    .filter((decision) => decision.submissionId === submissionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getPartnerInterestsForPartner(partnerId: string) {
  return readMockDb().partnerInterests
    .filter((interest) => interest.partnerId === partnerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getMarketplaceSellerProfileForFarm(farmId: string) {
  return readMockDb().marketplaceSellerProfiles.find((profile) => profile.farmId === farmId) ?? null
}

export function getMarketplacePickupLocationsForFarm(farmId: string) {
  return readMockDb().marketplacePickupLocations.filter((location) => location.farmId === farmId)
}

export function getMarketplaceDeliveryZonesForFarm(farmId: string) {
  return readMockDb().marketplaceDeliveryZones.filter((zone) => zone.farmId === farmId)
}

export function getMarketplaceListingsForFarm(farmId: string) {
  return readMockDb().marketplaceListings
    .filter((listing) => listing.farmId === farmId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getMarketplacePublishedListings() {
  return readMockDb().marketplaceListings
    .filter((listing) => listing.status === 'published')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getMarketplaceListingById(id: string) {
  return readMockDb().marketplaceListings.find((listing) => listing.id === id) ?? null
}

export function getMarketplaceOrdersForFarm(farmId: string) {
  return readMockDb().marketplaceOrders
    .filter((order) => order.farmId === farmId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getMarketplaceOrderItems(orderId: string) {
  return readMockDb().marketplaceOrderItems.filter((item) => item.orderId === orderId)
}

export function getMarketplaceInquiriesForFarm(farmId: string) {
  return readMockDb().marketplaceInquiries
    .filter((inquiry) => inquiry.farmId === farmId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getMarketplaceCommissionsForFarm(farmId: string) {
  return readMockDb().marketplaceCommissionLedger
    .filter((entry) => entry.farmId === farmId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getSubmissionsForFarm(farmId: string) {
  return readMockDb().submissions
    .filter((submission) => submission.farmId === farmId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export function getVerifiedFarms() {
  const database = readMockDb()
  const verifiedSubmissions = database.submissions.filter((submission) => submission.status === 'verified')

  return verifiedSubmissions.map((submission) => {
    const farm = database.farms.find((entry) => entry.id === submission.farmId)!
    const score = database.scoreSnapshots
      .filter((entry) => entry.farmId === submission.farmId && entry.verificationStatus === 'verified')
      .sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime())[0]!
    const crops = database.crops.filter((crop) => crop.farmId === submission.farmId)
    const distribution = database.distributionChannels.filter((channel) => channel.farmId === submission.farmId)

    return { farm, score, crops, distribution, verifiedAt: submission.verifiedAt ?? score.calculatedAt }
  })
}

export function getAdminQueue() {
  return readMockDb().submissions
    .filter((submission) => ['submitted', 'under_review'].includes(submission.status))
    .sort((a, b) => new Date(a.submittedAt ?? a.createdAt).getTime() - new Date(b.submittedAt ?? b.createdAt).getTime())
}

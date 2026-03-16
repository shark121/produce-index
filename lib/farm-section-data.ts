import type {
  CropProfile,
  DistributionChannel,
  DistributionChannelType,
  PricingProfile,
  SafetyPractice,
} from '@/lib/types'

export const SEASON_OPTIONS = ['Spring', 'Summer', 'Fall', 'Winter']
export const PRIMARY_USE_OPTIONS: CropProfile['primaryUse'][] = ['fresh', 'processed', 'both']
export const DISTRIBUTION_CHANNEL_OPTIONS: DistributionChannelType[] = [
  'farmers_market',
  'grocery',
  'food_bank',
  'restaurant',
  'csa',
  'wholesale',
  'direct_consumer',
]
export const SAFETY_CATEGORY_OPTIONS: SafetyPractice['category'][] = [
  'pesticide',
  'water',
  'handling',
  'certification',
  'soil',
]

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function cleanNumber(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function cleanBoolean(value: unknown) {
  return value === true || value === 'true' || value === 'on' || value === 1
}

function cleanStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((entry) => cleanString(entry)).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

export function normalizeCropInput(input: Record<string, unknown>, farmId: string, existing?: CropProfile): CropProfile {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    name: cleanString(input.name),
    variety: cleanString(input.variety) || null,
    seasonalAvailability: cleanStringArray(input.seasonalAvailability).filter((season) => SEASON_OPTIONS.includes(season)),
    annualYieldLbs: cleanNumber(input.annualYieldLbs),
    certifications: cleanStringArray(input.certifications),
    primaryUse: (PRIMARY_USE_OPTIONS.includes(input.primaryUse as CropProfile['primaryUse']) ? input.primaryUse : existing?.primaryUse ?? 'fresh') as CropProfile['primaryUse'],
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
}

export function normalizePricingInput(input: Record<string, unknown>, farmId: string, existing?: PricingProfile): PricingProfile {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    cropId: cleanString(input.cropId),
    cropName: cleanString(input.cropName),
    pricePerUnit: cleanNumber(input.pricePerUnit),
    unit: cleanString(input.unit) || 'lb',
    acceptsSnap: cleanBoolean(input.acceptsSnap),
    offersSlideScale: cleanBoolean(input.offersSlideScale),
    communityDiscountPct: cleanString(input.communityDiscountPct) === '' && input.communityDiscountPct !== 0
      ? null
      : cleanNumber(input.communityDiscountPct),
  }
}

export function normalizeDistributionInput(input: Record<string, unknown>, farmId: string, existing?: DistributionChannel): DistributionChannel {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    type: (DISTRIBUTION_CHANNEL_OPTIONS.includes(input.type as DistributionChannelType) ? input.type : existing?.type ?? 'farmers_market') as DistributionChannelType,
    name: cleanString(input.name),
    distanceMiles: cleanNumber(input.distanceMiles),
    percentageOfSales: cleanNumber(input.percentageOfSales),
    servesLowIncomeArea: cleanBoolean(input.servesLowIncomeArea),
  }
}

export function normalizeSafetyInput(input: Record<string, unknown>, farmId: string, existing?: SafetyPractice): SafetyPractice {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    category: (SAFETY_CATEGORY_OPTIONS.includes(input.category as SafetyPractice['category']) ? input.category : existing?.category ?? 'handling') as SafetyPractice['category'],
    practiceDescription: cleanString(input.practiceDescription),
    hasDocumentation: cleanBoolean(input.hasDocumentation),
    certificationBody: cleanString(input.certificationBody) || null,
    expiresAt: cleanString(input.expiresAt) || null,
  }
}

export function cropToSupabaseInsert(crop: CropProfile) {
  return {
    id: crop.id,
    farm_id: crop.farmId,
    name: crop.name,
    variety: crop.variety,
    seasonal_availability: crop.seasonalAvailability,
    annual_yield_lbs: crop.annualYieldLbs,
    certifications: crop.certifications,
    primary_use: crop.primaryUse,
    created_at: crop.createdAt,
  }
}

export function pricingToSupabaseInsert(profile: PricingProfile) {
  return {
    id: profile.id,
    farm_id: profile.farmId,
    crop_id: profile.cropId,
    crop_name: profile.cropName,
    price_per_unit: profile.pricePerUnit,
    unit: profile.unit,
    accepts_snap: profile.acceptsSnap,
    offers_slide_scale: profile.offersSlideScale,
    community_discount_pct: profile.communityDiscountPct,
  }
}

export function distributionToSupabaseInsert(channel: DistributionChannel) {
  return {
    id: channel.id,
    farm_id: channel.farmId,
    type: channel.type,
    name: channel.name,
    distance_miles: channel.distanceMiles,
    percentage_of_sales: channel.percentageOfSales,
    serves_low_income_area: channel.servesLowIncomeArea,
  }
}

export function safetyToSupabaseInsert(practice: SafetyPractice) {
  return {
    id: practice.id,
    farm_id: practice.farmId,
    category: practice.category,
    practice_description: practice.practiceDescription,
    has_documentation: practice.hasDocumentation,
    certification_body: practice.certificationBody,
    expires_at: practice.expiresAt,
  }
}

export function normalizeCropRow(row: Record<string, unknown>): CropProfile {
  return {
    id: String(row.id),
    farmId: String(row.farm_id ?? row.farmId),
    name: cleanString(row.name),
    variety: cleanString(row.variety) || null,
    seasonalAvailability: cleanStringArray(row.seasonal_availability ?? row.seasonalAvailability),
    annualYieldLbs: cleanNumber(row.annual_yield_lbs ?? row.annualYieldLbs),
    certifications: cleanStringArray(row.certifications),
    primaryUse: (cleanString(row.primary_use ?? row.primaryUse) || 'fresh') as CropProfile['primaryUse'],
    createdAt: cleanString(row.created_at ?? row.createdAt) || new Date().toISOString(),
  }
}

export function normalizePricingRow(row: Record<string, unknown>): PricingProfile {
  return {
    id: String(row.id),
    farmId: String(row.farm_id ?? row.farmId),
    cropId: cleanString(row.crop_id ?? row.cropId),
    cropName: cleanString(row.crop_name ?? row.cropName),
    pricePerUnit: cleanNumber(row.price_per_unit ?? row.pricePerUnit),
    unit: cleanString(row.unit) || 'lb',
    acceptsSnap: cleanBoolean(row.accepts_snap ?? row.acceptsSnap),
    offersSlideScale: cleanBoolean(row.offers_slide_scale ?? row.offersSlideScale),
    communityDiscountPct: row.community_discount_pct == null && row.communityDiscountPct == null
      ? null
      : cleanNumber(row.community_discount_pct ?? row.communityDiscountPct),
  }
}

export function normalizeDistributionRow(row: Record<string, unknown>): DistributionChannel {
  return {
    id: String(row.id),
    farmId: String(row.farm_id ?? row.farmId),
    type: cleanString(row.type) as DistributionChannelType,
    name: cleanString(row.name),
    distanceMiles: cleanNumber(row.distance_miles ?? row.distanceMiles),
    percentageOfSales: cleanNumber(row.percentage_of_sales ?? row.percentageOfSales),
    servesLowIncomeArea: cleanBoolean(row.serves_low_income_area ?? row.servesLowIncomeArea),
  }
}

export function normalizeSafetyRow(row: Record<string, unknown>): SafetyPractice {
  return {
    id: String(row.id),
    farmId: String(row.farm_id ?? row.farmId),
    category: cleanString(row.category) as SafetyPractice['category'],
    practiceDescription: cleanString(row.practice_description ?? row.practiceDescription),
    hasDocumentation: cleanBoolean(row.has_documentation ?? row.hasDocumentation),
    certificationBody: cleanString(row.certification_body ?? row.certificationBody) || null,
    expiresAt: cleanString(row.expires_at ?? row.expiresAt) || null,
  }
}

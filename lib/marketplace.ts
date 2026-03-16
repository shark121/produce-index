import type {
  BuyerMatchRequest,
  BuyerType,
  FarmScorecard,
  FulfillmentMethod,
  MarketplaceFarmMatchResult,
  MarketplaceListing,
  MarketplaceListingType,
  MarketplaceListingView,
  MarketplaceMatchResult,
  MarketplaceSellerSignals,
  MarketplaceVolumeTier,
  NutrientProfileTag,
} from '@/lib/types'

export const COMMISSION_RATE_PCT = 8

export const BUYER_TYPE_OPTIONS: Array<{ value: BuyerType; label: string }> = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'school', label: 'School' },
  { value: 'community_org', label: 'Community Organization' },
  { value: 'individual', label: 'Individual / Household' },
]

export const MARKETPLACE_FULFILLMENT_OPTIONS: Array<{ value: FulfillmentMethod; label: string }> = [
  { value: 'pickup', label: 'Pickup' },
  { value: 'delivery', label: 'Local Delivery' },
]

export const MARKETPLACE_VOLUME_OPTIONS: Array<{ value: MarketplaceVolumeTier; label: string }> = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'enterprise', label: 'Enterprise' },
]

export const MARKETPLACE_LISTING_TYPE_OPTIONS: Array<{ value: MarketplaceListingType; label: string }> = [
  { value: 'weekly_offer', label: 'Weekly Offer' },
  { value: 'catalog_item', label: 'Catalog Item' },
]

export const SERVICE_DAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const NUTRIENT_TAG_OPTIONS: Array<{ value: NutrientProfileTag; label: string; description: string }> = [
  { value: 'leafy_greens', label: 'Leafy Greens', description: 'Greens-rich listings and farm crop mixes.' },
  { value: 'fiber_rich', label: 'Fiber Rich', description: 'Roots, legumes, and high-fiber produce mixes.' },
  { value: 'protein_legumes', label: 'Protein Legumes', description: 'Legume-heavy listings for plant-forward meal programs.' },
  { value: 'vitamin_c_rich', label: 'Vitamin C Rich', description: 'Peppers, tomatoes, and other vitamin C supportive produce.' },
  { value: 'iron_supporting', label: 'Iron Supporting', description: 'Leafy greens and legumes often used in iron-supportive menus.' },
  { value: 'potassium_supporting', label: 'Potassium Supporting', description: 'Produce mixes with potassium-supportive crops.' },
  { value: 'antioxidant_rich', label: 'Antioxidant Rich', description: 'Color-dense produce associated with antioxidant-rich diets.' },
]

const NUTRIENT_TAG_LABELS = Object.fromEntries(
  NUTRIENT_TAG_OPTIONS.map((option) => [option.value, option.label]),
) as Record<NutrientProfileTag, string>

const CROP_TAG_MAP: Record<string, NutrientProfileTag[]> = {
  kale: ['leafy_greens', 'iron_supporting', 'fiber_rich', 'antioxidant_rich'],
  spinach: ['leafy_greens', 'iron_supporting', 'antioxidant_rich'],
  'swiss chard': ['leafy_greens', 'iron_supporting', 'potassium_supporting'],
  tomatoes: ['vitamin_c_rich', 'antioxidant_rich'],
  'sweet peppers': ['vitamin_c_rich', 'antioxidant_rich'],
  peppers: ['vitamin_c_rich', 'antioxidant_rich'],
  squash: ['potassium_supporting', 'fiber_rich'],
  carrots: ['fiber_rich', 'vitamin_c_rich', 'antioxidant_rich'],
  quinoa: ['fiber_rich', 'protein_legumes'],
  'black lentils': ['fiber_rich', 'protein_legumes', 'iron_supporting'],
  lentils: ['fiber_rich', 'protein_legumes', 'iron_supporting'],
}

const BUYER_WEIGHTS: Record<
  BuyerType,
  Record<'nutrientFit' | 'priScore' | 'safety' | 'reliability' | 'fulfillment' | 'localAccessibility' | 'affordability' | 'freshnessAvailability', number>
> = {
  hospital: {
    nutrientFit: 25,
    priScore: 20,
    safety: 20,
    reliability: 15,
    fulfillment: 10,
    localAccessibility: 10,
    affordability: 0,
    freshnessAvailability: 0,
  },
  school: {
    affordability: 20,
    localAccessibility: 20,
    nutrientFit: 20,
    reliability: 15,
    priScore: 15,
    fulfillment: 10,
    safety: 0,
    freshnessAvailability: 0,
  },
  community_org: {
    affordability: 25,
    localAccessibility: 20,
    fulfillment: 15,
    nutrientFit: 15,
    priScore: 15,
    safety: 10,
    reliability: 0,
    freshnessAvailability: 0,
  },
  individual: {
    affordability: 25,
    fulfillment: 20,
    nutrientFit: 20,
    priScore: 15,
    freshnessAvailability: 10,
    localAccessibility: 10,
    safety: 0,
    reliability: 0,
  },
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

function normalizedQuery(query?: string) {
  return query?.trim().toLowerCase() ?? ''
}

function safeRatio(matched: number, total: number) {
  if (total <= 0) return 0
  return matched / total
}

function volumeNeedsBulk(volumeTier?: MarketplaceVolumeTier) {
  return volumeTier === 'large' || volumeTier === 'enterprise'
}

export function getNutrientTagLabel(tag: NutrientProfileTag) {
  return NUTRIENT_TAG_LABELS[tag]
}

export function deriveNutrientTagsFromCropNames(cropNames: string[]): NutrientProfileTag[] {
  const tags = new Set<NutrientProfileTag>()

  cropNames.forEach((cropName) => {
    const normalized = cropName.trim().toLowerCase()
    const mapped = CROP_TAG_MAP[normalized]
    mapped?.forEach((tag) => tags.add(tag))
  })

  return Array.from(tags)
}

export function getListingSignals(listing: MarketplaceListing): MarketplaceSellerSignals {
  return {
    hasPublishedListings: listing.status === 'published',
    acceptsSnap: listing.acceptsSnap,
    communityDiscountPct: listing.communityDiscountPct,
    supportsPickup: listing.pickupEnabled,
    supportsDelivery: listing.deliveryEnabled,
  }
}

export function matchesBuyerRequestTags(
  availableTags: NutrientProfileTag[],
  requestedTags: NutrientProfileTag[] | undefined,
) {
  if (!requestedTags || requestedTags.length === 0) return true
  return requestedTags.some((tag) => availableTags.includes(tag))
}

function nutrientFitScore(availableTags: NutrientProfileTag[], request: BuyerMatchRequest) {
  if (!request.nutrientTags || request.nutrientTags.length === 0) {
    return clamp(55 + (availableTags.length * 8))
  }

  const matched = request.nutrientTags.filter((tag) => availableTags.includes(tag)).length
  return clamp(safeRatio(matched, request.nutrientTags.length) * 100)
}

function affordabilityScore(
  scorecard: FarmScorecard,
  sellerSignals: MarketplaceSellerSignals,
  request: BuyerMatchRequest,
) {
  let score = scorecard.score.affordability
  if (sellerSignals.acceptsSnap) score += 10
  if ((sellerSignals.communityDiscountPct ?? 0) >= 10) score += 10
  if (request.affordabilityNeeded && !sellerSignals.acceptsSnap && !sellerSignals.communityDiscountPct) score -= 15
  if (request.snapPreferred && !sellerSignals.acceptsSnap) score -= 20
  return clamp(score)
}

function fulfillmentScore(
  supportsPickup: boolean,
  supportsDelivery: boolean,
  request: BuyerMatchRequest,
) {
  if (!request.fulfillmentMethod) {
    return clamp((supportsPickup ? 45 : 0) + (supportsDelivery ? 55 : 0))
  }

  if (request.fulfillmentMethod === 'pickup') {
    return supportsPickup ? 100 : 0
  }

  return supportsDelivery ? 100 : 0
}

function localAccessibilityScore(scorecard: FarmScorecard, request: BuyerMatchRequest) {
  const regionMatch = request.region ? scorecard.farm.region === request.region : false
  return clamp(scorecard.healthImpactSummary.localDistributionPct + (regionMatch ? 15 : 0))
}

function freshnessAvailabilityScore(listingView: MarketplaceListingView, request: BuyerMatchRequest) {
  let score = listingView.listing.quantityAvailable > 0 ? 70 : 0
  if (listingView.listing.listingType === 'weekly_offer') score += 15
  if (request.availabilityWindow && listingView.listing.availabilityEnd) score += 10
  return clamp(score)
}

function listingMatchesRequest(listingView: MarketplaceListingView, request: BuyerMatchRequest) {
  const query = normalizedQuery(request.q)
  const haystack = [
    listingView.listing.title,
    listingView.listing.description,
    listingView.scorecard.farm.name,
    listingView.scorecard.farm.region,
    ...listingView.listing.cropNames,
    ...listingView.nutrientTags,
  ]
    .join(' ')
    .toLowerCase()

  if (query && !haystack.includes(query)) return false
  if (request.region && listingView.scorecard.farm.region !== request.region) return false
  if (typeof request.minPriScore === 'number' && listingView.scorecard.score.overallScore < request.minPriScore) return false
  if (!matchesBuyerRequestTags(listingView.nutrientTags, request.nutrientTags)) return false
  if (request.fulfillmentMethod === 'pickup' && !listingView.listing.pickupEnabled) return false
  if (request.fulfillmentMethod === 'delivery' && !listingView.listing.deliveryEnabled) return false
  if (request.affordabilityNeeded && !listingView.listing.acceptsSnap && !listingView.listing.communityDiscountPct && !listingView.listing.offersSlidingScale) return false
  if (request.snapPreferred && !listingView.listing.acceptsSnap) return false
  if (volumeNeedsBulk(request.volumeTier) && !listingView.listing.acceptsBulkInquiries) return false
  return listingView.listing.status === 'published'
}

export function getDefaultBuyerMatchRequest(overrides: Partial<BuyerMatchRequest> = {}): BuyerMatchRequest {
  return {
    buyerType: 'individual',
    ...overrides,
  }
}

export function rankMarketplaceListings(
  listingViews: MarketplaceListingView[],
  rawRequest: Partial<BuyerMatchRequest> = {},
): MarketplaceMatchResult[] {
  const request = getDefaultBuyerMatchRequest(rawRequest)
  const weights = BUYER_WEIGHTS[request.buyerType]

  return listingViews
    .filter((listingView) => listingMatchesRequest(listingView, request))
    .map((listingView) => {
      const priScore = clamp(listingView.scorecard.score.overallScore)
      const nutrientFit = nutrientFitScore(listingView.nutrientTags, request)
      const safety = clamp(listingView.scorecard.score.foodSafety)
      const reliability = clamp(listingView.scorecard.score.supplyReliability)
      const fulfillment = fulfillmentScore(
        listingView.listing.pickupEnabled,
        listingView.listing.deliveryEnabled,
        request,
      )
      const localAccessibility = localAccessibilityScore(listingView.scorecard, request)
      const affordability = affordabilityScore(listingView.scorecard, listingView.sellerSignals, request)
      const freshnessAvailability = freshnessAvailabilityScore(listingView, request)

      const weightedScore = (
        (priScore * weights.priScore) +
        (nutrientFit * weights.nutrientFit) +
        (safety * weights.safety) +
        (reliability * weights.reliability) +
        (fulfillment * weights.fulfillment) +
        (localAccessibility * weights.localAccessibility) +
        (affordability * weights.affordability) +
        (freshnessAvailability * weights.freshnessAvailability)
      ) / 100

      const reasons: string[] = []
      if (listingView.scorecard.score.overallScore >= Math.max(request.minPriScore ?? 0, 80)) {
        reasons.push('High PRI score')
      }
      if (nutrientFit >= 80 && request.nutrientTags?.length) {
        reasons.push(`${getNutrientTagLabel(request.nutrientTags[0])} crop mix`)
      } else if (listingView.nutrientTags.includes('vitamin_c_rich')) {
        reasons.push('Vitamin C rich crop mix')
      }
      if (listingView.scorecard.score.foodSafety >= 80 && listingView.scorecard.score.supplyReliability >= 75) {
        reasons.push('Strong safety and reliability')
      }
      if ((request.affordabilityNeeded || request.snapPreferred) && (listingView.listing.acceptsSnap || listingView.listing.communityDiscountPct)) {
        reasons.push('SNAP/community pricing')
      }
      if (request.fulfillmentMethod === 'delivery' && listingView.listing.deliveryEnabled) {
        reasons.push('Local delivery available')
      } else if (request.fulfillmentMethod === 'pickup' && listingView.listing.pickupEnabled) {
        reasons.push('Pickup available')
      } else if (!request.fulfillmentMethod && listingView.listing.deliveryEnabled) {
        reasons.push('Flexible pickup or delivery')
      }
      if (reasons.length === 0) {
        reasons.push('Verified PRI-backed produce offer')
      }

      return {
        listingView,
        matchScore: Math.round(weightedScore * 10) / 10,
        reasons: reasons.slice(0, 4),
      } satisfies MarketplaceMatchResult
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.listingView.scorecard.score.overallScore - a.listingView.scorecard.score.overallScore)
}

export function rankFarmScorecardsForBuyer(
  farms: Array<{ scorecard: FarmScorecard; sellerSignals: MarketplaceSellerSignals; nutrientTags: NutrientProfileTag[] }>,
  rawRequest: Partial<BuyerMatchRequest> = {},
): MarketplaceFarmMatchResult[] {
  const request = getDefaultBuyerMatchRequest(rawRequest)
  const weights = BUYER_WEIGHTS[request.buyerType]

  return farms
    .filter(({ scorecard, sellerSignals, nutrientTags }) => {
      const query = normalizedQuery(request.q)
      const haystack = [
        scorecard.farm.name,
        scorecard.farm.region,
        scorecard.farm.city,
        ...scorecard.crops.map((crop) => crop.name),
        ...nutrientTags,
      ]
        .join(' ')
        .toLowerCase()

      if (query && !haystack.includes(query)) return false
      if (request.region && scorecard.farm.region !== request.region) return false
      if (typeof request.minPriScore === 'number' && scorecard.score.overallScore < request.minPriScore) return false
      if (!matchesBuyerRequestTags(nutrientTags, request.nutrientTags)) return false
      if (request.fulfillmentMethod === 'pickup' && !sellerSignals.supportsPickup) return false
      if (request.fulfillmentMethod === 'delivery' && !sellerSignals.supportsDelivery) return false
      if (request.snapPreferred && !sellerSignals.acceptsSnap) return false
      return true
    })
    .map(({ scorecard, sellerSignals, nutrientTags }) => {
      const priScore = clamp(scorecard.score.overallScore)
      const nutrientFit = nutrientFitScore(nutrientTags, request)
      const safety = clamp(scorecard.score.foodSafety)
      const reliability = clamp(scorecard.score.supplyReliability)
      const fulfillment = fulfillmentScore(sellerSignals.supportsPickup, sellerSignals.supportsDelivery, request)
      const localAccessibility = localAccessibilityScore(scorecard, request)
      const affordability = affordabilityScore(scorecard, sellerSignals, request)
      const freshnessAvailability = sellerSignals.hasPublishedListings ? 85 : 45

      const weightedScore = (
        (priScore * weights.priScore) +
        (nutrientFit * weights.nutrientFit) +
        (safety * weights.safety) +
        (reliability * weights.reliability) +
        (fulfillment * weights.fulfillment) +
        (localAccessibility * weights.localAccessibility) +
        (affordability * weights.affordability) +
        (freshnessAvailability * weights.freshnessAvailability)
      ) / 100

      const reasons: string[] = []
      if (priScore >= Math.max(request.minPriScore ?? 0, 80)) reasons.push('High PRI score')
      if (nutrientFit >= 80 && request.nutrientTags?.length) reasons.push(`${getNutrientTagLabel(request.nutrientTags[0])} fit`)
      if (safety >= 80 && reliability >= 75) reasons.push('Strong safety and reliability')
      if ((request.affordabilityNeeded || request.snapPreferred) && (sellerSignals.acceptsSnap || sellerSignals.communityDiscountPct)) reasons.push('SNAP/community pricing')
      if (request.fulfillmentMethod === 'delivery' && sellerSignals.supportsDelivery) reasons.push('Local delivery available')
      if (request.fulfillmentMethod === 'pickup' && sellerSignals.supportsPickup) reasons.push('Pickup ready')
      if (reasons.length === 0) reasons.push('Verified farm with clear provenance')

      return {
        scorecard,
        sellerSignals,
        nutrientTags,
        matchScore: Math.round(weightedScore * 10) / 10,
        reasons: reasons.slice(0, 4),
      } satisfies MarketplaceFarmMatchResult
    })
    .sort((a, b) => b.matchScore - a.matchScore || b.scorecard.score.overallScore - a.scorecard.score.overallScore)
}

import 'server-only'

import { isMockMode } from '@/lib/is-mock-mode'
import {
  getMarketplaceCommissionsForFarm,
  getMarketplaceDeliveryZonesForFarm,
  getMarketplaceInquiriesForFarm,
  getMarketplaceListingsForFarm,
  getMarketplaceOrderItems,
  getMarketplaceOrdersForFarm,
  getMarketplacePickupLocationsForFarm,
  getMarketplacePublishedListings,
  getMarketplaceSellerProfileForFarm,
  getVerifiedFarms,
} from '@/lib/mock'
import { deriveNutrientTagsFromCropNames, getListingSignals } from '@/lib/marketplace'
import { buildFarmScorecard, getFarmScorecardById, getVerifiedFarmScorecards } from '@/lib/scorecards'
import type {
  MarketplaceListingView,
  MarketplaceSellerSignals,
} from '@/lib/types'

export function getMarketplaceListingViews(): MarketplaceListingView[] {
  if (!isMockMode()) return []

  return getMarketplacePublishedListings()
    .map((listing) => {
      const scorecard = getFarmScorecardById(listing.farmId)
      const sellerProfile = getMarketplaceSellerProfileForFarm(listing.farmId)
      if (!scorecard || !sellerProfile) return null

      const pickupLocations = getMarketplacePickupLocationsForFarm(listing.farmId)
        .filter((location) => listing.pickupLocationIds.includes(location.id))
      const deliveryZones = getMarketplaceDeliveryZonesForFarm(listing.farmId)
        .filter((zone) => listing.deliveryZoneIds.includes(zone.id))

      return {
        listing,
        sellerProfile,
        scorecard,
        pickupLocations,
        deliveryZones,
        nutrientTags: listing.nutrientTags.length > 0 ? listing.nutrientTags : deriveNutrientTagsFromCropNames(listing.cropNames),
        sellerSignals: getListingSignals(listing),
      } satisfies MarketplaceListingView
    })
    .filter((view): view is MarketplaceListingView => Boolean(view))
}

export function getMarketplaceListingViewById(id: string): MarketplaceListingView | null {
  if (!isMockMode()) return null
  return getMarketplaceListingViews().find((view) => view.listing.id === id) ?? null
}

export function getMarketplaceFarmStoreById(farmId: string) {
  if (!isMockMode()) return null

  const scorecard = getFarmScorecardById(farmId)
  const sellerProfile = getMarketplaceSellerProfileForFarm(farmId)
  if (!scorecard || !sellerProfile) return null

  const pickupLocations = getMarketplacePickupLocationsForFarm(farmId)
  const deliveryZones = getMarketplaceDeliveryZonesForFarm(farmId)
  const listings = getMarketplaceListingsForFarm(farmId)

  return {
    scorecard,
    sellerProfile,
    pickupLocations,
    deliveryZones,
    listings,
    nutrientTags: deriveNutrientTagsFromCropNames(scorecard.crops.map((crop) => crop.name)),
  }
}

export function getMarketplaceSellerSignalsByFarm() {
  if (!isMockMode()) {
    return new Map<string, MarketplaceSellerSignals>()
  }

  const signals = new Map<string, MarketplaceSellerSignals>()
  const listings = getMarketplacePublishedListings()

  getVerifiedFarmScorecards().forEach((scorecard) => {
    const farmListings = listings.filter((listing) => listing.farmId === scorecard.farm.id)
    const acceptsSnap = farmListings.some((listing) => listing.acceptsSnap)
    const communityDiscountPct = farmListings.reduce<number | null>((max, listing) => {
      const value = listing.communityDiscountPct
      if (value == null) return max
      return max == null ? value : Math.max(max, value)
    }, null)
    const supportsPickup = farmListings.some((listing) => listing.pickupEnabled)
    const supportsDelivery = farmListings.some((listing) => listing.deliveryEnabled)

    signals.set(scorecard.farm.id, {
      hasPublishedListings: farmListings.length > 0,
      acceptsSnap,
      communityDiscountPct,
      supportsPickup,
      supportsDelivery,
    })
  })

  return signals
}

export function getMarketplaceFarmMatchInputs() {
  if (!isMockMode()) return []

  const signalsByFarm = getMarketplaceSellerSignalsByFarm()
  return getVerifiedFarmScorecards().map((scorecard) => ({
    scorecard,
    sellerSignals: signalsByFarm.get(scorecard.farm.id) ?? {
      hasPublishedListings: false,
      acceptsSnap: false,
      communityDiscountPct: null,
      supportsPickup: false,
      supportsDelivery: false,
    },
    nutrientTags: deriveNutrientTagsFromCropNames(scorecard.crops.map((crop) => crop.name)),
  }))
}

export function getFarmerMarketplaceWorkspace(farmId: string) {
  if (!isMockMode()) return null

  const verified = getVerifiedFarms().find((entry) => entry.farm.id === farmId)
  const sellerProfile = getMarketplaceSellerProfileForFarm(farmId)
  const pickupLocations = getMarketplacePickupLocationsForFarm(farmId)
  const deliveryZones = getMarketplaceDeliveryZonesForFarm(farmId)
  const listings = getMarketplaceListingsForFarm(farmId)
  const orders = getMarketplaceOrdersForFarm(farmId).map((order) => ({
    ...order,
    items: getMarketplaceOrderItems(order.id),
  }))
  const inquiries = getMarketplaceInquiriesForFarm(farmId)
  const commissions = getMarketplaceCommissionsForFarm(farmId)

  return {
    farmId,
    verified: Boolean(verified),
    scorecard: verified
      ? buildFarmScorecard(verified.farm, verified.score, verified.crops, verified.distribution, verified.verifiedAt)
      : null,
    sellerProfile,
    pickupLocations,
    deliveryZones,
    listings,
    orders,
    inquiries,
    commissions,
  }
}

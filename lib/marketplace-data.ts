import {
  BUYER_TYPE_OPTIONS,
  MARKETPLACE_FULFILLMENT_OPTIONS,
  MARKETPLACE_LISTING_TYPE_OPTIONS,
  MARKETPLACE_VOLUME_OPTIONS,
  NUTRIENT_TAG_OPTIONS,
  SERVICE_DAY_OPTIONS,
} from '@/lib/marketplace'
import type {
  BuyerType,
  MarketplaceDeliveryZone,
  MarketplaceInquiry,
  MarketplaceListing,
  MarketplaceOrderStatus,
  MarketplacePickupLocation,
  MarketplaceSellerProfile,
  MarketplaceVolumeTier,
  NutrientProfileTag,
} from '@/lib/types'

const BUYER_TYPES = BUYER_TYPE_OPTIONS.map((option) => option.value)
const FULFILLMENT_METHODS = MARKETPLACE_FULFILLMENT_OPTIONS.map((option) => option.value)
const LISTING_TYPES = MARKETPLACE_LISTING_TYPE_OPTIONS.map((option) => option.value)
const VOLUME_TIERS = MARKETPLACE_VOLUME_OPTIONS.map((option) => option.value)
const NUTRIENT_TAGS = NUTRIENT_TAG_OPTIONS.map((option) => option.value)

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

function cleanNutrientTagArray(value: unknown) {
  return cleanStringArray(value).filter((tag): tag is NutrientProfileTag => NUTRIENT_TAGS.includes(tag as NutrientProfileTag))
}

export function normalizeMarketplaceSellerProfileInput(
  input: Record<string, unknown>,
  farmId: string,
  existing?: MarketplaceSellerProfile,
): MarketplaceSellerProfile {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    publicDescription: cleanString(input.publicDescription),
    contactEmail: cleanString(input.contactEmail),
    contactPhone: cleanString(input.contactPhone),
    orderInstructions: cleanString(input.orderInstructions),
    serviceDays: cleanStringArray(input.serviceDays).filter((day) => SERVICE_DAY_OPTIONS.includes(day)),
    acceptsCommunityOrders: cleanBoolean(input.acceptsCommunityOrders),
    publishedAt: cleanBoolean(input.isPublished ?? existing?.publishedAt)
      ? existing?.publishedAt ?? new Date().toISOString()
      : null,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function normalizeMarketplacePickupLocationInput(
  input: Record<string, unknown>,
  farmId: string,
  sellerProfileId: string,
  existing?: MarketplacePickupLocation,
): MarketplacePickupLocation {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    sellerProfileId,
    label: cleanString(input.label),
    address: cleanString(input.address),
    pickupWindow: cleanString(input.pickupWindow),
    notes: cleanString(input.notes) || null,
  }
}

export function normalizeMarketplaceDeliveryZoneInput(
  input: Record<string, unknown>,
  farmId: string,
  sellerProfileId: string,
  existing?: MarketplaceDeliveryZone,
): MarketplaceDeliveryZone {
  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    sellerProfileId,
    label: cleanString(input.label),
    areaSummary: cleanString(input.areaSummary),
    deliveryFee: cleanNumber(input.deliveryFee),
    deliveryDays: cleanStringArray(input.deliveryDays).filter((day) => SERVICE_DAY_OPTIONS.includes(day)),
    notes: cleanString(input.notes) || null,
  }
}

export function normalizeMarketplaceListingInput(
  input: Record<string, unknown>,
  farmId: string,
  sellerProfileId: string,
  existing?: MarketplaceListing,
): MarketplaceListing {
  const listingType = LISTING_TYPES.includes(input.listingType as MarketplaceListing['listingType'])
    ? (input.listingType as MarketplaceListing['listingType'])
    : existing?.listingType ?? 'catalog_item'

  const statusInput = cleanString(input.status)
  const validStatuses: MarketplaceListing['status'][] = ['draft', 'published', 'paused', 'sold_out']

  return {
    id: existing?.id ?? crypto.randomUUID(),
    farmId,
    sellerProfileId,
    title: cleanString(input.title),
    description: cleanString(input.description),
    listingType,
    status: validStatuses.includes(statusInput as MarketplaceListing['status'])
      ? (statusInput as MarketplaceListing['status'])
      : existing?.status ?? 'draft',
    cropNames: cleanStringArray(input.cropNames),
    nutrientTags: cleanNutrientTagArray(input.nutrientTags),
    pricePerUnit: cleanNumber(input.pricePerUnit),
    unit: cleanString(input.unit) || 'lb',
    quantityAvailable: cleanNumber(input.quantityAvailable),
    minimumOrderQuantity: Math.max(1, cleanNumber(input.minimumOrderQuantity || 1)),
    availabilityStart: cleanString(input.availabilityStart) || null,
    availabilityEnd: cleanString(input.availabilityEnd) || null,
    acceptsBulkInquiries: cleanBoolean(input.acceptsBulkInquiries),
    acceptsSnap: cleanBoolean(input.acceptsSnap),
    offersSlidingScale: cleanBoolean(input.offersSlidingScale),
    communityDiscountPct: cleanString(input.communityDiscountPct) === '' && input.communityDiscountPct !== 0
      ? null
      : cleanNumber(input.communityDiscountPct),
    pickupEnabled: cleanBoolean(input.pickupEnabled),
    deliveryEnabled: cleanBoolean(input.deliveryEnabled),
    pickupLocationIds: cleanStringArray(input.pickupLocationIds),
    deliveryZoneIds: cleanStringArray(input.deliveryZoneIds),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function normalizeMarketplaceInquiryInput(
  input: Record<string, unknown>,
  farmId: string,
): MarketplaceInquiry {
  const buyerType = BUYER_TYPES.includes(input.buyerType as BuyerType) && input.buyerType !== 'individual'
    ? (input.buyerType as MarketplaceInquiry['buyerType'])
    : 'community_org'
  const fulfillmentPreference = cleanString(input.fulfillmentPreference)
  const validFulfillment: Array<MarketplaceInquiry['fulfillmentPreference']> = [...FULFILLMENT_METHODS, 'either']

  return {
    id: crypto.randomUUID(),
    farmId,
    listingId: cleanString(input.listingId) || null,
    buyerType,
    organizationName: cleanString(input.organizationName),
    contactName: cleanString(input.contactName),
    email: cleanString(input.email),
    phone: cleanString(input.phone),
    volumeTier: (VOLUME_TIERS.includes(input.volumeTier as MarketplaceVolumeTier)
      ? input.volumeTier
      : 'small') as MarketplaceInquiry['volumeTier'],
    timingWindow: cleanString(input.timingWindow),
    region: cleanString(input.region),
    fulfillmentPreference: validFulfillment.includes(fulfillmentPreference as MarketplaceInquiry['fulfillmentPreference'])
      ? (fulfillmentPreference as MarketplaceInquiry['fulfillmentPreference'])
      : 'either',
    notes: cleanString(input.notes),
    status: 'new',
    createdAt: new Date().toISOString(),
  }
}

export function normalizeMarketplaceOrderStatus(value: unknown): MarketplaceOrderStatus | null {
  const cleaned = cleanString(value)
  const valid: MarketplaceOrderStatus[] = ['pending', 'confirmed', 'ready', 'completed', 'canceled']
  return valid.includes(cleaned as MarketplaceOrderStatus) ? (cleaned as MarketplaceOrderStatus) : null
}

export function sellerProfileToSupabaseInsert(profile: MarketplaceSellerProfile) {
  return {
    id: profile.id,
    farm_id: profile.farmId,
    public_description: profile.publicDescription,
    contact_email: profile.contactEmail,
    contact_phone: profile.contactPhone,
    order_instructions: profile.orderInstructions,
    service_days: profile.serviceDays,
    accepts_community_orders: profile.acceptsCommunityOrders,
    published_at: profile.publishedAt,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  }
}

export function pickupLocationToSupabaseInsert(location: MarketplacePickupLocation) {
  return {
    id: location.id,
    farm_id: location.farmId,
    seller_profile_id: location.sellerProfileId,
    label: location.label,
    address: location.address,
    pickup_window: location.pickupWindow,
    notes: location.notes,
  }
}

export function deliveryZoneToSupabaseInsert(zone: MarketplaceDeliveryZone) {
  return {
    id: zone.id,
    farm_id: zone.farmId,
    seller_profile_id: zone.sellerProfileId,
    label: zone.label,
    area_summary: zone.areaSummary,
    delivery_fee: zone.deliveryFee,
    delivery_days: zone.deliveryDays,
    notes: zone.notes,
  }
}

export function listingToSupabaseInsert(listing: MarketplaceListing) {
  return {
    id: listing.id,
    farm_id: listing.farmId,
    seller_profile_id: listing.sellerProfileId,
    title: listing.title,
    description: listing.description,
    listing_type: listing.listingType,
    status: listing.status,
    crop_names: listing.cropNames,
    nutrient_tags: listing.nutrientTags,
    price_per_unit: listing.pricePerUnit,
    unit: listing.unit,
    quantity_available: listing.quantityAvailable,
    minimum_order_quantity: listing.minimumOrderQuantity,
    availability_start: listing.availabilityStart,
    availability_end: listing.availabilityEnd,
    accepts_bulk_inquiries: listing.acceptsBulkInquiries,
    accepts_snap: listing.acceptsSnap,
    offers_sliding_scale: listing.offersSlidingScale,
    community_discount_pct: listing.communityDiscountPct,
    pickup_enabled: listing.pickupEnabled,
    delivery_enabled: listing.deliveryEnabled,
    pickup_location_ids: listing.pickupLocationIds,
    delivery_zone_ids: listing.deliveryZoneIds,
    created_at: listing.createdAt,
    updated_at: listing.updatedAt,
  }
}

export function normalizeMarketplaceSellerProfileRow(row: Record<string, unknown>): MarketplaceSellerProfile {
  return {
    id: String(row.id),
    farmId: cleanString(row.farm_id ?? row.farmId),
    publicDescription: cleanString(row.public_description ?? row.publicDescription),
    contactEmail: cleanString(row.contact_email ?? row.contactEmail),
    contactPhone: cleanString(row.contact_phone ?? row.contactPhone),
    orderInstructions: cleanString(row.order_instructions ?? row.orderInstructions),
    serviceDays: cleanStringArray(row.service_days ?? row.serviceDays),
    acceptsCommunityOrders: cleanBoolean(row.accepts_community_orders ?? row.acceptsCommunityOrders),
    publishedAt: cleanString(row.published_at ?? row.publishedAt) || null,
    createdAt: cleanString(row.created_at ?? row.createdAt) || new Date().toISOString(),
    updatedAt: cleanString(row.updated_at ?? row.updatedAt) || new Date().toISOString(),
  }
}

export function normalizeMarketplacePickupLocationRow(row: Record<string, unknown>): MarketplacePickupLocation {
  return {
    id: String(row.id),
    farmId: cleanString(row.farm_id ?? row.farmId),
    sellerProfileId: cleanString(row.seller_profile_id ?? row.sellerProfileId),
    label: cleanString(row.label),
    address: cleanString(row.address),
    pickupWindow: cleanString(row.pickup_window ?? row.pickupWindow),
    notes: cleanString(row.notes) || null,
  }
}

export function normalizeMarketplaceDeliveryZoneRow(row: Record<string, unknown>): MarketplaceDeliveryZone {
  return {
    id: String(row.id),
    farmId: cleanString(row.farm_id ?? row.farmId),
    sellerProfileId: cleanString(row.seller_profile_id ?? row.sellerProfileId),
    label: cleanString(row.label),
    areaSummary: cleanString(row.area_summary ?? row.areaSummary),
    deliveryFee: cleanNumber(row.delivery_fee ?? row.deliveryFee),
    deliveryDays: cleanStringArray(row.delivery_days ?? row.deliveryDays),
    notes: cleanString(row.notes) || null,
  }
}

export function normalizeMarketplaceListingRow(row: Record<string, unknown>): MarketplaceListing {
  return {
    id: String(row.id),
    farmId: cleanString(row.farm_id ?? row.farmId),
    sellerProfileId: cleanString(row.seller_profile_id ?? row.sellerProfileId),
    title: cleanString(row.title),
    description: cleanString(row.description),
    listingType: cleanString(row.listing_type ?? row.listingType) as MarketplaceListing['listingType'],
    status: cleanString(row.status) as MarketplaceListing['status'],
    cropNames: cleanStringArray(row.crop_names ?? row.cropNames),
    nutrientTags: cleanNutrientTagArray(row.nutrient_tags ?? row.nutrientTags),
    pricePerUnit: cleanNumber(row.price_per_unit ?? row.pricePerUnit),
    unit: cleanString(row.unit),
    quantityAvailable: cleanNumber(row.quantity_available ?? row.quantityAvailable),
    minimumOrderQuantity: cleanNumber(row.minimum_order_quantity ?? row.minimumOrderQuantity),
    availabilityStart: cleanString(row.availability_start ?? row.availabilityStart) || null,
    availabilityEnd: cleanString(row.availability_end ?? row.availabilityEnd) || null,
    acceptsBulkInquiries: cleanBoolean(row.accepts_bulk_inquiries ?? row.acceptsBulkInquiries),
    acceptsSnap: cleanBoolean(row.accepts_snap ?? row.acceptsSnap),
    offersSlidingScale: cleanBoolean(row.offers_sliding_scale ?? row.offersSlidingScale),
    communityDiscountPct: row.community_discount_pct == null && row.communityDiscountPct == null
      ? null
      : cleanNumber(row.community_discount_pct ?? row.communityDiscountPct),
    pickupEnabled: cleanBoolean(row.pickup_enabled ?? row.pickupEnabled),
    deliveryEnabled: cleanBoolean(row.delivery_enabled ?? row.deliveryEnabled),
    pickupLocationIds: cleanStringArray(row.pickup_location_ids ?? row.pickupLocationIds),
    deliveryZoneIds: cleanStringArray(row.delivery_zone_ids ?? row.deliveryZoneIds),
    createdAt: cleanString(row.created_at ?? row.createdAt) || new Date().toISOString(),
    updatedAt: cleanString(row.updated_at ?? row.updatedAt) || new Date().toISOString(),
  }
}

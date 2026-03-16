import { NextResponse } from 'next/server'
import {
  deliveryZoneToSupabaseInsert,
  normalizeMarketplaceDeliveryZoneInput,
  normalizeMarketplacePickupLocationInput,
  normalizeMarketplaceSellerProfileInput,
  pickupLocationToSupabaseInsert,
  sellerProfileToSupabaseInsert,
} from '@/lib/marketplace-data'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  getFarmById,
  getMarketplaceDeliveryZonesForFarm,
  getMarketplacePickupLocationsForFarm,
  getMarketplaceSellerProfileForFarm,
  getMockDatabase,
  saveMockDatabase,
} from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

function mockFarmId() {
  return 'farm-1'
}

export async function GET() {
  if (isMockMode()) {
    const farmId = mockFarmId()
    return NextResponse.json({
      data: {
        sellerProfile: getMarketplaceSellerProfileForFarm(farmId),
        pickupLocations: getMarketplacePickupLocationsForFarm(farmId),
        deliveryZones: getMarketplaceDeliveryZonesForFarm(farmId),
      },
      error: null,
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
  if (!farm) {
    return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
  }

  const [{ data: sellerProfile }, { data: pickupLocations }, { data: deliveryZones }] = await Promise.all([
    supabase.from('marketplace_seller_profiles').select('*').eq('farm_id', farm.id).maybeSingle(),
    supabase.from('marketplace_pickup_locations').select('*').eq('farm_id', farm.id).order('label'),
    supabase.from('marketplace_delivery_zones').select('*').eq('farm_id', farm.id).order('label'),
  ])

  return NextResponse.json({
    data: {
      sellerProfile: sellerProfile ?? null,
      pickupLocations: pickupLocations ?? [],
      deliveryZones: deliveryZones ?? [],
    },
    error: null,
  })
}

export async function POST(request: Request) {
  const body = await request.json()

  if (isMockMode()) {
    const farmId = mockFarmId()
    const farm = getFarmById(farmId)
    if (!farm) {
      return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
    }

    const existing = getMarketplaceSellerProfileForFarm(farmId) ?? undefined
    const sellerProfile = normalizeMarketplaceSellerProfileInput(body, farmId, existing)
    if (!sellerProfile.publicDescription || !sellerProfile.contactEmail) {
      return NextResponse.json({ data: null, error: { message: 'Public description and contact email are required' } }, { status: 400 })
    }

    const pickupLocations = Array.isArray(body.pickupLocations)
      ? (body.pickupLocations as Array<Record<string, unknown>>).map((entry) => normalizeMarketplacePickupLocationInput(entry, farmId, sellerProfile.id))
      : []
    const deliveryZones = Array.isArray(body.deliveryZones)
      ? (body.deliveryZones as Array<Record<string, unknown>>).map((entry) => normalizeMarketplaceDeliveryZoneInput(entry, farmId, sellerProfile.id))
      : []

    const db = getMockDatabase()
    db.marketplaceSellerProfiles = [sellerProfile, ...db.marketplaceSellerProfiles.filter((profile) => profile.farmId !== farmId)]
    db.marketplacePickupLocations = [
      ...pickupLocations,
      ...db.marketplacePickupLocations.filter((location) => location.farmId !== farmId),
    ]
    db.marketplaceDeliveryZones = [
      ...deliveryZones,
      ...db.marketplaceDeliveryZones.filter((zone) => zone.farmId !== farmId),
    ]
    saveMockDatabase(db)

    return NextResponse.json({ data: { sellerProfile, pickupLocations, deliveryZones }, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
  if (!farm) {
    return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
  }

  const { data: existing } = await supabase
    .from('marketplace_seller_profiles')
    .select('*')
    .eq('farm_id', farm.id)
    .maybeSingle()

  const sellerProfile = normalizeMarketplaceSellerProfileInput(body, String(farm.id), existing ?? undefined)
  const pickupLocations = Array.isArray(body.pickupLocations)
    ? (body.pickupLocations as Array<Record<string, unknown>>).map((entry) => normalizeMarketplacePickupLocationInput(entry, String(farm.id), sellerProfile.id))
    : []
  const deliveryZones = Array.isArray(body.deliveryZones)
    ? (body.deliveryZones as Array<Record<string, unknown>>).map((entry) => normalizeMarketplaceDeliveryZoneInput(entry, String(farm.id), sellerProfile.id))
    : []

  const { error: sellerError } = await supabase
    .from('marketplace_seller_profiles')
    .upsert(sellerProfileToSupabaseInsert(sellerProfile))

  if (sellerError) {
    return NextResponse.json({ data: null, error: { message: sellerError.message } }, { status: 400 })
  }

  await supabase.from('marketplace_pickup_locations').delete().eq('farm_id', farm.id)
  await supabase.from('marketplace_delivery_zones').delete().eq('farm_id', farm.id)

  if (pickupLocations.length > 0) {
    const { error } = await supabase
      .from('marketplace_pickup_locations')
      .insert(pickupLocations.map((location) => pickupLocationToSupabaseInsert(location)))
    if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  }

  if (deliveryZones.length > 0) {
    const { error } = await supabase
      .from('marketplace_delivery_zones')
      .insert(deliveryZones.map((zone) => deliveryZoneToSupabaseInsert(zone)))
    if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  }

  return NextResponse.json({ data: { sellerProfile, pickupLocations, deliveryZones }, error: null })
}

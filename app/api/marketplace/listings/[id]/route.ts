import { NextResponse } from 'next/server'
import { normalizeMarketplaceListingInput, listingToSupabaseInsert } from '@/lib/marketplace-data'
import { deriveNutrientTagsFromCropNames } from '@/lib/marketplace'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  deleteMockRecord,
  getMarketplaceListingById,
  getMarketplaceSellerProfileForFarm,
  getVerifiedFarms,
  upsertMockRecord,
} from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    const listing = getMarketplaceListingById(id)
    if (!listing || listing.status !== 'published') {
      return NextResponse.json({ data: null, error: { message: 'Listing not found' } }, { status: 404 })
    }

    return NextResponse.json({ data: listing, error: null })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) return NextResponse.json({ data: null, error: { message: 'Listing not found' } }, { status: 404 })
  return NextResponse.json({ data, error: null })
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    const existing = getMarketplaceListingById(id)
    if (!existing) {
      return NextResponse.json({ data: null, error: { message: 'Listing not found' } }, { status: 404 })
    }

    const sellerProfile = getMarketplaceSellerProfileForFarm(existing.farmId)
    if (!sellerProfile) {
      return NextResponse.json({ data: null, error: { message: 'Seller profile not found' } }, { status: 404 })
    }

    const listing = normalizeMarketplaceListingInput(await request.json(), existing.farmId, sellerProfile.id, existing)
    const isVerified = getVerifiedFarms().some((entry) => entry.farm.id === existing.farmId)
    if (listing.status === 'published' && !isVerified) {
      return NextResponse.json({ data: null, error: { message: 'Only verified farms can publish listings' } }, { status: 400 })
    }

    return NextResponse.json({
      data: upsertMockRecord('marketplaceListings', {
        ...listing,
        nutrientTags: listing.nutrientTags.length > 0 ? listing.nutrientTags : deriveNutrientTagsFromCropNames(listing.cropNames),
      }),
      error: null,
    })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: existingRow, error: existingError } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('id', id)
    .single()

  if (existingError || !existingRow) {
    return NextResponse.json({ data: null, error: { message: 'Listing not found' } }, { status: 404 })
  }

  const listing = normalizeMarketplaceListingInput(
    await request.json(),
    String(existingRow.farm_id),
    String(existingRow.seller_profile_id),
    {
      id: String(existingRow.id),
      farmId: String(existingRow.farm_id),
      sellerProfileId: String(existingRow.seller_profile_id),
      title: String(existingRow.title ?? ''),
      description: String(existingRow.description ?? ''),
      listingType: String(existingRow.listing_type ?? 'catalog_item') as never,
      status: String(existingRow.status ?? 'draft') as never,
      cropNames: (existingRow.crop_names as string[] | null) ?? [],
      nutrientTags: (existingRow.nutrient_tags as [] | null) ?? [],
      pricePerUnit: Number(existingRow.price_per_unit ?? 0),
      unit: String(existingRow.unit ?? 'lb'),
      quantityAvailable: Number(existingRow.quantity_available ?? 0),
      minimumOrderQuantity: Number(existingRow.minimum_order_quantity ?? 1),
      availabilityStart: String(existingRow.availability_start ?? '') || null,
      availabilityEnd: String(existingRow.availability_end ?? '') || null,
      acceptsBulkInquiries: Boolean(existingRow.accepts_bulk_inquiries),
      acceptsSnap: Boolean(existingRow.accepts_snap),
      offersSlidingScale: Boolean(existingRow.offers_sliding_scale),
      communityDiscountPct: existingRow.community_discount_pct == null ? null : Number(existingRow.community_discount_pct),
      pickupEnabled: Boolean(existingRow.pickup_enabled),
      deliveryEnabled: Boolean(existingRow.delivery_enabled),
      pickupLocationIds: (existingRow.pickup_location_ids as string[] | null) ?? [],
      deliveryZoneIds: (existingRow.delivery_zone_ids as string[] | null) ?? [],
      createdAt: String(existingRow.created_at ?? new Date().toISOString()),
      updatedAt: String(existingRow.updated_at ?? new Date().toISOString()),
    },
  )

  const { data: verifiedSubmission } = await supabase
    .from('pri_submissions')
    .select('id')
    .eq('farm_id', existingRow.farm_id)
    .eq('status', 'verified')
    .single()

  if (listing.status === 'published' && !verifiedSubmission) {
    return NextResponse.json({ data: null, error: { message: 'Only verified farms can publish listings' } }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('marketplace_listings')
    .update(listingToSupabaseInsert({
      ...listing,
      nutrientTags: listing.nutrientTags.length > 0 ? listing.nutrientTags : deriveNutrientTagsFromCropNames(listing.cropNames),
    }))
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data, error: null })
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params

  if (isMockMode()) {
    deleteMockRecord('marketplaceListings', id)
    return NextResponse.json({ data: { deleted: true }, error: null })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { error } = await supabase.from('marketplace_listings').delete().eq('id', id)
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data: { deleted: true }, error: null })
}

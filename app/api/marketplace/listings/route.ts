import { NextResponse } from 'next/server'
import { normalizeMarketplaceListingInput, listingToSupabaseInsert } from '@/lib/marketplace-data'
import { deriveNutrientTagsFromCropNames } from '@/lib/marketplace'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  getFarmById,
  getMarketplaceListingsForFarm,
  getMarketplacePublishedListings,
  getMarketplaceSellerProfileForFarm,
  getVerifiedFarms,
  upsertMockRecord,
} from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

function getMockFarmId() {
  return 'farm-1'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const farmId = searchParams.get('farmId')
  const scope = searchParams.get('scope')

  if (isMockMode()) {
    const data = scope === 'mine'
      ? getMarketplaceListingsForFarm(farmId ?? getMockFarmId())
      : (farmId
          ? getMarketplaceListingsForFarm(farmId).filter((listing) => listing.status === 'published')
          : getMarketplacePublishedListings())

    return NextResponse.json({ data, error: null })
  }

  const supabase = await createClient()
  let query = supabase.from('marketplace_listings').select('*').order('updated_at', { ascending: false })

  if (scope === 'mine') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'farmer') {
      return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { data: farm } = await supabase.from('farm_profiles').select('id').eq('user_id', user.id).single()
    if (!farm) {
      return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
    }

    query = query.eq('farm_id', farm.id)
  } else {
    query = query.eq('status', 'published')
    if (farmId) query = query.eq('farm_id', farmId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: data ?? [], error: null })
}

export async function POST(request: Request) {
  if (isMockMode()) {
    const farmId = getMockFarmId()
    const farm = getFarmById(farmId)
    const sellerProfile = getMarketplaceSellerProfileForFarm(farmId)
    if (!farm || !sellerProfile) {
      return NextResponse.json({ data: null, error: { message: 'Seller profile not found' } }, { status: 404 })
    }

    const listing = normalizeMarketplaceListingInput(await request.json(), farmId, sellerProfile.id)
    if (!listing.title || listing.cropNames.length === 0) {
      return NextResponse.json({ data: null, error: { message: 'Title and crop names are required' } }, { status: 400 })
    }

    const isVerified = getVerifiedFarms().some((entry) => entry.farm.id === farmId)
    if (listing.status === 'published' && !isVerified) {
      return NextResponse.json({ data: null, error: { message: 'Only verified farms can publish listings' } }, { status: 400 })
    }

    const normalizedListing = {
      ...listing,
      nutrientTags: listing.nutrientTags.length > 0 ? listing.nutrientTags : deriveNutrientTagsFromCropNames(listing.cropNames),
    }

    return NextResponse.json({ data: upsertMockRecord('marketplaceListings', normalizedListing), error: null }, { status: 201 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: farm } = await supabase
    .from('farm_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!farm) {
    return NextResponse.json({ data: null, error: { message: 'Farm profile not found' } }, { status: 404 })
  }

  const { data: sellerProfile } = await supabase
    .from('marketplace_seller_profiles')
    .select('id')
    .eq('farm_id', farm.id)
    .single()

  if (!sellerProfile) {
    return NextResponse.json({ data: null, error: { message: 'Seller profile not found' } }, { status: 404 })
  }

  const listing = normalizeMarketplaceListingInput(await request.json(), String(farm.id), String(sellerProfile.id))
  const { data: verifiedSubmission } = await supabase
    .from('pri_submissions')
    .select('id')
    .eq('farm_id', farm.id)
    .eq('status', 'verified')
    .single()

  if (listing.status === 'published' && !verifiedSubmission) {
    return NextResponse.json({ data: null, error: { message: 'Only verified farms can publish listings' } }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert(listingToSupabaseInsert({
      ...listing,
      nutrientTags: listing.nutrientTags.length > 0 ? listing.nutrientTags : deriveNutrientTagsFromCropNames(listing.cropNames),
    }))
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

import { NextResponse } from 'next/server'
import { normalizeMarketplaceInquiryInput } from '@/lib/marketplace-data'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  getMarketplaceInquiriesForFarm,
  getMarketplaceListingById,
  upsertMockRecord,
} from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'

function mockFarmId() {
  return 'farm-1'
}

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({ data: getMarketplaceInquiriesForFarm(mockFarmId()), error: null })
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

  const { data, error } = await supabase
    .from('marketplace_inquiries')
    .select('*')
    .eq('farm_id', farm.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: data ?? [], error: null })
}

export async function POST(request: Request) {
  const body = await request.json()
  const listingId = typeof body.listingId === 'string' ? body.listingId : ''
  const farmId = typeof body.farmId === 'string' ? body.farmId : ''

  if (isMockMode()) {
    const listing = listingId ? getMarketplaceListingById(listingId) : null
    const resolvedFarmId = listing?.farmId ?? farmId
    if (!resolvedFarmId) {
      return NextResponse.json({ data: null, error: { message: 'farmId or listingId is required' } }, { status: 400 })
    }

    const inquiry = normalizeMarketplaceInquiryInput(body, resolvedFarmId)
    if (!inquiry.organizationName || !inquiry.contactName || !inquiry.email) {
      return NextResponse.json({ data: null, error: { message: 'Organization, contact name, and email are required' } }, { status: 400 })
    }

    return NextResponse.json({ data: upsertMockRecord('marketplaceInquiries', inquiry), error: null }, { status: 201 })
  }

  const supabase = await createClient()
  const resolvedFarmId = listingId
    ? await (async () => {
        const { data } = await supabase
          .from('marketplace_listings')
          .select('farm_id')
          .eq('id', listingId)
          .single()
        return String(data?.farm_id ?? '')
      })()
    : farmId

  if (!resolvedFarmId) {
    return NextResponse.json({ data: null, error: { message: 'farmId or listingId is required' } }, { status: 400 })
  }

  const inquiry = normalizeMarketplaceInquiryInput(body, resolvedFarmId)
  if (!inquiry.organizationName || !inquiry.contactName || !inquiry.email) {
    return NextResponse.json({ data: null, error: { message: 'Organization, contact name, and email are required' } }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('marketplace_inquiries')
    .insert({
      id: inquiry.id,
      farm_id: inquiry.farmId,
      listing_id: inquiry.listingId,
      buyer_type: inquiry.buyerType,
      organization_name: inquiry.organizationName,
      contact_name: inquiry.contactName,
      email: inquiry.email,
      phone: inquiry.phone,
      volume_tier: inquiry.volumeTier,
      timing_window: inquiry.timingWindow,
      region: inquiry.region,
      fulfillment_preference: inquiry.fulfillmentPreference,
      notes: inquiry.notes,
      status: inquiry.status,
      created_at: inquiry.createdAt,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 400 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

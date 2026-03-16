import { NextResponse } from 'next/server'
import { COMMISSION_RATE_PCT } from '@/lib/marketplace'
import { normalizeMarketplaceOrderStatus } from '@/lib/marketplace-data'
import { isMockMode } from '@/lib/is-mock-mode'
import {
  getMarketplaceCommissionsForFarm,
  getMarketplaceDeliveryZonesForFarm,
  getMarketplaceListingById,
  getMarketplaceOrderItems,
  getMarketplaceOrdersForFarm,
  upsertMockRecord,
} from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import type { MarketplaceOrder, MarketplaceOrderItem } from '@/lib/types'

function buildReferenceCode() {
  return `PRI-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

function mockFarmId() {
  return 'farm-1'
}

export async function GET() {
  if (isMockMode()) {
    const farmId = mockFarmId()
    return NextResponse.json({
      data: getMarketplaceOrdersForFarm(farmId).map((order) => ({
        ...order,
        items: getMarketplaceOrderItems(order.id),
      })),
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

  const { data: orders, error } = await supabase
    .from('marketplace_orders')
    .select('*, marketplace_order_items(*)')
    .eq('farm_id', farm.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data: orders ?? [], error: null })
}

export async function POST(request: Request) {
  const body = await request.json()
  const items = Array.isArray(body.items) ? (body.items as Array<{ listingId: string; quantity?: number }>) : []
  if (items.length === 0) {
    return NextResponse.json({ data: null, error: { message: 'At least one listing is required' } }, { status: 400 })
  }

  if (isMockMode()) {
    const listings = items
      .map((item) => getMarketplaceListingById(String(item.listingId)))
      .filter((listing): listing is NonNullable<ReturnType<typeof getMarketplaceListingById>> => Boolean(listing))

    if (listings.length !== items.length) {
      return NextResponse.json({ data: null, error: { message: 'One or more listings were not found' } }, { status: 404 })
    }

    if (listings.some((listing) => listing.status !== 'published')) {
      return NextResponse.json({ data: null, error: { message: 'Only published listings can be reserved' } }, { status: 400 })
    }

    const farmIds = new Set(listings.map((listing) => listing.farmId))
    if (farmIds.size !== 1) {
      return NextResponse.json({ data: null, error: { message: 'Orders must contain items from a single farm' } }, { status: 400 })
    }

    const farmId = listings[0].farmId
    const fulfillmentMethod = body.fulfillmentMethod === 'delivery' ? 'delivery' : 'pickup'
    const deliveryZoneId = fulfillmentMethod === 'delivery' ? String(body.deliveryZoneId ?? '') : null
    const deliveryFee = deliveryZoneId
      ? (getMarketplaceDeliveryZonesForFarm(farmId).find((zone) => zone.id === deliveryZoneId)?.deliveryFee ?? 0)
      : 0

    const orderId = crypto.randomUUID()
    const orderItems: MarketplaceOrderItem[] = items.map((item) => {
      const listing = listings.find((entry) => entry.id === String(item.listingId))!
      const quantity = Math.max(Number(item.quantity ?? 1), listing.minimumOrderQuantity)
      return {
        id: crypto.randomUUID(),
        orderId,
        listingId: listing.id,
        listingTitle: listing.title,
        quantity,
        unit: listing.unit,
        unitPrice: listing.pricePerUnit,
        lineTotal: Math.round(quantity * listing.pricePerUnit * 100) / 100,
      }
    })

    const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100
    const order: MarketplaceOrder = {
      id: orderId,
      farmId,
      buyerType: body.buyerType === 'community_org' ? 'community_org' : 'individual',
      buyerName: String(body.buyerName ?? '').trim(),
      buyerEmail: String(body.buyerEmail ?? '').trim(),
      buyerPhone: String(body.buyerPhone ?? '').trim(),
      fulfillmentMethod,
      pickupLocationId: fulfillmentMethod === 'pickup' ? String(body.pickupLocationId ?? '') || null : null,
      deliveryZoneId,
      notes: String(body.notes ?? '').trim(),
      subtotal,
      deliveryFee,
      total: Math.round((subtotal + deliveryFee) * 100) / 100,
      status: 'pending',
      paymentStatus: 'pay_on_fulfillment',
      referenceCode: buildReferenceCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (!order.buyerName || !order.buyerEmail || !order.buyerPhone) {
      return NextResponse.json({ data: null, error: { message: 'Buyer name, email, and phone are required' } }, { status: 400 })
    }

    upsertMockRecord('marketplaceOrders', order)
    orderItems.forEach((item) => {
      upsertMockRecord('marketplaceOrderItems', item)
    })

    return NextResponse.json({ data: { ...order, items: orderItems }, error: null }, { status: 201 })
  }

  const supabase = await createClient()
  const listingIds = items.map((item) => String(item.listingId))
  const { data: listings, error: listingsError } = await supabase
    .from('marketplace_listings')
    .select('*')
    .in('id', listingIds)

  if (listingsError || !listings || listings.length !== items.length) {
    return NextResponse.json({ data: null, error: { message: 'Unable to load the requested listings' } }, { status: 400 })
  }

  if (listings.some((listing) => String(listing.status) !== 'published')) {
    return NextResponse.json({ data: null, error: { message: 'Only published listings can be reserved' } }, { status: 400 })
  }

  const farmIds = new Set(listings.map((listing) => String(listing.farm_id)))
  if (farmIds.size !== 1) {
    return NextResponse.json({ data: null, error: { message: 'Orders must contain items from a single farm' } }, { status: 400 })
  }

  const farmId = String(listings[0].farm_id)
  const orderId = crypto.randomUUID()
  const fulfillmentMethod = body.fulfillmentMethod === 'delivery' ? 'delivery' : 'pickup'
  let deliveryFee = 0

  if (fulfillmentMethod === 'delivery' && body.deliveryZoneId) {
    const { data: zone } = await supabase
      .from('marketplace_delivery_zones')
      .select('delivery_fee')
      .eq('id', body.deliveryZoneId)
      .single()
    deliveryFee = Number(zone?.delivery_fee ?? 0)
  }

  const orderItems = listings.map((listing) => {
    const requested = items.find((item) => String(item.listingId) === String(listing.id))
    const quantity = Math.max(Number(requested?.quantity ?? 1), Number(listing.minimum_order_quantity ?? 1))
    return {
      id: crypto.randomUUID(),
      order_id: orderId,
      listing_id: String(listing.id),
      listing_title: String(listing.title),
      quantity,
      unit: String(listing.unit),
      unit_price: Number(listing.price_per_unit),
      line_total: Math.round(quantity * Number(listing.price_per_unit) * 100) / 100,
    }
  })

  const subtotal = Math.round(orderItems.reduce((sum, item) => sum + item.line_total, 0) * 100) / 100
  const orderInsert = {
    id: orderId,
    farm_id: farmId,
    buyer_type: body.buyerType === 'community_org' ? 'community_org' : 'individual',
    buyer_name: String(body.buyerName ?? '').trim(),
    buyer_email: String(body.buyerEmail ?? '').trim(),
    buyer_phone: String(body.buyerPhone ?? '').trim(),
    fulfillment_method: fulfillmentMethod,
    pickup_location_id: fulfillmentMethod === 'pickup' ? String(body.pickupLocationId ?? '') || null : null,
    delivery_zone_id: fulfillmentMethod === 'delivery' ? String(body.deliveryZoneId ?? '') || null : null,
    notes: String(body.notes ?? '').trim(),
    subtotal,
    delivery_fee: deliveryFee,
    total: Math.round((subtotal + deliveryFee) * 100) / 100,
    status: 'pending',
    payment_status: 'pay_on_fulfillment',
    reference_code: buildReferenceCode(),
  }

  const { data: order, error: orderError } = await supabase
    .from('marketplace_orders')
    .insert(orderInsert)
    .select()
    .single()

  if (orderError) return NextResponse.json({ data: null, error: { message: orderError.message } }, { status: 400 })

  const { error: itemsError } = await supabase.from('marketplace_order_items').insert(orderItems)
  if (itemsError) return NextResponse.json({ data: null, error: { message: itemsError.message } }, { status: 400 })

  return NextResponse.json({ data: { ...order, items: orderItems }, error: null }, { status: 201 })
}

export async function PATCH(request: Request) {
  const { orderId, status } = await request.json()
  const nextStatus = normalizeMarketplaceOrderStatus(status)
  if (!orderId || !nextStatus) {
    return NextResponse.json({ data: null, error: { message: 'orderId and a valid status are required' } }, { status: 400 })
  }

  if (isMockMode()) {
    const farmId = mockFarmId()
    const order = getMarketplaceOrdersForFarm(farmId).find((entry) => entry.id === String(orderId))
    if (!order) {
      return NextResponse.json({ data: null, error: { message: 'Order not found' } }, { status: 404 })
    }

    const updatedOrder = {
      ...order,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    }
    upsertMockRecord('marketplaceOrders', updatedOrder)

    if (nextStatus === 'completed') {
      const existingCommission = getMarketplaceCommissionsForFarm(farmId).find((entry) => entry.orderId === order.id)
      if (!existingCommission) {
        upsertMockRecord('marketplaceCommissionLedger', {
          id: crypto.randomUUID(),
          farmId,
          orderId: order.id,
          ratePct: COMMISSION_RATE_PCT,
          produceSubtotal: order.subtotal,
          commissionAmount: Math.round(order.subtotal * (COMMISSION_RATE_PCT / 100) * 100) / 100,
          status: 'accrued',
          createdAt: new Date().toISOString(),
        })
      }
    }

    return NextResponse.json({ data: updatedOrder, error: null })
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

  const { data: order, error: orderError } = await supabase
    .from('marketplace_orders')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('farm_id', farm.id)
    .select()
    .single()

  if (orderError || !order) return NextResponse.json({ data: null, error: { message: 'Order not found' } }, { status: 404 })

  if (nextStatus === 'completed') {
    const { data: existingCommission } = await supabase
      .from('marketplace_commission_ledger')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle()

    if (!existingCommission) {
      await supabase.from('marketplace_commission_ledger').insert({
        id: crypto.randomUUID(),
        farm_id: farm.id,
        order_id: orderId,
        rate_pct: COMMISSION_RATE_PCT,
        produce_subtotal: Number(order.subtotal ?? 0),
        commission_amount: Math.round(Number(order.subtotal ?? 0) * (COMMISSION_RATE_PCT / 100) * 100) / 100,
        status: 'accrued',
      })
    }
  }

  return NextResponse.json({ data: order, error: null })
}

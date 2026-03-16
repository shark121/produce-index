'use client'

import { useState } from 'react'
import { Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MARKETPLACE_LISTING_TYPE_OPTIONS,
  NUTRIENT_TAG_OPTIONS,
  SERVICE_DAY_OPTIONS,
} from '@/lib/marketplace'
import type {
  MarketplaceCommissionLedgerEntry,
  MarketplaceDeliveryZone,
  MarketplaceInquiry,
  MarketplaceListing,
  MarketplaceOrder,
  MarketplaceOrderItem,
  MarketplacePickupLocation,
  MarketplaceSellerProfile,
} from '@/lib/types'

interface WorkspaceOrder extends MarketplaceOrder {
  items: MarketplaceOrderItem[]
}

interface FarmerMarketplaceWorkspace {
  verified: boolean
  scorecard: { score: { overallScore: number } } | null
  sellerProfile: MarketplaceSellerProfile | null
  pickupLocations: MarketplacePickupLocation[]
  deliveryZones: MarketplaceDeliveryZone[]
  listings: MarketplaceListing[]
  orders: WorkspaceOrder[]
  inquiries: MarketplaceInquiry[]
  commissions: MarketplaceCommissionLedgerEntry[]
}

interface MarketplaceManagerProps {
  initialData: FarmerMarketplaceWorkspace
}

function emptySellerProfile(): MarketplaceSellerProfile {
  return {
    id: '',
    farmId: '',
    publicDescription: '',
    contactEmail: '',
    contactPhone: '',
    orderInstructions: '',
    serviceDays: [],
    acceptsCommunityOrders: true,
    publishedAt: null,
    createdAt: '',
    updatedAt: '',
  }
}

function emptyListing(): MarketplaceListing {
  return {
    id: '',
    farmId: '',
    sellerProfileId: '',
    title: '',
    description: '',
    listingType: 'catalog_item',
    status: 'draft',
    cropNames: [],
    nutrientTags: [],
    pricePerUnit: 0,
    unit: 'lb',
    quantityAvailable: 0,
    minimumOrderQuantity: 1,
    availabilityStart: null,
    availabilityEnd: null,
    acceptsBulkInquiries: true,
    acceptsSnap: false,
    offersSlidingScale: false,
    communityDiscountPct: null,
    pickupEnabled: true,
    deliveryEnabled: false,
    pickupLocationIds: [],
    deliveryZoneIds: [],
    createdAt: '',
    updatedAt: '',
  }
}

function emptyPickupLocation(): MarketplacePickupLocation {
  return {
    id: crypto.randomUUID(),
    farmId: '',
    sellerProfileId: '',
    label: '',
    address: '',
    pickupWindow: '',
    notes: null,
  }
}

function emptyDeliveryZone(): MarketplaceDeliveryZone {
  return {
    id: crypto.randomUUID(),
    farmId: '',
    sellerProfileId: '',
    label: '',
    areaSummary: '',
    deliveryFee: 0,
    deliveryDays: [],
    notes: null,
  }
}

export function MarketplaceManager({ initialData }: MarketplaceManagerProps) {
  const [verified] = useState(initialData.verified)
  const [score] = useState(initialData.scorecard?.score.overallScore ?? null)
  const [sellerProfile, setSellerProfile] = useState(initialData.sellerProfile ?? emptySellerProfile())
  const [pickupLocations, setPickupLocations] = useState(initialData.pickupLocations)
  const [deliveryZones, setDeliveryZones] = useState(initialData.deliveryZones)
  const [listings, setListings] = useState(initialData.listings)
  const [orders, setOrders] = useState(initialData.orders)
  const [inquiries] = useState(initialData.inquiries)
  const [commissions, setCommissions] = useState(initialData.commissions)
  const [listingDraft, setListingDraft] = useState<MarketplaceListing>(emptyListing())
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingListing, setSavingListing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function clearFeedback() {
    setMessage(null)
    setError(null)
  }

  function updatePickupLocation(index: number, field: keyof MarketplacePickupLocation, value: string) {
    setPickupLocations((current) =>
      current.map((location, locationIndex) =>
        locationIndex === index
          ? {
              ...location,
              [field]: field === 'notes' ? value || null : value,
            }
          : location,
      ),
    )
  }

  function updateDeliveryZone(index: number, field: keyof MarketplaceDeliveryZone, value: string | number | string[]) {
    setDeliveryZones((current) =>
      current.map((zone, zoneIndex) =>
        zoneIndex === index
          ? {
              ...zone,
              [field]: field === 'notes' ? (value ? String(value) : null) : value,
            }
          : zone,
      ),
    )
  }

  async function saveSellerProfile() {
    clearFeedback()
    setSavingProfile(true)

    const response = await fetch('/api/marketplace/seller-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sellerProfile,
        isPublished: Boolean(sellerProfile.publishedAt),
        pickupLocations,
        deliveryZones,
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save seller profile.')
      setSavingProfile(false)
      return
    }

    setSellerProfile(payload.data.sellerProfile)
    setPickupLocations(payload.data.pickupLocations)
    setDeliveryZones(payload.data.deliveryZones)
    setMessage('Seller profile and fulfillment setup saved.')
    setSavingProfile(false)
  }

  async function saveListing() {
    clearFeedback()
    setSavingListing(true)

    const response = await fetch(editingListingId ? `/api/marketplace/listings/${editingListingId}` : '/api/marketplace/listings', {
      method: editingListingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(listingDraft),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to save listing.')
      setSavingListing(false)
      return
    }

    const nextListing = payload.data as MarketplaceListing
    setListings((current) => {
      const exists = current.some((listing) => listing.id === nextListing.id)
      return exists
        ? current.map((listing) => (listing.id === nextListing.id ? nextListing : listing))
        : [nextListing, ...current]
    })
    setListingDraft(emptyListing())
    setEditingListingId(null)
    setMessage(editingListingId ? 'Listing updated.' : 'Listing created.')
    setSavingListing(false)
  }

  async function deleteListing(id: string) {
    clearFeedback()
    const response = await fetch(`/api/marketplace/listings/${id}`, { method: 'DELETE' })
    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to delete listing.')
      return
    }

    setListings((current) => current.filter((listing) => listing.id !== id))
    if (editingListingId === id) {
      setListingDraft(emptyListing())
      setEditingListingId(null)
    }
    setMessage('Listing deleted.')
  }

  async function updateOrderStatus(orderId: string, status: MarketplaceOrder['status']) {
    clearFeedback()
    const response = await fetch('/api/marketplace/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to update order status.')
      return
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, ...payload.data } : order)))
    if (status === 'completed') {
      const existing = commissions.find((entry) => entry.orderId === orderId)
      if (!existing) {
        const order = orders.find((entry) => entry.id === orderId)
        if (order) {
          setCommissions((current) => [
            {
              id: crypto.randomUUID(),
              farmId: order.farmId,
              orderId,
              ratePct: 8,
              produceSubtotal: order.subtotal,
              commissionAmount: Math.round(order.subtotal * 0.08 * 100) / 100,
              status: 'accrued',
              createdAt: new Date().toISOString(),
            },
            ...current,
          ])
        }
      }
    }
    setMessage(`Order moved to ${status}.`)
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Marketplace Workspace</h1>
          <p className="mt-1 text-sm text-[#8E8E93]">
            Manage your Health-Aware Produce Exchange profile, live listings, orders, and sourcing demand.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {verified ? <Badge variant="green">Verified for publishing</Badge> : <Badge variant="orange">Verification required</Badge>}
          {score != null ? <Badge variant="blue">PRI {score.toFixed(1)}</Badge> : null}
        </div>
      </div>

      {!verified && (
        <div className="surface-elevated rounded-[18px] border border-[rgba(255,149,0,0.18)] bg-[rgba(255,149,0,0.06)] p-5 text-sm text-[#48484A]">
          Your farm can prepare a seller profile now, but live marketplace publishing stays locked until a verified PRI snapshot is available.
        </div>
      )}

      {message && <div className="surface-elevated rounded-[16px] border border-[rgba(52,199,89,0.18)] bg-[rgba(52,199,89,0.08)] px-4 py-3 text-sm text-[#1A7A32]">{message}</div>}
      {error && <div className="surface-elevated rounded-[16px] border border-[rgba(255,59,48,0.18)] bg-[rgba(255,59,48,0.08)] px-4 py-3 text-sm text-[#B42318]">{error}</div>}

      <section className="surface-elevated rounded-[22px] p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1C1E]">Seller profile and fulfillment setup</h2>
            <p className="mt-1 text-sm text-[#8E8E93]">This powers your public storefront and reservation options.</p>
          </div>
          <Button onClick={() => void saveSellerProfile()} disabled={savingProfile}>
            {savingProfile ? 'Saving...' : 'Save seller profile'}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <input
            value={sellerProfile.contactEmail}
            onChange={(event) => setSellerProfile((current) => ({ ...current, contactEmail: event.target.value }))}
            placeholder="Contact email"
            className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
          />
          <input
            value={sellerProfile.contactPhone}
            onChange={(event) => setSellerProfile((current) => ({ ...current, contactPhone: event.target.value }))}
            placeholder="Contact phone"
            className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
          />
        </div>
        <textarea
          rows={3}
          value={sellerProfile.publicDescription}
          onChange={(event) => setSellerProfile((current) => ({ ...current, publicDescription: event.target.value }))}
          placeholder="Public description"
          className="mt-4 w-full rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        />
        <textarea
          rows={3}
          value={sellerProfile.orderInstructions}
          onChange={(event) => setSellerProfile((current) => ({ ...current, orderInstructions: event.target.value }))}
          placeholder="Order instructions"
          className="mt-4 w-full rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        />
        <label className="mt-4 flex items-center gap-2 text-sm text-[#48484A]">
          <input
            type="checkbox"
            checked={sellerProfile.acceptsCommunityOrders}
            onChange={(event) => setSellerProfile((current) => ({ ...current, acceptsCommunityOrders: event.target.checked }))}
          />
          Accept community reservations
        </label>

        <div className="mt-5">
          <p className="text-sm font-medium text-[#1C1C1E]">Service days</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SERVICE_DAY_OPTIONS.map((day) => {
              const selected = sellerProfile.serviceDays.includes(day)
              return (
                <label key={day} className={`rounded-full border px-3 py-1.5 text-sm ${selected ? 'border-[#34C759] bg-[rgba(52,199,89,0.10)] text-[#1A7A32]' : 'border-[rgba(0,0,0,0.10)] text-[#48484A]'}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected}
                    onChange={() =>
                      setSellerProfile((current) => ({
                        ...current,
                        serviceDays: selected
                          ? current.serviceDays.filter((value) => value !== day)
                          : [...current.serviceDays, day],
                      }))
                    }
                  />
                  {day}
                </label>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#1C1C1E]">Pickup locations</p>
              <Button size="sm" variant="secondary" onClick={() => setPickupLocations((current) => [...current, emptyPickupLocation()])}>
                <Plus className="h-4 w-4" />
                Add pickup point
              </Button>
            </div>
            {pickupLocations.map((location, index) => (
              <div key={location.id} className="rounded-[16px] border border-[rgba(0,0,0,0.06)] p-4">
                <div className="grid gap-3">
                  <input value={location.label} onChange={(event) => updatePickupLocation(index, 'label', event.target.value)} placeholder="Label" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                  <input value={location.address} onChange={(event) => updatePickupLocation(index, 'address', event.target.value)} placeholder="Address" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                  <input value={location.pickupWindow} onChange={(event) => updatePickupLocation(index, 'pickupWindow', event.target.value)} placeholder="Pickup window" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                  <input value={location.notes ?? ''} onChange={(event) => updatePickupLocation(index, 'notes', event.target.value)} placeholder="Notes" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setPickupLocations((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#1C1C1E]">Delivery zones</p>
              <Button size="sm" variant="secondary" onClick={() => setDeliveryZones((current) => [...current, emptyDeliveryZone()])}>
                <Plus className="h-4 w-4" />
                Add delivery zone
              </Button>
            </div>
            {deliveryZones.map((zone, index) => (
              <div key={zone.id} className="rounded-[16px] border border-[rgba(0,0,0,0.06)] p-4">
                <div className="grid gap-3">
                  <input value={zone.label} onChange={(event) => updateDeliveryZone(index, 'label', event.target.value)} placeholder="Label" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                  <input value={zone.areaSummary} onChange={(event) => updateDeliveryZone(index, 'areaSummary', event.target.value)} placeholder="Area summary" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                  <input value={String(zone.deliveryFee)} onChange={(event) => updateDeliveryZone(index, 'deliveryFee', Number(event.target.value))} placeholder="Delivery fee" type="number" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_DAY_OPTIONS.map((day) => {
                      const selected = zone.deliveryDays.includes(day)
                      return (
                        <label key={day} className={`rounded-full border px-3 py-1 text-xs ${selected ? 'border-[#34C759] bg-[rgba(52,199,89,0.10)] text-[#1A7A32]' : 'border-[rgba(0,0,0,0.10)] text-[#48484A]'}`}>
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selected}
                            onChange={() =>
                              updateDeliveryZone(
                                index,
                                'deliveryDays',
                                selected
                                  ? zone.deliveryDays.filter((value) => value !== day)
                                  : [...zone.deliveryDays, day],
                              )
                            }
                          />
                          {day}
                        </label>
                      )
                    })}
                  </div>
                  <input value={zone.notes ?? ''} onChange={(event) => updateDeliveryZone(index, 'notes', event.target.value)} placeholder="Notes" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => setDeliveryZones((current) => current.filter((_, currentIndex) => currentIndex !== index))}>
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-elevated rounded-[22px] p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold text-[#1C1C1E]">Listings</h2>
            <p className="mt-1 text-sm text-[#8E8E93]">Publish weekly offers and catalog items from your verified farm profile.</p>
          </div>
          {editingListingId && (
            <Button variant="secondary" onClick={() => { setListingDraft(emptyListing()); setEditingListingId(null) }}>
              <RefreshCcw className="h-4 w-4" />
              Reset form
            </Button>
          )}
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="rounded-[18px] border border-[rgba(0,0,0,0.06)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#1C1C1E]">{listing.title}</p>
                      <Badge variant={listing.status === 'published' ? 'green' : listing.status === 'sold_out' ? 'orange' : 'blue'}>{listing.status}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-[#48484A]">{listing.description}</p>
                    <p className="mt-2 text-xs text-[#8E8E93]">${listing.pricePerUnit.toFixed(2)} / {listing.unit} · {listing.quantityAvailable} {listing.unit} available</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => { setListingDraft(listing); setEditingListingId(listing.id) }}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => void deleteListing(listing.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[20px] border border-[rgba(0,0,0,0.06)] p-5">
            <p className="text-sm font-semibold text-[#1C1C1E]">{editingListingId ? 'Edit listing' : 'New listing'}</p>
            <div className="mt-4 grid gap-3">
              <input value={listingDraft.title} onChange={(event) => setListingDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
              <textarea value={listingDraft.description} onChange={(event) => setListingDraft((current) => ({ ...current, description: event.target.value }))} rows={3} placeholder="Description" className="rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 py-2.5 text-sm outline-none focus:border-[#34C759]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <select value={listingDraft.listingType} onChange={(event) => setListingDraft((current) => ({ ...current, listingType: event.target.value as MarketplaceListing['listingType'] }))} className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]">
                  {MARKETPLACE_LISTING_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select value={listingDraft.status} onChange={(event) => setListingDraft((current) => ({ ...current, status: event.target.value as MarketplaceListing['status'] }))} className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]">
                  <option value="draft">Draft</option>
                  <option value="published" disabled={!verified}>Published</option>
                  <option value="paused">Paused</option>
                  <option value="sold_out">Sold out</option>
                </select>
              </div>
              <input value={listingDraft.cropNames.join(', ')} onChange={(event) => setListingDraft((current) => ({ ...current, cropNames: event.target.value.split(',').map((value) => value.trim()).filter(Boolean) }))} placeholder="Crop names, comma separated" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={String(listingDraft.pricePerUnit)} onChange={(event) => setListingDraft((current) => ({ ...current, pricePerUnit: Number(event.target.value) }))} type="number" placeholder="Price" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                <input value={listingDraft.unit} onChange={(event) => setListingDraft((current) => ({ ...current, unit: event.target.value }))} placeholder="Unit" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                <input value={String(listingDraft.quantityAvailable)} onChange={(event) => setListingDraft((current) => ({ ...current, quantityAvailable: Number(event.target.value) }))} type="number" placeholder="Quantity available" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
                <input value={String(listingDraft.minimumOrderQuantity)} onChange={(event) => setListingDraft((current) => ({ ...current, minimumOrderQuantity: Number(event.target.value) }))} type="number" placeholder="Minimum order quantity" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#1C1C1E]">Nutrient tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {NUTRIENT_TAG_OPTIONS.map((option) => {
                    const selected = listingDraft.nutrientTags.includes(option.value)
                    return (
                      <label key={option.value} className={`rounded-full border px-3 py-1 text-xs ${selected ? 'border-[#34C759] bg-[rgba(52,199,89,0.10)] text-[#1A7A32]' : 'border-[rgba(0,0,0,0.10)] text-[#48484A]'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() =>
                            setListingDraft((current) => ({
                              ...current,
                              nutrientTags: selected
                                ? current.nutrientTags.filter((tag) => tag !== option.value)
                                : [...current.nutrientTags, option.value],
                            }))
                          }
                        />
                        {option.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid gap-2 text-sm text-[#48484A]">
                <label className="flex items-center gap-2"><input type="checkbox" checked={listingDraft.acceptsBulkInquiries} onChange={(event) => setListingDraft((current) => ({ ...current, acceptsBulkInquiries: event.target.checked }))} /> Accept bulk inquiries</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={listingDraft.acceptsSnap} onChange={(event) => setListingDraft((current) => ({ ...current, acceptsSnap: event.target.checked }))} /> Accept SNAP</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={listingDraft.offersSlidingScale} onChange={(event) => setListingDraft((current) => ({ ...current, offersSlidingScale: event.target.checked }))} /> Offer sliding-scale pricing</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={listingDraft.pickupEnabled} onChange={(event) => setListingDraft((current) => ({ ...current, pickupEnabled: event.target.checked }))} /> Pickup available</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={listingDraft.deliveryEnabled} onChange={(event) => setListingDraft((current) => ({ ...current, deliveryEnabled: event.target.checked }))} /> Delivery available</label>
              </div>

              <input value={listingDraft.communityDiscountPct ?? ''} onChange={(event) => setListingDraft((current) => ({ ...current, communityDiscountPct: event.target.value === '' ? null : Number(event.target.value) }))} type="number" placeholder="Community discount %" className="h-10 rounded-[10px] border border-[rgba(0,0,0,0.10)] px-3 text-sm outline-none focus:border-[#34C759]" />

              <div>
                <p className="text-sm font-medium text-[#1C1C1E]">Pickup locations</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pickupLocations.map((location) => {
                    const selected = listingDraft.pickupLocationIds.includes(location.id)
                    return (
                      <label key={location.id} className={`rounded-full border px-3 py-1 text-xs ${selected ? 'border-[#34C759] bg-[rgba(52,199,89,0.10)] text-[#1A7A32]' : 'border-[rgba(0,0,0,0.10)] text-[#48484A]'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() =>
                            setListingDraft((current) => ({
                              ...current,
                              pickupLocationIds: selected
                                ? current.pickupLocationIds.filter((id) => id !== location.id)
                                : [...current.pickupLocationIds, location.id],
                            }))
                          }
                        />
                        {location.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-[#1C1C1E]">Delivery zones</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {deliveryZones.map((zone) => {
                    const selected = listingDraft.deliveryZoneIds.includes(zone.id)
                    return (
                      <label key={zone.id} className={`rounded-full border px-3 py-1 text-xs ${selected ? 'border-[#34C759] bg-[rgba(52,199,89,0.10)] text-[#1A7A32]' : 'border-[rgba(0,0,0,0.10)] text-[#48484A]'}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={selected}
                          onChange={() =>
                            setListingDraft((current) => ({
                              ...current,
                              deliveryZoneIds: selected
                                ? current.deliveryZoneIds.filter((id) => id !== zone.id)
                                : [...current.deliveryZoneIds, zone.id],
                            }))
                          }
                        />
                        {zone.label}
                      </label>
                    )
                  })}
                </div>
              </div>

              <Button onClick={() => void saveListing()} disabled={savingListing || !verified && listingDraft.status === 'published'}>
                {savingListing ? 'Saving...' : editingListingId ? 'Update listing' : 'Create listing'}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-elevated rounded-[22px] p-6">
        <h2 className="text-lg font-semibold text-[#1C1C1E]">Community orders</h2>
        <div className="mt-5 space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-[#8E8E93]">No marketplace orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="rounded-[18px] border border-[rgba(0,0,0,0.06)] p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-[#1C1C1E]">{order.buyerName}</p>
                      <Badge variant="blue">{order.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-[#48484A]">{order.buyerEmail} · {order.buyerPhone}</p>
                    <p className="mt-1 text-xs text-[#8E8E93]">Reference {order.referenceCode}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1C1C1E]">${order.total.toFixed(2)}</p>
                    <p className="mt-1 text-xs text-[#8E8E93]">{order.fulfillmentMethod}</p>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-[#48484A]">
                  {order.items.map((item) => (
                    <li key={item.id}>{item.listingTitle} · {item.quantity} {item.unit}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['confirmed', 'ready', 'completed', 'canceled'] as MarketplaceOrder['status'][]).map((status) => (
                    <Button key={status} size="sm" variant={order.status === status ? 'primary' : 'secondary'} onClick={() => void updateOrderStatus(order.id, status)}>
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-elevated rounded-[22px] p-6">
          <h2 className="text-lg font-semibold text-[#1C1C1E]">Sourcing inquiries</h2>
          <div className="mt-5 space-y-3">
            {inquiries.length === 0 ? (
              <p className="text-sm text-[#8E8E93]">No institutional sourcing inquiries yet.</p>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="rounded-[18px] border border-[rgba(0,0,0,0.06)] p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-[#1C1C1E]">{inquiry.organizationName}</p>
                    <Badge variant="blue">{inquiry.buyerType}</Badge>
                    <Badge>{inquiry.volumeTier}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[#48484A]">{inquiry.contactName} · {inquiry.email}</p>
                  <p className="mt-2 text-sm text-[#48484A]">{inquiry.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="surface-elevated rounded-[22px] p-6">
          <h2 className="text-lg font-semibold text-[#1C1C1E]">Commission ledger</h2>
          <div className="mt-5 space-y-3">
            {commissions.length === 0 ? (
              <p className="text-sm text-[#8E8E93]">No commission entries yet.</p>
            ) : (
              commissions.map((entry) => (
                <div key={entry.id} className="rounded-[18px] border border-[rgba(0,0,0,0.06)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1C1C1E]">Order {entry.orderId}</p>
                      <p className="mt-1 text-xs text-[#8E8E93]">{entry.ratePct}% rate · {entry.status}</p>
                    </div>
                    <p className="text-lg font-semibold text-[#1C1C1E]">${entry.commissionAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

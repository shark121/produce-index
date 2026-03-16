'use client'

import { useState } from 'react'
import { CircleDollarSign, PackageCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MarketplaceDeliveryZone, MarketplacePickupLocation } from '@/lib/types'

interface ReserveOrderCardProps {
  listingId: string
  listingTitle: string
  farmName: string
  pricePerUnit: number
  unit: string
  minimumOrderQuantity: number
  pickupLocations: MarketplacePickupLocation[]
  deliveryZones: MarketplaceDeliveryZone[]
}

export function ReserveOrderCard({
  listingId,
  listingTitle,
  farmName,
  pricePerUnit,
  unit,
  minimumOrderQuantity,
  pickupLocations,
  deliveryZones,
}: ReserveOrderCardProps) {
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')
  const [quantity, setQuantity] = useState(String(minimumOrderQuantity))
  const [notes, setNotes] = useState('')
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>(deliveryZones.length > 0 ? 'delivery' : 'pickup')
  const [pickupLocationId, setPickupLocationId] = useState(pickupLocations[0]?.id ?? '')
  const [deliveryZoneId, setDeliveryZoneId] = useState(deliveryZones[0]?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submitReservation() {
    setSaving(true)
    setError(null)
    setSuccess(null)

    const response = await fetch('/api/marketplace/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyerType: 'individual',
        buyerName,
        buyerEmail,
        buyerPhone,
        fulfillmentMethod,
        pickupLocationId: fulfillmentMethod === 'pickup' ? pickupLocationId : null,
        deliveryZoneId: fulfillmentMethod === 'delivery' ? deliveryZoneId : null,
        notes,
        items: [{ listingId, quantity: Number(quantity) || minimumOrderQuantity }],
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      setError(payload.error?.message ?? 'Unable to reserve produce right now.')
      setSaving(false)
      return
    }

    setSuccess(`Reservation recorded for ${listingTitle} from ${farmName}. Reference ${payload.data.referenceCode}. Payment happens offline at pickup or delivery.`)
    setSaving(false)
  }

  return (
    <div className="surface-elevated rounded-[20px] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1C1C1E]">Reserve for community pickup or delivery</p>
          <p className="mt-1 text-sm leading-relaxed text-[#48484A]">
            Reserve directly from {farmName}. Payment is collected offline when the order is fulfilled.
          </p>
        </div>
        <div className="rounded-[14px] bg-[rgba(52,199,89,0.10)] px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.14em] text-[#8E8E93]">Price</p>
          <p className="mt-1 text-lg font-semibold text-[#1C1C1E]">${pricePerUnit.toFixed(2)} / {unit}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input
          value={buyerName}
          onChange={(event) => setBuyerName(event.target.value)}
          placeholder="Your name"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        />
        <input
          value={buyerEmail}
          onChange={(event) => setBuyerEmail(event.target.value)}
          placeholder="Email"
          type="email"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        />
        <input
          value={buyerPhone}
          onChange={(event) => setBuyerPhone(event.target.value)}
          placeholder="Phone"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        />
        <input
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          min={minimumOrderQuantity}
          type="number"
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <select
          value={fulfillmentMethod}
          onChange={(event) => setFulfillmentMethod(event.target.value as 'pickup' | 'delivery')}
          className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
        >
          {pickupLocations.length > 0 && <option value="pickup">Pickup</option>}
          {deliveryZones.length > 0 && <option value="delivery">Delivery</option>}
        </select>

        {fulfillmentMethod === 'pickup' ? (
          <select
            value={pickupLocationId}
            onChange={(event) => setPickupLocationId(event.target.value)}
            className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
          >
            {pickupLocations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={deliveryZoneId}
            onChange={(event) => setDeliveryZoneId(event.target.value)}
            className="h-11 rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
          >
            {deliveryZones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <textarea
        rows={3}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Notes for the farm"
        className="mt-4 w-full rounded-[12px] border border-[rgba(0,0,0,0.10)] bg-white px-3.5 py-2.5 text-sm text-[#1C1C1E] outline-none focus:border-[#34C759]"
      />

      <div className="mt-4 rounded-[16px] bg-[rgba(0,122,255,0.06)] p-4 text-sm text-[#48484A]">
        <div className="flex items-start gap-3">
          <CircleDollarSign className="mt-0.5 h-4 w-4 shrink-0 text-[#007AFF]" />
          <p>Offline payment only in v1. PRI records the reservation and the farm collects payment when you pick up or receive the order.</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-[#8E8E93]">
          Minimum order: {minimumOrderQuantity} {unit}
        </p>
        <Button onClick={() => void submitReservation()} disabled={saving}>
          <PackageCheck className="h-4 w-4" />
          {saving ? 'Saving...' : 'Reserve produce'}
        </Button>
      </div>

      {success && <p className="mt-4 text-sm text-[#1A7A32]">{success}</p>}
      {error && <p className="mt-4 text-sm text-[#FF3B30]">{error}</p>}
    </div>
  )
}

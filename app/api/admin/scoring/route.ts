import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_WEIGHTS } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()
  // TODO: fetch from admin_config table; fall back to defaults
  return NextResponse.json({ data: DEFAULT_WEIGHTS, error: null })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const body = await request.json()
  const { nutritionalValue, foodSafety, supplyReliability, localAccessibility, affordability } = body

  const total = nutritionalValue + foodSafety + supplyReliability + localAccessibility + affordability
  if (Math.abs(total - 1) > 0.001) {
    return NextResponse.json(
      { data: null, error: { message: 'Weights must sum to 1.0' } },
      { status: 400 },
    )
  }

  // TODO: insert new version row into admin_config table
  const newVersion = {
    nutritionalValue,
    foodSafety,
    supplyReliability,
    localAccessibility,
    affordability,
    version: `v${Date.now()}`,
  }

  return NextResponse.json({ data: newVersion, error: null })
}

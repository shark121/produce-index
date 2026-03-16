import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_SCORING_CONFIG, getCurrentScoringConfig } from '@/lib/scoring-config'

export async function GET() {
  const supabase = await createClient()
  const config = await getCurrentScoringConfig(supabase)
  return NextResponse.json({ data: config, error: null })
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
  const currentConfig = await getCurrentScoringConfig(supabase)
  const newVersion = {
    weights: {
      nutritionalValue,
      foodSafety,
      supplyReliability,
      localAccessibility,
      affordability,
      version: `v${Date.now()}`,
    },
    benchmarkVersion: currentConfig.benchmarkVersion ?? DEFAULT_SCORING_CONFIG.benchmarkVersion,
    benchmarkSource: currentConfig.benchmarkSource ?? DEFAULT_SCORING_CONFIG.benchmarkSource,
    reviewMethod: currentConfig.reviewMethod ?? DEFAULT_SCORING_CONFIG.reviewMethod,
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json({ data: newVersion, error: null })
}

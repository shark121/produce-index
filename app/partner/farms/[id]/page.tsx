import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ScoreRing } from '@/components/ui/score-ring'
import { Badge } from '@/components/ui/badge'
import { VerificationStatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { MapPin, Sprout, Handshake, Truck } from 'lucide-react'
import { getFarmById, getScoreForFarm, getCropsForFarm, getDistributionForFarm } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'Farm Scorecard' }

interface Props { params: Promise<{ id: string }> }

const CATEGORIES = [
  { key: 'nutritionalValue' as const,   label: 'Nutritional Value',   weight: 30, color: '#34C759' },
  { key: 'foodSafety' as const,         label: 'Food Safety',         weight: 20, color: '#007AFF' },
  { key: 'supplyReliability' as const,  label: 'Supply Reliability',  weight: 20, color: '#AF52DE' },
  { key: 'localAccessibility' as const, label: 'Local Accessibility', weight: 15, color: '#FF9500' },
  { key: 'affordability' as const,      label: 'Affordability',       weight: 15, color: '#FF3B30' },
]


const distTypeLabel: Record<string, string> = {
  farmers_market: 'Farmers Market', grocery: 'Grocery', food_bank: 'Food Bank',
  restaurant: 'Restaurant', csa: 'CSA', wholesale: 'Wholesale', direct_consumer: 'Direct',
}

export default async function FarmScorecardPage({ params }: Props) {
  const { id } = await params

  const farm = MOCK_MODE ? getFarmById(id) : null
  const score = MOCK_MODE ? getScoreForFarm(id) : null
  const crops = MOCK_MODE ? getCropsForFarm(id) : []
  const distribution = MOCK_MODE ? getDistributionForFarm(id) : []

  if (!farm || !score) notFound()

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="surface-elevated rounded-[24px] p-6 flex items-start justify-between gap-6 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1C1C1E]">{farm.name}</h1>
            <VerificationStatusBadge status={score.verificationStatus} />
          </div>
          <p className="flex items-center gap-1 text-sm text-[#8E8E93]">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {farm.city}, {farm.state} · {farm.region}
          </p>
          <p className="mt-3 text-sm text-[#48484A] leading-relaxed max-w-xl">{farm.description}</p>
          <div className="mt-3 flex items-center gap-4 text-xs text-[#8E8E93]">
            <span>{farm.acreageTilled} acres tilled</span>
            <span>{farm.yearsInOperation} years in operation</span>
          </div>
        </div>
        <ScoreRing score={score.overallScore} size="lg" />
      </div>

      {/* Score breakdown */}
      <div>
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Score breakdown</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {CATEGORIES.map(({ key, label, weight, color }) => {
            const sub = score[key]
            return (
              <div key={key} className="surface-elevated rounded-[12px] p-4">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium text-[#1C1C1E]">{label}</span>
                  </div>
                  <span className="text-sm font-bold text-[#1C1C1E]">{sub.toFixed(1)}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[rgba(0,0,0,0.06)]">
                  <div className="h-full rounded-full" style={{ width: `${sub}%`, backgroundColor: color }} />
                </div>
                <p className="text-xs text-[#8E8E93] mt-1">{weight}% of score</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Crops */}
      <div className="surface-elevated rounded-[16px] p-5">
        <h2 className="text-sm font-semibold text-[#1C1C1E] mb-3">Crops grown</h2>
        <div className="flex flex-wrap gap-2">
          {crops.map((c) => (
            <Badge key={c.id} variant="green">
              <Sprout className="h-2.5 w-2.5" />
              {c.name}
              {c.certifications.length > 0 && (
                <span className="opacity-70"> · {c.certifications[0]}</span>
              )}
            </Badge>
          ))}
        </div>
      </div>

      {/* Distribution */}
      <div className="surface-elevated rounded-[16px] p-5">
        <h2 className="text-sm font-semibold text-[#1C1C1E] mb-3">Distribution channels</h2>
        <div className="space-y-2">
          {distribution.map((d) => (
            <div key={d.id} className="flex items-center justify-between py-1.5 border-b border-[rgba(0,0,0,0.05)] last:border-0">
              <div className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-[#8E8E93]" />
                <span className="text-sm text-[#1C1C1E]">{d.name}</span>
                {d.servesLowIncomeArea && <Badge variant="blue">Low-income area</Badge>}
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8E8E93]">
                <span>{distTypeLabel[d.type] ?? d.type}</span>
                <span>{d.distanceMiles} mi</span>
                <span className="font-medium text-[#1C1C1E]">{d.percentageOfSales}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interest CTA */}
      <div className="surface-elevated rounded-[16px] p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#1C1C1E]">Interested in working together?</p>
          <p className="text-xs text-[#8E8E93] mt-0.5">Express interest and our team will facilitate an introduction.</p>
        </div>
        <Button size="sm" variant="blue">
          <Handshake className="h-3.5 w-3.5" /> Express Interest
        </Button>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SubmissionStatusBadge } from '@/components/ui/status-badge'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { ReviewPanel } from './review-panel'
import { getCropsForFarm, getFarmById, getSubmissionById } from '@/lib/mock'
import { createClient } from '@/lib/supabase/server'
import { getAutoScoringContext, rerunAutoScoring } from '@/lib/submission-scoring-store'
import { MapPin, Sprout } from 'lucide-react'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'Review Submission' }

interface Props { params: Promise<{ id: string }> }


export default async function ReviewSubmissionPage({ params }: Props) {
  const { id } = await params

  const submission = MOCK_MODE ? getSubmissionById(id) : null
  const farm = MOCK_MODE && submission ? getFarmById(submission.farmId) : null
  const crops = MOCK_MODE && submission ? getCropsForFarm(submission.farmId) : []
  let reviewData = MOCK_MODE ? await getAutoScoringContext(id) : null

  if (!reviewData) {
    if (MOCK_MODE) {
      await rerunAutoScoring(id)
      reviewData = await getAutoScoringContext(id)
    } else {
      const supabase = await createClient()
      reviewData = await getAutoScoringContext(id, supabase as never)
      if (!reviewData?.run) {
        await rerunAutoScoring(id, supabase as never)
        reviewData = await getAutoScoringContext(id, supabase as never)
      }
    }
  }

  if (!submission || !farm) notFound()

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="surface-elevated rounded-[20px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-[#1C1C1E]">{farm.name}</h1>
              <SubmissionStatusBadge status={submission.status} />
            </div>
            <p className="flex items-center gap-1 text-sm text-[#8E8E93]">
              <MapPin className="h-3.5 w-3.5" /> {farm.city}, {farm.state} · {farm.region}
            </p>
          </div>
          <div className="text-xs text-[#8E8E93] sm:text-right">
            <p>Submitted {formatDateTime(submission.submittedAt!)}</p>
            <p>ID: {id}</p>
          </div>
        </div>
        <p className="text-sm text-[#48484A] mb-3">{farm.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {crops.map(c => (
            <Badge key={c.id} variant="green">
              <Sprout className="h-2.5 w-2.5" /> {c.name}
            </Badge>
          ))}
        </div>
      </div>

      <ReviewPanel
        submissionId={id}
        initialRun={reviewData?.run ?? null}
        initialAssets={reviewData?.evidenceAssets ?? []}
        initialExtractions={reviewData?.evidenceExtractions ?? []}
      />
    </div>
  )
}

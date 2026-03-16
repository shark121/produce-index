import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { SubmissionStatusBadge } from '@/components/ui/status-badge'
import { formatDateTime } from '@/lib/utils'
import { Upload, FileText } from 'lucide-react'
import { MOCK_SUBMISSIONS, getCropsForFarm } from '@/lib/mock'

export const metadata: Metadata = { title: 'Submission' }

interface Props { params: Promise<{ id: string }> }

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

const CATEGORIES = ['Nutritional Value', 'Food Safety', 'Supply Reliability', 'Local Accessibility', 'Affordability']

export default async function SubmissionDetailPage({ params }: Props) {
  const { id } = await params

  const submission = MOCK_MODE
    ? MOCK_SUBMISSIONS.find((s) => s.id === id) ?? null
    : null

  if (!submission) notFound()

  const crops = MOCK_MODE ? getCropsForFarm(submission.farmId) : []

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-[#1C1C1E]">Submission</h1>
            <SubmissionStatusBadge status={submission.status} />
          </div>
          <p className="text-sm text-[#8E8E93]">
            Created {formatDateTime(submission.createdAt)}
          </p>
        </div>
        {submission.status === 'draft' && (
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/farmer/submissions/${id}/evidence`}>
              <Upload className="h-3.5 w-3.5" /> Manage evidence
            </Link>
          </Button>
        )}
      </div>

      {/* Admin notes */}
      {submission.status === 'needs_changes' && submission.adminNotes && (
        <div className="rounded-[12px] bg-[rgba(255,59,48,0.08)] border border-[rgba(255,59,48,0.15)] p-4">
          <p className="text-sm font-medium text-[#FF3B30] mb-1">Changes requested by reviewer</p>
          <p className="text-sm text-[#48484A]">{submission.adminNotes}</p>
        </div>
      )}

      {/* Verified banner */}
      {submission.status === 'verified' && (
        <div className="rounded-[12px] bg-[rgba(52,199,89,0.08)] border border-[rgba(52,199,89,0.20)] p-4 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#34C759] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A7A32]">Verified</p>
            <p className="text-xs text-[#48484A]">
              Verified {formatDateTime(submission.verifiedAt!)} · Score published to partner directory
            </p>
          </div>
        </div>
      )}

      {/* Evidence by category */}
      <div className="surface-elevated rounded-[20px] p-6">
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-4">Evidence by category</h2>
        <div className="space-y-3">
          {CATEGORIES.map((cat, i) => {
            const count = submission.status === 'verified' ? [2, 1, 2, 1, 1][i] : [1, 0, 1, 0, 0][i]
            return (
              <div key={cat} className="flex items-center justify-between py-2 border-b border-[rgba(0,0,0,0.05)] last:border-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-[#8E8E93]" />
                  <span className="text-sm text-[#1C1C1E]">{cat}</span>
                </div>
                {count > 0 ? (
                  <span className="text-xs bg-[rgba(52,199,89,0.10)] text-[#1A7A32] px-2 py-0.5 rounded-full font-medium">
                    {count} file{count > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-xs text-[#FF9500]">No evidence</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      {submission.status === 'draft' && (
        <div className="surface-elevated rounded-[16px] p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#1C1C1E]">Ready to submit?</p>
            <p className="text-xs text-[#8E8E93] mt-0.5">Once submitted, moves to admin review queue.</p>
          </div>
          <Button size="sm">Submit for Review</Button>
        </div>
      )}
    </div>
  )
}

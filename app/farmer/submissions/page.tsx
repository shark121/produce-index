import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SubmissionStatusBadge } from '@/components/ui/status-badge'
import { formatDateTime } from '@/lib/utils'
import { getSubmissionsForFarm } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'Submissions' }


export default async function SubmissionsPage() {
  const submissions = MOCK_MODE ? getSubmissionsForFarm('farm-1') : []

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1C1C1E]">Submissions</h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            Each submission is a snapshot of your farm data reviewed for scoring.
          </p>
        </div>
        <Button size="sm" className="self-start shrink-0" asChild>
          <Link href="/farmer/submissions/new">
            <Plus className="h-3.5 w-3.5" /> New submission
          </Link>
        </Button>
      </div>

      {submissions.length === 0 ? (
        <div className="surface-elevated rounded-[16px] p-12 text-center">
          <p className="text-sm text-[#8E8E93] mb-4">No submissions yet.</p>
          <Button asChild><Link href="/farmer/submissions/new">Start your first submission</Link></Button>
        </div>
      ) : (
        <div className="space-y-2">
          {submissions.map((s) => (
            <Link
              key={s.id}
              href={`/farmer/submissions/${s.id}`}
              className="surface-elevated rounded-[12px] px-5 py-4 flex items-center justify-between group hover:border-[rgba(52,199,89,0.30)] transition-colors"
            >
              <div className="flex items-center gap-3">
                <SubmissionStatusBadge status={s.status} />
                <span className="text-sm text-[#8E8E93]">
                  Updated {formatDateTime(s.updatedAt)}
                </span>
              </div>
              <span className="text-xs text-[#C7C7CC] group-hover:text-[#34C759] transition-colors">
                View →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

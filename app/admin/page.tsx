import type { Metadata } from 'next'
import Link from 'next/link'
import { SubmissionStatusBadge } from '@/components/ui/status-badge'
import { formatDateTime } from '@/lib/utils'
import { getAdminQueue, MOCK_SUBMISSIONS } from '@/lib/mock'

import { isMockMode } from '@/lib/is-mock-mode'
const MOCK_MODE = isMockMode()

export const metadata: Metadata = { title: 'Review Queue' }


export default async function AdminQueuePage() {
  const queue = MOCK_MODE ? getAdminQueue() : []
  const allSubmissions = MOCK_MODE ? MOCK_SUBMISSIONS : []

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Review Queue</h1>
        <p className="text-sm text-[#8E8E93] mt-1">Submissions awaiting review, oldest first.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Awaiting review', value: allSubmissions.filter(s => s.status === 'submitted').length,    color: '#007AFF' },
          { label: 'In review',       value: allSubmissions.filter(s => s.status === 'under_review').length, color: '#FF9500' },
          { label: 'Verified total',  value: allSubmissions.filter(s => s.status === 'verified').length,     color: '#34C759' },
          { label: 'Queue total',     value: queue.length,                                                    color: '#1C1C1E' },
        ].map(({ label, value, color }) => (
          <div key={label} className="surface-elevated rounded-[12px] px-4 py-4">
            <p className="text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-xs text-[#8E8E93] mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {queue.length === 0 ? (
        <div className="surface-elevated rounded-[20px] p-12 text-center">
          <p className="text-sm text-[#8E8E93]">Queue is empty. No pending submissions.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {queue.map((item) => (
            <Link
              key={item.id}
              href={`/admin/queue/${item.id}`}
              className="surface-elevated rounded-[12px] px-4 sm:px-5 py-4 flex items-center justify-between group hover:border-[rgba(0,122,255,0.30)] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <SubmissionStatusBadge status={item.status} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1C1C1E] truncate">{item.farmName}</p>
                  <p className="text-xs text-[#8E8E93] truncate">
                    Submitted {formatDateTime(item.submittedAt!)}
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#C7C7CC] group-hover:text-[#007AFF] transition-colors shrink-0 ml-2">Review →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

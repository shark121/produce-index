import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SubmissionStatusBadge } from '@/components/ui/status-badge'
import { ScoreRing } from '@/components/ui/score-ring'
import { ArrowRight, Plus } from 'lucide-react'
import {
  MOCK_USERS,
  MOCK_FARMS,
  getLatestSubmissionForFarm,
  getScoreForFarm,
} from '@/lib/mock'

export const metadata: Metadata = { title: 'Dashboard' }

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true'

export default async function FarmerDashboardPage() {
  const user = MOCK_USERS.farmer
  const farm = MOCK_MODE ? MOCK_FARMS[0] : null
  const latestSubmission = MOCK_MODE ? getLatestSubmissionForFarm('farm-1') : null
  const latestScore = MOCK_MODE ? getScoreForFarm('farm-1') : null

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">
          {farm ? farm.name : 'Welcome to PRI'}
        </h1>
        <p className="text-sm text-[#8E8E93] mt-1">Hello, {user.fullName}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Score card */}
        <Card>
          <CardHeader><CardTitle>PRI Score</CardTitle></CardHeader>
          <CardContent>
            {latestScore ? (
              <div className="flex flex-col items-center gap-3">
                <ScoreRing score={latestScore.overallScore} size="md" />
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/farmer/score">Full breakdown →</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[#8E8E93]">No verified score yet</p>
                <Button size="sm" asChild><Link href="/farmer/submissions/new">Start submission</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest submission */}
        <Card>
          <CardHeader><CardTitle>Latest Submission</CardTitle></CardHeader>
          <CardContent>
            {latestSubmission ? (
              <div className="space-y-2">
                <SubmissionStatusBadge status={latestSubmission.status} />
                <p className="text-xs text-[#8E8E93]">
                  Updated {new Date(latestSubmission.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                {latestSubmission.status === 'needs_changes' && latestSubmission.adminNotes && (
                  <p className="text-xs text-[#FF3B30] bg-[rgba(255,59,48,0.08)] rounded-[6px] px-2 py-1">
                    {latestSubmission.adminNotes.slice(0, 80)}…
                  </p>
                )}
                <Button size="sm" variant="secondary" asChild>
                  <Link href={`/farmer/submissions/${latestSubmission.id}`}>View</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[#8E8E93]">No submissions yet</p>
                <Button size="sm" asChild>
                  <Link href="/farmer/submissions/new"><Plus className="h-3.5 w-3.5" /> New submission</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Farm profile */}
        <Card>
          <CardHeader><CardTitle>Farm Profile</CardTitle></CardHeader>
          <CardContent>
            {farm ? (
              <div className="space-y-2">
                <p className="text-sm text-[#34C759] font-medium">Profile complete</p>
                <p className="text-xs text-[#8E8E93]">{farm.acreageTilled} ac · {farm.city}, {farm.state}</p>
                <Button size="sm" variant="secondary" asChild>
                  <Link href="/farmer/farm">Edit profile</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-[#FF9500]">Profile incomplete</p>
                <Button size="sm" asChild><Link href="/farmer/farm">Set up profile</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-[#1C1C1E] mb-3">Quick actions</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            { href: '/farmer/submissions/new',  label: 'Start a new PRI submission',   desc: 'Submit farm data and evidence for scoring' },
            { href: '/farmer/recommendations',  label: 'View recommendations',          desc: 'See what to improve in your score' },
            { href: '/farmer/farm/crops',       label: 'Update crop profiles',          desc: 'Add new crops or edit existing ones' },
            { href: '/farmer/score',            label: 'Full score breakdown',          desc: 'See your category subscores in detail' },
          ].map(({ href, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="surface-elevated rounded-[12px] p-4 flex items-center justify-between group hover:border-[rgba(52,199,89,0.30)] transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-[#1C1C1E]">{label}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#C7C7CC] group-hover:text-[#34C759] transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

import { Badge } from './badge'
import type { SubmissionStatus, VerificationStatus } from '@/lib/types'

const submissionConfig: Record<SubmissionStatus, { label: string; variant: 'default' | 'green' | 'blue' | 'orange' | 'red' | 'purple' }> = {
  draft:          { label: 'Draft',          variant: 'default' },
  submitted:      { label: 'Submitted',      variant: 'blue' },
  under_review:   { label: 'Under Review',   variant: 'orange' },
  verified:       { label: 'Verified',       variant: 'green' },
  needs_changes:  { label: 'Needs Changes',  variant: 'red' },
}

const verificationConfig: Record<VerificationStatus, { label: string; variant: 'default' | 'green' | 'blue' | 'orange' | 'red' | 'purple' }> = {
  self_reported: { label: 'Self-reported', variant: 'default' },
  reviewed:      { label: 'Reviewed',      variant: 'blue' },
  verified:      { label: 'Verified',      variant: 'green' },
}

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  const { label, variant } = submissionConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  const { label, variant } = verificationConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}

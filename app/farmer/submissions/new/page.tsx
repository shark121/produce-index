import type { Metadata } from 'next'
import { NewSubmissionForm } from './new-submission-form'

export const metadata: Metadata = { title: 'New Submission' }

export default function NewSubmissionPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">New Submission</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          A submission locks a snapshot of your farm profile for admin review and scoring.
          Make sure your farm profile is complete before submitting.
        </p>
      </div>
      <NewSubmissionForm />
    </div>
  )
}

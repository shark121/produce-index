import type { Metadata } from 'next'
import { EvidenceUploader } from './evidence-uploader'

export const metadata: Metadata = { title: 'Upload Evidence' }

interface Props {
  params: Promise<{ id: string }>
}

export default async function EvidencePage({ params }: Props) {
  const { id } = await params

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-[#1C1C1E]">Upload Evidence</h1>
        <p className="text-sm text-[#8E8E93] mt-1">
          Attach supporting documents for each scoring category. Accepted: PDF, JPG, PNG (max 10 MB each).
        </p>
      </div>
      <EvidenceUploader submissionId={id} />
    </div>
  )
}

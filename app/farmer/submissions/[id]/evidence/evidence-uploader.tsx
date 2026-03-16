'use client'

import { useState, useRef } from 'react'
import { formatFileSize } from '@/lib/utils'
import type { EvidenceCategory } from '@/lib/types'
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react'

const CATEGORIES: { key: EvidenceCategory; label: string; color: string }[] = [
  { key: 'nutritional_value',   label: 'Nutritional Value',   color: '#34C759' },
  { key: 'food_safety',         label: 'Food Safety',         color: '#007AFF' },
  { key: 'supply_reliability',  label: 'Supply Reliability',  color: '#AF52DE' },
  { key: 'local_accessibility', label: 'Local Accessibility', color: '#FF9500' },
  { key: 'affordability',       label: 'Affordability',       color: '#FF3B30' },
]

interface UploadedFile {
  id: string
  name: string
  size: number
  category: EvidenceCategory
  status: 'uploading' | 'done' | 'error'
}

interface Props {
  submissionId: string
}

export function EvidenceUploader({ submissionId }: Props) {
  const [activeCategory, setActiveCategory] = useState<EvidenceCategory>('nutritional_value')
  const [files, setFiles] = useState<UploadedFile[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(selectedFiles: FileList) {
    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: f.size,
      category: activeCategory,
      status: 'uploading',
    }))

    setFiles((prev) => [...prev, ...newFiles])

    for (const file of Array.from(selectedFiles)) {
      const fileId = newFiles.find((f) => f.name === file.name)!.id
      const form = new FormData()
      form.append('file', file)
      form.append('category', activeCategory)
      form.append('submissionId', submissionId)

      try {
        const res = await fetch(`/api/submissions/${submissionId}/evidence`, {
          method: 'POST',
          body: form,
        })
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: res.ok ? 'done' : 'error' } : f)),
        )
      } catch {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'error' } : f)),
        )
      }
    }
  }

  const categoryFiles = files.filter((f) => f.category === activeCategory)

  return (
    <div className="space-y-5">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ key, label, color }) => {
          const count = files.filter((f) => f.category === key && f.status === 'done').length
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-[10px] text-sm font-medium transition-all ${
                activeCategory === key
                  ? 'bg-white shadow-sm border border-[rgba(0,0,0,0.10)] text-[#1C1C1E]'
                  : 'text-[#48484A] hover:bg-[rgba(0,0,0,0.04)]'
              }`}
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              {label}
              {count > 0 && (
                <span className="text-xs bg-[rgba(52,199,89,0.15)] text-[#1A7A32] px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Drop zone */}
      <div
        className="surface-elevated rounded-[16px] border-2 border-dashed border-[rgba(0,0,0,0.10)] p-6 md:p-10 text-center cursor-pointer hover:border-[#34C759] transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[rgba(52,199,89,0.10)] mx-auto mb-3">
          <Upload className="h-6 w-6 text-[#34C759]" />
        </div>
        <p className="text-sm font-medium text-[#1C1C1E]">
          Click or drag files here
        </p>
        <p className="text-xs text-[#8E8E93] mt-1">PDF, JPG, PNG — up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* File list for active category */}
      {categoryFiles.length > 0 && (
        <div className="space-y-2">
          {categoryFiles.map((file) => (
            <div
              key={file.id}
              className="surface-elevated rounded-[10px] px-4 py-3 flex items-center gap-3"
            >
              <FileText className="h-4 w-4 text-[#8E8E93] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1C1C1E] truncate">{file.name}</p>
                <p className="text-xs text-[#8E8E93]">{formatFileSize(file.size)}</p>
              </div>
              {file.status === 'uploading' && (
                <span className="text-xs text-[#8E8E93]">Uploading…</span>
              )}
              {file.status === 'done' && (
                <CheckCircle2 className="h-4 w-4 text-[#34C759]" />
              )}
              {file.status === 'error' && (
                <span className="text-xs text-[#FF3B30]">Failed</span>
              )}
              <button
                onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                className="text-[#C7C7CC] hover:text-[#FF3B30] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

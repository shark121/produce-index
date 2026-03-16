import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { EvidenceCategory, EvidenceAssetType } from '@/lib/types'

interface Context { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  const { data, error } = await supabase
    .from('evidence_assets')
    .select('*')
    .eq('submission_id', id)
    .order('uploaded_at', { ascending: false })

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data, error: null })
}

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export async function POST(request: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const form = await request.formData()
  const file = form.get('file') as File | null
  const category = form.get('category') as EvidenceCategory | null

  if (!file || !category) {
    return NextResponse.json({ data: null, error: { message: 'file and category are required' } }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ data: null, error: { message: 'File exceeds 10 MB limit' } }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ data: null, error: { message: 'Only PDF, JPG, and PNG are accepted' } }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const storageKey = `evidence/${id}/${category}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('evidence')
    .upload(storageKey, file, { contentType: file.type })

  if (uploadError) {
    return NextResponse.json({ data: null, error: { message: uploadError.message } }, { status: 500 })
  }

  const assetType: EvidenceAssetType =
    file.type === 'application/pdf' ? 'certification' :
    file.name.toLowerCase().includes('test') ? 'lab_test_result' :
    'photo'

  const { data, error } = await supabase
    .from('evidence_assets')
    .insert({
      submission_id: id,
      category,
      type: assetType,
      file_name: file.name,
      storage_key: storageKey,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ data: null, error: { message: error.message } }, { status: 500 })
  return NextResponse.json({ data, error: null }, { status: 201 })
}

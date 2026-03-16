import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Context { params: Promise<{ id: string }> }

/**
 * GET /api/evidence/[id]
 * Returns a short-lived signed URL for the file.
 */
export async function GET(_req: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized' } }, { status: 401 })

  const { data: asset, error: assetError } = await supabase
    .from('evidence_assets')
    .select('storage_key, submission_id')
    .eq('id', id)
    .single()

  if (assetError || !asset) {
    return NextResponse.json({ data: null, error: { message: 'Evidence not found' } }, { status: 404 })
  }

  const { data: signedUrl, error: urlError } = await supabase.storage
    .from('evidence')
    .createSignedUrl(asset.storage_key, 300) // 5 min TTL

  if (urlError) return NextResponse.json({ data: null, error: { message: urlError.message } }, { status: 500 })
  return NextResponse.json({ data: { signedUrl: signedUrl.signedUrl }, error: null })
}

/**
 * DELETE /api/evidence/[id]
 * Deletes evidence only if submission is still in draft state.
 */
export async function DELETE(_req: Request, { params }: Context) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role !== 'farmer') {
    return NextResponse.json({ data: null, error: { message: 'Forbidden' } }, { status: 403 })
  }

  const { data: asset } = await supabase
    .from('evidence_assets')
    .select('storage_key, submission_id')
    .eq('id', id)
    .single()

  if (!asset) {
    return NextResponse.json({ data: null, error: { message: 'Not found' } }, { status: 404 })
  }

  // Only allow deletion on draft submissions
  const { data: submission } = await supabase
    .from('pri_submissions')
    .select('status')
    .eq('id', asset.submission_id)
    .single()

  if (submission?.status !== 'draft') {
    return NextResponse.json(
      { data: null, error: { message: 'Evidence can only be deleted while submission is in draft' } },
      { status: 409 },
    )
  }

  await supabase.storage.from('evidence').remove([asset.storage_key])
  await supabase.from('evidence_assets').delete().eq('id', id)

  return NextResponse.json({ data: { deleted: true }, error: null })
}

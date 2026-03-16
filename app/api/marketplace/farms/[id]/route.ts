import { NextResponse } from 'next/server'
import { getMarketplaceFarmStoreById } from '@/lib/marketplace-server'
import { isMockMode } from '@/lib/is-mock-mode'

interface Context {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params

  if (!isMockMode()) {
    return NextResponse.json({ data: null, error: { message: 'Marketplace farm API is using demo data only right now' } }, { status: 501 })
  }

  const farmStore = getMarketplaceFarmStoreById(id)
  if (!farmStore) {
    return NextResponse.json({ data: null, error: { message: 'Marketplace farm not found' } }, { status: 404 })
  }

  return NextResponse.json({ data: farmStore, error: null })
}

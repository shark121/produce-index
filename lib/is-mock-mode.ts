/**
 * Returns true when:
 * - NEXT_PUBLIC_MOCK_MODE is explicitly set to "true", OR
 * - Supabase env vars are missing or still placeholder (not yet configured)
 *
 * This means the app runs safely on Vercel even before real API keys are added.
 */
export function isMockMode(): boolean {
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  return !url || !key || url.includes('placeholder') || key.includes('placeholder')
}

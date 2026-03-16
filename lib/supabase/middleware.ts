import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isMockMode } from '@/lib/is-mock-mode'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export async function updateSession(request: NextRequest) {
  // Pass through when mock mode is on or Supabase is not configured
  if (isMockMode()) { // no Supabase configured — pass through
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/how-it-works', '/for-farmers', '/for-partners', '/for-institutions', '/apply']
  const authPaths = ['/auth/login', '/auth/register', '/auth/callback']

  if (
    publicPaths.some((p) => pathname === p) ||
    pathname === '/marketplace' ||
    pathname.startsWith('/marketplace/') ||
    authPaths.some((p) => pathname.startsWith(p))
  ) {
    return supabaseResponse
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  const role = user.user_metadata?.role as string | undefined
  if (pathname.startsWith('/farmer') && role !== 'farmer') return NextResponse.redirect(new URL('/auth/login', request.url))
  if (pathname.startsWith('/partner') && role !== 'partner') return NextResponse.redirect(new URL('/auth/login', request.url))
  if (pathname.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/auth/login', request.url))

  return supabaseResponse
}

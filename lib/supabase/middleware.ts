import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // ── Mock mode: skip all auth checks ──────────────────────────────────────
  if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true') {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/how-it-works', '/for-farmers', '/for-partners', '/apply']
  const authPaths = ['/auth/login', '/auth/register', '/auth/callback']

  if (publicPaths.some((p) => pathname === p) || authPaths.some((p) => pathname.startsWith(p))) {
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

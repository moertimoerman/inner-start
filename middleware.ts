import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = pathname.startsWith('/app') || pathname.startsWith('/dashboard')
  const isLoginRoute = pathname.startsWith('/login')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (user && isLoginRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Lightweight A/B experiment assignment for homepage copy.
  if (!request.cookies.get('exp_home_copy')) {
    const variant = Math.random() < 0.5 ? 'A' : 'B'
    supabaseResponse.cookies.set('exp_home_copy', variant, {
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
      sameSite: 'lax',
    })
  }

  // Anonymous id for simple conversion tracking correlation.
  if (!request.cookies.get('exp_anon_id')) {
    const anonId = `anon_${Math.random().toString(36).slice(2)}`
    supabaseResponse.cookies.set('exp_anon_id', anonId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

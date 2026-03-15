import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fail-safe: never crash middleware if Supabase env is missing.
  // Public routes keep working; protected routes redirect to /login.
  if (!supabaseUrl || !supabaseAnonKey) {
    const pathname = request.nextUrl.pathname
    const isProtectedRoute = pathname.startsWith('/app') || pathname.startsWith('/dashboard')
    if (isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  let user: { id: string } | null = null
  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser ? { id: authUser.id } : null
  } catch (error) {
    console.error('MIDDLEWARE_SUPABASE_ERROR', error)
    // Keep middleware alive; treat as logged-out user.
    user = null
  }

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

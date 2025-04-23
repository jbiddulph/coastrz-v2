import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  // Add the request pathname to a header to use it in the layout
  res.headers.set('x-pathname', req.nextUrl.pathname)

  // Check if accessing a protected route (orders)
  if (req.nextUrl.pathname.startsWith('/orders')) {
    if (!session) {
      // Redirect to login page with return URL
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('returnUrl', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 
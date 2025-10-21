
import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Si no hay token y está intentando acceder a una ruta protegida
    if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/checkout'))) {
      const loginUrl = new URL('/auth/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Permitir acceso público a /admin/login
        if (pathname === '/admin/login') {
          return true
        }

        // Check if user is authenticated for protected routes
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        if (pathname.startsWith('/checkout')) {
          return !!token
        }
        if (pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checkout/:path*',
    // Admin routes use custom auth, not NextAuth
  ]
}

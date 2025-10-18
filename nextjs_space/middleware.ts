
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware logic here
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

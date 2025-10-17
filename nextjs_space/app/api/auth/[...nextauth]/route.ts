import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Protección adicional para build time
// Durante el build, Next.js puede intentar pre-renderizar esta ruta
// Esta protección asegura que no falle el build
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// Configuración de ruta dinámica para evitar static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

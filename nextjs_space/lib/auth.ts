
import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Detectar si estamos en build time para evitar conexiones a DB
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true'

export const authOptions: NextAuthOptions = {
  // Solo usar PrismaAdapter si NO estamos en build time
  // Durante el build, NextAuth no necesita el adaptador
  ...(isBuildTime ? {} : { adapter: PrismaAdapter(prisma) }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        phone: { label: 'Teléfono', type: 'tel' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        // Durante build time, no intentar conectar a la DB
        if (isBuildTime) {
          return null
        }

        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        try {
          // Por ahora, usar email como fallback si no hay usuario con teléfono
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: credentials.phone },
                { email: 'john@doe.com' } // Usuario de prueba
              ]
            }
          })

          if (!user) {
            return null
          }

          // Verificar contraseña (simplificado para MVP)
          if (credentials.password !== 'johndoe123') {
            return null
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email || '',
            phone: user.phone || undefined
          }
        } catch (error) {
          console.error('Error during authorization:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string
        session.user.phone = token.phone as string
      }
      return session
    }
  },
  // Agregar secret con valor por defecto para build time
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build-only-change-in-production'
}

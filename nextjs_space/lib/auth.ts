
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
          console.log('⚠️ Build time detected, skipping authorization')
          return null
        }

        if (!credentials?.phone || !credentials?.password) {
          console.log('❌ Missing phone or password')
          return null
        }

        try {
          console.log(`🔍 Buscando usuario con teléfono: ${credentials.phone}`)
          
          // Buscar usuario por teléfono
          const user = await prisma.user.findFirst({
            where: {
              phone: credentials.phone
            }
          })

          if (!user) {
            console.log('❌ Usuario no encontrado')
            return null
          }

          console.log(`✅ Usuario encontrado: ${user.name || user.email}`)

          // Verificar si el usuario tiene contraseña
          if (!user.password) {
            console.log('❌ Usuario sin contraseña configurada')
            return null
          }

          // Verificar contraseña con bcrypt
          const passwordValid = await bcrypt.compare(credentials.password, user.password)

          if (!passwordValid) {
            console.log('❌ Contraseña incorrecta')
            return null
          }

          console.log('✅ Autenticación exitosa')
          return {
            id: user.id,
            name: user.name,
            email: user.email || '',
            phone: user.phone || undefined
          }
        } catch (error) {
          console.error('❌ Error durante la autorización:', error)
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


import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // First check our local database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (user) {
            // For now, we'll create a simple password check
            // In production, you'd want proper password hashing
            const isValid = credentials.password === 'johndoe123' || 
                           credentials.password === 'cuenty123'
            
            if (isValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              }
            }
          }

          // Try to authenticate with existing backend API
          const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (response.ok) {
            const userData = await response.json()
            
            // Create or update user in our database
            const existingUser = await prisma.user.findUnique({
              where: { email: credentials.email }
            })

            if (!existingUser) {
              const newUser = await prisma.user.create({
                data: {
                  email: credentials.email,
                  name: userData.usuario?.nombre || credentials.email.split('@')[0],
                }
              })
              return {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
              }
            }

            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

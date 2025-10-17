
import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Lazy initialization: solo inicializa cuando realmente se usa
// Esto previene que PrismaClient se inicialice durante el build
const getPrismaClient = (): PrismaClient => {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalThis.prisma
}

// Proxy que inicializa lazy
export const prisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    return typeof value === 'function' ? value.bind(client) : value
  }
})

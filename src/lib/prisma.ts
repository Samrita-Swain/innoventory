import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a single instance of Prisma client with Vercel-optimized configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown - only in non-serverless environments
if (typeof window === 'undefined' && process.env.VERCEL !== '1') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}

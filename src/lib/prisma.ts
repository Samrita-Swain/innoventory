import { PrismaClient } from '@prisma/client'

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Get DATABASE_URL with fallback for build time
const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  // Fallback for build time when DATABASE_URL is not available
  // This won't be used at runtime, only during build
  return 'postgresql://build:build@localhost:5432/build'
}

// Create a single instance of Prisma client with Vercel-optimized configuration
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: getDatabaseUrl(),
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

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

// Check if we're in a runtime environment where database is required
const isDatabaseRequired = () => {
  // During build time, database is not required
  if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
    return false
  }
  return true
}

// Create a single instance of Prisma client with Vercel-optimized configuration
let prismaInstance: PrismaClient | null = null

try {
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  })
} catch (error) {
  console.warn('Failed to initialize Prisma client:', error)
  prismaInstance = null
}

export const prisma = prismaInstance

// Helper function to check database connectivity
export const isDatabaseConnected = async (): Promise<boolean> => {
  try {
    if (!process.env.DATABASE_URL || !prisma) {
      return false
    }
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

// In development, store the client on the global object to prevent multiple instances
if (process.env.NODE_ENV !== 'production' && prismaInstance) {
  globalForPrisma.prisma = prismaInstance
}

// Graceful shutdown - only in non-serverless environments
if (typeof window === 'undefined' && process.env.VERCEL !== '1' && prismaInstance) {
  process.on('beforeExit', async () => {
    await prismaInstance.$disconnect()
  })
}

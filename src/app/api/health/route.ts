import { NextRequest, NextResponse } from 'next/server'
import { isDatabaseConnected } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const dbConnected = await isDatabaseConnected()
    
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        connected: dbConnected,
        url_configured: !!process.env.DATABASE_URL
      },
      env_vars: {
        jwt_secret: !!process.env.JWT_SECRET,
        database_url: !!process.env.DATABASE_URL,
        nextauth_url: !!process.env.NEXTAUTH_URL,
        nextauth_secret: !!process.env.NEXTAUTH_SECRET
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma, isDatabaseConnected } from '@/lib/prisma'

// Demo users for backward compatibility
const demoUsers = [
  {
    id: '1',
    email: 'admin@innoventory.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    permissions: ['read', 'write', 'delete', 'manage_users', 'view_analytics']
  },
  {
    id: '2',
    email: 'subadmin@innoventory.com',
    password: 'subadmin123',
    name: 'Sub Admin User',
    role: 'sub_admin',
    isActive: true,
    permissions: ['read', 'write', 'view_analytics']
  }
]

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if database is available and try to find user
    const dbConnected = await isDatabaseConnected()
    let user = null

    if (dbConnected) {
      try {
        user = await prisma.user.findUnique({
          where: {
            id: payload.userId,
            isActive: true
          },
          include: {
            permissions: true
          }
        })
      } catch (dbError) {
        console.error('Database query failed in auth/me:', dbError)
        // Continue to demo user fallback
      }
    }

    if (user) {
      // Database user found - use real permissions
      const permissions = user.permissions.map(p => p.permission)
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: permissions
      })
    } else {
      // Fallback to demo users for backward compatibility
      const demoUser = demoUsers.find(u => u.id === payload.userId && u.isActive)

      if (!demoUser) {
        return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 })
      }

      // Return demo user data
      return NextResponse.json({
        id: demoUser.id,
        email: demoUser.email,
        name: demoUser.name,
        role: demoUser.role,
        permissions: demoUser.permissions
      })
    }

  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

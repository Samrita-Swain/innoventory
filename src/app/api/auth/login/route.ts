import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth'

// Demo users for backward compatibility
const demoUsers = [
  {
    id: '1',
    email: 'admin@innoventory.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    permissions: ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
  },
  {
    id: '2',
    email: 'subadmin@innoventory.com',
    password: 'subadmin123',
    name: 'Sub Admin User',
    role: 'sub_admin',
    isActive: true,
    permissions: ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
  }
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()
    let user = null

    if (dbConnected) {
      // Try to find user in database first
      try {
        user = await prisma.user.findUnique({
          where: { email },
          include: {
            permissions: true
          }
        })
      } catch (dbError) {
        console.error('Database query failed:', dbError)
        // Continue to demo user fallback
      }
    }

    if (user && user.isActive) {
      // Database user found - verify password
      const isValidPassword = await verifyPassword(password, user.password)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Extract permissions
      const permissions = user.permissions.map(p => p.permission)

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
          permissions: permissions
        },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '24h' }
      )

      // Return user data and token
      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: permissions
        },
        token
      })
    } else {
      // Fallback to demo users for backward compatibility
      const demoUser = demoUsers.find(u =>
        u.email === email && u.password === password && u.isActive
      )

      if (!demoUser) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          permissions: demoUser.permissions
        },
        process.env.JWT_SECRET || 'demo-secret-key',
        { expiresIn: '24h' }
      )

      // Return user data and token
      return NextResponse.json({
        user: {
          id: demoUser.id,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          permissions: demoUser.permissions
        },
        token
      })
    }

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

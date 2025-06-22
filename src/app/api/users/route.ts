import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import { verifyToken, hashPassword } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions - only admins can manage users
    if (!payload.permissions.includes('MANAGE_USERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Return empty array when database is not available
      console.log('Database not connected, returning empty users array')
      return NextResponse.json([])
    }

    try {
      const users = await prisma.user.findMany({
        where: {
          role: 'SUB_ADMIN'
        },
        include: {
          permissions: true
        },
        orderBy: { createdAt: 'desc' }
      })

      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        permissions: user.permissions.map(p => p.permission),
        createdAt: user.createdAt
      }))

      return NextResponse.json(formattedUsers)
    } catch (dbError) {
      console.error('Database query failed in users GET:', dbError)
      // Return empty array on database error
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions - only admins can create users
    if (!payload.permissions.includes('MANAGE_USERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse FormData
    const formData = await request.formData()
    console.log('Received form data keys:', Array.from(formData.keys()))

    // Extract form fields
    const subAdminOnboardingDate = formData.get('subAdminOnboardingDate') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const country = formData.get('country') as string
    const username = formData.get('username') as string
    const panNumber = formData.get('panNumber') as string
    const termOfWork = formData.get('termOfWork') as string
    const password = formData.get('password') as string
    const permissionsStr = formData.get('permissions') as string

    // Parse JSON fields
    let permissions: string[] = []

    try {
      if (permissionsStr) {
        permissions = JSON.parse(permissionsStr)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    // Validate required fields
    if (!name || !email || !password || !permissions || permissions.length === 0) {
      return NextResponse.json({
        error: 'Missing required fields: name, email, password, permissions'
      }, { status: 400 })
    }

    if (!country || !username) {
      return NextResponse.json({
        error: 'Missing required fields: country, username'
      }, { status: 400 })
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    try {
      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json({
          error: 'User with this email already exists'
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error('Database query failed in user email check:', dbError)
      return NextResponse.json({
        error: 'Database error. Please try again later.'
      }, { status: 503 })
    }

    // Handle file uploads (placeholder URLs for now)
    const tdsFileUrl = formData.get('tdsFile') ? 'placeholder-tds-file-url' : null
    const ndaFileUrl = formData.get('nda') ? 'placeholder-nda-file-url' : null
    const employmentAgreementUrl = formData.get('employmentAgreement') ? 'placeholder-employment-agreement-url' : null
    const panCardFileUrl = formData.get('panCard') ? 'placeholder-pan-card-file-url' : null

    // Hash password
    const hashedPassword = await hashPassword(password)

    console.log('Creating sub-admin with data:', {
      name,
      email,
      username,
      country,
      termOfWork
    })

    try {
      // Create user with all comprehensive fields
      const user = await prisma.user.create({
        data: {
          // Original fields
          name,
          email,
          password: hashedPassword,
          role: 'SUB_ADMIN',
          isActive: true,
          createdById: payload.userId,

          // New comprehensive fields
          subAdminOnboardingDate: subAdminOnboardingDate && subAdminOnboardingDate.trim() ? new Date(subAdminOnboardingDate) : null,
          address: address || null,
          city: city || null,
          state: state || null,
          country: country || null,
          username: username || null,
          panNumber: panNumber || null,
          termOfWork: termOfWork || null,

          // File URLs
          tdsFileUrl,
          ndaFileUrl,
          employmentAgreementUrl,
          panCardFileUrl,
          otherDocsUrls: [] // Placeholder for other documents
        }
      })

      // Create user permissions
      try {
        const permissionPromises = permissions.map((permission: string) =>
          prisma.userPermission.create({
            data: {
              userId: user.id,
              permission: permission as 'MANAGE_CUSTOMERS' | 'MANAGE_VENDORS' | 'MANAGE_ORDERS' | 'VIEW_ANALYTICS' | 'MANAGE_PAYMENTS' | 'VIEW_REPORTS'
            }
          })
        )

        await Promise.all(permissionPromises)
      } catch (permError) {
        console.error('Failed to create user permissions:', permError)
        // Continue even if permissions fail
      }

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'USER_CREATED',
            description: `Created new sub-admin: ${name}`,
            entityType: 'User',
            entityId: user.id,
            userId: payload.userId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      // Return user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json({
        ...userWithoutPassword,
        permissions
      }, { status: 201 })
    } catch (dbError) {
      console.error('Database error creating user:', dbError)
      return NextResponse.json({
        error: 'Failed to create user. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

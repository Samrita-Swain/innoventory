import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions - only admins can update users
    if (!payload.permissions.includes('MANAGE_USERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
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
    if (!name || !email || !permissions || permissions.length === 0) {
      return NextResponse.json({
        error: 'Missing required fields: name, email, permissions'
      }, { status: 400 })
    }

    if (!country || !username) {
      return NextResponse.json({
        error: 'Missing required fields: country, username'
      }, { status: 400 })
    }

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id },
        include: { permissions: true }
      })

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Check if email is being changed and if it already exists
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        })

        if (emailExists) {
          return NextResponse.json({
            error: 'User with this email already exists'
          }, { status: 409 })
        }
      }

      // Handle file uploads (placeholder URLs for now)
      const tdsFileUrl = formData.get('tdsFile') ? 'placeholder-tds-file-url' : existingUser.tdsFileUrl
      const ndaFileUrl = formData.get('nda') ? 'placeholder-nda-file-url' : existingUser.ndaFileUrl
      const employmentAgreementUrl = formData.get('employmentAgreement') ? 'placeholder-employment-agreement-url' : existingUser.employmentAgreementUrl
      const panCardFileUrl = formData.get('panCard') ? 'placeholder-pan-card-file-url' : existingUser.panCardFileUrl

      // Update user with all comprehensive fields
      const updatedUser = await prisma.user.update({
        where: { id: params.id },
        data: {
          // Basic fields
          name,
          email,
          
          // Comprehensive fields
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
          // Keep existing otherDocsUrls for now
        }
      })

      // Update user permissions
      try {
        // Delete existing permissions
        await prisma.userPermission.deleteMany({
          where: { userId: params.id }
        })

        // Create new permissions
        const permissionPromises = permissions.map((permission: string) =>
          prisma.userPermission.create({
            data: {
              userId: params.id,
              permission: permission as 'MANAGE_CUSTOMERS' | 'MANAGE_VENDORS' | 'MANAGE_ORDERS' | 'VIEW_ANALYTICS' | 'MANAGE_PAYMENTS' | 'VIEW_REPORTS'
            }
          })
        )

        await Promise.all(permissionPromises)
      } catch (permError) {
        console.error('Failed to update user permissions:', permError)
        // Continue even if permissions fail
      }

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'USER_UPDATED',
            description: `Updated sub-admin: ${name}`,
            entityType: 'User',
            entityId: updatedUser.id,
            userId: payload.userId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      // Return updated user without password
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = updatedUser
      return NextResponse.json({
        ...userWithoutPassword,
        permissions
      })

    } catch (dbError) {
      console.error('Database error updating user:', dbError)
      return NextResponse.json({
        error: 'Failed to update user. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check permissions - only admins can delete users
    if (!payload.permissions.includes('MANAGE_USERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: params.id }
      })

      if (!existingUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Delete user permissions first
      await prisma.userPermission.deleteMany({
        where: { userId: params.id }
      })

      // Delete user
      await prisma.user.delete({
        where: { id: params.id }
      })

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'USER_DELETED',
            description: `Deleted sub-admin: ${existingUser.name}`,
            entityType: 'User',
            entityId: params.id,
            userId: payload.userId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      return NextResponse.json({ message: 'User deleted successfully' })

    } catch (dbError) {
      console.error('Database error deleting user:', dbError)
      return NextResponse.json({
        error: 'Failed to delete user. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

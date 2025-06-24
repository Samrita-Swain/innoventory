import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token or handle demo token
    let payload
    if (token === 'demo-token') {
      // Handle demo authentication
      payload = {
        role: 'ADMIN',
        userId: 'demo-admin-id',
        email: 'admin@innoventory.com',
        name: 'John Admin',
        permissions: ['MANAGE_VENDORS', 'MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
      }
    } else {
      payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    // Check permissions
    if (!payload.permissions.includes('MANAGE_VENDORS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: vendorId } = await params

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json({
        error: 'Invalid JSON in request body',
        details: 'Request body must be valid JSON'
      }, { status: 400 })
    }

    const { rating } = body

    // Validate rating
    if (rating !== null && rating !== undefined) {
      if (typeof rating !== 'number' || rating < 0 || rating > 5) {
        return NextResponse.json({
          error: 'Invalid rating',
          details: 'Rating must be a number between 0 and 5'
        }, { status: 400 })
      }
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    try {
      // Check if vendor exists
      const existingVendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { id: true, name: true }
      })

      if (!existingVendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }

      // Update vendor rating
      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          rating: rating
        },
        include: {
          _count: {
            select: { orders: true }
          }
        }
      })

      // Log activity (only if we have a valid user ID)
      if (payload.userId !== 'demo-admin-id') {
        try {
          // Check if user exists before logging
          const userExists = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true }
          })

          if (userExists) {
            await prisma.activityLog.create({
              data: {
                action: 'VENDOR_RATING_UPDATED',
                description: `Updated rating for vendor: ${existingVendor.name} to ${rating}`,
                entityType: 'Vendor',
                entityId: vendorId,
                userId: payload.userId
              }
            })
          }
        } catch (logError) {
          console.error('Failed to log activity:', logError)
          // Continue even if logging fails
        }
      }

      return NextResponse.json(updatedVendor)
    } catch (dbError) {
      console.error('Database error updating vendor rating:', dbError)
      return NextResponse.json({
        error: 'Failed to update vendor rating. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Update vendor rating error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

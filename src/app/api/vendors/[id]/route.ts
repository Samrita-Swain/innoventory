import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function DELETE(
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

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    // Check if vendor exists and perform deletion
    try {
      const existingVendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      })

      if (!existingVendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }

      // Check if vendor has orders
      const orderCount = await prisma.order.count({
        where: { vendorId }
      })

      // Always permanently delete the vendor
      // First, we need to handle any related orders if they exist
      if (orderCount > 0) {
        // Option 1: Delete related orders first (cascade delete)
        await prisma.order.deleteMany({
          where: { vendorId }
        })
      }

      // Now delete the vendor
      await prisma.vendor.delete({
        where: { id: vendorId }
      })

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'VENDOR_DELETED',
            description: `Permanently deleted vendor: ${existingVendor.name}${orderCount > 0 ? ` (and ${orderCount} related orders)` : ''}`,
            entityType: 'Vendor',
            entityId: vendorId,
            userId: payload.userId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      return NextResponse.json({
        message: `Vendor deleted successfully${orderCount > 0 ? ` (${orderCount} related orders also deleted)` : ''}`
      })
    } catch (dbError) {
      console.error('Database error deleting vendor:', dbError)
      return NextResponse.json({
        error: 'Failed to delete vendor. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Delete vendor error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(
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

    const { id: vendorId } = await params

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: {
          _count: {
            select: { orders: true }
          },
          orders: {
            select: {
              id: true,
              referenceNumber: true,
              title: true,
              status: true,
              amount: true,
              createdAt: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!vendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }

      return NextResponse.json(vendor)
    } catch (dbError) {
      console.error('Database error fetching vendor:', dbError)
      return NextResponse.json({
        error: 'Failed to fetch vendor. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Get vendor error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

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
    const body = await request.json()
    const {
      name, email, phone, company, address, country, specialization, isActive,
      // Comprehensive fields
      onboardingDate, companyType, companyName, individualName,
      city, state, username, gstNumber, startupBenefits, typeOfWork
    } = body

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    // Validate required fields
    if (!email || !country) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'Email and country are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Check if vendor exists
    try {
      const existingVendor = await prisma.vendor.findUnique({
        where: { id: vendorId }
      })

      if (!existingVendor) {
        return NextResponse.json({ error: 'Vendor not found' }, { status: 404 })
      }

      // Check if email is already taken by another vendor
      if (email !== existingVendor.email) {
        const emailExists = await prisma.vendor.findFirst({
          where: {
            email,
            id: { not: vendorId }
          }
        })

        if (emailExists) {
          return NextResponse.json({
            error: 'Email already exists',
            details: 'Another vendor is already using this email address'
          }, { status: 400 })
        }
      }

      // Update vendor
      const updatedVendor = await prisma.vendor.update({
        where: { id: vendorId },
        data: {
          name: name || 'Unknown',
          email,
          phone: phone || null,
          company: company || companyName || individualName || 'Unknown',
          address: address || null,
          country,
          specialization: specialization || (typeOfWork && typeOfWork.length > 0 ? typeOfWork.join(', ') : null),
          isActive: isActive !== undefined ? isActive : true,
          // Comprehensive fields
          onboardingDate: onboardingDate && onboardingDate.trim()
            ? new Date(onboardingDate)
            : null,
          companyType: companyType || null,
          companyName: companyName || null,
          individualName: individualName || null,
          city: city || null,
          state: state || null,
          username: username || null,
          gstNumber: gstNumber || null,
          startupBenefits: startupBenefits || null,
          typeOfWork: typeOfWork || []
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
                action: 'VENDOR_UPDATED',
                description: `Updated vendor: ${name}`,
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
      console.error('Database error updating vendor:', dbError)
      return NextResponse.json({
        error: 'Failed to update vendor. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Update vendor error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

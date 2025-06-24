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
        permissions: ['MANAGE_CUSTOMERS', 'MANAGE_USERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
      }
    } else {
      payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    // Check permissions - support both old demo permissions and new database permissions
    const hasManageCustomers = payload.permissions.includes('MANAGE_CUSTOMERS')
    const hasDeletePermission = payload.permissions.includes('delete' as any) // Old demo permission
    const isAdmin = payload.role === 'ADMIN'

    console.log('Delete customer request (updated):', {
      userId: payload.userId,
      role: payload.role,
      permissions: payload.permissions,
      hasManageCustomers,
      hasDeletePermission,
      isAdmin
    })

    if (!hasManageCustomers && !hasDeletePermission && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: customerId } = await params

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { id: customerId }
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if customer has orders
    const orderCount = await prisma.order.count({
      where: { customerId }
    })

    // Always permanently delete the customer
    // First, we need to handle any related orders if they exist
    if (orderCount > 0) {
      // Option 1: Delete related orders first (cascade delete)
      await prisma.order.deleteMany({
        where: { customerId }
      })
    }

    // Now delete the customer
    await prisma.customer.delete({
      where: { id: customerId }
    })

    // Log activity - only if user exists in database
    try {
      const userExists = await prisma.user.findUnique({
        where: { id: payload.userId }
      })

      if (userExists) {
        await prisma.activityLog.create({
          data: {
            action: 'CUSTOMER_DELETED',
            description: `Permanently deleted customer: ${existingCustomer.name}${orderCount > 0 ? ` (and ${orderCount} related orders)` : ''}`,
            entityType: 'Customer',
            entityId: customerId,
            userId: payload.userId
          }
        })
      } else {
        console.log('Skipping activity log - demo user not in database')
      }
    } catch (error) {
      console.log('Activity log error (non-critical):', error)
    }

    return NextResponse.json({
      message: `Customer deleted successfully${orderCount > 0 ? ` (${orderCount} related orders also deleted)` : ''}`
    })

  } catch (error) {
    console.error('Delete customer error:', error)
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
        permissions: ['MANAGE_CUSTOMERS', 'MANAGE_USERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
      }
    } else {
      payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    const { id: customerId } = await params

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
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

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json(customer)

  } catch (error) {
    console.error('Get customer error:', error)
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
        permissions: ['MANAGE_CUSTOMERS', 'MANAGE_USERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
      }
    } else {
      payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    // Check permissions - support both old demo permissions and new database permissions
    const hasManageCustomers = payload.permissions.includes('MANAGE_CUSTOMERS')
    const hasWritePermission = payload.permissions.includes('write' as any) // Old demo permission
    const isAdmin = payload.role === 'ADMIN'

    if (!hasManageCustomers && !hasWritePermission && !isAdmin) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: customerId } = await params
    const body = await request.json()
    const {
      name, email, phone, company, address, country, isActive,
      // Comprehensive fields
      clientOnboardingDate, companyType, companyName, individualName,
      city, state, username, gstNumber, dpiitRegister, dpiitValidTill
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

    // Check if customer exists
    try {
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: customerId }
      })

      if (!existingCustomer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      // Check if email is already taken by another customer
      if (email !== existingCustomer.email) {
        const emailExists = await prisma.customer.findFirst({
          where: {
            email,
            id: { not: customerId }
          }
        })

        if (emailExists) {
          return NextResponse.json({
            error: 'Email already exists',
            details: 'Another customer is already using this email address'
          }, { status: 400 })
        }
      }

      // Update customer
      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: {
          name: name || 'Unknown',
          email,
          phone: phone || null,
          company: company || companyName || individualName || 'Unknown',
          address: address || null,
          country,
          isActive: isActive !== undefined ? isActive : true,
          // Comprehensive fields
          clientOnboardingDate: clientOnboardingDate && clientOnboardingDate.trim()
            ? new Date(clientOnboardingDate)
            : null,
          companyType: companyType || null,
          companyName: companyName || null,
          individualName: individualName || null,
          city: city || null,
          state: state || null,
          username: username || null,
          gstNumber: gstNumber || null,
          dpiitRegister: dpiitRegister || null,
          dpiitValidTill: dpiitValidTill && dpiitValidTill.trim()
            ? new Date(dpiitValidTill)
            : null
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
                action: 'CUSTOMER_UPDATED',
                description: `Updated customer: ${name}`,
                entityType: 'Customer',
                entityId: customerId,
                userId: payload.userId
              }
            })
          }
        } catch (logError) {
          console.error('Failed to log activity:', logError)
          // Continue even if logging fails
        }
      }

      return NextResponse.json(updatedCustomer)
    } catch (dbError) {
      console.error('Database error updating customer:', dbError)
      return NextResponse.json({
        error: 'Failed to update customer. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const whereClause: Record<string, string | Record<string, unknown>[]> = {}

    if (search) {
      whereClause.OR = [
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (type) {
      whereClause.type = type
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Return empty array when database is not available
      console.log('Database not connected, returning empty orders array')
      return NextResponse.json([])
    }

    try {
      const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true, company: true } },
          vendor: { select: { name: true, company: true } },
          assignedTo: { select: { name: true } }
        }
      })

      return NextResponse.json(orders)
    } catch (dbError) {
      console.error('Database query failed in orders GET:', dbError)
      // Return empty array on database error
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Get orders error:', error)
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

    // Check permissions
    if (!payload.permissions.includes('MANAGE_ORDERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      customerId,
      vendorId,
      assignedToId,
      country,
      priority,
      amount,
      dueDate
    } = body

    // Validate required fields
    if (!title || !type || !customerId || !vendorId || !country || !priority || !amount) {
      return NextResponse.json({
        error: 'Missing required fields'
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
      // Generate reference number
      const orderCount = await prisma.order.count()
      const referenceNumber = `IP-${new Date().getFullYear()}-${String(orderCount + 1).padStart(3, '0')}`

      // Create order
      const order = await prisma.order.create({
        data: {
          referenceNumber,
          title,
          description: description || null,
          type: type as 'PATENT' | 'TRADEMARK' | 'COPYRIGHT' | 'DESIGN',
          status: 'YET_TO_START',
          customerId,
          vendorId,
          assignedToId: assignedToId || payload.userId,
          country,
          priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
          amount: parseFloat(amount),
          paidAmount: 0,
          dueDate: dueDate ? new Date(dueDate) : null,
          startDate: new Date()
        },
        include: {
          customer: { select: { name: true, company: true } },
          vendor: { select: { name: true, company: true } },
          assignedTo: { select: { name: true } }
        }
      })

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'ORDER_CREATED',
            description: `Created new order: ${referenceNumber}`,
            entityType: 'Order',
            entityId: order.id,
            userId: payload.userId,
            orderId: order.id
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      return NextResponse.json(order, { status: 201 })
    } catch (dbError) {
      console.error('Database error creating order:', dbError)
      return NextResponse.json({
        error: 'Failed to create order. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

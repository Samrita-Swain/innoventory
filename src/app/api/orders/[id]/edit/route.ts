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
    const payload = verifyToken(token)

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions
    if (!payload.permissions.includes('MANAGE_ORDERS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: orderId } = await params
    const body = await request.json()
    const { title, description, type, status, priority, country, amount, paidAmount, dueDate } = body

    // Validate enum values
    const validTypes = ['PATENT', 'TRADEMARK', 'COPYRIGHT', 'DESIGN']
    const validStatuses = ['YET_TO_START', 'IN_PROGRESS', 'PENDING_WITH_CLIENT', 'PENDING_PAYMENT', 'COMPLETED', 'CLOSED', 'CANCELLED']
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: `Invalid type. Must be one of: ${validTypes.join(', ')}` }, { status: 400 })
    }

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 })
    }

    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` }, { status: 400 })
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected || !prisma) {
      return NextResponse.json({
        error: 'Database not available. Please try again later.'
      }, { status: 503 })
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (type !== undefined) updateData.type = type
    if (status !== undefined) updateData.status = status
    if (priority !== undefined) updateData.priority = priority
    if (country !== undefined) updateData.country = country
    if (amount !== undefined) updateData.amount = parseFloat(amount.toString())
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount.toString())
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null

    // Set completion date if status is COMPLETED
    if (status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
      updateData.completedDate = new Date()
    }

    // Update order
    try {
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
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
            action: 'ORDER_UPDATED',
            description: `Order ${existingOrder.referenceNumber} was updated`,
            entityType: 'Order',
            entityId: orderId,
            userId: payload.userId,
            orderId: orderId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      return NextResponse.json(updatedOrder)
    } catch (dbError) {
      console.error('Database error updating order:', dbError)
      return NextResponse.json({
        error: 'Failed to update order. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

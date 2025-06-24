import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Handle demo mode
    if (token === 'demo-token') {
      // For demo mode, return success without actual database operation
      const { isActive } = await request.json()
      
      return NextResponse.json({
        message: `Work type ${isActive ? 'activated' : 'deactivated'} successfully (Demo Mode)`,
        isActive
      })
    }

    // Verify JWT token for real authentication
    let userId: string
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
      userId = decoded.userId
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify user exists and has permission
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get the request body
    const { isActive } = await request.json()

    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive must be a boolean' }, { status: 400 })
    }

    // Check if work type exists
    const existingWorkType = await prisma.typeOfWork.findUnique({
      where: { id: params.id }
    })

    if (!existingWorkType) {
      return NextResponse.json({ error: 'Work type not found' }, { status: 404 })
    }

    // Update the work type status
    const updatedWorkType = await prisma.typeOfWork.update({
      where: { id: params.id },
      data: {
        isActive,
        updatedAt: new Date()
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: `Work type ${isActive ? 'activated' : 'deactivated'} successfully`,
      workType: updatedWorkType
    })

  } catch (error) {
    console.error('Error toggling work type status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

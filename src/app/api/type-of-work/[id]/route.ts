import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Fetch single type of work
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if database is connected
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected || !prisma) {
      console.log('Database not connected, returning demo response')
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    const typeOfWork = await prisma.typeOfWork.findUnique({
      where: { id },
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

    if (!typeOfWork) {
      return NextResponse.json({ error: 'Type of work not found' }, { status: 404 })
    }

    return NextResponse.json(typeOfWork)
  } catch (error) {
    console.error('Error fetching type of work:', error)
    return NextResponse.json({ error: 'Failed to fetch type of work' }, { status: 500 })
  }
}

// PUT - Update type of work
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isActive } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if database is connected
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected || !prisma) {
      console.log('Database not connected, returning demo response')
      return NextResponse.json({ error: 'Database not available' }, { status: 503 })
    }

    // Check if type of work exists
    const existingTypeOfWork = await prisma.typeOfWork.findUnique({
      where: { id }
    })

    if (!existingTypeOfWork) {
      return NextResponse.json({ error: 'Type of work not found' }, { status: 404 })
    }

    // Check if another type of work with same name exists (excluding current one)
    const duplicateTypeOfWork = await prisma.typeOfWork.findFirst({
      where: {
        name,
        id: { not: id }
      }
    })

    if (duplicateTypeOfWork) {
      return NextResponse.json({ error: 'Type of work with this name already exists' }, { status: 400 })
    }

    console.log('Attempting to update type of work with ID:', id, 'Data:', { name, description, isActive })
    const updatedTypeOfWork = await prisma.typeOfWork.update({
      where: { id },
      data: {
        name,
        description,
        isActive
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
    console.log('Successfully updated type of work:', updatedTypeOfWork)

    return NextResponse.json(updatedTypeOfWork)
  } catch (error) {
    console.error('Error updating type of work:', error)
    return NextResponse.json({ error: 'Failed to update type of work' }, { status: 500 })
  }
}

// DELETE - Delete type of work
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if database is connected
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected || !prisma) {
      console.log('Database not connected, returning demo response')
      return NextResponse.json({ message: 'Type of work deleted successfully (demo mode)' })
    }

    // Check if type of work exists
    const existingTypeOfWork = await prisma.typeOfWork.findUnique({
      where: { id },
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

    if (!existingTypeOfWork) {
      return NextResponse.json({ error: 'Type of work not found' }, { status: 404 })
    }

    // Delete the type of work
    console.log('Attempting to delete type of work with ID:', id)
    const deletedTypeOfWork = await prisma.typeOfWork.delete({
      where: { id }
    })
    console.log('Successfully deleted type of work:', deletedTypeOfWork)

    return NextResponse.json({
      message: 'Type of work deleted successfully',
      deletedItem: {
        id: existingTypeOfWork.id,
        name: existingTypeOfWork.name
      }
    })
  } catch (error) {
    console.error('Error deleting type of work:', error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint') || error.message.includes('foreign key')) {
        return NextResponse.json({
          error: 'Cannot delete this work type as it is referenced by other records'
        }, { status: 400 })
      }

      if (error.message.includes('Record to delete does not exist') || error.message.includes('not found')) {
        return NextResponse.json({ error: 'Type of work not found' }, { status: 404 })
      }

      if (error.message.includes('Connection') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json({
          error: 'Database connection error. Please try again later.'
        }, { status: 503 })
      }

      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({
          error: 'A work type with this name already exists'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      error: 'Failed to delete type of work',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

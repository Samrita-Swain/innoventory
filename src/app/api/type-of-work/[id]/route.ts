import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Fetch single type of work
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    const typeOfWork = await prisma.typeOfWork.findUnique({
      where: { id: params.id },
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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    // Check if type of work exists
    const existingTypeOfWork = await prisma.typeOfWork.findUnique({
      where: { id: params.id }
    })

    if (!existingTypeOfWork) {
      return NextResponse.json({ error: 'Type of work not found' }, { status: 404 })
    }

    // Check if another type of work with same name exists (excluding current one)
    const duplicateTypeOfWork = await prisma.typeOfWork.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (duplicateTypeOfWork) {
      return NextResponse.json({ error: 'Type of work with this name already exists' }, { status: 400 })
    }

    const updatedTypeOfWork = await prisma.typeOfWork.update({
      where: { id: params.id },
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

    return NextResponse.json(updatedTypeOfWork)
  } catch (error) {
    console.error('Error updating type of work:', error)
    return NextResponse.json({ error: 'Failed to update type of work' }, { status: 500 })
  }
}

// DELETE - Delete type of work
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
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

    // Check if type of work exists
    const existingTypeOfWork = await prisma.typeOfWork.findUnique({
      where: { id: params.id }
    })

    if (!existingTypeOfWork) {
      return NextResponse.json({ error: 'Type of work not found' }, { status: 404 })
    }

    await prisma.typeOfWork.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Type of work deleted successfully' })
  } catch (error) {
    console.error('Error deleting type of work:', error)
    return NextResponse.json({ error: 'Failed to delete type of work' }, { status: 500 })
  }
}

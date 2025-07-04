import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Fetch all type of work
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token or handle demo token
    let decoded
    if (token === 'demo-token') {
      // Handle demo authentication
      decoded = {
        role: 'ADMIN',
        userId: 'demo-admin-id',
        email: 'admin@innoventory.com',
        name: 'John Admin'
      }
    } else {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError)
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    // Check if database is connected
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected || !prisma) {
      console.log('Database not connected, returning empty array')
      return NextResponse.json([])
    }

    const typeOfWorkItems = await prisma.typeOfWork.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(typeOfWorkItems)
  } catch (error) {
    console.error('Error fetching type of work:', error)
    return NextResponse.json({ error: 'Failed to fetch type of work' }, { status: 500 })
  }
}

// POST - Create new type of work
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token or handle demo token
    let decoded
    if (token === 'demo-token') {
      // Handle demo authentication
      decoded = {
        role: 'ADMIN',
        userId: 'demo-admin-id',
        email: 'admin@innoventory.com',
        name: 'John Admin'
      }
    } else {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError)
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { name, description, isActive = true } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    // Check if database is connected
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected || !prisma) {
      console.log('Database not connected, returning demo response')
      return NextResponse.json({
        id: 'demo-' + Date.now(),
        name,
        description,
        isActive,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: 'demo-user',
          name: 'Demo User',
          email: 'demo@example.com'
        }
      }, { status: 201 })
    }

    // Check if type of work with same name already exists
    const existingTypeOfWork = await prisma.typeOfWork.findUnique({
      where: { name }
    })

    if (existingTypeOfWork) {
      return NextResponse.json({ error: 'Type of work with this name already exists' }, { status: 400 })
    }

    const typeOfWork = await prisma.typeOfWork.create({
      data: {
        name,
        description,
        isActive,
        createdById: decoded.userId
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

    return NextResponse.json(typeOfWork, { status: 201 })
  } catch (error) {
    console.error('Error creating type of work:', error)
    return NextResponse.json({ error: 'Failed to create type of work' }, { status: 500 })
  }
}

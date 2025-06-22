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
    const specialization = searchParams.get('specialization') || ''

    const whereClause: Record<string, string | boolean | Record<string, unknown>[]> = {
      isActive: true
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { individualName: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (specialization) {
      if (whereClause.OR) {
        // If search is already applied, combine with AND
        whereClause.AND = [
          { OR: whereClause.OR },
          {
            OR: [
              { specialization: { contains: specialization, mode: 'insensitive' } },
              { typeOfWork: { has: specialization } }
            ]
          }
        ]
        delete whereClause.OR
      } else {
        // If no search, just apply specialization filter
        whereClause.OR = [
          { specialization: { contains: specialization, mode: 'insensitive' } },
          { typeOfWork: { has: specialization } }
        ]
      }
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Return empty array when database is not available
      console.log('Database not connected, returning empty vendors array')
      return NextResponse.json([])
    }

    try {
      const vendors = await prisma.vendor.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true }
          }
        }
      })

      return NextResponse.json(vendors)
    } catch (dbError) {
      console.error('Database query failed in vendors GET:', dbError)
      // Return empty array on database error
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Get vendors error:', error)
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
    if (!payload.permissions.includes('MANAGE_VENDORS')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Parse FormData
    const formData = await request.formData()
    console.log('Received form data keys:', Array.from(formData.keys()))

    // Extract form fields
    const onboardingDate = formData.get('onboardingDate') as string
    const companyType = formData.get('companyType') as string
    const companyName = formData.get('companyName') as string
    const individualName = formData.get('individualName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const country = formData.get('country') as string
    const username = formData.get('username') as string
    const gstNumber = formData.get('gstNumber') as string
    const startupBenefits = formData.get('startupBenefits') as string
    const typeOfWorkStr = formData.get('typeOfWork') as string
    const pointsOfContactStr = formData.get('pointsOfContact') as string

    // Parse JSON fields
    let typeOfWork: string[] = []
    let pointsOfContact = null

    try {
      if (typeOfWorkStr) {
        typeOfWork = JSON.parse(typeOfWorkStr)
      }
      if (pointsOfContactStr) {
        pointsOfContact = JSON.parse(pointsOfContactStr)
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 })
    }

    // Validate required fields
    if (!email || !country) {
      return NextResponse.json({
        error: 'Missing required fields: email, country'
      }, { status: 400 })
    }

    // Validate company type specific fields (only if company type is provided)
    if (companyType === 'Individual' && !individualName?.trim()) {
      return NextResponse.json({
        error: 'Individual name is required for Individual company type'
      }, { status: 400 })
    }

    if (companyType && companyType !== 'Individual' && !companyName?.trim()) {
      return NextResponse.json({
        error: 'Company name is required for non-Individual company types'
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
      // Check if email already exists
      const existingVendor = await prisma.vendor.findUnique({
        where: { email }
      })

      if (existingVendor) {
        return NextResponse.json({
          error: 'Vendor with this email already exists'
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error('Database query failed in vendor email check:', dbError)
      return NextResponse.json({
        error: 'Database error. Please try again later.'
      }, { status: 503 })
    }

    // Handle file uploads (placeholder URLs for now)
    const gstFileUrl = formData.get('gstFile') ? 'placeholder-gst-file-url' : null
    const ndaFileUrl = formData.get('nda') ? 'placeholder-nda-file-url' : null
    const agreementFileUrl = formData.get('agreement') ? 'placeholder-agreement-file-url' : null
    const companyLogoUrl = formData.get('companyLogo') ? 'placeholder-logo-file-url' : null

    // Create vendor with all comprehensive fields
    const vendorName = companyType === 'Individual' ? individualName : companyName
    const specialization = typeOfWork.length > 0 ? typeOfWork.join(', ') : 'General'

    console.log('Creating vendor with data:', {
      vendorName,
      email,
      companyType,
      typeOfWork,
      pointsOfContact: pointsOfContact ? 'has data' : 'null'
    })

    try {
      const vendor = await prisma.vendor.create({
        data: {
          // Original fields
          name: vendorName || 'Unknown',
          email,
          phone: phone || null,
          company: companyName || individualName || 'Unknown',
          country,
          address: address || null,
          specialization,

          // New comprehensive fields
          onboardingDate: onboardingDate && onboardingDate.trim() ? new Date(onboardingDate) : null,
          companyType: companyType || null,
          companyName: companyName || null,
          individualName: individualName || null,
          city: city || null,
          state: state || null,
          username: username || null,
          gstNumber: gstNumber || null,
          startupBenefits: startupBenefits || null,
          typeOfWork: typeOfWork || [],
          pointsOfContact: pointsOfContact ? JSON.stringify(pointsOfContact) : null,

          // File URLs
          gstFileUrl,
          ndaFileUrl,
          agreementFileUrl,
          companyLogoUrl,
          otherDocsUrls: [], // Placeholder for other documents

          createdById: payload.userId,
          isActive: true
        }
      })

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'VENDOR_CREATED',
            description: `Created new vendor: ${vendorName}`,
            entityType: 'Vendor',
            entityId: vendor.id,
            userId: payload.userId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      return NextResponse.json(vendor, { status: 201 })
    } catch (dbError) {
      console.error('Database error creating vendor:', dbError)
      return NextResponse.json({
        error: 'Failed to create vendor. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Create vendor error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

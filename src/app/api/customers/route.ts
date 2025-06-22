import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Verify JWT token with demo secret
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const country = searchParams.get('country') || ''

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

    if (country) {
      whereClause.country = country
    }

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Return empty array when database is not available
      console.log('Database not connected, returning empty customers array')
      return NextResponse.json([])
    }

    try {
      const customers = await prisma.customer.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: true }
          }
        }
      })

      return NextResponse.json(customers)
    } catch (dbError) {
      console.error('Database query failed in customers GET:', dbError)
      // Return empty array on database error
      return NextResponse.json([])
    }
  } catch (error) {
    console.error('Get customers error:', error)
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

    // Verify JWT token with demo secret
    let payload
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key') as any
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check permissions (demo users have all permissions)
    // if (!payload.permissions.includes('MANAGE_CUSTOMERS')) {
    //   return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    // }

    // Parse FormData
    const formData = await request.formData()
    console.log('Received form data keys:', Array.from(formData.keys()))

    // Extract form fields
    const clientOnboardingDate = formData.get('clientOnboardingDate') as string
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
    const dpiitRegister = formData.get('dpiitRegister') as string
    const dpiitValidTill = formData.get('dpiitValidTill') as string
    const pointOfContactStr = formData.get('pointOfContact') as string

    // Parse JSON fields
    let pointOfContact = null

    try {
      if (pointOfContactStr) {
        pointOfContact = JSON.parse(pointOfContactStr)
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

    // Company type specific validation
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
      const existingCustomer = await prisma.customer.findUnique({
        where: { email }
      })

      if (existingCustomer) {
        return NextResponse.json({
          error: 'Customer with this email already exists'
        }, { status: 409 })
      }
    } catch (dbError) {
      console.error('Database query failed in customer email check:', dbError)
      return NextResponse.json({
        error: 'Database error. Please try again later.'
      }, { status: 503 })
    }

    // Handle file uploads (placeholder URLs for now)
    const dpiitCertificateUrl = formData.get('dpiitCertificate') ? 'placeholder-dpiit-certificate-url' : null
    const tdsFileUrl = formData.get('tdsFile') ? 'placeholder-tds-file-url' : null
    const gstFileUrl = formData.get('gstFile') ? 'placeholder-gst-file-url' : null
    const ndaFileUrl = formData.get('nda') ? 'placeholder-nda-file-url' : null
    const agreementFileUrl = formData.get('agreement') ? 'placeholder-agreement-file-url' : null
    const quotationFileUrl = formData.get('quotation') ? 'placeholder-quotation-file-url' : null
    const panCardFileUrl = formData.get('panCard') ? 'placeholder-pan-card-file-url' : null
    const udhyamRegistrationUrl = formData.get('udhyamRegistration') ? 'placeholder-udhyam-registration-url' : null

    // Create customer with all comprehensive fields
    const customerName = companyType === 'Individual' ? individualName : companyName
    const companyField = companyName || individualName || 'Unknown'

    console.log('Creating customer with data:', {
      customerName,
      email,
      companyType,
      pointOfContact: pointOfContact ? 'has data' : 'null'
    })

    try {
      const customer = await prisma.customer.create({
        data: {
          // Original fields
          name: customerName || 'Unknown',
          email,
          phone: phone || null,
          company: companyField,
          country,
          address: address || null,

          // New comprehensive fields
          clientOnboardingDate: clientOnboardingDate && clientOnboardingDate.trim() ? new Date(clientOnboardingDate) : null,
          companyType: companyType || null,
          companyName: companyName || null,
          individualName: individualName || null,
          city: city || null,
          state: state || null,
          username: username || null,
          gstNumber: gstNumber || null,
          dpiitRegister: dpiitRegister || null,
          dpiitValidTill: dpiitValidTill && dpiitValidTill.trim() ? new Date(dpiitValidTill) : null,
          pointOfContact: pointOfContact ? JSON.stringify(pointOfContact) : null,

          // File URLs
          dpiitCertificateUrl,
          tdsFileUrl,
          gstFileUrl,
          ndaFileUrl,
          agreementFileUrl,
          quotationFileUrl,
          panCardFileUrl,
          udhyamRegistrationUrl,
          otherDocsUrls: [], // Placeholder for other documents

          createdById: payload.userId,
          isActive: true
        }
      })

      // Log activity
      try {
        await prisma.activityLog.create({
          data: {
            action: 'CUSTOMER_CREATED',
            description: `Created new customer: ${customerName}`,
            entityType: 'Customer',
            entityId: customer.id,
            userId: payload.userId
          }
        })
      } catch (logError) {
        console.error('Failed to log activity:', logError)
        // Continue even if logging fails
      }

      return NextResponse.json(customer, { status: 201 })
    } catch (dbError) {
      console.error('Database error creating customer:', dbError)
      return NextResponse.json({
        error: 'Failed to create customer. Please try again later.',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

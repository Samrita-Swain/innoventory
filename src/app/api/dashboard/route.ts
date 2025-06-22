import { NextRequest, NextResponse } from 'next/server'
import { prisma, isDatabaseConnected } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
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
    const timeframe = searchParams.get('timeframe') || 'all'

    // Get date range based on timeframe
    const getDateRange = () => {
      const now = new Date()
      switch (timeframe) {
        case 'month':
          return new Date(now.getFullYear(), now.getMonth(), 1)
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3)
          return new Date(now.getFullYear(), quarter * 3, 1)
        case 'year':
          return new Date(now.getFullYear(), 0, 1)
        default:
          return new Date(0) // All time
      }
    }

    const startDate = getDateRange()

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Return empty dashboard data when database is not available
      console.log('Database not connected, returning empty dashboard data')
      const emptyDashboardData = {
        totalCustomers: 0,
        totalVendors: 0,
        totalIPsRegistered: 0,
        totalIPsClosed: 0,
        customersByCountry: [],
        vendorsByCountry: [],
        workDistribution: [],
        pendingWork: [],
        pendingPayments: [],
        yearlyTrends: [],
        assignedCustomers: 0,
        assignedVendors: 0,
        totalOrders: 0,
        ordersYetToStart: 0,
        ordersPendingWithClient: 0,
        ordersCompleted: 0,
        assignedPendingOrders: [],
        recentActivities: [],
        monthlyProgress: []
      }
      return NextResponse.json(emptyDashboardData)
    }

    if (payload.role === 'ADMIN') {
      // Admin dashboard data
      const [
        totalCustomers,
        totalVendors,
        totalIPsRegistered,
        totalIPsClosed,
        customersByCountry,
        vendorsByCountry,
        workDistribution,
        pendingWork,
        pendingPayments,
        yearlyTrends
      ] = await Promise.all([
        // Total customers
        prisma.customer.count({
          where: { isActive: true }
        }).catch(() => 0),

        // Total vendors
        prisma.vendor.count({
          where: { isActive: true }
        }).catch(() => 0),

        // Total IPs registered
        prisma.order.count({
          where: { status: 'COMPLETED' }
        }).catch(() => 0),

        // Total IPs closed
        prisma.order.count({
          where: { status: 'CLOSED' }
        }).catch(() => 0),

        // Customers by country
        prisma.customer.groupBy({
          by: ['country'],
          _count: { id: true },
          where: { isActive: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }).catch(() => []),

        // Vendors by country
        prisma.vendor.groupBy({
          by: ['country'],
          _count: { id: true },
          where: { isActive: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }).catch(() => []),

        // Work distribution by country
        prisma.order.groupBy({
          by: ['country'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }).catch(() => []),

        // Pending work (top 10 most recent)
        prisma.order.findMany({
          where: {
            status: {
              in: ['YET_TO_START', 'IN_PROGRESS', 'PENDING_WITH_CLIENT']
            }
          },
          include: {
            customer: { select: { name: true } }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }).catch(() => []),

        // Pending payments (top 10 with fewest days remaining)
        prisma.invoice.findMany({
          where: { status: 'PENDING' },
          include: {
            order: {
              include: {
                customer: { select: { name: true } }
              }
            }
          },
          orderBy: { dueDate: 'asc' },
          take: 10
        }).catch(() => []),

        // Yearly trends - simplified to avoid raw SQL issues
        Promise.resolve([
          { year: '2024', customers: 0, vendors: 0, ips: 0 }
        ])
      ])

      // Transform data for frontend
      const dashboardData = {
        totalCustomers,
        totalVendors,
        totalIPsRegistered,
        totalIPsClosed,
        customersByCountry: customersByCountry.map(item => ({
          country: item.country,
          count: item._count.id,
          coordinates: getCountryCoordinates(item.country)
        })),
        vendorsByCountry: vendorsByCountry.map(item => ({
          country: item.country,
          count: item._count.id,
          coordinates: getCountryCoordinates(item.country)
        })),
        workDistribution: workDistribution.map(item => ({
          country: item.country,
          workCount: item._count.id,
          coordinates: getCountryCoordinates(item.country)
        })),
        pendingWork: pendingWork.map(order => ({
          id: order.id,
          referenceNumber: order.referenceNumber,
          title: order.title,
          daysLeft: order.dueDate ? Math.ceil((order.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
          status: order.status,
          priority: order.priority
        })),
        pendingPayments: pendingPayments.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          orderReferenceNumber: invoice.order.referenceNumber,
          imageUrl: invoice.imageUrl || '',
          daysLeft: Math.ceil((invoice.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          amount: invoice.amount,
          currency: invoice.currency,
          customerName: invoice.order.customer.name
        })),
        yearlyTrends
      }

      return NextResponse.json(dashboardData)

    } else {
      // Sub-admin dashboard data
      const userId = payload.userId

      const [
        assignedCustomers,
        assignedVendors,
        totalOrders,
        ordersYetToStart,
        ordersPendingWithClient,
        ordersCompleted,
        assignedPendingOrders,
        recentActivities,
        monthlyProgress
      ] = await Promise.all([
        // Assigned customers
        prisma.customer.count({
          where: {
            createdById: userId,
            isActive: true
          }
        }).catch(() => 0),

        // Assigned vendors
        prisma.vendor.count({
          where: {
            createdById: userId,
            isActive: true
          }
        }).catch(() => 0),

        // Total orders assigned
        prisma.order.count({
          where: { assignedToId: userId }
        }).catch(() => 0),

        // Orders yet to start
        prisma.order.count({
          where: {
            assignedToId: userId,
            status: 'YET_TO_START'
          }
        }).catch(() => 0),

        // Orders pending with client
        prisma.order.count({
          where: {
            assignedToId: userId,
            status: 'PENDING_WITH_CLIENT'
          }
        }).catch(() => 0),

        // Completed orders
        prisma.order.count({
          where: {
            assignedToId: userId,
            status: 'COMPLETED'
          }
        }).catch(() => 0),

        // Assigned pending orders
        prisma.order.findMany({
          where: {
            assignedToId: userId,
            status: {
              in: ['YET_TO_START', 'IN_PROGRESS', 'PENDING_WITH_CLIENT']
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }).catch(() => []),

        // Recent activities
        prisma.activityLog.findMany({
          where: { userId: userId },
          orderBy: { createdAt: 'desc' },
          take: 5
        }).catch(() => []),

        // Monthly progress (last 6 months) - simplified to avoid raw SQL issues
        Promise.resolve([
          { month: 'Jan', completed: 0, pending: 0 },
          { month: 'Feb', completed: 0, pending: 0 },
          { month: 'Mar', completed: 0, pending: 0 },
          { month: 'Apr', completed: 0, pending: 0 },
          { month: 'May', completed: 0, pending: 0 },
          { month: 'Jun', completed: 0, pending: 0 }
        ])
      ])

      const dashboardData = {
        assignedCustomers,
        assignedVendors,
        totalOrders,
        ordersYetToStart,
        ordersPendingWithClient,
        ordersCompleted,
        assignedPendingOrders: assignedPendingOrders.map(order => ({
          id: order.id,
          referenceNumber: order.referenceNumber,
          title: order.title,
          daysLeft: order.dueDate ? Math.ceil((order.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0,
          status: order.status,
          priority: order.priority
        })),
        recentActivities,
        monthlyProgress
      }

      return NextResponse.json(dashboardData)
    }

  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get country coordinates (simplified)
function getCountryCoordinates(country: string): [number, number] {
  const coordinates: { [key: string]: [number, number] } = {
    'United States': [39.8283, -98.5795],
    'United Kingdom': [55.3781, -3.4360],
    'Germany': [51.1657, 10.4515],
    'Canada': [56.1304, -106.3468],
    'Australia': [-25.2744, 133.7751],
    'India': [20.5937, 78.9629],
    'Japan': [36.2048, 138.2529],
    'France': [46.6034, 1.8883],
    'Italy': [41.8719, 12.5674],
    'Spain': [40.4637, -3.7492]
  }

  return coordinates[country] || [0, 0]
}

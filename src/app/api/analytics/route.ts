import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma, isDatabaseConnected } from '@/lib/prisma'

// Helper function to get date range based on timeframe
function getDateRange(timeframe: string) {
  const now = new Date()
  let startDate = new Date()

  switch (timeframe) {
    case '1month':
      startDate.setMonth(now.getMonth() - 1)
      break
    case '3months':
      startDate.setMonth(now.getMonth() - 3)
      break
    case '6months':
      startDate.setMonth(now.getMonth() - 6)
      break
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      startDate.setMonth(now.getMonth() - 6) // Default to 6 months
  }

  return startDate
}

// Helper function to get month labels for the timeframe
function getMonthLabels(timeframe: string) {
  const now = new Date()
  const labels = []
  let months = 6

  switch (timeframe) {
    case '1month':
      months = 1
      break
    case '3months':
      months = 3
      break
    case '6months':
      months = 6
      break
    case '1year':
      months = 12
      break
  }

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    labels.push(date.toLocaleDateString('en-US', { month: 'short' }))
  }

  return labels
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '6months'

    const startDate = getDateRange(timeframe)

    // Check if database is available
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Return empty analytics data when database is not available
      console.log('Database not connected, returning empty analytics data')
      const emptyAnalyticsData = {
        kpiData: {
          totalRevenue: 0,
          activeCustomers: 0,
          ordersCompleted: 0,
          successRate: 0
        },
        revenueData: {
          labels: getMonthLabels(timeframe),
          datasets: [{
            label: 'Revenue',
            data: Array(getMonthLabels(timeframe).length).fill(0),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
          }]
        },
        orderTypesData: {
          labels: ['Patents', 'Trademarks', 'Copyrights', 'Designs'],
          datasets: [{
            label: 'Orders by Type',
            data: [0, 0, 0, 0],
            backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
          }]
        },
        performanceData: {
          labels: getMonthLabels(timeframe),
          datasets: [
            {
              label: 'Completed Orders',
              data: Array(getMonthLabels(timeframe).length).fill(0),
              backgroundColor: 'rgba(16, 185, 129, 0.5)',
              borderColor: 'rgb(16, 185, 129)',
              borderWidth: 2
            },
            {
              label: 'New Orders',
              data: Array(getMonthLabels(timeframe).length).fill(0),
              backgroundColor: 'rgba(139, 92, 246, 0.5)',
              borderColor: 'rgb(139, 92, 246)',
              borderWidth: 2
            }
          ]
        }
      }
      return NextResponse.json(emptyAnalyticsData)
    }

    // Fetch real analytics data from database
    const [
      totalRevenue,
      activeCustomers,
      ordersCompleted,
      totalOrders,
      ordersByType,
      monthlyRevenue,
      monthlyOrdersCompleted,
      monthlyNewOrders
    ] = await Promise.all([
      // Total revenue from completed orders
      prisma.order.aggregate({
        _sum: { paidAmount: true },
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }).catch(() => ({ _sum: { paidAmount: 0 } })),

      // Active customers count
      prisma.customer.count({
        where: { 
          isActive: true,
          createdAt: { gte: startDate }
        }
      }).catch(() => 0),

      // Completed orders count
      prisma.order.count({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: startDate }
        }
      }).catch(() => 0),

      // Total orders count
      prisma.order.count({
        where: { createdAt: { gte: startDate } }
      }).catch(() => 0),

      // Orders by type
      prisma.order.groupBy({
        by: ['type'],
        _count: { id: true },
        where: { createdAt: { gte: startDate } }
      }).catch(() => []),

      // Monthly revenue data
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          SUM("paidAmount") as revenue
        FROM "Order"
        WHERE "createdAt" >= ${startDate} AND "status" = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `.catch(() => []),

      // Monthly completed orders
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "Order"
        WHERE "createdAt" >= ${startDate} AND "status" = 'COMPLETED'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `.catch(() => []),

      // Monthly new orders
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "Order"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `.catch(() => [])
    ])

    // Calculate success rate
    const successRate = totalOrders > 0 ? Math.round((ordersCompleted / totalOrders) * 100) : 0

    // Transform order types data
    const orderTypesMap = new Map()
    ordersByType.forEach(item => {
      orderTypesMap.set(item.type, item._count.id)
    })

    // Prepare chart data
    const monthLabels = getMonthLabels(timeframe)
    
    // Transform monthly data to match chart labels
    const revenueByMonth = Array(monthLabels.length).fill(0)
    const completedByMonth = Array(monthLabels.length).fill(0)
    const newOrdersByMonth = Array(monthLabels.length).fill(0)

    // Fill in actual data (simplified - in production you'd want more sophisticated date matching)
    monthlyRevenue.forEach((item: any, index: number) => {
      if (index < revenueByMonth.length) {
        revenueByMonth[index] = Number(item.revenue) || 0
      }
    })

    monthlyOrdersCompleted.forEach((item: any, index: number) => {
      if (index < completedByMonth.length) {
        completedByMonth[index] = Number(item.count) || 0
      }
    })

    monthlyNewOrders.forEach((item: any, index: number) => {
      if (index < newOrdersByMonth.length) {
        newOrdersByMonth[index] = Number(item.count) || 0
      }
    })

    const analyticsData = {
      kpiData: {
        totalRevenue: totalRevenue._sum.paidAmount || 0,
        activeCustomers,
        ordersCompleted,
        successRate
      },
      revenueData: {
        labels: monthLabels,
        datasets: [{
          label: 'Revenue',
          data: revenueByMonth,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }]
      },
      orderTypesData: {
        labels: ['Patents', 'Trademarks', 'Copyrights', 'Designs'],
        datasets: [{
          label: 'Orders by Type',
          data: [
            orderTypesMap.get('PATENT') || 0,
            orderTypesMap.get('TRADEMARK') || 0,
            orderTypesMap.get('COPYRIGHT') || 0,
            orderTypesMap.get('DESIGN') || 0
          ],
          backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']
        }]
      },
      performanceData: {
        labels: monthLabels,
        datasets: [
          {
            label: 'Completed Orders',
            data: completedByMonth,
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2
          },
          {
            label: 'New Orders',
            data: newOrdersByMonth,
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 2
          }
        ]
      }
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

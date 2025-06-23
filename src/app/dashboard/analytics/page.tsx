'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, Users, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import InteractiveChart from '@/components/dashboard/InteractiveChart'
import KPICard from '@/components/dashboard/KPICard'
import AnimatedLoader from '@/components/animations/AnimatedLoader'

// Interface for analytics data
interface AnalyticsData {
  kpiData: {
    totalRevenue: number
    activeCustomers: number
    ordersCompleted: number
    successRate: number
  }
  revenueData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
      borderWidth: number
    }>
  }
  orderTypesData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string[]
    }>
  }
  performanceData: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      backgroundColor: string
      borderColor: string
      borderWidth: number
    }>
  }
}

export default function AnalyticsPage() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [timeframe, setTimeframe] = useState('6months')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  // Function to fetch analytics data from API
  const fetchAnalyticsData = async (token: string, selectedTimeframe: string) => {
    try {
      const response = await fetch(`/api/analytics?timeframe=${selectedTimeframe}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
      } else {
        console.error('Failed to fetch analytics data:', response.statusText)
        setError('Failed to load analytics data')
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError('Failed to load analytics data')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a JWT token
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
          // We have JWT authentication, use it
          try {
            const userData = JSON.parse(storedUser)
            setUserRole(userData.role)
            setUserPermissions(userData.permissions)

            // Fetch real analytics data
            await fetchAnalyticsData(token, timeframe)

            setIsLoading(false)
            return
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError)
            // Fall through to demo authentication
          }
        }

        // Fallback to demo authentication for development
        const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
        const storedPermissions = localStorage.getItem('demoPermissions')

        if (storedRole) {
          setUserRole(storedRole)
          setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])

          // For demo mode, set empty analytics data
          setAnalyticsData({
            kpiData: {
              totalRevenue: 0,
              activeCustomers: 0,
              ordersCompleted: 0,
              successRate: 0
            },
            revenueData: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [{
                label: 'Revenue',
                data: [0, 0, 0, 0, 0, 0],
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
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Completed Orders',
                  data: [0, 0, 0, 0, 0, 0],
                  backgroundColor: 'rgba(16, 185, 129, 0.5)',
                  borderColor: 'rgb(16, 185, 129)',
                  borderWidth: 2
                },
                {
                  label: 'New Orders',
                  data: [0, 0, 0, 0, 0, 0],
                  backgroundColor: 'rgba(139, 92, 246, 0.5)',
                  borderColor: 'rgb(139, 92, 246)',
                  borderWidth: 2
                }
              ]
            }
          })
        } else {
          // No authentication found, redirect to login
          router.push('/login')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Handle timeframe changes
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token && analyticsData) {
      fetchAnalyticsData(token, timeframe)
    }
  }, [timeframe])

  // Generate KPI data from analytics data
  const kpiData = analyticsData ? [
    {
      title: 'Total Revenue',
      value: analyticsData.kpiData.totalRevenue,
      previousValue: Math.round(analyticsData.kpiData.totalRevenue * 0.8), // Estimate previous value
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up' as const,
      subtitle: 'This period'
    },
    {
      title: 'Active Customers',
      value: analyticsData.kpiData.activeCustomers,
      previousValue: Math.round(analyticsData.kpiData.activeCustomers * 0.9), // Estimate previous value
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up' as const,
      subtitle: 'Total active'
    },
    {
      title: 'Orders Completed',
      value: analyticsData.kpiData.ordersCompleted,
      previousValue: Math.round(analyticsData.kpiData.ordersCompleted * 0.85), // Estimate previous value
      icon: FileText,
      color: 'bg-purple-500',
      trend: 'up' as const,
      subtitle: 'This period'
    },
    {
      title: 'Success Rate',
      value: analyticsData.kpiData.successRate,
      previousValue: Math.round(analyticsData.kpiData.successRate * 0.95), // Estimate previous value
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: 'up' as const,
      subtitle: 'Completion rate'
    }
  ] : []

  // Show loading state
  if (isLoading || !analyticsData) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedLoader
              size={80}
              color="#8B5CF6"
              text={error || "Loading analytics..."}
            />
          </motion.div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={12} color="#8B5CF6" size={3} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-purple-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <KPICard {...kpi} />
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InteractiveChart
            type="bar"
            data={analyticsData.revenueData}
            title="Revenue Trends"
            height={350}
          />

          <InteractiveChart
            type="doughnut"
            data={analyticsData.orderTypesData}
            title="Orders by Type"
            height={350}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <InteractiveChart
            type="line"
            data={analyticsData.performanceData}
            title="Order Performance Over Time"
            height={400}
          />
        </div>

        {/* Key Metrics Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Analytics Summary</h3>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${analyticsData.kpiData.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.kpiData.activeCustomers}
              </div>
              <div className="text-sm text-gray-600">Active Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.kpiData.ordersCompleted}
              </div>
              <div className="text-sm text-gray-600">Orders Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.kpiData.successRate}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Analytics data for the selected timeframe: {timeframe.replace(/(\d+)/, '$1 ').replace(/months?/, 'month(s)').replace(/year/, 'year')}
            </p>
          </div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, DollarSign, Users, FileText } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import InteractiveChart from '@/components/dashboard/InteractiveChart'
import KPICard from '@/components/dashboard/KPICard'

export default function AnalyticsPage() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [timeframe, setTimeframe] = useState('6months')

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
      if (storedRole) {
        setUserRole(storedRole)
      }
    }
  }, [])

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']

  // Mock analytics data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  }

  const orderTypesData = {
    labels: ['Patents', 'Trademarks', 'Copyrights', 'Designs'],
    datasets: [
      {
        label: 'Orders by Type',
        data: [45, 30, 15, 10],
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#8B5CF6',
          '#F59E0B'
        ]
      }
    ]
  }

  const performanceData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Completed Orders',
        data: [8, 12, 10, 15, 14, 18],
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      },
      {
        label: 'New Orders',
        data: [12, 15, 13, 18, 16, 20],
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2
      }
    ]
  }

  const kpiData = [
    {
      title: 'Total Revenue',
      value: 123000,
      previousValue: 98000,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: 'up' as const,
      subtitle: 'This month'
    },
    {
      title: 'Active Customers',
      value: 1247,
      previousValue: 1180,
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up' as const,
      subtitle: 'Total active'
    },
    {
      title: 'Orders Completed',
      value: 89,
      previousValue: 76,
      icon: FileText,
      color: 'bg-purple-500',
      trend: 'up' as const,
      subtitle: 'This month'
    },
    {
      title: 'Success Rate',
      value: 94,
      previousValue: 91,
      icon: TrendingUp,
      color: 'bg-orange-500',
      trend: 'up' as const,
      subtitle: 'Completion rate'
    }
  ]

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
            data={revenueData}
            title="Revenue Trends"
            height={350}
          />

          <InteractiveChart
            type="doughnut"
            data={orderTypesData}
            title="Orders by Type"
            height={350}
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 gap-6">
          <InteractiveChart
            type="line"
            data={performanceData}
            title="Order Performance Over Time"
            height={400}
          />
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Countries</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-3">
              {[
                { country: 'United States', orders: 145, percentage: 35 },
                { country: 'United Kingdom', orders: 89, percentage: 22 },
                { country: 'Germany', orders: 67, percentage: 16 },
                { country: 'Canada', orders: 45, percentage: 11 }
              ].map((item) => (
                <div key={item.country} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.country}</p>
                    <p className="text-xs text-gray-500">{item.orders} orders</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-3">
              {[
                { action: 'New order created', time: '2 hours ago', type: 'success' },
                { action: 'Payment received', time: '4 hours ago', type: 'success' },
                { action: 'Order completed', time: '6 hours ago', type: 'success' },
                { action: 'Customer registered', time: '8 hours ago', type: 'info' }
              ].map((activity) => (
                <div key={activity.action} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Customer Satisfaction</span>
                  <span className="text-sm font-medium text-gray-900">4.8/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Order Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">94%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Revenue Growth</span>
                  <span className="text-sm font-medium text-gray-900">+25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

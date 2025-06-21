'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, FileText, Clock, Activity, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

import KPICard from './KPICard'
import InteractiveChart from './InteractiveChart'
import PendingWorkWidget from './PendingWorkWidget'
import PageTransition from '../animations/PageTransition'
import FloatingParticles from '../animations/FloatingParticles'

interface PendingWorkItem {
  id: string
  referenceNumber: string
  title: string
  daysLeft: number
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

interface ActivityItem {
  id: string
  description: string
  createdAt: string
}

interface SubAdminDashboardProps {
  dashboardData: {
    assignedCustomers: number
    assignedVendors: number
    totalOrders: number
    ordersYetToStart: number
    ordersPendingWithClient: number
    ordersCompleted: number
    assignedPendingOrders: PendingWorkItem[]
    recentActivities: ActivityItem[]
    monthlyProgress: { month: string; completed: number; pending: number }[]
  }
  userInfo: {
    name: string
    email: string
    permissions: string[]
  }
}

const SubAdminDashboard = ({ dashboardData, userInfo }: SubAdminDashboardProps) => {
  const router = useRouter()

  // KPI data for sub-admin
  const kpiData = [
    {
      title: 'Assigned Customers',
      value: dashboardData.assignedCustomers,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => router.push('/dashboard/customers?assigned=true'),
      subtitle: 'Under your management'
    },
    {
      title: 'Assigned Vendors',
      value: dashboardData.assignedVendors,
      icon: Building2,
      color: 'bg-green-500',
      onClick: () => router.push('/dashboard/vendors?assigned=true'),
      subtitle: 'Active partnerships'
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders,
      icon: FileText,
      color: 'bg-purple-500',
      onClick: () => router.push('/dashboard/orders?assigned=true'),
      subtitle: 'All assigned orders'
    },
    {
      title: 'Completed Orders',
      value: dashboardData.ordersCompleted,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      onClick: () => router.push('/dashboard/orders?status=completed&assigned=true'),
      subtitle: 'Successfully finished'
    }
  ]

  // Order status breakdown chart
  const orderStatusData = {
    labels: ['Yet to Start', 'Pending with Client', 'Completed'],
    datasets: [
      {
        label: 'Orders by Status',
        data: [
          dashboardData.ordersYetToStart,
          dashboardData.ordersPendingWithClient,
          dashboardData.ordersCompleted
        ],
        backgroundColor: [
          '#F59E0B', // Orange for yet to start
          '#3B82F6', // Blue for pending
          '#10B981'  // Green for completed
        ]
      }
    ]
  }

  // Monthly progress chart
  const monthlyProgressData = {
    labels: dashboardData.monthlyProgress.map(item => item.month),
    datasets: [
      {
        label: 'Completed',
        data: dashboardData.monthlyProgress.map(item => item.completed),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      },
      {
        label: 'Pending',
        data: dashboardData.monthlyProgress.map(item => item.pending),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  }

  const handleOrderStatusClick = (segmentIndex: number, segmentLabel: string) => {
    const statusMap: { [key: string]: string } = {
      'Yet to Start': 'yet_to_start',
      'Pending with Client': 'pending_with_client',
      'Completed': 'completed'
    }
    const status = statusMap[segmentLabel]
    router.push(`/dashboard/orders?status=${status}&assigned=true`)
  }

  const handlePendingOrderClick = (referenceNumber: string) => {
    router.push(`/dashboard/orders/${referenceNumber}`)
  }

  return (
    <PageTransition className="space-y-6 relative">
      <FloatingParticles count={12} color="#10B981" size={2} />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userInfo.name}!</h1>
          <p className="text-gray-600 mt-1">Here&apos;s your personalized dashboard overview</p>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-500">Sub-Admin Dashboard</p>
          <p className="text-xs text-gray-400">{userInfo.email}</p>
        </div>
      </motion.div>

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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InteractiveChart
          type="doughnut"
          data={orderStatusData}
          title="Order Status Breakdown"
          onSegmentClick={handleOrderStatusClick}
          height={300}
        />
        
        <InteractiveChart
          type="bar"
          data={monthlyProgressData}
          title="Monthly Progress"
          height={300}
        />
      </div>

      {/* Pending Orders and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingWorkWidget
          data={dashboardData.assignedPendingOrders}
          onItemClick={handlePendingOrderClick}
          onViewAll={() => router.push('/dashboard/orders?status=pending&assigned=true')}
          title="Your Assigned Pending Orders"
        />
        
        {/* Recent Activity Log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity Log</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {dashboardData.recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activities</p>
              </div>
            ) : (
              dashboardData.recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {dashboardData.recentActivities.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard/activity-log')}
              className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              View Full Activity Log
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userInfo.permissions.includes('MANAGE_CUSTOMERS') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/customers/new')}
              className="p-4 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Users className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Add Customer</span>
            </motion.button>
          )}
          
          {userInfo.permissions.includes('MANAGE_ORDERS') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/orders/new')}
              className="p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <FileText className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm font-medium">Create Order</span>
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/orders?status=pending&assigned=true')}
            className="p-4 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-center"
          >
            <Clock className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Pending Work</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard/reports')}
            className="p-4 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-center"
          >
            <Activity className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Reports</span>
          </motion.button>
        </div>
      </motion.div>
    </PageTransition>
  )
}

export default SubAdminDashboard

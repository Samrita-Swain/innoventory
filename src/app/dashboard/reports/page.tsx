'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, BarChart3, PieChart, TrendingUp } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'

export default function ReportsPage() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState('last30days')

  useEffect(() => {
    // Get user role from token
    const getUserRole = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setUserRole(userData.role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }

    getUserRole()
  }, [])

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']

  const reportTypes = [
    { id: 'overview', name: 'Business Overview', icon: BarChart3, description: 'Comprehensive business metrics' },
    { id: 'customers', name: 'Customer Report', icon: PieChart, description: 'Customer analytics and insights' },
    { id: 'orders', name: 'Order Report', icon: FileText, description: 'Order performance and trends' },
    { id: 'revenue', name: 'Revenue Report', icon: TrendingUp, description: 'Financial performance analysis' }
  ]

  const mockReportData = {
    overview: {
      totalRevenue: 245000,
      totalOrders: 156,
      activeCustomers: 89,
      completionRate: 94,
      trends: [
        { metric: 'Revenue Growth', value: '+25%', trend: 'up' },
        { metric: 'Order Volume', value: '+18%', trend: 'up' },
        { metric: 'Customer Satisfaction', value: '4.8/5', trend: 'stable' },
        { metric: 'Completion Rate', value: '94%', trend: 'up' }
      ]
    },
    customers: {
      newCustomers: 23,
      returningCustomers: 66,
      customerRetention: 78,
      avgOrderValue: 1570,
      topCountries: [
        { country: 'United States', customers: 34, percentage: 38 },
        { country: 'United Kingdom', customers: 22, percentage: 25 },
        { country: 'Germany', customers: 18, percentage: 20 },
        { country: 'Canada', customers: 15, percentage: 17 }
      ]
    }
  }

  const handleDownloadReport = () => {
    // Simulate report download
    alert(`Downloading ${reportTypes.find(r => r.id === selectedReport)?.name} for ${dateRange}`)
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={8} color="#F59E0B" size={2} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-orange-600" />
              Reports & Analytics
            </h1>
            <p className="text-gray-600 mt-1">Generate comprehensive business reports</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadReport}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Download Report</span>
          </motion.button>
        </div>

        {/* Report Controls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>{report.name}</option>
                ))}
              </select>
            </div>

            <div className="md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last3months">Last 3 Months</option>
                <option value="last6months">Last 6 Months</option>
                <option value="lastyear">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedReport(report.id)}
              className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedReport === report.id ? 'ring-2 ring-orange-500 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${selectedReport === report.id ? 'bg-orange-100' : 'bg-gray-100'}`}>
                  <report.icon className={`h-6 w-6 ${selectedReport === report.id ? 'text-orange-600' : 'text-gray-600'}`} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.name}</h3>
              <p className="text-sm text-gray-600">{report.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Report Content */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₹{mockReportData.overview.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReportData.overview.totalOrders}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReportData.overview.activeCustomers}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <PieChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReportData.overview.completionRate}%</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Trends */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockReportData.overview.trends.map((trend, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{trend.metric}</p>
                        <p className="text-xl font-bold text-gray-900">{trend.value}</p>
                      </div>
                      <div className={`p-1 rounded-full ${
                        trend.trend === 'up' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <TrendingUp className={`h-4 w-4 ${
                          trend.trend === 'up' ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedReport === 'customers' && (
          <div className="space-y-6">
            {/* Customer Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">New Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReportData.customers.newCustomers}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Returning Customers</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReportData.customers.returningCustomers}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <PieChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReportData.customers.customerRetention}%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-gray-900">₹{mockReportData.customers.avgOrderValue}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customers by Country</h3>
              <div className="space-y-3">
                {mockReportData.customers.topCountries.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.country}</p>
                      <p className="text-xs text-gray-500">{item.customers} customers</p>
                    </div>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Placeholder for other report types */}
        {(selectedReport === 'orders' || selectedReport === 'revenue') && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {reportTypes.find(r => r.id === selectedReport)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              This report is being generated. Detailed {selectedReport} analytics will be available here.
            </p>
            <button
              onClick={handleDownloadReport}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Download Report
            </button>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Building2, FileText, ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'

import KPICard from './KPICard'
import InteractiveChart from './InteractiveChart'
import WorldMap from './WorldMap'
import PendingWorkWidget from './PendingWorkWidget'
import PendingPaymentsWidget from './PendingPaymentsWidget'
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

interface PendingPaymentItem {
  id: string
  invoiceNumber: string
  orderReferenceNumber: string
  imageUrl?: string
  daysLeft: number
  amount: number
  currency: string
  customerName: string
}

interface AdminDashboardProps {
  dashboardData: {
    totalCustomers: number
    totalVendors: number
    totalIPsRegistered: number
    totalIPsClosed: number
    totalOrders?: number // Add totalOrders field
    customersByCountry: { country: string; count: number; coordinates: [number, number] }[]
    vendorsByCountry: { country: string; count: number; coordinates: [number, number] }[]
    workDistribution: { country: string; workCount: number; coordinates: [number, number] }[]
    pendingWork: PendingWorkItem[]
    pendingPayments: PendingPaymentItem[]
    yearlyTrends: { year: string; customers: number; vendors: number; ips: number }[]
  }
}

const AdminDashboard = ({ dashboardData }: AdminDashboardProps) => {
  const router = useRouter()
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')

  // KPI data
  const kpiData = [
    {
      title: 'Total Customers',
      value: dashboardData.totalCustomers,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => router.push('/dashboard/customers'),
      subtitle: 'Registered customers'
    },
    {
      title: 'Total Vendors',
      value: dashboardData.totalVendors,
      icon: Building2,
      color: 'bg-green-500',
      onClick: () => router.push('/dashboard/vendors'),
      subtitle: 'Active vendors'
    },
    {
      title: 'Total Clients',
      value: dashboardData.totalCustomers,
      icon: FileText,
      color: 'bg-purple-500',
      onClick: () => router.push('/dashboard/customers'),
      subtitle: 'All registered clients'
    },
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders || (dashboardData.totalIPsRegistered + dashboardData.totalIPsClosed),
      icon: ShoppingCart,
      color: 'bg-orange-500',
      onClick: () => router.push('/dashboard/orders'),
      subtitle: 'All orders placed'
    }
  ]

  // Chart data for yearly trends
  const yearlyTrendsData = {
    labels: dashboardData.yearlyTrends.map(item => item.year),
    datasets: [
      {
        label: 'Customers',
        data: dashboardData.yearlyTrends.map(item => item.customers),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      },
      {
        label: 'Vendors',
        data: dashboardData.yearlyTrends.map(item => item.vendors),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2
      },
      {
        label: 'IPs Registered',
        data: dashboardData.yearlyTrends.map(item => item.ips),
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        borderColor: 'rgb(139, 92, 246)',
        borderWidth: 2
      }
    ]
  }

  // Country distribution chart
  const countryDistributionData = {
    labels: dashboardData.customersByCountry.map(item => item.country),
    datasets: [
      {
        label: 'Customers by Country',
        data: dashboardData.customersByCountry.map(item => item.count),
        backgroundColor: [
          '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
          '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
        ]
      }
    ]
  }

  const handleChartSegmentClick = (segmentIndex: number, segmentLabel: string) => {
    // Navigate to filtered view based on chart segment
    router.push(`/dashboard/customers?country=${encodeURIComponent(segmentLabel)}`)
  }

  const handleMapCountryClick = (country: string) => {
    router.push(`/dashboard/orders?country=${encodeURIComponent(country)}`)
  }

  const handlePendingWorkClick = (referenceNumber: string) => {
    router.push(`/dashboard/orders/${referenceNumber}`)
  }

  const handlePendingPaymentClick = (orderReferenceNumber: string) => {
    router.push(`/dashboard/orders/${orderReferenceNumber}`)
  }

  return (
    <PageTransition className="space-y-6 relative">
      <FloatingParticles count={15} color="#3B82F6" size={3} />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your IP management system</p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="quarter">This Quarter</option>
            <option value="month">This Month</option>
          </select>
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
          type="line"
          data={yearlyTrendsData}
          title="Yearly Trends"
          onSegmentClick={handleChartSegmentClick}
          height={350}
        />

        <InteractiveChart
          type="doughnut"
          data={countryDistributionData}
          title="Customer Distribution by Country"
          onSegmentClick={handleChartSegmentClick}
          height={350}
        />
      </div>

      {/* World Map */}
      <WorldMap
        data={dashboardData.workDistribution}
        onCountryClick={handleMapCountryClick}
        title="Geographic Work Distribution"
      />

      {/* Pending Items Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PendingWorkWidget
          data={dashboardData.pendingWork}
          onItemClick={handlePendingWorkClick}
          onViewAll={() => router.push('/dashboard/orders?status=pending')}
        />

        <PendingPaymentsWidget
          data={dashboardData.pendingPayments}
          onItemClick={handlePendingPaymentClick}
          onViewAll={() => router.push('/dashboard/orders?payment_status=pending')}
        />
      </div>
    </PageTransition>
  )
}

export default AdminDashboard

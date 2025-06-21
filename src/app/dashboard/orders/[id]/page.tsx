'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, User, Building, Calendar, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'

interface OrderDetails {
  id: string
  referenceNumber: string
  title: string
  description?: string
  type: string
  status: string
  priority: string
  country: string
  amount: number
  paidAmount: number
  dueDate?: string
  createdAt: string
  customer: {
    name: string
    company: string
    email: string
    phone?: string
  }
  vendor: {
    name: string
    company: string
    email: string
    phone?: string
  }
  assignedTo?: {
    name: string
    email: string
  }
  activities: Array<{
    id: string
    action: string
    description: string
    createdAt: string
    user: {
      name: string
    }
  }>
}

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
      if (storedRole) {
        setUserRole(storedRole)
      }
    }

    fetchOrderDetails()
  }, [params.id])

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch(`/api/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Failed to fetch order details')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'PENDING_WITH_CLIENT': return 'bg-orange-100 text-orange-800'
      case 'YET_TO_START': return 'bg-gray-100 text-gray-800'
      case 'PENDING_PAYMENT': return 'bg-yellow-100 text-yellow-800'
      case 'CLOSED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'LOW': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']

  if (isLoading) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2 text-gray-600">Loading order details...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => router.back()}
                className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
              >
                Go back
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!order) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <button
            onClick={() => router.back()}
            className="mt-2 text-purple-600 hover:text-purple-500 underline"
          >
            Go back
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <FileText className="mr-3 h-8 w-8 text-purple-600" />
                Order Details
              </h1>
              <p className="text-gray-600 mt-1">{order.referenceNumber}</p>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="text-gray-900">{order.title}</p>
              </div>
              {order.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{order.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-gray-900">{order.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-gray-900">{order.country}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                    {order.priority}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className="text-2xl font-bold text-gray-900">${order.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Paid Amount</label>
                <p className="text-xl font-semibold text-green-600">${order.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Remaining</label>
                <p className="text-xl font-semibold text-red-600">${(order.amount - order.paidAmount).toLocaleString()}</p>
              </div>
              {order.dueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <p className="text-gray-900">{new Date(order.dueDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

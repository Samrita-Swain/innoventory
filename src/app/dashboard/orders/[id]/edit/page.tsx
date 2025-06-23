'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'

interface OrderData {
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
  customerId: string
  vendorId: string
  assignedToId?: string
}

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    priority: '',
    country: '',
    amount: 0,
    paidAmount: 0,
    dueDate: ''
  })

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

        // Populate form data
        setFormData({
          title: data.title || '',
          description: data.description || '',
          type: data.type || '',
          status: data.status || '',
          priority: data.priority || '',
          country: data.country || '',
          amount: data.amount || 0,
          paidAmount: data.paidAmount || 0,
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : ''
        })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'paidAmount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch(`/api/orders/${params.id}/edit`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccessMessage('Order updated successfully!')
        setTimeout(() => {
          router.push('/dashboard/orders')
        }, 1500)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      setError('Failed to update order')
    } finally {
      setIsSaving(false)
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

  if (error && !order) {
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
              <h1 className="text-3xl font-bold text-gray-900">Edit Order</h1>
              <p className="text-gray-600 mt-1">{order?.referenceNumber}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-400 p-4"
          >
            <p className="text-sm text-green-700">{successMessage}</p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-400 p-4"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter order title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter order description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="PATENT">Patent</option>
                  <option value="TRADEMARK">Trademark</option>
                  <option value="COPYRIGHT">Copyright</option>
                  <option value="DESIGN">Design</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* Status and Financial */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Status & Financial</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="YET_TO_START">Yet to Start</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_WITH_CLIENT">Pending with Client</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount ($)</label>
                <input
                  type="number"
                  name="paidAmount"
                  value={formData.paidAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

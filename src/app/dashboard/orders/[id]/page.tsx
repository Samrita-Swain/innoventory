'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, User, Building, Calendar, IndianRupee, Clock, CheckCircle, AlertTriangle, Upload, Hash, MessageSquare, AlertCircle, Globe } from 'lucide-react'
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
  // Comprehensive vendor fields
  onboardingDate?: string
  currentStatus?: string
  statusComment?: string
  statusChangeDate?: string
  workCompletionExpected?: string
  documentsProvidedUrl?: string
  invoiceFromVendorUrl?: string
  amountToBePaid?: number
  amountPaidToVendor?: number
  // Comprehensive order fields
  dateOfCompletion?: string
  countryToBeImplemented?: string
  workDocumentsUrl?: string
  applicationDairyNumber?: string
  dateOfFilingAtPO?: string
  lawyerReferenceNumber?: string
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
                <p className="text-2xl font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Paid Amount</label>
                <p className="text-xl font-semibold text-green-600">₹{order.paidAmount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Remaining</label>
                <p className="text-xl font-semibold text-red-600">₹{(order.amount - order.paidAmount).toLocaleString()}</p>
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

        {/* Customer Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Customer Name</label>
              <p className="text-gray-900">{order.customer.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Company</label>
              <p className="text-gray-900">{order.customer.company}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{order.customer.email}</p>
            </div>
            {order.customer.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{order.customer.phone}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Vendor Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Vendor Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Vendor Name</label>
              <p className="text-gray-900">{order.vendor.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Company</label>
              <p className="text-gray-900">{order.vendor.company}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{order.vendor.email}</p>
            </div>
            {order.vendor.phone && (
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{order.vendor.phone}</p>
              </div>
            )}

            {/* Comprehensive Vendor Fields */}
            {order.onboardingDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Onboarding Date
                </label>
                <p className="text-gray-900">{new Date(order.onboardingDate).toLocaleDateString()}</p>
              </div>
            )}

            {order.currentStatus && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Current Status
                </label>
                <p className="text-gray-900 capitalize">{order.currentStatus.replace('_', ' ')}</p>
              </div>
            )}

            {order.workCompletionExpected && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Work Completion Expected
                </label>
                <p className="text-gray-900">{new Date(order.workCompletionExpected).toLocaleDateString()}</p>
              </div>
            )}

            {order.statusChangeDate && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Status Change Date
                </label>
                <p className="text-gray-900">{new Date(order.statusChangeDate).toLocaleDateString()}</p>
              </div>
            )}

            {(order.amountToBePaid !== undefined && order.amountToBePaid > 0) && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Amount to be Paid to Vendor
                </label>
                <p className="text-gray-900">₹{order.amountToBePaid.toLocaleString()}</p>
              </div>
            )}

            {(order.amountPaidToVendor !== undefined && order.amountPaidToVendor > 0) && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Amount Paid to Vendor
                </label>
                <p className="text-gray-900">₹{order.amountPaidToVendor.toLocaleString()}</p>
              </div>
            )}

            {order.statusComment && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Status Comment
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{order.statusComment}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Additional Order Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Additional Order Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {order.countryToBeImplemented && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Country to be Implemented
                </label>
                <p className="text-gray-900">{order.countryToBeImplemented}</p>
              </div>
            )}

            {order.dateOfCompletion && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Completion
                </label>
                <p className="text-gray-900">{new Date(order.dateOfCompletion).toLocaleDateString()}</p>
              </div>
            )}

            {order.applicationDairyNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Application/Dairy Number
                </label>
                <p className="text-gray-900">{order.applicationDairyNumber}</p>
              </div>
            )}

            {order.dateOfFilingAtPO && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Filing at PO
                </label>
                <p className="text-gray-900">{new Date(order.dateOfFilingAtPO).toLocaleDateString()}</p>
              </div>
            )}

            {order.lawyerReferenceNumber && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Lawyer Reference Number
                </label>
                <p className="text-gray-900">{order.lawyerReferenceNumber}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Document Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Document Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {order.documentsProvidedUrl && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="text-sm font-medium text-green-700 mb-2 block">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Documents Provided by Vendor
                </label>
                <a
                  href={order.documentsProvidedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-green-600 hover:text-green-800 underline"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  View Document
                </a>
              </div>
            )}

            {order.invoiceFromVendorUrl && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="text-sm font-medium text-blue-700 mb-2 block">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Invoice from Vendor
                </label>
                <a
                  href={order.invoiceFromVendorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 underline"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  View Invoice
                </a>
              </div>
            )}

            {order.workDocumentsUrl && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <label className="text-sm font-medium text-purple-700 mb-2 block">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Work Documents
                </label>
                <a
                  href={order.workDocumentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-purple-600 hover:text-purple-800 underline"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  View Documents
                </a>
              </div>
            )}
          </div>

          {!order.documentsProvidedUrl && !order.invoiceFromVendorUrl && !order.workDocumentsUrl && (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No documents uploaded yet</p>
            </div>
          )}
        </motion.div>

        {/* Assigned To Information */}
        {order.assignedTo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold text-orange-700 mb-4 flex items-center">
              <User className="mr-2 h-5 w-5" />
              Assigned To
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900">{order.assignedTo.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{order.assignedTo.email}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Order Timeline
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Order Created</p>
                <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>

            {order.activities && order.activities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Recent Activities</h3>
                {order.activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString()} by {activity.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </PageTransition>
    </DashboardLayout>
  )
}
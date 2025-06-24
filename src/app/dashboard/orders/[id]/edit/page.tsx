'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X, Calendar, Upload, FileText, Hash, IndianRupee, AlertCircle, MessageSquare } from 'lucide-react'
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

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')

  // Vendor status options
  const vendorStatusOptions = [
    { value: 'yet_to_start', label: 'Yet to start' },
    { value: 'pending_with_client', label: 'Pending with client' },
    { value: 'pending_with_vendor', label: 'Pending with Vendor' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' }
  ]

  // File handling functions
  const handleFileChange = (field: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }))
  }

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
    dueDate: '',
    // Comprehensive vendor fields
    onboardingDate: '',
    currentStatus: '',
    statusComment: '',
    statusChangeDate: '',
    workCompletionExpected: '',
    amountToBePaid: 0,
    amountPaidToVendor: 0,
    // Comprehensive order fields
    dateOfCompletion: '',
    countryToBeImplemented: '',
    applicationDairyNumber: '',
    dateOfFilingAtPO: '',
    lawyerReferenceNumber: ''
  })

  // File states for document uploads
  const [files, setFiles] = useState({
    documentsProvided: null as File | null,
    invoiceFromVendor: null as File | null,
    workDocuments: null as File | null
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
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : '',
          // Comprehensive vendor fields
          onboardingDate: data.onboardingDate ? new Date(data.onboardingDate).toISOString().split('T')[0] : '',
          currentStatus: data.currentStatus || '',
          statusComment: data.statusComment || '',
          statusChangeDate: data.statusChangeDate ? new Date(data.statusChangeDate).toISOString().split('T')[0] : '',
          workCompletionExpected: data.workCompletionExpected ? new Date(data.workCompletionExpected).toISOString().split('T')[0] : '',
          amountToBePaid: data.amountToBePaid || 0,
          amountPaidToVendor: data.amountPaidToVendor || 0,
          // Comprehensive order fields
          dateOfCompletion: data.dateOfCompletion ? new Date(data.dateOfCompletion).toISOString().split('T')[0] : '',
          countryToBeImplemented: data.countryToBeImplemented || '',
          applicationDairyNumber: data.applicationDairyNumber || '',
          dateOfFilingAtPO: data.dateOfFilingAtPO ? new Date(data.dateOfFilingAtPO).toISOString().split('T')[0] : '',
          lawyerReferenceNumber: data.lawyerReferenceNumber || ''
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
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

              <div className="lg:col-span-2">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country to be Implemented in</label>
                <input
                  type="text"
                  name="countryToBeImplemented"
                  value={formData.countryToBeImplemented}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter country to be implemented in"
                />
              </div>
            </div>
          </div>

          {/* Status and Financial */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Status & Financial Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Total Amount (INR)
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Paid Amount (INR)
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Completion
                </label>
                <input
                  type="date"
                  name="dateOfCompletion"
                  value={formData.dateOfCompletion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-green-700 mb-4 border-b border-gray-200 pb-2">Vendor Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Onboarding vendor for this order
                </label>
                <input
                  type="date"
                  name="onboardingDate"
                  value={formData.onboardingDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <AlertCircle className="inline h-4 w-4 mr-1" />
                  Current Status
                </label>
                <select
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select current status</option>
                  {vendorStatusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Status Comment
                </label>
                <textarea
                  name="statusComment"
                  value={formData.statusComment}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Comments about status changes will be stored for showing on order page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of change of status
                </label>
                <input
                  type="date"
                  name="statusChangeDate"
                  value={formData.statusChangeDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of work completion expected from vendor
                </label>
                <input
                  type="date"
                  name="workCompletionExpected"
                  value={formData.workCompletionExpected}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Amount to be Paid to vendor (INR)
                </label>
                <input
                  type="number"
                  name="amountToBePaid"
                  value={formData.amountToBePaid}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount to be paid in INR"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <IndianRupee className="inline h-4 w-4 mr-1" />
                  Amount Paid to vendor (INR)
                </label>
                <input
                  type="number"
                  name="amountPaidToVendor"
                  value={formData.amountPaidToVendor}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount paid in INR"
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-purple-700 mb-4 border-b border-gray-200 pb-2">Additional Order Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Application/Dairy Number
                </label>
                <input
                  type="text"
                  name="applicationDairyNumber"
                  value={formData.applicationDairyNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter application/dairy number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date of Filing at PO
                </label>
                <input
                  type="date"
                  name="dateOfFilingAtPO"
                  value={formData.dateOfFilingAtPO}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Hash className="inline h-4 w-4 mr-1" />
                  Lawyer Reference Number
                </label>
                <input
                  type="text"
                  name="lawyerReferenceNumber"
                  value={formData.lawyerReferenceNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter lawyer reference number"
                />
              </div>
            </div>
          </div>

          {/* Document Uploads */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-blue-700 mb-4 border-b border-gray-200 pb-2">Document Management</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Documents Provided by vendor
                </label>
                {order?.documentsProvidedUrl && (
                  <div className="mb-2 p-2 bg-green-50 rounded border">
                    <p className="text-sm text-green-700">Current file:
                      <a href={order.documentsProvidedUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View Document
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('documentsProvided', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {files.documentsProvided && (
                  <p className="text-sm text-green-600 mt-1">✓ {files.documentsProvided.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Invoice from the Vendor
                </label>
                {order?.invoiceFromVendorUrl && (
                  <div className="mb-2 p-2 bg-blue-50 rounded border">
                    <p className="text-sm text-blue-700">Current file:
                      <a href={order.invoiceFromVendorUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View Invoice
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('invoiceFromVendor', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {files.invoiceFromVendor && (
                  <p className="text-sm text-blue-600 mt-1">✓ {files.invoiceFromVendor.name}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Work Documents
                </label>
                {order?.workDocumentsUrl && (
                  <div className="mb-2 p-2 bg-purple-50 rounded border">
                    <p className="text-sm text-purple-700">Current file:
                      <a href={order.workDocumentsUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View Work Documents
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('workDocuments', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {files.workDocuments && (
                  <p className="text-sm text-purple-600 mt-1">✓ {files.workDocuments.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

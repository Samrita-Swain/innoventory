'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText, Plus, Search, Edit, Trash2, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import CreateOrderForm from '@/components/forms/CreateOrderForm'


// Order interface
interface Order {
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
  }
  vendor: {
    name: string
    company: string
  }
  assignedTo?: {
    name: string
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const fetchOrders = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const url = new URL('/api/orders', window.location.origin)
      if (searchTerm) url.searchParams.set('search', searchTerm)
      if (filterType) url.searchParams.set('type', filterType)

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          setOrders(data)
        } else {
          console.error('API returned non-JSON response:', await response.text())
          if (retryCount < 2) {
            console.log(`Retrying API call (attempt ${retryCount + 1})...`)
            setTimeout(() => fetchOrders(retryCount + 1), 1000)
            return
          }
          setError('Server returned invalid response format')
        }
      } else {
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json()
            setError(errorData.error || 'Failed to fetch orders')
          } else {
            console.error('API error - non-JSON response:', await response.text())
            if (retryCount < 2) {
              console.log(`Retrying API call (attempt ${retryCount + 1})...`)
              setTimeout(() => fetchOrders(retryCount + 1), 1000)
              return
            }
            setError(`Failed to fetch orders (${response.status})`)
          }
        } catch (parseError) {
          console.error('Error parsing API response:', parseError)
          if (retryCount < 2) {
            console.log(`Retrying API call (attempt ${retryCount + 1})...`)
            setTimeout(() => fetchOrders(retryCount + 1), 1000)
            return
          }
          setError(`Failed to fetch orders (${response.status})`)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (retryCount < 2) {
        console.log(`Retrying API call (attempt ${retryCount + 1})...`)
        setTimeout(() => fetchOrders(retryCount + 1), 1000)
        return
      }
      setError('Failed to fetch orders')
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, filterType])

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
      if (storedRole) {
        setUserRole(storedRole)
      }
    }

    // Fetch orders on page load
    fetchOrders()
  }, [fetchOrders])

  // Refetch when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrders()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterType, fetchOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !filterType || order.type === filterType
    return matchesSearch && matchesType
  })

  const types = [...new Set(orders.map(o => o.type))]

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']

  const handleCreateOrderSuccess = () => {
    // Refresh orders list
    fetchOrders()
  }

  const handleViewOrder = (orderId: string) => {
    console.log('View order:', orderId)
    // Navigate to order details page
    window.location.href = `/dashboard/orders/${orderId}`
  }

  const handleEditOrder = (orderId: string) => {
    console.log('Edit order:', orderId)
    // Navigate to edit page
    window.location.href = `/dashboard/orders/${orderId}/edit`
  }

  const handleDeleteOrder = async (orderId: string, orderRef: string) => {
    console.log('Delete order:', orderId)
    const confirmed = confirm(`Are you sure you want to delete order ${orderRef}? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login again')
        return
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccessMessage(`Order ${orderRef} deleted successfully`)
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchOrders() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      setError('Failed to delete order')
    }
  }



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-blue-600" />
      case 'PENDING_WITH_CLIENT': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800'
      case 'PENDING_WITH_CLIENT': return 'bg-orange-100 text-orange-800'
      case 'YET_TO_START': return 'bg-gray-100 text-gray-800'
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

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={10} color="#8B5CF6" size={2} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-8 w-8 text-purple-600" />
              Order Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage IP registration orders</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Order</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orders.length}
                </p>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orders.filter(o => o.status === 'IN_PROGRESS').length}
                </p>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orders.filter(o => o.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : orders.filter(o => o.status === 'PENDING_WITH_CLIENT').length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:w-48 relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent relative z-20"
                style={{ position: 'relative' }}
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden relative">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => fetchOrders()}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {searchTerm || filterType ? 'No orders found matching your criteria.' : 'No orders yet. Create your first order!'}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.referenceNumber}</div>
                        <div className="text-sm text-gray-500">{order.title}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">{order.customer.name}</div>
                        <div className="text-sm text-gray-500">{order.customer.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {order.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">${order.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Paid: ${order.paidAmount.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Order"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditOrder(order.id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                          title="Edit Order"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id, order.referenceNumber)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Order"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Create Order Form */}
        <CreateOrderForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleCreateOrderSuccess}
        />
      </PageTransition>
    </DashboardLayout>
  )
}

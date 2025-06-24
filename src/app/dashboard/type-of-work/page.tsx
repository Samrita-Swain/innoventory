'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import CreateTypeOfWorkForm from '@/components/forms/CreateTypeOfWorkForm'

// Work Type interface
interface WorkType {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdById: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

export default function TypeOfWorkPage() {
  const router = useRouter()
  const [workTypes, setWorkTypes] = useState<WorkType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [showAddForm, setShowAddForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isClient, setIsClient] = useState(false)

  // Fetch work types from API
  const fetchWorkTypes = async () => {
    try {
      setIsLoading(true)
      setError('')

      let token = localStorage.getItem('token')

      // If no token found, check if we're in demo mode
      if (!token) {
        const demoRole = localStorage.getItem('demoRole')
        if (demoRole) {
          token = 'demo-token'
        } else {
          // If no token and no demo role, show empty data
          setWorkTypes([])
          setIsLoading(false)
          return
        }
      }

      const response = await fetch('/api/type-of-work', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWorkTypes(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch work types')
      }
    } catch (error) {
      console.error('Error fetching work types:', error)
      setError('Failed to fetch work types')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Set client-side flag
    setIsClient(true)

    // Check authentication and set user role
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

            // Fetch real work types data
            await fetchWorkTypes()
            return
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError)
            // Fall through to demo authentication
          }
        }

        // Fallback to demo authentication for development
        const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'

        if (storedRole) {
          setUserRole(storedRole)
          // For demo mode, fetch work types anyway
          await fetchWorkTypes()
        } else {
          // No authentication found, show empty state with login message
          setError('Please log in to view work types')
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Filter work types based on search only
  const filteredWorkTypes = workTypes.filter(workType => {
    const matchesSearch = workType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workType.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']

  const handleEditWorkType = (workTypeId: string) => {
    router.push(`/dashboard/type-of-work/${workTypeId}/edit`)
  }

  const handleToggleActiveStatus = async (workTypeId: string, workTypeName: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    const confirmed = confirm(`Are you sure you want to ${action} "${workTypeName}"?`)
    if (!confirmed) return

    try {
      let token = localStorage.getItem('token')

      // If no token found, check if we're in demo mode
      if (!token) {
        const demoRole = localStorage.getItem('demoRole')
        if (demoRole) {
          token = 'demo-token'
        } else {
          setError('Please login again')
          return
        }
      }

      const response = await fetch(`/api/type-of-work/${workTypeId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        setSuccessMessage(`Work type "${workTypeName}" ${action}d successfully`)
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchWorkTypes() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || `Failed to ${action} work type`)
      }
    } catch (error) {
      console.error(`Error ${action}ing work type:`, error)
      setError(`Failed to ${action} work type`)
    }
  }

  const handleDeleteWorkType = async (workTypeId: string, workTypeName: string) => {
    console.log('Delete work type:', workTypeId)
    const confirmed = confirm(`Are you sure you want to delete "${workTypeName}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      let token = localStorage.getItem('token')

      // If no token found, check if we're in demo mode
      if (!token) {
        const demoRole = localStorage.getItem('demoRole')
        if (demoRole) {
          token = 'demo-token'
        } else {
          setError('Please login again')
          return
        }
      }

      const response = await fetch(`/api/type-of-work/${workTypeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setSuccessMessage(`Work type "${workTypeName}" deleted successfully`)
        setTimeout(() => setSuccessMessage(''), 3000)
        fetchWorkTypes() // Refresh the list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete work type')
      }
    } catch (error) {
      console.error('Error deleting work type:', error)
      setError('Failed to delete work type')
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
        Inactive
      </span>
    )
  }



  // Show loading state while checking authentication
  if (!isClient || isLoading) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2 text-gray-600">Loading work types...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6">
        <FloatingParticles count={8} color="#8B5CF6" size={2} />

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
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-700">{error}</p>
              {error.includes('log in') && (
                <a
                  href="/login"
                  className="text-sm text-red-600 hover:text-red-800 underline font-medium"
                >
                  Go to Login
                </a>
              )}
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Briefcase className="mr-3 h-8 w-8 text-purple-600" />
              Type Of Work Management
            </h1>
            <p className="text-gray-600 mt-1">Manage work types and service categories</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add New</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Briefcase className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Work Types</p>
                <p className="text-2xl font-bold text-gray-900">{workTypes.length}</p>
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
              <div className="p-3 rounded-full bg-green-100">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Types</p>
                <p className="text-2xl font-bold text-gray-900">{workTypes.filter(w => w.isActive).length}</p>
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
              <div className="p-3 rounded-full bg-blue-100">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive Types</p>
                <p className="text-2xl font-bold text-gray-900">{workTypes.filter(w => !w.isActive).length}</p>
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
              <div className="p-3 rounded-full bg-orange-100">
                <Edit className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Created Today</p>
                <p className="text-2xl font-bold text-gray-900">
                  {workTypes.filter(w => new Date(w.createdAt).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search work types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Types Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Work Types List</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredWorkTypes.length} of {workTypes.length} work types
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2 text-gray-600">Loading work types...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Work Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredWorkTypes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm ? 'No work types found matching your criteria.' : 'No work types yet. Add your first work type!'}
                      </td>
                    </tr>
                  ) : (
                    filteredWorkTypes.map((workType, index) => (
                      <motion.tr
                        key={workType.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{workType.name}</div>
                            <div className="text-sm text-gray-500">{workType.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(workType.isActive)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{workType.createdBy.name}</div>
                            <div className="text-xs text-gray-500">{workType.createdBy.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(workType.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditWorkType(workType.id)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                              title="Edit Work Type"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleActiveStatus(workType.id, workType.name, workType.isActive)}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                workType.isActive
                                  ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                                  : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                              }`}
                              title={workType.isActive ? 'Deactivate Work Type' : 'Activate Work Type'}
                            >
                              {workType.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteWorkType(workType.id, workType.name)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Work Type"
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

        {/* Add New Form Modal */}
        <CreateTypeOfWorkForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            setSuccessMessage('Work type created successfully!')
            setTimeout(() => setSuccessMessage(''), 3000)
            fetchWorkTypes() // Refresh the list
          }}
        />
      </PageTransition>
    </DashboardLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Users, Plus, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import CreateSubAdminForm from '@/components/forms/CreateSubAdminForm'

// Sub-admin interface
interface SubAdmin {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  permissions: string[]
  createdAt: string
  lastLogin?: string
}

const availablePermissions = [
  { key: 'MANAGE_USERS', label: 'Manage Users', description: 'Create and manage user accounts' },
  { key: 'MANAGE_CUSTOMERS', label: 'Manage Customers', description: 'Add, edit, and view customers' },
  { key: 'MANAGE_VENDORS', label: 'Manage Vendors', description: 'Add, edit, and view vendors' },
  { key: 'MANAGE_ORDERS', label: 'Manage Orders', description: 'Create and manage orders' },
  { key: 'VIEW_ANALYTICS', label: 'View Analytics', description: 'Access analytics and reports' },
  { key: 'MANAGE_PAYMENTS', label: 'Manage Payments', description: 'Handle payment processing' },
  { key: 'VIEW_REPORTS', label: 'View Reports', description: 'Generate and view reports' }
]

export default function SettingsPage() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSubAdmin, setSelectedSubAdmin] = useState<SubAdmin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

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

          // Fetch sub-admins if user is admin
          if (userData.role === 'ADMIN') {
            fetchSubAdmins()
          }
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

  const handleCreateSubAdminSuccess = () => {
    // Refresh sub-admins list
    fetchSubAdmins()
  }

  const fetchSubAdmins = async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSubAdmins(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch sub-admins')
      }
    } catch (error) {
      console.error('Error fetching sub-admins:', error)
      setError('Failed to fetch sub-admins')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubAdmin = (subAdmin: SubAdmin) => {
    setSelectedSubAdmin(subAdmin)
    setShowEditModal(true)
  }

  const handleUpdateSubAdmin = () => {
    if (selectedSubAdmin) {
      setSubAdmins(subAdmins.map(sa =>
        sa.id === selectedSubAdmin.id ? selectedSubAdmin : sa
      ))
      setShowEditModal(false)
      setSelectedSubAdmin(null)
    }
  }

  const handleToggleStatus = (id: string) => {
    setSubAdmins(subAdmins.map(sa =>
      sa.id === id ? { ...sa, isActive: !sa.isActive } : sa
    ))
  }

  const handleDeleteSubAdmin = (id: string) => {
    if (confirm('Are you sure you want to delete this sub-admin?')) {
      setSubAdmins(subAdmins.filter(sa => sa.id !== id))
    }
  }

  const togglePermission = (permission: string) => {
    if (selectedSubAdmin) {
      const updatedPermissions = selectedSubAdmin.permissions.includes(permission)
        ? selectedSubAdmin.permissions.filter(p => p !== permission)
        : [...selectedSubAdmin.permissions, permission]
      setSelectedSubAdmin({ ...selectedSubAdmin, permissions: updatedPermissions })
    }
  }

  // Only show settings if user is admin
  if (userRole !== 'ADMIN') {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <PageTransition className="space-y-6 relative">
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </PageTransition>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={8} color="#6B7280" size={2} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="mr-3 h-8 w-8 text-gray-600" />
              Settings & User Management
            </h1>
            <p className="text-gray-600 mt-1">Manage sub-administrators and their permissions</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create Sub-Admin</span>
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Sub-Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : subAdmins.length}
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
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : subAdmins.filter(sa => sa.isActive).length}
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
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : subAdmins.filter(sa => !sa.isActive).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sub-Admins Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Sub-Administrator Accounts</h3>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchSubAdmins}
                    className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading sub-admins...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No sub-administrators yet. Create your first sub-admin!
                    </td>
                  </tr>
                ) : (
                  subAdmins.map((subAdmin, index) => (
                  <motion.tr
                    key={subAdmin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{subAdmin.name}</div>
                        <div className="text-sm text-gray-500">{subAdmin.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {subAdmin.permissions.map(permission => (
                          <span
                            key={permission}
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {availablePermissions.find(p => p.key === permission)?.label}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subAdmin.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subAdmin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {subAdmin.lastLogin ? new Date(subAdmin.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSubAdmin(subAdmin)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(subAdmin.id)}
                          className={subAdmin.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        >
                          {subAdmin.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteSubAdmin(subAdmin.id)}
                          className="text-red-600 hover:text-red-900"
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

        {/* Create Sub-Admin Form */}
        <CreateSubAdminForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSubAdminSuccess}
        />

        {/* Edit Sub-Admin Modal */}
        {showEditModal && selectedSubAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Sub-Admin</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedSubAdmin.name}
                    onChange={(e) => setSelectedSubAdmin({ ...selectedSubAdmin, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedSubAdmin.email}
                    onChange={(e) => setSelectedSubAdmin({ ...selectedSubAdmin, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availablePermissions.filter(p => p.key !== 'MANAGE_USERS').map(permission => (
                      <label key={permission.key} className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedSubAdmin.permissions.includes(permission.key)}
                          onChange={() => togglePermission(permission.key)}
                          className="mt-1"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateSubAdmin}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update Sub-Admin
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Building2, Plus, Search, Edit, Trash2, Eye, Star, X, FileText, Download, User, Phone, Mail, MapPin, Calendar, Users, Briefcase, Shield, Award } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import AddVendorForm from '@/components/forms/AddVendorForm'
import EditVendorForm from '@/components/forms/EditVendorForm'

// Vendor interface
interface Vendor {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  country: string
  address?: string
  specialization: string
  rating?: number
  isActive: boolean
  createdAt: string
  updatedAt?: string
  _count?: {
    orders: number
  }
  // Comprehensive fields
  onboardingDate?: string
  companyType?: string
  companyName?: string
  individualName?: string
  city?: string
  state?: string
  username?: string
  gstNumber?: string
  startupBenefits?: string
  typeOfWork?: string[]
  pointsOfContact?: string
  // Document fields
  gstFileUrl?: string
  ndaFileUrl?: string
  agreementFileUrl?: string
  companyLogoUrl?: string
  otherDocsUrls?: string[]
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSpecialization, setFilterSpecialization] = useState('')
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const url = new URL('/api/vendors', window.location.origin)
      if (searchTerm) url.searchParams.set('search', searchTerm)
      if (filterSpecialization) url.searchParams.set('specialization', filterSpecialization)

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setVendors(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch vendors')
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      setError('Failed to fetch vendors')
    } finally {
      setIsLoading(false)
    }
  }, [searchTerm, filterSpecialization])

  useEffect(() => {
    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
      if (storedRole) {
        setUserRole(storedRole)
      }
    }

    // Fetch vendors on page load
    fetchVendors()
  }, [fetchVendors])

  // Refetch when search or filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVendors()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterSpecialization, fetchVendors])

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = !filterSpecialization || vendor.specialization === filterSpecialization
    return matchesSearch && matchesSpecialization
  })

  const specializations = [...new Set(vendors.map(v => v.specialization))]

  const userPermissions = userRole === 'ADMIN'
    ? ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
    : ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']

  const handleAddVendorSuccess = () => {
    // Refresh vendors list
    fetchVendors()
  }

  const handleViewVendor = async (vendor: Vendor) => {
    try {
      // Verify vendor still exists before opening view modal
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login again')
        return
      }

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const currentVendor = await response.json()
        setSelectedVendor(currentVendor)
        setShowViewModal(true)
      } else if (response.status === 404) {
        alert('Vendor not found. It may have been deleted. Refreshing the list...')
        fetchVendors() // Refresh the list
      } else {
        alert('Failed to load vendor details')
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error)
      alert('Failed to load vendor details')
    }
  }

  const handleEditVendor = async (vendor: Vendor) => {
    try {
      // Verify vendor still exists before opening edit modal
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login again')
        return
      }

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const currentVendor = await response.json()
        setSelectedVendor(currentVendor)
        setShowEditModal(true)
      } else if (response.status === 404) {
        alert('Vendor not found. It may have been deleted. Refreshing the list...')
        fetchVendors() // Refresh the list
      } else {
        alert('Failed to load vendor details')
      }
    } catch (error) {
      console.error('Error fetching vendor details:', error)
      alert('Failed to load vendor details')
    }
  }

  const handleDeleteVendor = async (vendor: Vendor) => {
    if (!confirm(`Are you sure you want to delete vendor "${vendor.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login again')
        return
      }

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message || 'Vendor deleted successfully')
        fetchVendors() // Refresh the list
      } else {
        const errorMessage = data.error || 'Failed to delete vendor'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
      alert('Failed to delete vendor')
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  // EditableRating component
  const EditableRating = ({ vendorId, currentRating, onRatingUpdate }: {
    vendorId: string
    currentRating: number
    onRatingUpdate: (rating: number) => void
  }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tempRating, setTempRating] = useState(currentRating)
    const [isUpdating, setIsUpdating] = useState(false)
    const [hasUserInteracted, setHasUserInteracted] = useState(false)

    // Sync tempRating with currentRating when it changes
    useEffect(() => {
      setTempRating(currentRating)
    }, [currentRating])

    const handleStarClick = (rating: number) => {
      setTempRating(rating)
    }

    const handleSave = async () => {
      if (tempRating === currentRating) {
        setIsEditing(false)
        return
      }

      setIsUpdating(true)
      setHasUserInteracted(true)
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('Please login again')
          return
        }

        const response = await fetch(`/api/vendors/${vendorId}/rating`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ rating: tempRating })
        })

        if (response.ok) {
          onRatingUpdate(tempRating)
          setIsEditing(false)
        } else {
          // If rating API fails, try the main vendor update API as fallback
          if (response.status === 404) {
            console.log('Rating API not found, using fallback vendor update API')
            // This is a fallback - should not normally be needed
            alert('Rating update temporarily unavailable. Please use the edit vendor form.')
          } else {
            const errorData = await response.json()
            if (hasUserInteracted) {
              alert(errorData.error || 'Failed to update rating')
            }
          }
          setTempRating(currentRating) // Reset to original
        }
      } catch (error) {
        console.error('Error updating rating:', error)
        if (hasUserInteracted) {
          alert('Failed to update rating')
        }
        setTempRating(currentRating) // Reset to original
      } finally {
        setIsUpdating(false)
      }
    }

    const handleCancel = () => {
      setTempRating(currentRating)
      setIsEditing(false)
    }

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <div className="flex">
            {Array.from({ length: 5 }, (_, i) => (
              <button
                key={i}
                onClick={() => handleStarClick(i + 1)}
                disabled={isUpdating}
                className="focus:outline-none disabled:opacity-50"
              >
                <Star
                  className={`h-4 w-4 cursor-pointer transition-colors ${
                    i < tempRating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-200'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-900 min-w-[2rem]">{tempRating.toFixed(1)}</span>
          <div className="flex space-x-1">
            <button
              onClick={handleSave}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded bg-green-50 hover:bg-green-100 disabled:opacity-50"
            >
              {isUpdating ? '...' : '✓'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        </div>
      )
    }

    return (
      <div
        className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
        onClick={() => {
          setIsEditing(true)
          setHasUserInteracted(true)
        }}
        title="Click to edit rating"
      >
        <div className="flex mr-2">
          {renderStars(currentRating)}
        </div>
        <span className="text-sm text-gray-900">{currentRating?.toFixed(1) || 'N/A'}</span>
      </div>
    )
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={10} color="#10B981" size={2} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-green-600" />
              Vendor Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your vendor network and partnerships</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Vendor</span>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.length}
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
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.filter(v => v.isActive).length}
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Orders Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.reduce((sum, v) => sum + (v._count?.orders || 0), 0)}
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? '...' : vendors.length > 0
                    ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="md:w-48">
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={fetchVendors}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Loading vendors...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVendors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        {searchTerm || filterSpecialization ? 'No vendors found matching your criteria.' : 'No vendors yet. Add your first vendor!'}
                      </td>
                    </tr>
                  ) : (
                    filteredVendors.map((vendor, index) => (
                      <motion.tr
                        key={vendor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                            <div className="text-sm text-gray-500">{vendor.company}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{vendor.email}</div>
                            <div className="text-sm text-gray-500">{vendor.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {vendor.specialization}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <EditableRating
                            vendorId={vendor.id}
                            currentRating={vendor.rating || 0}
                            onRatingUpdate={(newRating) => {
                              setVendors(prev => prev.map(v =>
                                v.id === vendor.id ? { ...v, rating: newRating } : v
                              ))
                            }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vendor._count?.orders || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            vendor.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vendor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewVendor(vendor)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors cursor-pointer"
                              title="View Vendor"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditVendor(vendor)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors cursor-pointer"
                              title="Edit Vendor"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVendor(vendor)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Vendor"
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

        {/* Add Vendor Form */}
        <AddVendorForm
          isOpen={showAddForm}
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddVendorSuccess}
        />

        {/* Edit Vendor Form */}
        {showEditModal && selectedVendor && (
          <EditVendorForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={() => {
              fetchVendors()
              setShowEditModal(false)
            }}
            vendor={selectedVendor}
          />
        )}

        {/* View Vendor Modal */}
        {showViewModal && selectedVendor && (
          <div className="fixed inset-0 bg-white z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white w-full h-full overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Eye className="mr-3 h-6 w-6 text-blue-600" />
                    Vendor Details
                  </h2>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Basic Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Vendor Name</label>
                      <p className="text-gray-900">{selectedVendor.name || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedVendor.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{selectedVendor.phone || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Company</label>
                      <p className="text-gray-900">{selectedVendor.company}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Specialization</label>
                      <p className="text-gray-900">{selectedVendor.specialization}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedVendor.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedVendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Additional Information
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Country</label>
                      <p className="text-gray-900">{selectedVendor.country}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Address</label>
                      <p className="text-gray-900">{selectedVendor.address || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Rating</label>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(selectedVendor.rating || 0)}
                        </div>
                        <span className="text-sm text-gray-900">{selectedVendor.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Total Orders</label>
                      <p className="text-gray-900">{selectedVendor._count?.orders || 0}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Created Date</label>
                      <p className="text-gray-900">
                        {new Date(selectedVendor.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {selectedVendor.updatedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                        <p className="text-gray-900">
                          {new Date(selectedVendor.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Details Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                    Company Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Company Type</label>
                      <p className="text-gray-900">{selectedVendor.companyType || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Company Name</label>
                      <p className="text-gray-900">{selectedVendor.companyName || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Individual Name</label>
                      <p className="text-gray-900">{selectedVendor.individualName || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">GST Number</label>
                      <p className="text-gray-900">{selectedVendor.gstNumber || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">City</label>
                      <p className="text-gray-900">{selectedVendor.city || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">State</label>
                      <p className="text-gray-900">{selectedVendor.state || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Username</label>
                      <p className="text-gray-900">{selectedVendor.username || 'N/A'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500">Onboarding Date</label>
                      <p className="text-gray-900">
                        {selectedVendor.onboardingDate
                          ? new Date(selectedVendor.onboardingDate).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500">Startup Benefits</label>
                    <p className="text-gray-900">{selectedVendor.startupBenefits || 'N/A'}</p>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Type of Work</label>
                    {selectedVendor.typeOfWork && selectedVendor.typeOfWork.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.typeOfWork.map((work, index) => (
                          <span
                            key={index}
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                          >
                            {work}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900">N/A</p>
                    )}
                  </div>
                </div>

                {/* Points of Contact Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-green-600" />
                    Points of Contact
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedVendor.pointsOfContact ? (
                      (() => {
                        try {
                          const contacts = JSON.parse(selectedVendor.pointsOfContact)
                          if (Array.isArray(contacts) && contacts.length > 0) {
                            return contacts.map((contact, index) => (
                              <div key={index} className="mb-4 last:mb-0 p-3 bg-white rounded border">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500">Name</label>
                                    <p className="text-sm text-gray-900">{contact.name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500">Phone</label>
                                    <p className="text-sm text-gray-900">{contact.phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500">Email</label>
                                    <p className="text-sm text-gray-900">{contact.email || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          } else if (contacts && typeof contacts === 'object') {
                            return (
                              <div className="p-3 bg-white rounded border">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500">Name</label>
                                    <p className="text-sm text-gray-900">{contacts.name || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500">Phone</label>
                                    <p className="text-sm text-gray-900">{contacts.phone || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500">Email</label>
                                    <p className="text-sm text-gray-900">{contacts.email || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            )
                          } else {
                            return (
                              <div className="p-3 bg-white rounded border">
                                <p className="text-sm text-gray-900">No contact information available</p>
                              </div>
                            )
                          }
                        } catch (e) {
                          return (
                            <div className="p-3 bg-white rounded border">
                              <p className="text-sm text-gray-900">{selectedVendor.pointsOfContact}</p>
                            </div>
                          )
                        }
                      })()
                    ) : (
                      <div className="p-3 bg-white rounded border">
                        <p className="text-sm text-gray-900">No contact information available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-purple-600" />
                    Documents
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">GST File</span>
                      </div>
                      {selectedVendor.gstFileUrl ? (
                        <a
                          href={selectedVendor.gstFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Not uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">NDA File</span>
                      </div>
                      {selectedVendor.ndaFileUrl ? (
                        <a
                          href={selectedVendor.ndaFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Not uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Agreement File</span>
                      </div>
                      {selectedVendor.agreementFileUrl ? (
                        <a
                          href={selectedVendor.agreementFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Not uploaded</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Company Logo</span>
                      </div>
                      {selectedVendor.companyLogoUrl ? (
                        <a
                          href={selectedVendor.companyLogoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="text-sm text-gray-500">Not uploaded</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Other Documents</label>
                    {selectedVendor.otherDocsUrls && selectedVendor.otherDocsUrls.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedVendor.otherDocsUrls.map((docUrl, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 text-gray-600 mr-2" />
                              <span className="text-sm text-gray-900">Document {index + 1}</span>
                            </div>
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Download className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 rounded border">
                        <p className="text-sm text-gray-500">No additional documents uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </PageTransition>
    </DashboardLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Briefcase, User, Mail, Calendar } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'

interface WorkType {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

interface FormData {
  name: string
  description: string
  isActive: boolean
}

export default function EditTypeOfWorkPage() {
  const params = useParams()
  const router = useRouter()
  const [workType, setWorkType] = useState<WorkType | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    isActive: true
  })
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check authentication and set user role
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUserRole(userData.role)
          setUserPermissions(userData.permissions || [])
        } catch (error) {
          console.error('Failed to parse user data:', error)
          const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
          const storedPermissions = localStorage.getItem('demoPermissions')
          if (storedRole) {
            setUserRole(storedRole)
            setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
          }
        }
      } else {
        const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
        const storedPermissions = localStorage.getItem('demoPermissions')
        if (storedRole) {
          setUserRole(storedRole)
          setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
        }
      }
    }

    checkAuth()
    fetchWorkType()
  }, [params.id])

  const fetchWorkType = async () => {
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
          setError('No authentication token found')
          return
        }
      }

      const response = await fetch(`/api/type-of-work/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setWorkType(data)
        setFormData({
          name: data.name,
          description: data.description || '',
          isActive: data.isActive
        })
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch work type')
      }
    } catch (error) {
      console.error('Error fetching work type:', error)
      setError('Failed to fetch work type')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

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

      const response = await fetch(`/api/type-of-work/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setSuccessMessage('Work type updated successfully!')
        setTimeout(() => {
          router.push('/dashboard/type-of-work')
        }, 1500)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update work type')
      }
    } catch (error) {
      console.error('Error updating work type:', error)
      setError('Failed to update work type')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          <span className="ml-2 text-gray-600">Loading work type...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard/type-of-work')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Briefcase className="mr-3 h-6 w-6 text-purple-600" />
                Edit Work Type
              </h1>
              <p className="text-gray-600">Update work type information</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-400 p-4"
          >
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-400 p-4"
          >
            <p className="text-sm text-green-700">{successMessage}</p>
          </motion.div>
        )}

        {/* Form */}
        {workType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Work Type Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Briefcase className="inline h-4 w-4 mr-1" />
                    Work Type Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter work type name"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter work type description"
                />
              </div>

              {/* Created By Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Created By Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-1 font-medium">{workType.createdBy.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-1 font-medium">{workType.createdBy.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Created:</span>
                    <span className="ml-1 font-medium">
                      {new Date(workType.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/type-of-work')}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Briefcase, User, Mail, Save } from 'lucide-react'

interface CreateTypeOfWorkFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface FormData {
  name: string
  description: string
}

const CreateTypeOfWorkForm = ({ isOpen, onClose, onSuccess }: CreateTypeOfWorkFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: ''
  })
  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUserInfo({ name: userData.name, email: userData.email })
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

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

      const response = await fetch('/api/type-of-work', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        })
      })

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          description: ''
        })
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create work type')
      }
    } catch (error) {
      console.error('Error creating work type:', error)
      setError('Failed to create work type')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full h-full overflow-y-auto"
      >
        <div className="p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Briefcase className="mr-3 h-6 w-6 text-purple-600" />
              Add New Work Type
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
            >
              <p className="text-sm text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter work type description"
              />
            </div>

            {/* User Info Display */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Created By Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-1 font-medium">{userInfo.name || 'Not available'}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-1 font-medium">{userInfo.email || 'Not available'}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default CreateTypeOfWorkForm

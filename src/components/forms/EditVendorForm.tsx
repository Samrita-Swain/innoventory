'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Phone, Building, MapPin, Globe, Edit, Calendar } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  address?: string
  country: string
  specialization?: string
  isActive: boolean
  createdAt: string
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
}

interface EditVendorFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vendor: Vendor
}

const countries = [
  'United States', 'United Kingdom', 'Germany', 'Canada', 'Australia',
  'France', 'Italy', 'Spain', 'Netherlands', 'Japan', 'India', 'Brazil'
]

const companyTypes = [
  'Startup',
  'DPIIT',
  'MSME',
  'Small Entity',
  'Large Entity',
  'Individual'
]

const workTypes = [
  'Trademark Registration',
  'Patent Filing',
  'Copyright Registration',
  'Design Registration',
  'IP Consultation',
  'Legal Services',
  'Research & Analysis'
]

const EditVendorForm = ({ isOpen, onClose, onSuccess, vendor }: EditVendorFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    country: '',
    specialization: '',
    isActive: true,
    // Comprehensive fields
    onboardingDate: '',
    companyType: '',
    companyName: '',
    individualName: '',
    city: '',
    state: '',
    username: '',
    gstNumber: '',
    startupBenefits: '',
    typeOfWork: [] as string[]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-populate form with vendor data
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        company: vendor.company || '',
        address: vendor.address || '',
        country: vendor.country || '',
        specialization: vendor.specialization || '',
        isActive: vendor.isActive,
        // Comprehensive fields
        onboardingDate: vendor.onboardingDate
          ? new Date(vendor.onboardingDate).toISOString().split('T')[0]
          : '',
        companyType: vendor.companyType || '',
        companyName: vendor.companyName || '',
        individualName: vendor.individualName || '',
        city: vendor.city || '',
        state: vendor.state || '',
        username: vendor.username || '',
        gstNumber: vendor.gstNumber || '',
        startupBenefits: vendor.startupBenefits || '',
        typeOfWork: vendor.typeOfWork || []
      })
    }
  }, [vendor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleWorkTypeChange = (workType: string) => {
    setFormData(prev => ({
      ...prev,
      typeOfWork: prev.typeOfWork.includes(workType)
        ? prev.typeOfWork.filter(type => type !== workType)
        : [...prev.typeOfWork, workType]
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required'
    }

    if (formData.companyType === 'Individual' && !formData.individualName.trim()) {
      newErrors.individualName = 'Individual name is required for Individual company type'
    }

    if (formData.companyType && formData.companyType !== 'Individual' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for non-Individual company types'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again to continue')
      }

      const response = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          throw new Error('Session expired. Please login again.')
        }

        if (response.status === 404) {
          throw new Error('Vendor not found. It may have been deleted by another user.')
        }

        const errorMessage = data.error || `Failed to update vendor (${response.status})`
        throw new Error(errorMessage)
      }

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error updating vendor:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update vendor'

      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        setErrors({ submit: errorMessage })
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else if (errorMessage.includes('Vendor not found')) {
        // Vendor was deleted, close modal and refresh list
        setErrors({ submit: errorMessage })
        setTimeout(() => {
          onClose()
          onSuccess() // This will refresh the vendor list
        }, 2000)
      } else {
        setErrors({ submit: errorMessage })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="bg-white w-full h-full overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Edit className="mr-3 h-6 w-6 text-green-600" />
            Edit Vendor
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Basic Information</h3>

              {/* Vendor Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Vendor Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter vendor name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline w-4 h-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="inline w-4 h-4 mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Onboarding Date
                  </label>
                  <input
                    type="date"
                    name="onboardingDate"
                    value={formData.onboardingDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Type
                  </label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select company type</option>
                    {companyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Company/Individual Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline w-4 h-4 mr-2" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.companyName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Individual Name
                  </label>
                  <input
                    type="text"
                    name="individualName"
                    value={formData.individualName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.individualName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter individual name"
                  />
                  {errors.individualName && (
                    <p className="mt-1 text-sm text-red-600">{errors.individualName}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="inline w-4 h-4 mr-2" />
                    Country *
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter city"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter full address"
                />
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              {/* Specialization and Startup Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialization
                  </label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter specialization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Startup Benefits
                  </label>
                  <input
                    type="text"
                    name="startupBenefits"
                    value={formData.startupBenefits}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter startup benefits"
                  />
                </div>
              </div>

              {/* Type of Work */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Work
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workTypes.map(workType => (
                    <label key={workType} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.typeOfWork.includes(workType)}
                        onChange={() => handleWorkTypeChange(workType)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{workType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="mt-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active Vendor</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </div>
              ) : (
                'Update Vendor'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EditVendorForm

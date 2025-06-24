'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Key, Shield, Calendar, MapPin, Globe, FileText, Upload, Briefcase, Edit } from 'lucide-react'
import anime from 'animejs'
import { globalLocationData } from '../../data/globalLocationData'

interface EditSubAdminFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subAdmin: any
}

const availablePermissions = [
  { key: 'MANAGE_CUSTOMERS', label: 'Manage Customers', description: 'Add, edit, and view customers' },
  { key: 'MANAGE_VENDORS', label: 'Manage Vendors', description: 'Add, edit, and view vendors' },
  { key: 'MANAGE_ORDERS', label: 'Manage Orders', description: 'Create and manage orders' },
  { key: 'VIEW_ANALYTICS', label: 'View Analytics', description: 'Access analytics and reports' },
  { key: 'MANAGE_PAYMENTS', label: 'Manage Payments', description: 'Handle payment processing' },
  { key: 'VIEW_REPORTS', label: 'View Reports', description: 'Generate and view reports' }
]

const termOfWorkOptions = [
  'Part-time',
  'Full-time',
  'Contract',
  'Internship'
]

// Use the comprehensive global location data
const locationData = globalLocationData
const countries = Object.keys(locationData)

const EditSubAdminForm = ({ isOpen, onClose, onSuccess, subAdmin }: EditSubAdminFormProps) => {
  const [formData, setFormData] = useState({
    subAdminOnboardingDate: '',
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    username: '',
    panNumber: '',
    termOfWork: '',
    permissions: [] as string[]
  })

  const [files, setFiles] = useState({
    tdsFile: null as File | null,
    nda: null as File | null,
    employmentAgreement: null as File | null,
    panCard: null as File | null,
    others: [] as File[]
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get available states for selected country (cascading behavior)
  const getAvailableStates = () => {
    if (!formData.country || !locationData[formData.country]) return []
    return Object.keys(locationData[formData.country])
  }

  // Get available cities for selected country and state (cascading behavior)
  const getAvailableCities = () => {
    if (!formData.country || !formData.state || !locationData[formData.country]?.[formData.state]) return []
    return locationData[formData.country][formData.state]
  }

  // Pre-populate form with sub-admin data
  useEffect(() => {
    if (subAdmin) {
      setFormData({
        subAdminOnboardingDate: subAdmin.subAdminOnboardingDate
          ? new Date(subAdmin.subAdminOnboardingDate).toISOString().split('T')[0]
          : '',
        name: subAdmin.name || '',
        email: subAdmin.email || '',
        address: subAdmin.address || '',
        city: subAdmin.city || '',
        state: subAdmin.state || '',
        country: subAdmin.country || '',
        username: subAdmin.username || '',
        panNumber: subAdmin.panNumber || '',
        termOfWork: subAdmin.termOfWork || '',
        permissions: subAdmin.permissions || []
      })
    }
  }, [subAdmin])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle cascading dropdown logic
    if (name === 'country') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        state: '', // Reset state when country changes
        city: ''   // Reset city when country changes
      }))
    } else if (name === 'state') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        city: ''   // Reset city when state changes
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleFileChange = (field: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }))
  }

  const handleMultipleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setFiles(prev => ({ ...prev, others: fileArray }))
    }
  }

  const togglePermission = (permission: string) => {
    const updatedPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission]
    setFormData(prev => ({ ...prev, permissions: updatedPermissions }))

    // Clear permissions error
    if (errors.permissions) {
      setErrors(prev => ({ ...prev, permissions: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (formData.permissions.length === 0) newErrors.permissions = 'At least one permission is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Animate error fields
      const errorFields = Object.keys(errors)
      errorFields.forEach(field => {
        const element = document.querySelector(`[name="${field}"]`) ||
                      document.querySelector(`[data-field="${field}"]`)
        if (element) {
          anime({
            targets: element,
            translateX: [-10, 10, -10, 10, 0],
            duration: 400,
            easing: 'easeInOutSine'
          })
        }
      })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')

      // Create FormData for file uploads
      const submitData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value as string)
        }
      })

      // Add files
      Object.entries(files).forEach(([key, value]) => {
        if (value) {
          if (Array.isArray(value)) {
            value.forEach((file, index) => {
              submitData.append(`${key}[${index}]`, file)
            })
          } else {
            submitData.append(key, value)
          }
        }
      })

      const response = await fetch(`/api/users/${subAdmin.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update sub-admin')
      }

      // Success animation
      anime({
        targets: '.form-container',
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeInOutSine'
      })

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error updating sub-admin:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update sub-admin' })
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
        className="form-container bg-white w-full h-full overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Edit className="mr-3 h-6 w-6 text-blue-600" />
            Edit Sub-Administrator
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
            {/* Sub-Admin Onboarding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Sub-Admin Onboarding Date
              </label>
              <input
                type="date"
                name="subAdminOnboardingDate"
                value={formData.subAdminOnboardingDate}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.subAdminOnboardingDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.subAdminOnboardingDate && (
                <p className="mt-1 text-sm text-red-600">{errors.subAdminOnboardingDate}</p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter address"
              />
            </div>

            {/* Location - Cascading Dropdowns: Country → State → City */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country - First */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline w-4 h-4 mr-2" />
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
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

              {/* State - Second (depends on country) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!formData.country}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    !formData.country ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select state</option>
                  {getAvailableStates().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {!formData.country && (
                  <p className="mt-1 text-xs text-gray-500">Please select a country first</p>
                )}
              </div>

              {/* City - Third (depends on country and state) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.country || !formData.state}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    !formData.country || !formData.state ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select city</option>
                  {getAvailableCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {(!formData.country || !formData.state) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Please select {!formData.country ? 'country' : 'state'} first
                  </p>
                )}
              </div>
            </div>

            {/* Username, PAN Number, Term of Work */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-2" />
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter PAN number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="inline w-4 h-4 mr-2" />
                  Term of Work
                </label>
                <select
                  name="termOfWork"
                  value={formData.termOfWork}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select term of work</option>
                  {termOfWorkOptions.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Upload className="inline w-5 h-5 mr-2" />
                File Upload Section
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* TDS File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TDS File
                  </label>
                  {subAdmin.tdsFileUrl && (
                    <div className="mb-2 p-2 bg-blue-50 rounded border">
                      <p className="text-sm text-blue-700">Current file:
                        <a href={subAdmin.tdsFileUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                          View TDS File
                        </a>
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('tdsFile', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {files.tdsFile && (
                    <p className="mt-1 text-sm text-green-600">Selected: {files.tdsFile.name}</p>
                  )}
                </div>

                {/* NDA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NDA
                  </label>
                  {subAdmin.ndaFileUrl && (
                    <div className="mb-2 p-2 bg-green-50 rounded border">
                      <p className="text-sm text-green-700">Current file:
                        <a href={subAdmin.ndaFileUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                          View NDA File
                        </a>
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('nda', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {files.nda && (
                    <p className="mt-1 text-sm text-green-600">Selected: {files.nda.name}</p>
                  )}
                </div>

                {/* Employment Agreement */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Agreement
                  </label>
                  {subAdmin.employmentAgreementUrl && (
                    <div className="mb-2 p-2 bg-orange-50 rounded border">
                      <p className="text-sm text-orange-700">Current file:
                        <a href={subAdmin.employmentAgreementUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                          View Agreement File
                        </a>
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('employmentAgreement', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {files.employmentAgreement && (
                    <p className="mt-1 text-sm text-green-600">Selected: {files.employmentAgreement.name}</p>
                  )}
                </div>

                {/* Pan Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pan Card
                  </label>
                  {subAdmin.panCardUrl && (
                    <div className="mb-2 p-2 bg-purple-50 rounded border">
                      <p className="text-sm text-purple-700">Current file:
                        <a href={subAdmin.panCardUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                          View PAN Card
                        </a>
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('panCard', e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {files.panCard && (
                    <p className="mt-1 text-sm text-green-600">Selected: {files.panCard.name}</p>
                  )}
                </div>

                {/* Others */}
                <div className="md:col-span-2 lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Others (Multiple files allowed)
                  </label>
                  {subAdmin.otherDocsUrls && subAdmin.otherDocsUrls.length > 0 && (
                    <div className="mb-2 p-2 bg-gray-50 rounded border">
                      <p className="text-sm text-gray-700">Current files:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {subAdmin.otherDocsUrls.map((url: string, index: number) => (
                          <li key={index}>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="underline">
                              Document {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleMultipleFileChange(e.target.files)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {files.others.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">Selected {files.others.length} file(s):</p>
                      <ul className="text-sm text-gray-600 ml-4">
                        {files.others.map((file, index) => (
                          <li key={index}>• {file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Shield className="inline h-4 w-4 mr-1" />
              Permissions *
            </label>
            <div
              data-field="permissions"
              className={`space-y-3 p-4 border rounded-lg ${
                errors.permissions ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              {availablePermissions.map(permission => (
                <motion.label
                  key={permission.key}
                  className="flex items-start space-x-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.key)}
                    onChange={() => togglePermission(permission.key)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                    <div className="text-xs text-gray-500">{permission.description}</div>
                  </div>
                </motion.label>
              ))}
            </div>
            {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
          </div>

          {/* Selected Permissions Summary */}
          {formData.permissions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Permissions:</h4>
              <div className="flex flex-wrap gap-2">
                {formData.permissions.map(permission => (
                  <span
                    key={permission}
                    className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                  >
                    {availablePermissions.find(p => p.key === permission)?.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Updating Sub-Admin...
                </div>
              ) : (
                'Update Sub-Admin'
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EditSubAdminForm
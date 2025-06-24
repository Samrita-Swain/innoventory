'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Phone, Building, MapPin, Globe, Edit, Calendar, Star, Upload, FileText, Plus, Trash2, Users } from 'lucide-react'

interface Vendor {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  address?: string
  country: string
  specialization?: string
  rating?: number
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
  pointsOfContact?: string
  // Document fields
  gstFileUrl?: string
  ndaFileUrl?: string
  agreementFileUrl?: string
  companyLogoUrl?: string
  otherDocsUrls?: string[]
}

interface PointOfContact {
  id: string
  name: string
  phone: string
  countryCode: string
  email: string
  areaOfExpertise: string
}

interface EditVendorFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  vendor: Vendor
}

import { globalLocationData } from '../../data/globalLocationData'

// Use the comprehensive global location data
const locationData = globalLocationData
const countries = Object.keys(locationData)

const companyTypes = [
  'Pvt. Limited',
  'MSME',
  'Firm',
  'Individual',
  'Partnership',
  'LLP'
]

// Dynamic work types will be fetched from API

// Areas of expertise will use the same dynamic work types

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'USA/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+61', country: 'Australia' }
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
    rating: 0,
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

  const [workTypes, setWorkTypes] = useState<Array<{ id: string; name: string }>>([])
  const [loadingWorkTypes, setLoadingWorkTypes] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pointsOfContact, setPointsOfContact] = useState<PointOfContact[]>([])
  const [files, setFiles] = useState({
    gstFile: null as File | null,
    nda: null as File | null,
    agreement: null as File | null,
    companyLogo: null as File | null,
    otherDocuments: [] as File[]
  })

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

  // Fetch work types from API
  const fetchWorkTypes = async () => {
    setLoadingWorkTypes(true)
    try {
      let token = localStorage.getItem('token')

      // If no token found, check if we're in demo mode
      if (!token) {
        const demoRole = localStorage.getItem('demoRole')
        if (demoRole) {
          token = 'demo-token'
        } else {
          console.log('No token found for work types')
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
        setWorkTypes(data.filter((workType: any) => workType.isActive))
      } else {
        console.error('Failed to fetch work types:', response.status)
      }
    } catch (error) {
      console.error('Error fetching work types:', error)
    } finally {
      setLoadingWorkTypes(false)
    }
  }

  // Pre-populate form with vendor data
  useEffect(() => {
    // Fetch work types when component mounts
    fetchWorkTypes()

    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        company: vendor.company || '',
        address: vendor.address || '',
        country: vendor.country || '',
        specialization: vendor.specialization || '',
        rating: vendor.rating || 0,
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

      // Parse and set points of contact
      if (vendor.pointsOfContact) {
        try {
          const contacts = JSON.parse(vendor.pointsOfContact)
          if (Array.isArray(contacts)) {
            setPointsOfContact(contacts)
          } else if (contacts && typeof contacts === 'object') {
            setPointsOfContact([contacts])
          }
        } catch (e) {
          console.error('Error parsing points of contact:', e)
          setPointsOfContact([])
        }
      } else {
        setPointsOfContact([])
      }
    }
  }, [vendor])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
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

  const handleFileChange = (field: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }))
  }

  const addPointOfContact = () => {
    const newContact: PointOfContact = {
      id: Date.now().toString(),
      name: '',
      phone: '',
      countryCode: '+91',
      email: '',
      areaOfExpertise: ''
    }
    setPointsOfContact(prev => [...prev, newContact])
  }

  const removePointOfContact = (id: string) => {
    setPointsOfContact(prev => prev.filter(contact => contact.id !== id))
  }

  const updatePointOfContact = (id: string, field: keyof PointOfContact, value: string) => {
    setPointsOfContact(prev => prev.map(contact =>
      contact.id === id ? { ...contact, [field]: value } : contact
    ))
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
      let token = localStorage.getItem('token')

      // If no token found, check if we're in demo mode
      if (!token) {
        const demoRole = localStorage.getItem('demoRole')
        if (demoRole) {
          token = 'demo-token'
        } else {
          throw new Error('Please login again to continue')
        }
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

              {/* Location - Cascading Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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

                {/* State - Second (depends on country) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={!formData.country}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
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
                    City
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={!formData.country || !formData.state}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      !formData.country || !formData.state ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select city</option>
                    {getAvailableCities().map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  {(!formData.country || !formData.state) && (
                    <p className="mt-1 text-xs text-gray-500">Please select country and state first</p>
                  )}
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

              {/* Specialization and Rating */}
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
                    <Star className="inline w-4 h-4 mr-2" />
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter rating (0-5)"
                  />
                </div>
              </div>

              {/* Startup Benefits */}
              <div className="mt-4">
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

              {/* Type of Work */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Work
                </label>
                {loadingWorkTypes ? (
                  <div className="flex items-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500 mr-2"></div>
                    <span className="text-sm text-gray-600">Loading work types...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {workTypes.map(workType => (
                      <label key={workType.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.typeOfWork.includes(workType.name)}
                          onChange={() => handleWorkTypeChange(workType.name)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{workType.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {workTypes.length === 0 && !loadingWorkTypes && (
                  <p className="text-sm text-gray-500 py-2">No active work types available</p>
                )}
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

            {/* Points of Contact */}
            {formData.companyType && formData.companyType !== 'Individual' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex-1 flex items-center">
                    <Users className="mr-2 h-5 w-5 text-green-600" />
                    Points of Contact
                  </h3>
                  <button
                    type="button"
                    onClick={addPointOfContact}
                    className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </button>
                </div>

                {pointsOfContact.map((contact, index) => (
                  <div key={contact.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Contact {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePointOfContact(contact.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Contact Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Name *
                        </label>
                        <input
                          type="text"
                          value={contact.name}
                          onChange={(e) => updatePointOfContact(contact.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="Enter contact name"
                        />
                      </div>

                      {/* Contact Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Contact Email *
                        </label>
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updatePointOfContact(contact.id, 'email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="Enter contact email"
                        />
                      </div>

                      {/* Contact Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <div className="flex">
                          <select
                            value={contact.countryCode}
                            onChange={(e) => updatePointOfContact(contact.id, 'countryCode', e.target.value)}
                            className="px-2 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50 flex-shrink-0"
                          >
                            {countryCodes.map(cc => (
                              <option key={cc.code} value={cc.code}>
                                {cc.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => updatePointOfContact(contact.id, 'phone', e.target.value)}
                            className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>

                      {/* Area of Expertise */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Area of Expertise *
                        </label>
                        <select
                          value={contact.areaOfExpertise}
                          onChange={(e) => updatePointOfContact(contact.id, 'areaOfExpertise', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        >
                          <option value="">Select area of expertise</option>
                          {workTypes.map(workType => (
                            <option key={workType.id} value={workType.name}>{workType.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Document Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* GST File */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline h-4 w-4 mr-1" />
                  GST File
                </label>
                {vendor.gstFileUrl && (
                  <div className="mb-2 p-2 bg-blue-50 rounded border">
                    <p className="text-sm text-blue-700">Current file:
                      <a href={vendor.gstFileUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View GST File
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileChange('gstFile', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX</p>
              </div>

              {/* NDA */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  NDA Document
                </label>
                {vendor.ndaFileUrl && (
                  <div className="mb-2 p-2 bg-green-50 rounded border">
                    <p className="text-sm text-green-700">Current file:
                      <a href={vendor.ndaFileUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View NDA File
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('nda', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
              </div>

              {/* Agreement */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Agreement Document
                </label>
                {vendor.agreementFileUrl && (
                  <div className="mb-2 p-2 bg-orange-50 rounded border">
                    <p className="text-sm text-orange-700">Current file:
                      <a href={vendor.agreementFileUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View Agreement File
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('agreement', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
              </div>

              {/* Company Logo */}
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Company Logo
                </label>
                {vendor.companyLogoUrl && (
                  <div className="mb-2 p-2 bg-purple-50 rounded border">
                    <p className="text-sm text-purple-700">Current file:
                      <a href={vendor.companyLogoUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline">
                        View Logo
                      </a>
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.svg"
                  onChange={(e) => handleFileChange('companyLogo', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, SVG</p>
              </div>
            </div>

            {/* Other Documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Upload className="inline h-4 w-4 mr-1" />
                Other Documents
              </label>
              {vendor.otherDocsUrls && vendor.otherDocsUrls.length > 0 && (
                <div className="mb-2 p-2 bg-gray-50 rounded border">
                  <p className="text-sm text-gray-700">Current files:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {vendor.otherDocsUrls.map((url, index) => (
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
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => {
                  const fileList = Array.from(e.target.files || [])
                  setFiles(prev => ({ ...prev, otherDocuments: fileList }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-gray-500 mt-1">Multiple files allowed. Accepted formats: PDF, JPG, PNG, DOC, DOCX</p>
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

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  X, Building2, Mail, Phone, Building, MapPin, Globe, Award,
  Calendar, Upload, User, Plus, Trash2, FileText
} from 'lucide-react'
import anime from 'animejs'

interface PointOfContact {
  id: string
  name: string
  phone: string
  countryCode: string
  email: string
  areaOfExpertise: string
}

interface AddVendorFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
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

const countryCodes = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' }
]

const areasOfExpertise = [
  'Patents',
  'Trademarks',
  'Copyrights',
  'Designs',
  'Consultancy',
  'Legal Affairs',
  'Technical Writing',
  'Prior Art Search',
  'Patent Prosecution',
  'IP Litigation'
]

const workTypes = [
  'Patents',
  'Trademarks',
  'Copyrights',
  'Designs',
  'Consultancy',
  'Others'
]

const AddVendorForm = ({ isOpen, onClose, onSuccess }: AddVendorFormProps) => {
  const [formData, setFormData] = useState({
    onboardingDate: '',
    companyType: '',
    companyName: '',
    individualName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    username: '',
    gstNumber: '',
    startupBenefits: '',
    typeOfWork: [] as string[]
  })

  const [pointsOfContact, setPointsOfContact] = useState<PointOfContact[]>([])
  const [files, setFiles] = useState({
    gstFile: null as File | null,
    nda: null as File | null,
    agreement: null as File | null,
    companyLogo: null as File | null,
    otherDocuments: [] as File[]
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

  const updatePointOfContact = (id: string, field: string, value: string) => {
    setPointsOfContact(prev => prev.map(contact =>
      contact.id === id ? { ...contact, [field]: value } : contact
    ))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Only validate fields that are actually required by the API
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

    if (!formData.country) newErrors.country = 'Country is required'

    // Company type specific validation (only if company type is selected)
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
        if (key === 'typeOfWork') {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value as string)
        }
      })

      // Add points of contact
      submitData.append('pointsOfContact', JSON.stringify(pointsOfContact))

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

      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || `Failed to create vendor (${response.status})`
        const details = data.details ? ` - ${data.details}` : ''
        throw new Error(errorMessage + details)
      }

      // Success animation
      anime({
        targets: '.form-container',
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeInOutSine'
      })

      // Reset form
      setFormData({
        onboardingDate: '',
        companyType: '',
        companyName: '',
        individualName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        username: '',
        gstNumber: '',
        startupBenefits: '',
        typeOfWork: []
      })
      setPointsOfContact([])
      setFiles({
        gstFile: null,
        nda: null,
        agreement: null,
        companyLogo: null,
        otherDocuments: []
      })

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error creating vendor:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create vendor' })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="form-container bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building2 className="mr-3 h-6 w-6 text-green-600" />
            Add New Vendor
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8 bg-white rounded-b-xl">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Onboarding Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Vendor Onboarding Date
                </label>
                <input
                  type="date"
                  name="onboardingDate"
                  value={formData.onboardingDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.onboardingDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.onboardingDate && <p className="text-red-500 text-sm mt-1">{errors.onboardingDate}</p>}
              </div>

              {/* Company Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="inline h-4 w-4 mr-1" />
                  Company Type
                </label>
                <select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.companyType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select company type</option>
                  {companyTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.companyType && <p className="text-red-500 text-sm mt-1">{errors.companyType}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name / Individual Name */}
              {formData.companyType === 'Individual' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Individual Name *
                  </label>
                  <input
                    type="text"
                    name="individualName"
                    value={formData.individualName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.individualName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter individual name"
                  />
                  {errors.individualName && <p className="text-red-500 text-sm mt-1">{errors.individualName}</p>}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-1" />
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.companyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter company name"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>
              )}

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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="Enter GST number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter full address"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            {/* Location Details - Cascading Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Country - First */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="inline h-4 w-4 mr-1" />
                  Country *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>

              {/* State - Second */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!formData.country}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.state ? 'border-red-500' : 'border-gray-300'
                  } ${!formData.country ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                >
                  <option value="">
                    {!formData.country ? 'Select country first' : 'Select state'}
                  </option>
                  {getAvailableStates().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
              </div>

              {/* City - Third */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  City
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!formData.country || !formData.state}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  } ${(!formData.country || !formData.state) ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                >
                  <option value="">
                    {!formData.country ? 'Select country first' :
                     !formData.state ? 'Select state first' : 'Select city'}
                  </option>
                  {getAvailableCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>
          </div>

          {/* Points of Contact */}
          {formData.companyType && formData.companyType !== 'Individual' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 flex-1">
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
                        Name *
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
                        Email *
                      </label>
                      <input
                        type="email"
                        value={contact.email}
                        onChange={(e) => updatePointOfContact(contact.id, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Enter email address"
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
                          className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-gray-50"
                        >
                          {countryCodes.map(cc => (
                            <option key={cc.code} value={cc.code}>
                              {cc.code} ({cc.country})
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
                        {areasOfExpertise.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Type of Work */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Type of Work
            </h3>

            <div
              data-field="typeOfWork"
              className={`space-y-3 p-4 border rounded-lg shadow-sm ${
                errors.typeOfWork ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select types of work (multiple selection allowed)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {workTypes.map(workType => (
                  <motion.label
                    key={workType}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-gray-200 bg-white shadow-sm"
                    whileHover={{ scale: 1.02 }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.typeOfWork.includes(workType)}
                      onChange={() => handleWorkTypeChange(workType)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">{workType}</span>
                  </motion.label>
                ))}
              </div>
            </div>
            {errors.typeOfWork && <p className="text-red-500 text-sm mt-1">{errors.typeOfWork}</p>}

            {/* Startup Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Award className="inline h-4 w-4 mr-1" />
                  Startup Benefits
                </label>
                <select
                  name="startupBenefits"
                  value={formData.startupBenefits}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
              Document Uploads
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GST File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline h-4 w-4 mr-1" />
                  GST File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileChange('gstFile', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC, DOCX</p>
              </div>

              {/* NDA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  NDA Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('nda', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
              </div>

              {/* Agreement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Agreement Document
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange('agreement', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
              </div>

              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="inline h-4 w-4 mr-1" />
                  Company Logo
                </label>
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

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Vendor...
                </div>
              ) : (
                'Create Vendor'
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

export default AddVendorForm

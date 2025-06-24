'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Mail, Phone, Building, MapPin, Globe, Calendar, FileText, Upload, Award } from 'lucide-react'
import anime from 'animejs'

interface AddCustomerFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface PointOfContact {
  id: string
  name: string
  phone: string
  email: string
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


const AddCustomerForm = ({ isOpen, onClose, onSuccess }: AddCustomerFormProps) => {
  const [formData, setFormData] = useState({
    clientOnboardingDate: '',
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
    dpiitRegister: ''
  })

  const [dpiitData, setDpiitData] = useState({
    validTill: '',
    certificate: null as File | null
  })

  const [pointOfContact, setPointOfContact] = useState<PointOfContact>({
    id: '1',
    name: '',
    phone: '',
    email: ''
  })

  const [files, setFiles] = useState({
    tdsFile: null as File | null,
    gstFile: null as File | null,
    nda: null as File | null,
    agreement: null as File | null,
    quotation: null as File | null,
    panCard: null as File | null,
    udhyamRegistration: null as File | null,
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

  const handleDpiitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setDpiitData(prev => ({ ...prev, [name]: value }))
  }

  const handlePointOfContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPointOfContact(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (field: string, file: File | null) => {
    if (field === 'dpiitCertificate') {
      setDpiitData(prev => ({ ...prev, certificate: file }))
    } else {
      setFiles(prev => ({ ...prev, [field]: file }))
    }
  }

  const handleMultipleFileChange = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setFiles(prev => ({ ...prev, others: fileArray }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

    if (!formData.country) newErrors.country = 'Country is required'

    // Company type specific validation
    if (formData.companyType === 'Individual' && !formData.individualName.trim()) {
      newErrors.individualName = 'Individual name is required for Individual company type'
    }
    if (formData.companyType && formData.companyType !== 'Individual' && !formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required for non-Individual company types'
    }

    // Point of contact validation for Individual type only
    if (formData.companyType === 'Individual') {
      if (!pointOfContact.name.trim()) newErrors.pointOfContactName = 'Point of contact name is required for Individual'
      if (!pointOfContact.email.trim()) newErrors.pointOfContactEmail = 'Point of contact email is required for Individual'
      if (!pointOfContact.phone.trim()) newErrors.pointOfContactPhone = 'Point of contact phone is required for Individual'
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

      // Create FormData for file uploads
      const submitData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value as string)
      })

      // Add point of contact data
      submitData.append('pointOfContact', JSON.stringify(pointOfContact))

      // Add DPIIT data if applicable
      if (formData.dpiitRegister === 'Yes') {
        submitData.append('dpiitValidTill', dpiitData.validTill)
        if (dpiitData.certificate) {
          submitData.append('dpiitCertificate', dpiitData.certificate)
        }
      }

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

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      const data = await response.json()

      if (!response.ok) {
        // Handle authentication errors specifically
        if (response.status === 401) {
          localStorage.removeItem('token')
          throw new Error('Session expired. Please login again.')
        }

        const errorMessage = data.error || `Failed to create customer (${response.status})`
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
        clientOnboardingDate: '',
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
        dpiitRegister: ''
      })

      setDpiitData({
        validTill: '',
        certificate: null
      })

      setPointOfContact({
        id: '1',
        name: '',
        phone: '',
        email: ''
      })

      setFiles({
        tdsFile: null,
        gstFile: null,
        nda: null,
        agreement: null,
        quotation: null,
        panCard: null,
        udhyamRegistration: null,
        others: []
      })

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error creating customer:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer'

      // If it's an authentication error, redirect to login
      if (errorMessage.includes('Session expired') || errorMessage.includes('login again')) {
        // Show error for a moment then redirect
        setErrors({ submit: errorMessage })
        setTimeout(() => {
          window.location.href = '/login'
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="form-container bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="mr-3 h-6 w-6 text-blue-600" />
            Add New Customer
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
            {/* Client Onboarding Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline w-4 h-4 mr-2" />
                Client Onboarding Date
              </label>
              <input
                type="date"
                name="clientOnboardingDate"
                value={formData.clientOnboardingDate}
                onChange={handleChange}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  width: '100%',
                  color: '#111827'
                }}
                className={`focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.clientOnboardingDate ? 'border-red-500 bg-red-50' : ''
                }`}
              />
              {errors.clientOnboardingDate && (
                <p className="mt-1 text-sm text-red-600">{errors.clientOnboardingDate}</p>
              )}
            </div>

            {/* Type of Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline w-4 h-4 mr-2" />
                Type of Company
              </label>
              <select
                name="companyType"
                value={formData.companyType}
                onChange={handleChange}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  width: '100%',
                  color: '#111827'
                }}
                className={`focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.companyType ? 'border-red-500 bg-red-50' : ''
                }`}
              >
                <option value="">Select company type</option>
                {companyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.companyType && (
                <p className="mt-1 text-sm text-red-600">{errors.companyType}</p>
              )}
            </div>

            {/* Company Name / Individual Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  disabled={formData.companyType === 'Individual'}
                  style={{
                    backgroundColor: formData.companyType === 'Individual' ? '#f3f4f6' : 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: '#111827',
                    cursor: formData.companyType === 'Individual' ? 'not-allowed' : 'text'
                  }}
                  className={`focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.companyName ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Individual Name
                </label>
                <input
                  type="text"
                  name="individualName"
                  value={formData.individualName}
                  onChange={handleChange}
                  disabled={formData.companyType !== 'Individual' && formData.companyType !== ''}
                  style={{
                    backgroundColor: (formData.companyType !== 'Individual' && formData.companyType !== '') ? '#f3f4f6' : 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: '#111827',
                    cursor: (formData.companyType !== 'Individual' && formData.companyType !== '') ? 'not-allowed' : 'text'
                  }}
                  className={`focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.individualName ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Enter individual name"
                />
                {errors.individualName && (
                  <p className="mt-1 text-sm text-red-600">{errors.individualName}</p>
                )}
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Company&apos;s Email ID *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: '#111827'
                  }}
                  className={`focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-500 bg-red-50' : ''
                  }`}
                  placeholder="Enter company email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Company&apos;s Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: '#111827'
                  }}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter company phone number"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline w-4 h-4 mr-2" />
                Company&apos;s Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  width: '100%',
                  color: '#111827',
                  resize: 'vertical'
                }}
                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter company address"
              />
            </div>

            {/* Country, State, City - Cascading Dropdowns */}
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
                  style={{
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: '#111827'
                  }}
                  className={`focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    errors.country ? 'border-red-500 bg-red-50' : ''
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

              {/* State - Second */}
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
                  style={{
                    backgroundColor: !formData.country ? '#f3f4f6' : 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: !formData.country ? '#9ca3af' : '#111827',
                    cursor: !formData.country ? 'not-allowed' : 'pointer'
                  }}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">
                    {!formData.country ? 'Select country first' : 'Select state'}
                  </option>
                  {getAvailableStates().map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City - Third */}
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
                  style={{
                    backgroundColor: (!formData.country || !formData.state) ? '#f3f4f6' : 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    width: '100%',
                    color: (!formData.country || !formData.state) ? '#9ca3af' : '#111827',
                    cursor: (!formData.country || !formData.state) ? 'not-allowed' : 'pointer'
                  }}
                  className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">
                    {!formData.country ? 'Select country first' :
                     !formData.state ? 'Select state first' : 'Select city'}
                  </option>
                  {getAvailableCities().map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Point of Contact Section */}
            <div className={`border rounded-lg p-4 transition-all duration-200 ${
              formData.companyType === 'Individual' ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 border-gray-300'
            }`}>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="inline w-5 h-5 mr-2" />
                Point of Contact
                {formData.companyType !== 'Individual' && formData.companyType !== '' && (
                  <span className="ml-2 text-sm text-gray-500">(Disabled for non-Individual types)</span>
                )}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={pointOfContact.name}
                    onChange={handlePointOfContactChange}
                    disabled={formData.companyType !== 'Individual'}
                    data-field="pointOfContactName"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      formData.companyType !== 'Individual' ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
                    } ${errors.pointOfContactName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Enter contact name"
                  />
                  {errors.pointOfContactName && (
                    <p className="mt-1 text-sm text-red-600">{errors.pointOfContactName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={pointOfContact.phone}
                    onChange={handlePointOfContactChange}
                    disabled={formData.companyType !== 'Individual'}
                    data-field="pointOfContactPhone"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      formData.companyType !== 'Individual' ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
                    } ${errors.pointOfContactPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Enter contact phone"
                  />
                  {errors.pointOfContactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.pointOfContactPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email ID
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={pointOfContact.email}
                    onChange={handlePointOfContactChange}
                    disabled={formData.companyType !== 'Individual'}
                    data-field="pointOfContactEmail"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      formData.companyType !== 'Individual' ? 'bg-gray-200 cursor-not-allowed' : 'bg-white'
                    } ${errors.pointOfContactEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Enter contact email"
                  />
                  {errors.pointOfContactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.pointOfContactEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Username and GST Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline w-4 h-4 mr-2" />
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="inline w-4 h-4 mr-2" />
                GST Number
              </label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter GST number"
              />
            </div>
          </div>

          {/* DPIIT Register Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Award className="inline w-5 h-5 mr-2" />
              DPIIT Register
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DPIIT Registered
                </label>
                <select
                  name="dpiitRegister"
                  value={formData.dpiitRegister}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {formData.dpiitRegister === 'Yes' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline w-4 h-4 mr-2" />
                      Valid Till
                    </label>
                    <input
                      type="date"
                      name="validTill"
                      value={dpiitData.validTill}
                      onChange={handleDpiitChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Upload className="inline w-4 h-4 mr-2" />
                      Upload Certificate
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange('dpiitCertificate', e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {dpiitData.certificate && (
                      <p className="mt-1 text-sm text-green-600">
                        Selected: {dpiitData.certificate.name}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
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

              {/* GST File */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST File
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('gstFile', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {files.gstFile && (
                  <p className="mt-1 text-sm text-green-600">Selected: {files.gstFile.name}</p>
                )}
              </div>

              {/* NDA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NDA
                </label>
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

              {/* Agreement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('agreement', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {files.agreement && (
                  <p className="mt-1 text-sm text-green-600">Selected: {files.agreement.name}</p>
                )}
              </div>

              {/* Quotation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quotation
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('quotation', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {files.quotation && (
                  <p className="mt-1 text-sm text-green-600">Selected: {files.quotation.name}</p>
                )}
              </div>

              {/* Pan Card */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pan Card
                </label>
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

              {/* Udhyam Registration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Udhyam Registration
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('udhyamRegistration', e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {files.udhyamRegistration && (
                  <p className="mt-1 text-sm text-green-600">Selected: {files.udhyamRegistration.name}</p>
                )}
              </div>

              {/* Others */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Others (Multiple files allowed)
                </label>
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
                  Creating Customer...
                </div>
              ) : (
                'Create Customer'
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

export default AddCustomerForm

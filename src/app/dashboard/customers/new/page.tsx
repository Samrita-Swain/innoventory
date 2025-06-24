'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, Building, MapPin, Globe, Calendar, FileText, Upload, Award, ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import anime from 'animejs'

interface PointOfContact {
  id: string
  name: string
  phone: string
  email: string
}

import { globalLocationData } from '../../../../data/globalLocationData'

// Use the comprehensive global location data
const locationData = globalLocationData || {}
const countries = Object.keys(locationData).filter(country => country && locationData[country])

const companyTypes = [
  'Pvt. Limited',
  'MSME',
  'Firm',
  'Individual',
  'Partnership',
  'LLP'
]

export default function NewCustomerPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [userPermissions, setUserPermissions] = useState<string[]>([])

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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Get available states for selected country
  const getStatesForCountry = (country: string) => {
    const countryData = locationData[country]
    if (!countryData || typeof countryData !== 'object') return []

    // Convert the object structure to array of state objects
    return Object.keys(countryData).map(stateName => ({
      state: stateName,
      cities: countryData[stateName] || []
    }))
  }

  // Get available cities for selected state
  const getCitiesForState = (country: string, state: string) => {
    const countryData = locationData[country]
    if (!countryData || typeof countryData !== 'object') return []

    // Get cities directly from the state key
    const cities = countryData[state]
    if (!cities || !Array.isArray(cities)) return []
    return cities
  }

  useEffect(() => {
    // Get user role and permissions from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUserRole(userData.role)
          setUserPermissions(userData.permissions)
        } catch (error) {
          console.error('Failed to parse user data:', error)
          // Fallback to demo mode
          const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
          const storedPermissions = localStorage.getItem('demoPermissions')
          if (storedRole) {
            setUserRole(storedRole)
            setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
          }
        }
      } else {
        // Fallback to demo mode
        const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
        const storedPermissions = localStorage.getItem('demoPermissions')
        if (storedRole) {
          setUserRole(storedRole)
          setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
        } else {
          // No authentication found, redirect to login
          router.push('/login')
        }
      }
    }
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Reset state and city when country changes
    if (name === 'country') {
      setFormData(prev => ({ ...prev, state: '', city: '' }))
    }

    // Reset city when state changes
    if (name === 'state') {
      setFormData(prev => ({ ...prev, city: '' }))
    }
  }

  const handlePointOfContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPointOfContact(prev => ({ ...prev, [name]: value }))
  }

  const handleDpiitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target
    if (name === 'certificate' && files) {
      setDpiitData(prev => ({ ...prev, certificate: files[0] }))
    } else {
      setDpiitData(prev => ({ ...prev, [name]: value }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.clientOnboardingDate) newErrors.clientOnboardingDate = 'Client onboarding date is required'
    if (!formData.companyType) newErrors.companyType = 'Company type is required'

    if (formData.companyType === 'Individual') {
      if (!formData.individualName.trim()) newErrors.individualName = 'Individual name is required'
    } else {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    }

    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.state) newErrors.state = 'State is required'
    if (!formData.city) newErrors.city = 'City is required'

    // DPIIT validation
    if (formData.dpiitRegister === 'Yes') {
      if (!dpiitData.validTill) newErrors.dpiitValidTill = 'DPIIT valid till date is required'
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

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      const data = await response.json()

      if (!response.ok) {
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

      // Redirect back to customers page
      router.push('/dashboard/customers')

    } catch (error) {
      console.error('Error creating customer:', error)
      alert(error instanceof Error ? error.message : 'Failed to create customer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
      <PageTransition className="space-y-6 relative">
        <FloatingParticles count={15} color="#3B82F6" size={3} />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <User className="mr-3 h-8 w-8 text-blue-600" />
                Add New Customer
              </h1>
              <p className="text-gray-600 mt-1">Create a new customer profile with comprehensive details</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-md">
          <form onSubmit={handleSubmit} className="form-container p-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Onboarding Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Onboarding Date *
                  </label>
                  <input
                    type="date"
                    name="clientOnboardingDate"
                    value={formData.clientOnboardingDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.clientOnboardingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.clientOnboardingDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientOnboardingDate}</p>
                  )}
                </div>

                {/* Type of Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Company *
                  </label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.companyType ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select company type</option>
                    {companyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.companyType && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Company/Individual Name Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-600" />
                {formData.companyType === 'Individual' ? 'Individual Details' : 'Company Details'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formData.companyType === 'Individual' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Individual Name *
                    </label>
                    <input
                      type="text"
                      name="individualName"
                      value={formData.individualName}
                      onChange={handleInputChange}
                      placeholder="Enter individual name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.individualName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.individualName && (
                      <p className="text-red-500 text-sm mt-1">{errors.individualName}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company's Email ID *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter company email"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company's Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter company phone number"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                Address Information
              </h3>
              <div className="space-y-6">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company's Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter company address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Location Cascading Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-1">{errors.country}</p>
                    )}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!formData.country}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select state</option>
                      {formData.country && getStatesForCountry(formData.country).map((stateObj, index) => (
                        <option key={stateObj?.state || index} value={stateObj?.state || ''}>{stateObj?.state || ''}</option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                    )}
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!formData.state}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select city</option>
                      {formData.state && getCitiesForState(formData.country, formData.state).map((city, index) => (
                        <option key={city || index} value={city || ''}>{city || ''}</option>
                      ))}
                    </select>
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="Enter GST number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* DPIIT Registration Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-blue-600" />
                DPIIT Registration
              </h3>
              <div className="space-y-6">
                {/* DPIIT Register */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DPIIT Register
                  </label>
                  <select
                    name="dpiitRegister"
                    value={formData.dpiitRegister}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* DPIIT Valid Till (conditional) */}
                {formData.dpiitRegister === 'Yes' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DPIIT Valid Till *
                      </label>
                      <input
                        type="date"
                        name="validTill"
                        value={dpiitData.validTill}
                        onChange={handleDpiitChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          errors.dpiitValidTill ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.dpiitValidTill && (
                        <p className="text-red-500 text-sm mt-1">{errors.dpiitValidTill}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        DPIIT Certificate
                      </label>
                      <input
                        type="file"
                        name="certificate"
                        onChange={handleDpiitChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PDF, JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Point of Contact Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Point of Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={pointOfContact.name}
                    onChange={handlePointOfContactChange}
                    placeholder="Enter contact name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={pointOfContact.phone}
                    onChange={handlePointOfContactChange}
                    placeholder="Enter contact phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={pointOfContact.email}
                    onChange={handlePointOfContactChange}
                    placeholder="Enter contact email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      <span>Create Customer</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

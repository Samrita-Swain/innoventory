'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { User, Mail, Phone, Building, MapPin, Globe, Calendar, FileText, Upload, Award, ArrowLeft, Save } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'
import anime from 'animejs'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  address?: string
  country: string
  isActive: boolean
  createdAt: string
  _count?: {
    orders: number
  }
  // Comprehensive fields
  clientOnboardingDate?: string
  companyType?: string
  companyName?: string
  individualName?: string
  city?: string
  state?: string
  username?: string
  gstNumber?: string
  dpiitRegister?: string
  dpiitValidTill?: string
  pointOfContact?: string
}

interface PointOfContact {
  id: string
  name: string
  phone: string
  email: string
}

import { globalLocationData } from '../../../../../data/globalLocationData'

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

export default function EditCustomerPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    country: '',
    isActive: true,
    clientOnboardingDate: '',
    companyType: '',
    companyName: '',
    individualName: '',
    city: '',
    state: '',
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

    // Fetch customer data
    fetchCustomer()
  }, [router, customerId])

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const customerData = await response.json()
        setCustomer(customerData)

        // Pre-populate form with customer data
        setFormData({
          name: customerData.name || '',
          email: customerData.email || '',
          phone: customerData.phone || '',
          company: customerData.company || '',
          address: customerData.address || '',
          country: customerData.country || '',
          isActive: customerData.isActive,
          clientOnboardingDate: customerData.clientOnboardingDate
            ? new Date(customerData.clientOnboardingDate).toISOString().split('T')[0]
            : '',
          companyType: customerData.companyType || '',
          companyName: customerData.companyName || '',
          individualName: customerData.individualName || '',
          city: customerData.city || '',
          state: customerData.state || '',
          username: customerData.username || '',
          gstNumber: customerData.gstNumber || '',
          dpiitRegister: customerData.dpiitRegister || ''
        })

        if (customerData.dpiitValidTill) {
          setDpiitData(prev => ({
            ...prev,
            validTill: new Date(customerData.dpiitValidTill).toISOString().split('T')[0]
          }))
        }

        // Set point of contact if available
        if (customerData.pointOfContact) {
          try {
            const poc = JSON.parse(customerData.pointOfContact)
            setPointOfContact(poc)
          } catch (e) {
            // If parsing fails, treat as string
            setPointOfContact(prev => ({ ...prev, name: customerData.pointOfContact }))
          }
        }

      } else if (response.status === 404) {
        alert('Customer not found. Redirecting to customers list...')
        router.push('/dashboard/customers')
      } else {
        alert('Failed to load customer details')
        router.push('/dashboard/customers')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      alert('Failed to load customer details')
      router.push('/dashboard/customers')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.company.trim()) newErrors.company = 'Company is required'
    if (!formData.country) newErrors.country = 'Country is required'

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
      const token = localStorage.getItem('token')

      if (!token) {
        throw new Error('Please login again to continue')
      }

      // Prepare submit data
      const submitData = {
        ...formData,
        pointOfContact: JSON.stringify(pointOfContact)
      }

      // Add DPIIT data if applicable
      if (formData.dpiitRegister === 'Yes') {
        submitData.dpiitValidTill = dpiitData.validTill
      }

      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          throw new Error('Session expired. Please login again.')
        }

        if (response.status === 404) {
          throw new Error('Customer not found. It may have been deleted by another user.')
        }

        const errorMessage = data.error || `Failed to update customer (${response.status})`
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
      console.error('Error updating customer:', error)
      alert(error instanceof Error ? error.message : 'Failed to update customer')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!customer) {
    return (
      <DashboardLayout userRole={userRole} userPermissions={userPermissions}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Customer not found</h2>
          <p className="text-gray-600 mt-2">The customer you're looking for doesn't exist.</p>
        </div>
      </DashboardLayout>
    )
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
                <User className="mr-3 h-8 w-8 text-green-600" />
                Edit Customer
              </h1>
              <p className="text-gray-600 mt-1">Update customer information and details</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-md">
          <form onSubmit={handleSubmit} className="form-container p-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-green-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter customer name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Client Onboarding Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Onboarding Date
                  </label>
                  <input
                    type="date"
                    name="clientOnboardingDate"
                    value={formData.clientOnboardingDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Company/Individual Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-green-600" />
                Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type of Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Company
                  </label>
                  <select
                    name="companyType"
                    value={formData.companyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Select company type</option>
                    {companyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.company && (
                    <p className="text-red-500 text-sm mt-1">{errors.company}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="mr-2 h-5 w-5 text-green-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
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
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-green-600" />
                Address Information
              </h3>
              <div className="space-y-6">
                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter address"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
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
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      disabled={!formData.country}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select state</option>
                      {formData.country && getStatesForCountry(formData.country).map((stateObj, index) => (
                        <option key={stateObj?.state || index} value={stateObj?.state || ''}>{stateObj?.state || ''}</option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!formData.state}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select city</option>
                      {formData.state && getCitiesForState(formData.country, formData.state).map((city, index) => (
                        <option key={city || index} value={city || ''}>{city || ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* DPIIT Registration Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-green-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                <User className="mr-2 h-5 w-5 text-green-600" />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="mr-2 h-5 w-5 text-green-600" />
                Status
              </h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active Customer
                </label>
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
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Update Customer</span>
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

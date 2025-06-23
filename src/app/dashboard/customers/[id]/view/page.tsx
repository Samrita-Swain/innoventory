'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import { User, Mail, Phone, Building, MapPin, Globe, Calendar, FileText, Award, ArrowLeft, Eye } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PageTransition from '@/components/animations/PageTransition'
import FloatingParticles from '@/components/animations/FloatingParticles'

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

export default function ViewCustomerPage() {
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
                <Eye className="mr-3 h-8 w-8 text-blue-600" />
                View Customer
              </h1>
              <p className="text-gray-600 mt-1">Customer information and details</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-md">
          <div className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.name}
                  </div>
                </div>

                {/* Client Onboarding Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Onboarding Date
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.clientOnboardingDate || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-blue-600" />
                Company Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type of Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Company
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.companyType || 'N/A'}
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.companyName || formData.company || 'N/A'}
                  </div>
                </div>

                {/* Individual Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Individual Name
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.individualName || 'N/A'}
                  </div>
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.gstNumber || 'N/A'}
                  </div>
                </div>

                {/* DPIIT Register */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DPIIT Register
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.dpiitRegister || 'N/A'}
                  </div>
                </div>

                {/* DPIIT Valid Till */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DPIIT Valid Till
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {dpiitData.validTill || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.email}
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.phone || 'N/A'}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.username || 'N/A'}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      formData.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.country}
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.state || 'N/A'}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {formData.city || 'N/A'}
                  </div>
                </div>

                {/* Full Address */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 min-h-[80px]">
                    {formData.address || 'N/A'}
                  </div>
                </div>
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
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {pointOfContact.name || 'N/A'}
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {pointOfContact.phone || 'N/A'}
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {pointOfContact.email || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* System Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                System Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total Orders */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Orders
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {customer._count?.orders || 0}
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created Date
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Customers</span>
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  )
}

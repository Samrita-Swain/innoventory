'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, User, Building2, DollarSign, Calendar, CheckCircle, Circle, Upload, Hash, AlertCircle, MessageSquare } from 'lucide-react'
import anime from 'animejs'

interface CreateOrderFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type FormSection = 'customer' | 'vendor' | 'order'

interface Customer {
  id: string
  name: string
  email: string
  company: string
  phone: string
  address: string
}

interface Vendor {
  id: string
  name: string
  email: string
  company: string
  specialization: string
  phone: string
}

interface CustomerFormData {
  customerId: string
  customerName: string
  customerEmail: string
  customerCompany: string
  customerPhone: string
  customerAddress: string
  orderOnboardingDate: string
  orderReferenceNumber: string
  orderFriendlyImage: File | null
  typeOfWork: string
  workCompletionDate: string
  documentsProvided: File | null
  invoiceForCustomer: File | null
  totalInvoiceValue: string
  totalGstGovtFees: string
  paymentExpectedDate: string
}

interface VendorFormData {
  vendorId: string
  vendorName: string
  vendorEmail: string
  vendorCompany: string
  vendorSpecialization: string
  vendorPhone: string
  // New fields from specification
  onboardingDate: string
  currentStatus: string
  statusComment: string
  statusChangeDate: string
  workCompletionExpected: string
  documentsProvided: File | null
  invoiceFromVendor: File | null
  amountToBePaid: string
  amountPaidToVendor: string
}

interface OrderFormData {
  title: string
  description: string
  type: string
  country: string
  priority: string
  amount: string
  dueDate: string
  // New fields from specification
  dateOfCompletion: string
  countryToBeImplemented: string
  workDocuments: File | null
  applicationDairyNumber: string
  dateOfFilingAtPO: string
  lawyerReferenceNumber: string
}

const workTypes = [
  { value: 'PATENTS', label: 'Patents' },
  { value: 'TRADEMARKS', label: 'Trademarks' },
  { value: 'COPYRIGHTS', label: 'Copyrights' },
  { value: 'DESIGNS', label: 'Designs' },
  { value: 'CONSULTANCY', label: 'Consultancy' },
  { value: 'AUDIT_SERVICE', label: 'Audit Service' },
  { value: 'AGREEMENT_DRAFTING', label: 'Agreement drafting' },
  { value: 'OTHERS', label: 'Others' }
]

const vendorStatusOptions = [
  { value: 'YET_TO_START', label: 'Yet to start' },
  { value: 'PENDING_WITH_CLIENT', label: 'Pending with client' },
  { value: 'PENDING_WITH_VENDOR', label: 'Pending with Vendor' },
  { value: 'BLOCKED', label: 'blocked' },
  { value: 'COMPLETED', label: 'completed' }
]

const CreateOrderForm = ({ isOpen, onClose, onSuccess }: CreateOrderFormProps) => {
  const [activeSection, setActiveSection] = useState<FormSection>('customer')
  const [completedSections, setCompletedSections] = useState<Set<FormSection>>(new Set())

  const [customerData, setCustomerData] = useState<CustomerFormData>({
    customerId: '',
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    customerPhone: '',
    customerAddress: '',
    orderOnboardingDate: '',
    orderReferenceNumber: '',
    orderFriendlyImage: null,
    typeOfWork: '',
    workCompletionDate: '',
    documentsProvided: null,
    invoiceForCustomer: null,
    totalInvoiceValue: '',
    totalGstGovtFees: '',
    paymentExpectedDate: ''
  })

  const [vendorData, setVendorData] = useState<VendorFormData>({
    vendorId: '',
    vendorName: '',
    vendorEmail: '',
    vendorCompany: '',
    vendorSpecialization: '',
    vendorPhone: '',
    // New fields from specification
    onboardingDate: '',
    currentStatus: '',
    statusComment: '',
    statusChangeDate: '',
    workCompletionExpected: '',
    documentsProvided: null,
    invoiceFromVendor: null,
    amountToBePaid: '',
    amountPaidToVendor: ''
  })

  const [orderData, setOrderData] = useState<OrderFormData>({
    title: '',
    description: '',
    type: '',
    country: '',
    priority: '',
    amount: '',
    dueDate: '',
    // New fields from specification
    dateOfCompletion: '',
    countryToBeImplemented: '',
    workDocuments: null,
    applicationDairyNumber: '',
    dateOfFilingAtPO: '',
    lawyerReferenceNumber: ''
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchData()
      generateOrderReference()
    }
  }, [isOpen])

  const generateOrderReference = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    const referenceNumber = `IS-${timestamp}${randomNum}`
    setCustomerData(prev => ({ ...prev, orderReferenceNumber: referenceNumber }))
  }

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`
      }

      // Fetch customers, vendors, and users in parallel
      const [customersRes, vendorsRes] = await Promise.all([
        fetch('/api/customers', { headers }),
        fetch('/api/vendors', { headers })
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }

      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json()
        setVendors(vendorsData)
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCustomerFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null
    setCustomerData(prev => ({ ...prev, [fieldName]: file }))
    // Clear error when file is selected
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleVendorFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null
    setVendorData(prev => ({ ...prev, [fieldName]: file }))
    // Clear error when file is selected
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleOrderFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null
    setOrderData(prev => ({ ...prev, [fieldName]: file }))
    // Clear error when file is selected
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const handleVendorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVendorData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleVendorStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    const currentDate = new Date().toISOString().split('T')[0]
    setVendorData(prev => ({
      ...prev,
      currentStatus: value,
      statusChangeDate: currentDate
    }))
    // Clear error when field is filled
    if (errors.currentStatus) {
      setErrors(prev => ({ ...prev, currentStatus: '' }))
    }
  }

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setOrderData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleCustomerSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const customerId = e.target.value
    const selectedCustomer = customers.find((c: Customer) => c.id === customerId)

    if (selectedCustomer) {
      setCustomerData(prev => ({
        ...prev,
        customerId,
        customerName: selectedCustomer.name || '',
        customerEmail: selectedCustomer.email || '',
        customerCompany: selectedCustomer.company || '',
        customerPhone: selectedCustomer.phone || '',
        customerAddress: selectedCustomer.address || ''
      }))
    } else {
      setCustomerData(prev => ({
        ...prev,
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        customerPhone: '',
        customerAddress: ''
      }))
    }
  }

  const handleVendorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vendorId = e.target.value
    const selectedVendor = vendors.find((v: Vendor) => v.id === vendorId)

    if (selectedVendor) {
      setVendorData(prev => ({
        ...prev,
        vendorId,
        vendorName: selectedVendor.name || '',
        vendorEmail: selectedVendor.email || '',
        vendorCompany: selectedVendor.company || '',
        vendorSpecialization: selectedVendor.specialization || '',
        vendorPhone: selectedVendor.phone || ''
      }))
    } else {
      setVendorData(prev => ({
        ...prev,
        vendorId: '',
        vendorName: '',
        vendorEmail: '',
        vendorCompany: '',
        vendorSpecialization: '',
        vendorPhone: ''
      }))
    }
  }

  const validateCustomerForm = () => {
    const newErrors: Record<string, string> = {}

    if (!customerData.customerId) newErrors.customerId = 'Customer selection is required'
    if (!customerData.customerName.trim()) newErrors.customerName = 'Customer name is required'
    if (!customerData.customerEmail.trim()) newErrors.customerEmail = 'Customer email is required'
    if (!customerData.orderOnboardingDate) newErrors.orderOnboardingDate = 'Order onboarding date is required'
    if (!customerData.orderFriendlyImage) newErrors.orderFriendlyImage = 'Order friendly image is required'
    if (!customerData.typeOfWork) newErrors.typeOfWork = 'Type of work is required'
    if (!customerData.workCompletionDate) newErrors.workCompletionDate = 'Work completion date is required'
    if (!customerData.documentsProvided) newErrors.documentsProvided = 'Documents provided are required'
    if (!customerData.invoiceForCustomer) newErrors.invoiceForCustomer = 'Invoice for customer is required'
    if (!customerData.totalInvoiceValue.trim()) newErrors.totalInvoiceValue = 'Total invoice value is required'
    if (!customerData.paymentExpectedDate) newErrors.paymentExpectedDate = 'Payment expected date is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateVendorForm = () => {
    const newErrors: Record<string, string> = {}

    // Original required fields
    if (!vendorData.vendorId) newErrors.vendorId = 'Vendor selection is required'
    if (!vendorData.vendorName.trim()) newErrors.vendorName = 'Vendor name is required'
    if (!vendorData.vendorEmail.trim()) newErrors.vendorEmail = 'Vendor email is required'

    // New required fields from specification
    if (!vendorData.onboardingDate) newErrors.onboardingDate = 'Date of onboarding vendor is required'
    if (!vendorData.currentStatus) newErrors.currentStatus = 'Current status is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateOrderForm = () => {
    const newErrors: Record<string, string> = {}

    // No required fields in the new Order Part specification
    // All fields are optional according to the image

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSectionComplete = (section: FormSection) => {
    let isValid = false

    switch (section) {
      case 'customer':
        isValid = validateCustomerForm()
        break
      case 'vendor':
        isValid = validateVendorForm()
        break
      case 'order':
        isValid = validateOrderForm()
        break
    }

    if (isValid) {
      setCompletedSections(prev => new Set([...prev, section]))
      // Move to next section
      if (section === 'customer') setActiveSection('vendor')
      else if (section === 'vendor') setActiveSection('order')
    } else {
      // Animate error fields
      const errorFields = Object.keys(errors)
      errorFields.forEach(field => {
        const element = document.querySelector(`[name="${field}"]`)
        if (element) {
          anime({
            targets: element,
            translateX: [-10, 10, -10, 10, 0],
            duration: 400,
            easing: 'easeInOutSine'
          })
        }
      })
    }
  }

  const isCreateOrderEnabled = () => {
    return completedSections.has('customer') &&
           completedSections.has('vendor') &&
           completedSections.has('order')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isCreateOrderEnabled()) {
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('token')

      // Combine all form data
      const combinedFormData = {
        title: orderData.title,
        description: orderData.description,
        type: orderData.type,
        customerId: customerData.customerId,
        vendorId: vendorData.vendorId,
        country: orderData.country,
        priority: orderData.priority,
        amount: orderData.amount,
        dueDate: orderData.dueDate
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(combinedFormData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order')
      }

      // Success animation
      anime({
        targets: '.form-container',
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeInOutSine'
      })

      // Reset all forms
      setCustomerData({
        customerId: '',
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        customerPhone: '',
        customerAddress: '',
        orderOnboardingDate: '',
        orderReferenceNumber: '',
        orderFriendlyImage: null,
        typeOfWork: '',
        workCompletionDate: '',
        documentsProvided: null,
        invoiceForCustomer: null,
        totalInvoiceValue: '',
        totalGstGovtFees: '',
        paymentExpectedDate: ''
      })

      setVendorData({
        vendorId: '',
        vendorName: '',
        vendorEmail: '',
        vendorCompany: '',
        vendorSpecialization: '',
        vendorPhone: '',
        // New fields from specification
        onboardingDate: '',
        currentStatus: '',
        statusComment: '',
        statusChangeDate: '',
        workCompletionExpected: '',
        documentsProvided: null,
        invoiceFromVendor: null,
        amountToBePaid: '',
        amountPaidToVendor: ''
      })

      setOrderData({
        title: '',
        description: '',
        type: '',
        country: '',
        priority: '',
        amount: '',
        dueDate: '',
        // New fields from specification
        dateOfCompletion: '',
        countryToBeImplemented: '',
        workDocuments: null,
        applicationDairyNumber: '',
        dateOfFilingAtPO: '',
        lawyerReferenceNumber: ''
      })

      setCompletedSections(new Set())
      setActiveSection('customer')

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Error creating order:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create order' })
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
        className="form-container bg-white w-full h-full overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 h-6 w-6 text-purple-600" />
            Create New Order
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Section Navigation */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-4">
            {/* Customer Part Button */}
            <button
              type="button"
              onClick={() => setActiveSection('customer')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'customer'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {completedSections.has('customer') ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 mr-2" />
              )}
              Customer Part
            </button>

            {/* Vendor Part Button */}
            <button
              type="button"
              onClick={() => setActiveSection('vendor')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'vendor'
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {completedSections.has('vendor') ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 mr-2" />
              )}
              Vendor Part
            </button>

            {/* Order Part Button */}
            <button
              type="button"
              onClick={() => setActiveSection('order')}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeSection === 'order'
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
            >
              {completedSections.has('order') ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 mr-2" />
              )}
              Order Part
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Customer Form Section */}
          {activeSection === 'customer' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-blue-700 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Customer & Order Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Order Onboarding Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Order Onboarding Date *
                  </label>
                  <input
                    type="date"
                    name="orderOnboardingDate"
                    value={customerData.orderOnboardingDate}
                    onChange={handleCustomerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.orderOnboardingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.orderOnboardingDate && <p className="text-red-500 text-sm mt-1">{errors.orderOnboardingDate}</p>}
                </div>

                {/* Order Reference Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    Order Reference Number (Auto Generated)
                  </label>
                  <input
                    type="text"
                    name="orderReferenceNumber"
                    value={customerData.orderReferenceNumber}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Auto generated with IS-"
                    readOnly
                  />
                </div>

                {/* Order Friendly Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Order Friendly Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleCustomerFileChange(e, 'orderFriendlyImage')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.orderFriendlyImage ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.orderFriendlyImage && <p className="text-red-500 text-sm mt-1">{errors.orderFriendlyImage}</p>}
                  {customerData.orderFriendlyImage && (
                    <p className="text-sm text-green-600 mt-1">✓ {customerData.orderFriendlyImage.name}</p>
                  )}
                </div>

                {/* Customer Selection */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Customer *
                  </label>
                  <select
                    name="customerId"
                    value={customerData.customerId}
                    onChange={handleCustomerSelect}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.customerId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer: Customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.company} - {customer.name}
                      </option>
                    ))}
                  </select>
                  {errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
                </div>

                {/* Type of Work */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Type of Work *
                  </label>
                  <select
                    name="typeOfWork"
                    value={customerData.typeOfWork}
                    onChange={handleCustomerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.typeOfWork ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select type of work</option>
                    {workTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  {errors.typeOfWork && <p className="text-red-500 text-sm mt-1">{errors.typeOfWork}</p>}
                </div>

                {/* Date of Work Completion Expected */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of Work Completion Expected *
                  </label>
                  <input
                    type="date"
                    name="workCompletionDate"
                    value={customerData.workCompletionDate}
                    onChange={handleCustomerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.workCompletionDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.workCompletionDate && <p className="text-red-500 text-sm mt-1">{errors.workCompletionDate}</p>}
                </div>

                {/* Date of Payment Expected */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of Payment Expected *
                  </label>
                  <input
                    type="date"
                    name="paymentExpectedDate"
                    value={customerData.paymentExpectedDate}
                    onChange={handleCustomerChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.paymentExpectedDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.paymentExpectedDate && <p className="text-red-500 text-sm mt-1">{errors.paymentExpectedDate}</p>}
                </div>

                {/* Documents Provided */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Documents Provided (as part of order) *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleCustomerFileChange(e, 'documentsProvided')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.documentsProvided ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.documentsProvided && <p className="text-red-500 text-sm mt-1">{errors.documentsProvided}</p>}
                  {customerData.documentsProvided && (
                    <p className="text-sm text-green-600 mt-1">✓ {customerData.documentsProvided.name}</p>
                  )}
                </div>

                {/* Invoice for Customer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Invoice for the Customer *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleCustomerFileChange(e, 'invoiceForCustomer')}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.invoiceForCustomer ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.invoiceForCustomer && <p className="text-red-500 text-sm mt-1">{errors.invoiceForCustomer}</p>}
                  {customerData.invoiceForCustomer && (
                    <p className="text-sm text-green-600 mt-1">✓ {customerData.invoiceForCustomer.name}</p>
                  )}
                </div>

                {/* Total Invoice Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Total Invoice Value *
                  </label>
                  <input
                    type="number"
                    name="totalInvoiceValue"
                    value={customerData.totalInvoiceValue}
                    onChange={handleCustomerChange}
                    min="0"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      errors.totalInvoiceValue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter total invoice value"
                  />
                  {errors.totalInvoiceValue && <p className="text-red-500 text-sm mt-1">{errors.totalInvoiceValue}</p>}
                </div>

                {/* Total GST + Govt Fees */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Total value of GST + Govt fees
                  </label>
                  <input
                    type="number"
                    name="totalGstGovtFees"
                    value={customerData.totalGstGovtFees}
                    onChange={handleCustomerChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter GST + Government fees"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('customer')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Complete Customer Part
                </button>
              </div>
            </motion.div>
          )}

          {/* Vendor Form Section */}
          {activeSection === 'vendor' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-green-700 flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Vendor Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Onboarding vendor for this order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of Onboarding vendor for this order *
                  </label>
                  <input
                    type="date"
                    name="onboardingDate"
                    value={vendorData.onboardingDate}
                    onChange={handleVendorChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.onboardingDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.onboardingDate && <p className="text-red-500 text-sm mt-1">{errors.onboardingDate}</p>}
                </div>

                {/* Vendor Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Vendor Name *
                  </label>
                  <select
                    name="vendorId"
                    value={vendorData.vendorId}
                    onChange={handleVendorSelect}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.vendorId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select vendor</option>
                    {vendors.map((vendor: Vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.company} - {vendor.name}
                      </option>
                    ))}
                  </select>
                  {errors.vendorId && <p className="text-red-500 text-sm mt-1">{errors.vendorId}</p>}
                </div>

                {/* Current Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Current Status *
                  </label>
                  <select
                    name="currentStatus"
                    value={vendorData.currentStatus}
                    onChange={handleVendorStatusChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                      errors.currentStatus ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select current status</option>
                    {vendorStatusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  {errors.currentStatus && <p className="text-red-500 text-sm mt-1">{errors.currentStatus}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    Options: Yet to start, Pending with client, Pending with Vendor, blocked, completed
                  </p>
                </div>

                {/* Status Comment */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="inline h-4 w-4 mr-1" />
                    Comment *
                  </label>
                  <textarea
                    name="statusComment"
                    value={vendorData.statusComment}
                    onChange={handleVendorChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Anytime the change happens to the status, we need to ask for the comments. All the comments will be stored for showing on order page"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Required when status changes. All comments will be stored for showing on order page.
                  </p>
                </div>

                {/* Date of change of status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of change of status
                  </label>
                  <input
                    type="date"
                    name="statusChangeDate"
                    value={vendorData.statusChangeDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-1">Auto-updated when status changes</p>
                </div>

                {/* Date of work completion expected from vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of work completion expected from vendor
                  </label>
                  <input
                    type="date"
                    name="workCompletionExpected"
                    value={vendorData.workCompletionExpected}
                    onChange={handleVendorChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Documents Provided by vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Documents Provided (as part of order) by vendor
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleVendorFileChange(e, 'documentsProvided')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                  {vendorData.documentsProvided && (
                    <p className="text-sm text-green-600 mt-1">✓ {vendorData.documentsProvided.name}</p>
                  )}
                </div>

                {/* Invoice from the Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Invoice from the Vendor
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleVendorFileChange(e, 'invoiceFromVendor')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                  {vendorData.invoiceFromVendor && (
                    <p className="text-sm text-green-600 mt-1">✓ {vendorData.invoiceFromVendor.name}</p>
                  )}
                </div>

                {/* Amount to be Paid to vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Amount to be Paid to vendor
                  </label>
                  <input
                    type="number"
                    name="amountToBePaid"
                    value={vendorData.amountToBePaid}
                    onChange={handleVendorChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter amount to be paid"
                  />
                </div>

                {/* Amount Paid to vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Amount Paid to vendor
                  </label>
                  <input
                    type="number"
                    name="amountPaidToVendor"
                    value={vendorData.amountPaidToVendor}
                    onChange={handleVendorChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    placeholder="Enter amount paid"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('vendor')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Complete Vendor Part
                </button>
              </div>
            </motion.div>
          )}

          {/* Order Form Section */}
          {activeSection === 'order' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-purple-700 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Order Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date of Completion of order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of Completion of order
                  </label>
                  <input
                    type="date"
                    name="dateOfCompletion"
                    value={orderData.dateOfCompletion}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Country to be Implemented in */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline h-4 w-4 mr-1" />
                    Country to be Implemented in
                  </label>
                  <input
                    type="text"
                    name="countryToBeImplemented"
                    value={orderData.countryToBeImplemented}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter country to be implemented in"
                  />
                </div>

                {/* Work Documents */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Upload className="inline h-4 w-4 mr-1" />
                    Work Documents
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => handleOrderFileChange(e, 'workDocuments')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                  {orderData.workDocuments && (
                    <p className="text-sm text-green-600 mt-1">✓ {orderData.workDocuments.name}</p>
                  )}
                </div>

                {/* Application/Dairy Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    Application/Dairy Number
                  </label>
                  <input
                    type="text"
                    name="applicationDairyNumber"
                    value={orderData.applicationDairyNumber}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter application/dairy number"
                  />
                </div>

                {/* Date of Filing at PO */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Date of Filing at PO
                  </label>
                  <input
                    type="date"
                    name="dateOfFilingAtPO"
                    value={orderData.dateOfFilingAtPO}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  />
                </div>

                {/* Lawyer Reference Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="inline h-4 w-4 mr-1" />
                    Lawyer Reference Number
                  </label>
                  <input
                    type="text"
                    name="lawyerReferenceNumber"
                    value={orderData.lawyerReferenceNumber}
                    onChange={handleOrderChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter lawyer reference number"
                  />
                </div>


              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSectionComplete('order')}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Complete Order Part
                </button>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: isCreateOrderEnabled() ? 1.02 : 1 }}
              whileTap={{ scale: isCreateOrderEnabled() ? 0.98 : 1 }}
              type="submit"
              disabled={isLoading || !isCreateOrderEnabled()}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isCreateOrderEnabled()
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Order...
                </div>
              ) : (
                'Create Order'
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

export default CreateOrderForm

'use client'

import { useState } from 'react'
import AddCustomerForm from '@/components/forms/AddCustomerForm'
import AddVendorForm from '@/components/forms/AddVendorForm'
import CreateOrderForm from '@/components/forms/CreateOrderForm'
import CreateSubAdminForm from '@/components/forms/CreateSubAdminForm'

export default function TestFormsPage() {
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [showVendorForm, setShowVendorForm] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [showSubAdminForm, setShowSubAdminForm] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Form Testing Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Form Test */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customer Form</h2>
            <button
              onClick={() => setShowCustomerForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Open Add Customer Form
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Status: {showCustomerForm ? 'Open' : 'Closed'}
            </p>
          </div>

          {/* Vendor Form Test */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Vendor Form</h2>
            <button
              onClick={() => setShowVendorForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Open Add Vendor Form
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Status: {showVendorForm ? 'Open' : 'Closed'}
            </p>
          </div>

          {/* Order Form Test */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order Form</h2>
            <button
              onClick={() => setShowOrderForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Open Create Order Form
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Status: {showOrderForm ? 'Open' : 'Closed'}
            </p>
          </div>

          {/* Sub-Admin Form Test */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Sub-Admin Form</h2>
            <button
              onClick={() => setShowSubAdminForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Open Create Sub-Admin Form
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Status: {showSubAdminForm ? 'Open' : 'Closed'}
            </p>
          </div>
        </div>

        {/* Forms */}
        <AddCustomerForm
          isOpen={showCustomerForm}
          onClose={() => setShowCustomerForm(false)}
          onSuccess={() => {
            alert('Customer created successfully!')
            setShowCustomerForm(false)
          }}
        />

        <AddVendorForm
          isOpen={showVendorForm}
          onClose={() => setShowVendorForm(false)}
          onSuccess={() => {
            alert('Vendor created successfully!')
            setShowVendorForm(false)
          }}
        />

        <CreateOrderForm
          isOpen={showOrderForm}
          onClose={() => setShowOrderForm(false)}
          onSuccess={() => {
            alert('Order created successfully!')
            setShowOrderForm(false)
          }}
        />

        <CreateSubAdminForm
          isOpen={showSubAdminForm}
          onClose={() => setShowSubAdminForm(false)}
          onSuccess={() => {
            alert('Sub-Admin created successfully!')
            setShowSubAdminForm(false)
          }}
        />
      </div>
    </div>
  )
}

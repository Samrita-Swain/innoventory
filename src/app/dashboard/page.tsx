'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import SubAdminDashboard from '@/components/dashboard/SubAdminDashboard'
import AnimatedLoader from '@/components/animations/AnimatedLoader'

// Mock data - In a real app, this would come from your API
const mockAdminData = {
  totalCustomers: 1247,
  totalVendors: 89,
  totalIPsRegistered: 2156,
  totalIPsClosed: 1834,
  customersByCountry: [
    { country: 'United States', count: 456, coordinates: [39.8283, -98.5795] as [number, number] },
    { country: 'United Kingdom', count: 234, coordinates: [55.3781, -3.4360] as [number, number] },
    { country: 'Germany', count: 189, coordinates: [51.1657, 10.4515] as [number, number] },
    { country: 'Canada', count: 167, coordinates: [56.1304, -106.3468] as [number, number] },
    { country: 'Australia', count: 123, coordinates: [-25.2744, 133.7751] as [number, number] }
  ],
  vendorsByCountry: [
    { country: 'United States', count: 34, coordinates: [39.8283, -98.5795] as [number, number] },
    { country: 'India', count: 23, coordinates: [20.5937, 78.9629] as [number, number] },
    { country: 'United Kingdom', count: 18, coordinates: [55.3781, -3.4360] as [number, number] },
    { country: 'Germany', count: 14, coordinates: [51.1657, 10.4515] as [number, number] }
  ],
  workDistribution: [
    { country: 'United States', workCount: 145, coordinates: [39.8283, -98.5795] as [number, number] },
    { country: 'United Kingdom', workCount: 89, coordinates: [55.3781, -3.4360] as [number, number] },
    { country: 'Germany', workCount: 67, coordinates: [51.1657, 10.4515] as [number, number] },
    { country: 'Canada', workCount: 45, coordinates: [56.1304, -106.3468] as [number, number] },
    { country: 'Australia', workCount: 34, coordinates: [-25.2744, 133.7751] as [number, number] },
    { country: 'Japan', workCount: 28, coordinates: [36.2048, 138.2529] as [number, number] }
  ],
  pendingWork: [
    {
      id: '1',
      referenceNumber: 'IP-2024-001',
      title: 'Patent Application for AI Algorithm',
      daysLeft: 2,
      status: 'Pending Review',
      priority: 'URGENT' as const
    },
    {
      id: '2',
      referenceNumber: 'IP-2024-002',
      title: 'Trademark Registration for Brand Logo',
      daysLeft: 5,
      status: 'Documentation Required',
      priority: 'HIGH' as const
    },
    {
      id: '3',
      referenceNumber: 'IP-2024-003',
      title: 'Copyright Filing for Software',
      daysLeft: 8,
      status: 'In Progress',
      priority: 'MEDIUM' as const
    }
  ],
  pendingPayments: [
    {
      id: '1',
      invoiceNumber: 'INV-2024-001',
      orderReferenceNumber: 'IP-2024-001',
      imageUrl: '/api/placeholder/100/100',
      daysLeft: 3,
      amount: 2500,
      currency: 'USD',
      customerName: 'TechCorp Inc.'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024-002',
      orderReferenceNumber: 'IP-2024-004',
      daysLeft: 7,
      amount: 1800,
      currency: 'USD',
      customerName: 'Innovation Labs'
    }
  ],
  yearlyTrends: [
    { year: '2020', customers: 234, vendors: 12, ips: 456 },
    { year: '2021', customers: 456, vendors: 23, ips: 789 },
    { year: '2022', customers: 678, vendors: 34, ips: 1123 },
    { year: '2023', customers: 890, vendors: 56, ips: 1567 },
    { year: '2024', customers: 1247, vendors: 89, ips: 2156 }
  ]
}

const mockSubAdminData = {
  assignedCustomers: 45,
  assignedVendors: 12,
  totalOrders: 78,
  ordersYetToStart: 8,
  ordersPendingWithClient: 15,
  ordersCompleted: 55,
  assignedPendingOrders: [
    {
      id: '1',
      referenceNumber: 'IP-2024-005',
      title: 'Patent Application Review',
      daysLeft: 4,
      status: 'Awaiting Client Response',
      priority: 'HIGH' as const
    },
    {
      id: '2',
      referenceNumber: 'IP-2024-006',
      title: 'Trademark Search Report',
      daysLeft: 9,
      status: 'In Progress',
      priority: 'MEDIUM' as const
    }
  ],
  recentActivities: [
    {
      id: '1',
      description: 'Updated order IP-2024-005 status to "Pending Review"',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      description: 'Added new customer "StartupXYZ"',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      description: 'Completed order IP-2024-003',
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ],
  monthlyProgress: [
    { month: 'Jan', completed: 12, pending: 8 },
    { month: 'Feb', completed: 15, pending: 6 },
    { month: 'Mar', completed: 18, pending: 9 },
    { month: 'Apr', completed: 22, pending: 7 },
    { month: 'May', completed: 25, pending: 12 },
    { month: 'Jun', completed: 20, pending: 15 }
  ]
}

const mockUserInfo = {
  admin: {
    name: 'John Admin',
    email: 'admin@innoventory.com',
    role: 'ADMIN' as const,
    permissions: ['MANAGE_USERS', 'MANAGE_CUSTOMERS', 'MANAGE_VENDORS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS', 'MANAGE_PAYMENTS', 'VIEW_REPORTS']
  },
  subAdmin: {
    name: 'Jane SubAdmin',
    email: 'subadmin@innoventory.com',
    role: 'SUB_ADMIN' as const,
    permissions: ['MANAGE_CUSTOMERS', 'MANAGE_ORDERS', 'VIEW_ANALYTICS']
  }
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Get user role from localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
      const storedPermissions = localStorage.getItem('demoPermissions')
      
      if (storedRole) {
        setUserRole(storedRole)
        setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
      }
    }

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }, [])

  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedLoader
            size={80}
            color="#3B82F6"
            text="Loading dashboard..."
          />
        </motion.div>
      </div>
    )
  }

  return (
    <DashboardLayout
      userRole={userRole}
      userPermissions={userPermissions}
    >
      {userRole === 'ADMIN' ? (
        <AdminDashboard dashboardData={mockAdminData} />
      ) : (
        <SubAdminDashboard
          dashboardData={mockSubAdminData}
          userInfo={{
            name: mockUserInfo.subAdmin.name,
            email: mockUserInfo.subAdmin.email,
            permissions: userPermissions
          }}
        />
      )}
    </DashboardLayout>
  )
}

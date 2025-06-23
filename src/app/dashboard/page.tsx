'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminDashboard from '@/components/dashboard/AdminDashboard'
import SubAdminDashboard from '@/components/dashboard/SubAdminDashboard'
import AnimatedLoader from '@/components/animations/AnimatedLoader'

// Interface for dashboard data
interface DashboardData {
  totalCustomers: number
  totalVendors: number
  totalIPsRegistered: number
  totalIPsClosed: number
  totalOrders?: number
  customersByCountry: { country: string; count: number; coordinates: [number, number] }[]
  vendorsByCountry: { country: string; count: number; coordinates: [number, number] }[]
  workDistribution: { country: string; workCount: number; coordinates: [number, number] }[]
  pendingWork: Array<{
    id: string
    referenceNumber: string
    title: string
    daysLeft: number
    status: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }>
  pendingPayments: Array<{
    id: string
    invoiceNumber: string
    orderReferenceNumber: string
    imageUrl?: string
    daysLeft: number
    amount: number
    currency: string
    customerName: string
  }>
  yearlyTrends: { year: string; customers: number; vendors: number; ips: number }[]
}

// Interface for sub-admin dashboard data
interface SubAdminDashboardData {
  assignedCustomers: number
  assignedVendors: number
  totalOrders: number
  ordersYetToStart: number
  ordersPendingWithClient: number
  ordersCompleted: number
  assignedPendingOrders: Array<{
    id: string
    referenceNumber: string
    title: string
    daysLeft: number
    status: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  }>
  recentActivities: Array<{
    id: string
    description: string
    createdAt: string
  }>
  monthlyProgress: Array<{
    month: string
    completed: number
    pending: number
  }>
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<'ADMIN' | 'SUB_ADMIN'>('ADMIN')
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [dashboardData, setDashboardData] = useState<DashboardData | SubAdminDashboardData | null>(null)
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  // Function to fetch dashboard data from API
  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        console.error('Failed to fetch dashboard data:', response.statusText)
        setError('Failed to load dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    }
  }

  useEffect(() => {
    setIsClient(true)

    const checkAuth = async () => {
      try {
        // First check if we have a JWT token
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (token && storedUser) {
          // We have JWT authentication, use it
          try {
            const userData = JSON.parse(storedUser)
            setUserRole(userData.role)
            setUserPermissions(userData.permissions)
            setUserInfo({ name: userData.name, email: userData.email })

            // Fetch real dashboard data
            await fetchDashboardData(token)

            setIsLoading(false)
            return
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError)
            // Fall through to demo authentication
          }
        }

        // Fallback to demo authentication for development
        const storedRole = localStorage.getItem('demoRole') as 'ADMIN' | 'SUB_ADMIN'
        const storedPermissions = localStorage.getItem('demoPermissions')

        if (storedRole) {
          setUserRole(storedRole)
          setUserPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])

          // Set default user info for demo mode
          setUserInfo({
            name: storedRole === 'ADMIN' ? 'John Admin' : 'Jane SubAdmin',
            email: storedRole === 'ADMIN' ? 'admin@innoventory.com' : 'subadmin@innoventory.com'
          })

          // For demo mode, set empty dashboard data
          setDashboardData(storedRole === 'ADMIN' ? {
            totalCustomers: 0,
            totalVendors: 0,
            totalIPsRegistered: 0,
            totalIPsClosed: 0,
            totalOrders: 0,
            customersByCountry: [],
            vendorsByCountry: [],
            workDistribution: [],
            pendingWork: [],
            pendingPayments: [],
            yearlyTrends: []
          } : {
            assignedCustomers: 0,
            assignedVendors: 0,
            totalOrders: 0,
            ordersYetToStart: 0,
            ordersPendingWithClient: 0,
            ordersCompleted: 0,
            assignedPendingOrders: [],
            recentActivities: [],
            monthlyProgress: []
          })
        } else {
          // No authentication found, redirect to login
          router.push('/login')
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (!isClient || isLoading || !dashboardData || !userInfo) {
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
            text={error || "Loading dashboard..."}
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
        <AdminDashboard dashboardData={dashboardData as DashboardData} />
      ) : (
        <SubAdminDashboard
          dashboardData={dashboardData as SubAdminDashboardData}
          userInfo={{
            name: userInfo.name,
            email: userInfo.email,
            permissions: userPermissions
          }}
        />
      )}
    </DashboardLayout>
  )
}

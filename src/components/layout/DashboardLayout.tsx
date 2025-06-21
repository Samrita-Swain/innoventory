'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import anime from 'animejs'
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: 'ADMIN' | 'SUB_ADMIN'
  userPermissions: string[]
}

const DashboardLayout = ({ children, userRole, userPermissions }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)
  const menuItemsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate sidebar on mount
    if (sidebarRef.current) {
      anime({
        targets: sidebarRef.current,
        translateX: [-300, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutCubic'
      })
    }

    // Animate menu items with stagger - set initial state and animate
    setTimeout(() => {
      const menuItems = menuItemsRef.current?.children
      if (menuItems) {
        // Set initial state
        anime.set(menuItems, {
          translateX: -20,
          opacity: 0
        })

        // Animate to final state
        anime({
          targets: menuItems,
          translateX: 0,
          opacity: 1,
          duration: 500,
          easing: 'easeOutCubic',
          delay: anime.stagger(100, { start: 200 })
        })
      }
    }, 300)
  }, [])

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      permission: null
    },
    {
      name: 'Customers',
      href: '/dashboard/customers',
      icon: Users,
      permission: 'MANAGE_CUSTOMERS'
    },
    {
      name: 'Vendors',
      href: '/dashboard/vendors',
      icon: Building2,
      permission: 'MANAGE_VENDORS'
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: FileText,
      permission: 'MANAGE_ORDERS'
    },
    {
      name: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      permission: 'VIEW_ANALYTICS'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      permission: userRole === 'ADMIN' ? null : 'MANAGE_USERS'
    }
  ]

  const filteredMenuItems = menuItems.filter(item =>
    !item.permission ||
    userRole === 'ADMIN' ||
    userPermissions.includes(item.permission)
  )

  const handleLogout = () => {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    // Redirect to login
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200 transform opacity-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Innoventory</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav ref={menuItemsRef} className="mt-6 px-3">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700'
                }`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-6">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all duration-200 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg mr-3 bg-gray-100 text-gray-500 group-hover:bg-red-100 group-hover:text-red-700 transition-colors">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Role: <span className="font-medium text-gray-900">{userRole}</span>
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default DashboardLayout

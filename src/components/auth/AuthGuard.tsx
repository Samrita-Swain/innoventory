'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import AnimatedLoader from '@/components/animations/AnimatedLoader'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window === 'undefined') return

        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (!token || !storedUser) {
          // No authentication found, redirect to login
          router.push('/login')
          return
        }

        try {
          // Try to validate token with server
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })

          if (response.ok) {
            // Token is valid
            setIsAuthenticated(true)
          } else if (response.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            router.push('/login')
            return
          } else {
            // Server error, but we have stored user data
            // Use stored data as fallback for offline scenarios
            const userData = JSON.parse(storedUser)
            if (userData && userData.email) {
              setIsAuthenticated(true)
            } else {
              router.push('/login')
              return
            }
          }
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // On network error, try to use stored data
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            if (userData && userData.email) {
              setIsAuthenticated(true)
            } else {
              router.push('/login')
            }
          } catch {
            router.push('/login')
          }
        } else {
          router.push('/login')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatedLoader
            size={80}
            color="#3B82F6"
            text="Checking authentication..."
          />
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}

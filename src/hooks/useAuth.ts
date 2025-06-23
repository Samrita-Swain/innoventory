import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'SUB_ADMIN'
  permissions: string[]
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false
  })
  const router = useRouter()

  const checkAuth = async () => {
    try {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (!token || !storedUser) {
        // No authentication found
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        })
        return
      }

      try {
        const user = JSON.parse(storedUser)
        
        // Validate token with server
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const userData = await response.json()
          setAuthState({
            user: userData,
            token,
            isLoading: false,
            isAuthenticated: true
          })
        } else {
          // Token is invalid, but we have stored user data
          // Use stored data as fallback for offline scenarios
          setAuthState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true
          })
        }
      } catch (parseError) {
        console.error('Failed to parse stored user data:', parseError)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false
      })
    }
  }

  const login = (userData: User, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setAuthState({
      user: userData,
      token,
      isLoading: false,
      isAuthenticated: true
    })
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('demoRole')
    localStorage.removeItem('demoPermissions')
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    })
    router.push('/login')
  }

  const getAuthHeaders = () => {
    const token = authState.token || localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    getAuthHeaders
  }
}

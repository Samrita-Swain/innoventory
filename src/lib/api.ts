// API utility functions with authentication handling

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const apiRequest = async (url: string, options: ApiOptions = {}) => {
  const { requireAuth = true, ...fetchOptions } = options

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  // Add authentication if required
  if (requireAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      // No token available, redirect to login
      window.location.href = '/login'
      throw new ApiError('No authentication token found', 401)
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    // Handle authentication errors
    if (response.status === 401 && requireAuth) {
      // Token is invalid or expired
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      throw new ApiError('Authentication failed', 401, response)
    }

    // Handle other errors
    if (!response.ok) {
      let errorMessage = 'Request failed'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If we can't parse the error response, use the status text
        errorMessage = response.statusText || errorMessage
      }
      throw new ApiError(errorMessage, response.status, response)
    }

    // Return the response for further processing
    return response
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    console.error('API request failed:', error)
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

// Convenience methods
export const apiGet = async (url: string, options: ApiOptions = {}) => {
  const response = await apiRequest(url, { ...options, method: 'GET' })
  return response.json()
}

export const apiPost = async (url: string, data?: any, options: ApiOptions = {}) => {
  const response = await apiRequest(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export const apiPut = async (url: string, data?: any, options: ApiOptions = {}) => {
  const response = await apiRequest(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
  return response.json()
}

export const apiDelete = async (url: string, options: ApiOptions = {}) => {
  const response = await apiRequest(url, { ...options, method: 'DELETE' })
  return response.json()
}

// Form data helper for file uploads
export const apiPostFormData = async (url: string, formData: FormData, options: ApiOptions = {}) => {
  const { requireAuth = true, ...fetchOptions } = options

  // Prepare headers (don't set Content-Type for FormData)
  const headers: HeadersInit = {
    ...fetchOptions.headers,
  }

  // Add authentication if required
  if (requireAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      window.location.href = '/login'
      throw new ApiError('No authentication token found', 401)
    }
  }

  const response = await apiRequest(url, {
    ...fetchOptions,
    method: 'POST',
    headers,
    body: formData,
  })

  return response.json()
}

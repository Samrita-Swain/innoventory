'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, CheckCircle, Clock, AlertTriangle, IndianRupee, XCircle, Ban } from 'lucide-react'

interface StatusDropdownProps {
  currentStatus: string
  orderId: string
  onStatusChange: (orderId: string, newStatus: string) => Promise<void>
  disabled?: boolean
}

const statusOptions = [
  {
    value: 'YET_TO_START',
    label: 'Yet to Start',
    icon: Clock,
    color: 'bg-gray-100 text-gray-800',
    iconColor: 'text-gray-600'
  },
  {
    value: 'IN_PROGRESS',
    label: 'In Progress',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800',
    iconColor: 'text-blue-600'
  },
  {
    value: 'PENDING_WITH_CLIENT',
    label: 'Pending with Client',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800',
    iconColor: 'text-orange-600'
  },
  {
    value: 'PENDING_PAYMENT',
    label: 'Pending Payment',
    icon: IndianRupee,
    color: 'bg-yellow-100 text-yellow-800',
    iconColor: 'text-yellow-600'
  },
  {
    value: 'COMPLETED',
    label: 'Completed',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    iconColor: 'text-green-600'
  },
  {
    value: 'CLOSED',
    label: 'Closed',
    icon: XCircle,
    color: 'bg-purple-100 text-purple-800',
    iconColor: 'text-purple-600'
  },
  {
    value: 'CANCELLED',
    label: 'Cancelled',
    icon: Ban,
    color: 'bg-red-100 text-red-800',
    iconColor: 'text-red-600'
  }
]

const StatusDropdown = ({ currentStatus, orderId, onStatusChange, disabled = false }: StatusDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentStatusOption = statusOptions.find(option => option.value === currentStatus)
  const CurrentIcon = currentStatusOption?.icon || Clock

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Auto-scroll adjustment when clicking on dropdown status elements
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      buttonRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })
    }
  }, [isOpen])

  const handleStatusChange = async (newStatus: string) => {
    console.log('StatusDropdown: handleStatusChange called', {
      currentStatus,
      newStatus,
      orderId,
      isUpdating,
      disabled
    })

    if (newStatus === currentStatus || isUpdating) {
      console.log('StatusDropdown: Skipping - same status or updating')
      return
    }

    // Show confirmation for certain critical status changes
    const criticalStatuses = ['COMPLETED', 'CLOSED', 'CANCELLED']
    if (criticalStatuses.includes(newStatus)) {
      const statusLabel = statusOptions.find(opt => opt.value === newStatus)?.label || newStatus
      const confirmed = confirm(`Are you sure you want to change the status to "${statusLabel}"? This action will be logged.`)
      if (!confirmed) {
        console.log('StatusDropdown: User cancelled confirmation')
        setIsOpen(false)
        return
      }
    }

    console.log('StatusDropdown: Starting status update')
    setIsUpdating(true)
    try {
      await onStatusChange(orderId, newStatus)
      console.log('StatusDropdown: Status update successful')
      setIsOpen(false)
    } catch (error) {
      console.error('StatusDropdown: Failed to update status:', error)
      // Error handling is done in the parent component
    } finally {
      setIsUpdating(false)
    }
  }

  if (disabled) {
    return (
      <div className="flex items-center">
        <CurrentIcon className={`h-4 w-4 ${currentStatusOption?.iconColor || 'text-gray-600'}`} />
        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${currentStatusOption?.color || 'bg-gray-100 text-gray-800'}`}>
          {currentStatusOption?.label || currentStatus.replace('_', ' ')}
        </span>
      </div>
    )
  }

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setButtonRect(rect)

      // Auto-scroll to ensure dropdown will be fully visible
      setTimeout(() => {
        const dropdownHeight = 272 // max-h-64 (256px) + padding (16px)
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom

        if (spaceBelow < dropdownHeight + 20) { // 20px extra margin
          const scrollAmount = dropdownHeight + 20 - spaceBelow
          window.scrollBy({
            top: scrollAmount,
            behavior: 'smooth'
          })
        }
      }, 50)
    }
    setIsOpen(!isOpen)
  }

  return (
    <div ref={dropdownRef} className="relative status-dropdown-container">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={isUpdating}
        data-order-id={orderId}
        className={`flex items-center space-x-1 px-2 py-1 rounded border transition-colors ${
          isUpdating
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-50 cursor-pointer'
        }`}
      >
        <CurrentIcon className={`h-4 w-4 ${currentStatusOption?.iconColor || 'text-gray-600'}`} />
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${currentStatusOption?.color || 'bg-gray-100 text-gray-800'}`}>
          {isUpdating ? 'Updating...' : (currentStatusOption?.label || currentStatus.replace('_', ' '))}
        </span>
        <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown options - positioned under the trigger element using portal */}
      {isOpen && !isUpdating && mounted && buttonRect && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className="fixed w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-[9999]"
            style={{
              top: `${buttonRect.bottom + 8}px`,
              left: `${buttonRect.left}px`,
            }}
          >
            <div
              className="max-h-64 overflow-y-auto py-1"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d1d5db #f9fafb',
                scrollBehavior: 'smooth',
              }}
            >
              {statusOptions.map((option) => {
                const OptionIcon = option.icon
                const isSelected = option.value === currentStatus

                return (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('StatusDropdown: Option clicked', option.value)
                      handleStatusChange(option.value)
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                    style={{
                      minHeight: '48px' // Ensure touch-friendly height
                    }}
                  >
                    <OptionIcon className={`h-4 w-4 mr-3 flex-shrink-0 ${
                      isSelected ? 'text-blue-600' : option.iconColor
                    }`} />
                    <span className="flex-1 text-left font-medium">{option.label}</span>
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

export default StatusDropdown

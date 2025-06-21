'use client'

import { useEffect, useRef, useState } from 'react'
// 
import anime from 'animejs'
import { Clock, AlertTriangle, FileText, ExternalLink } from 'lucide-react'

interface PendingWorkItem {
  id: string
  referenceNumber: string
  title: string
  daysLeft: number
  status: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

interface PendingWorkWidgetProps {
  data: PendingWorkItem[]
  onItemClick?: (referenceNumber: string) => void
  onViewAll?: () => void
  title?: string
}

const PendingWorkWidget = ({
  data,
  onItemClick,
  onViewAll,
  title = "Pending Work Overview"
}: PendingWorkWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-600 font-bold'
    if (daysLeft <= 7) return 'text-orange-600 font-semibold'
    if (daysLeft <= 14) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getDaysLeftIcon = (daysLeft: number) => {
    if (daysLeft <= 3) return <AlertTriangle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-gray-500" />
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)

          // Animate header
          anime({
            targets: headerRef.current,
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutCubic'
          })

          // Animate container
          anime({
            targets: containerRef.current,
            scale: [0.95, 1],
            opacity: [0, 1],
            duration: 700,
            easing: 'easeOutBack',
            delay: 100
          })

          // Animate list items with stagger
          setTimeout(() => {
            const items = containerRef.current?.querySelectorAll('.pending-item')
            if (items) {
              anime({
                targets: items,
                translateX: [-30, 0],
                opacity: [0, 1],
                duration: 500,
                easing: 'easeOutCubic',
                delay: anime.stagger(100)
              })
            }
          }, 300)
        }
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [isVisible])

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-xl shadow-md p-6 opacity-0 transform"
    >
      <div ref={headerRef} className="flex items-center justify-between mb-4 opacity-0 transform">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <FileText className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No pending work items</p>
          </div>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="pending-item border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer opacity-0 transform"
              onClick={() => onItemClick?.(item.referenceNumber)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-blue-600 hover:text-blue-800">
                      {item.referenceNumber}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-gray-600 mb-2">
                    Status: <span className="font-medium">{item.status}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end space-y-1">
                  <div className="flex items-center space-x-1">
                    {getDaysLeftIcon(item.daysLeft)}
                    <span className={`text-sm ${getDaysLeftColor(item.daysLeft)}`}>
                      {item.daysLeft} days
                    </span>
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {onViewAll && data.length > 0 && (
        <button
          onClick={onViewAll}
          className="w-full mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium hover:scale-105 transform duration-200"
        >
          View All Pending Work
        </button>
      )}
    </div>
  )
}

export default PendingWorkWidget

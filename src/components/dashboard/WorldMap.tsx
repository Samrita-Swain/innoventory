'use client'

import { useEffect, useRef, useState } from 'react'
// 
import anime from 'animejs'
import dynamic from 'next/dynamic'

// Dynamically import the entire map component to avoid SSR issues
const DynamicMap = dynamic(() => import('./WorldMapClient'), {
  ssr: false,
  loading: () => (
    <div className="h-96 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Loading map...</p>
      </div>
    </div>
  )
})

interface CountryData {
  country: string
  workCount: number
  coordinates: [number, number]
}

interface WorldMapProps {
  data: CountryData[]
  onCountryClick?: (country: string) => void
  title?: string
}

const WorldMap = ({ data, onCountryClick, title = "Geographic Work Distribution" }: WorldMapProps) => {
  const [isClient, setIsClient] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const legendRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)

          // Animate title
          anime({
            targets: titleRef.current,
            translateX: [-50, 0],
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutCubic'
          })

          // Animate container
          anime({
            targets: containerRef.current,
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 800,
            easing: 'easeOutBack',
            delay: 200
          })

          // Animate legend items
          anime({
            targets: legendRef.current?.children,
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutCubic',
            delay: anime.stagger(100, { start: 600 })
          })
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
      <h3 ref={titleRef} className="text-lg font-semibold text-gray-900 mb-4 opacity-0 transform">{title}</h3>

      {isClient ? (
        <DynamicMap data={data} onCountryClick={onCountryClick} />
      ) : (
        <div className="h-96 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div ref={legendRef} className="mt-4 flex items-center justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>1-20 orders</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>21-50 orders</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>51-100 orders</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-600 rounded-full"></div>
          <span>100+ orders</span>
        </div>
      </div>

      {onCountryClick && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Click on markers or country names to view detailed orders
        </p>
      )}
    </div>
  )
}

export default WorldMap

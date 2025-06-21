'use client'

import { useEffect, useRef, useState } from 'react'
// 
import anime from 'animejs'
import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: number
  previousValue?: number
  icon: LucideIcon
  color: string
  onClick?: () => void
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}

const KPICard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  color,
  onClick,
  subtitle,
  trend = 'neutral'
}: KPICardProps) => {
  const countRef = useRef<HTMLSpanElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const [displayValue, setDisplayValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Intersection Observer for triggering animations when card comes into view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)

          // Animate the card entrance
          anime({
            targets: cardRef.current,
            translateY: [50, 0],
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 800,
            easing: 'easeOutElastic(1, .8)',
            delay: Math.random() * 200
          })

          // Animate the icon with a bounce effect
          anime({
            targets: iconRef.current,
            scale: [0, 1],
            rotate: [0, 360],
            duration: 1000,
            easing: 'easeOutBounce',
            delay: 300
          })

          // Animate the number counting
          const animationObj = { value: 0 }
          anime({
            targets: animationObj,
            value: value,
            duration: 2000,
            easing: 'easeOutExpo',
            delay: 500,
            update: () => {
              setDisplayValue(Math.floor(animationObj.value))
            }
          })
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [value, isVisible])

  // Hover animations
  const handleMouseEnter = () => {
    anime({
      targets: iconRef.current,
      scale: 1.1,
      rotate: '+=10deg',
      duration: 300,
      easing: 'easeOutQuad'
    })
  }

  const handleMouseLeave = () => {
    anime({
      targets: iconRef.current,
      scale: 1,
      rotate: '-=10deg',
      duration: 300,
      easing: 'easeOutQuad'
    })
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  const calculatePercentageChange = () => {
    if (!previousValue || previousValue === 0) return 0
    return ((value - previousValue) / previousValue * 100).toFixed(1)
  }

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-xl shadow-md p-6 cursor-pointer transition-all duration-300 opacity-0 ${
        onClick ? 'hover:shadow-lg' : ''
      }`}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div ref={iconRef} className={`p-2 rounded-lg ${color} transform`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="mt-4">
            <div className="flex items-baseline space-x-2">
              <span
                ref={countRef}
                className="text-3xl font-bold text-gray-900"
              >
                {displayValue.toLocaleString()}
              </span>
              {previousValue && (
                <span className={`text-sm font-medium ${getTrendColor()}`}>
                  {getTrendIcon()} {calculatePercentageChange()}%
                </span>
              )}
            </div>
            
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
      
    </div>
  )
}

export default KPICard

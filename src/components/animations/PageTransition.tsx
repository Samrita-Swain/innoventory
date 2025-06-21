'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      // Page entrance animation
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutCubic'
      })

      // Animate child elements with stagger
      const childElements = containerRef.current.children
      if (childElements.length > 0) {
        anime({
          targets: childElements,
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
          easing: 'easeOutCubic',
          delay: anime.stagger(100, { start: 200 })
        })
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className={`opacity-0 transform ${className}`}
    >
      {children}
    </div>
  )
}

export default PageTransition

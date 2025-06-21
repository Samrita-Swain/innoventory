'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'

interface AnimatedLoaderProps {
  size?: number
  color?: string
  text?: string
}

const AnimatedLoader = ({ 
  size = 60, 
  color = '#3B82F6', 
  text = 'Loading...' 
}: AnimatedLoaderProps) => {
  const loaderRef = useRef<HTMLDivElement>(null)
  const dotsRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    // Animate the main loader circle
    if (loaderRef.current) {
      anime({
        targets: loaderRef.current,
        rotate: '360deg',
        duration: 2000,
        easing: 'linear',
        loop: true
      })
    }

    // Animate the dots
    if (dotsRef.current) {
      const dots = dotsRef.current.children
      anime({
        targets: dots,
        scale: [1, 1.5, 1],
        opacity: [0.3, 1, 0.3],
        duration: 1000,
        easing: 'easeInOutSine',
        delay: anime.stagger(200),
        loop: true
      })
    }

    // Animate the text
    if (textRef.current) {
      anime({
        targets: textRef.current,
        opacity: [0.5, 1, 0.5],
        duration: 2000,
        easing: 'easeInOutSine',
        loop: true
      })
    }
  }, [])

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Main loader */}
      <div className="relative">
        <div
          ref={loaderRef}
          className="rounded-full border-4 border-gray-200"
          style={{
            width: size,
            height: size,
            borderTopColor: color,
            borderRightColor: color
          }}
        />
        
        {/* Inner dots */}
        <div 
          ref={dotsRef}
          className="absolute inset-0 flex items-center justify-center space-x-1"
        >
          <div 
            className="rounded-full"
            style={{ 
              width: size * 0.1, 
              height: size * 0.1, 
              backgroundColor: color 
            }}
          />
          <div 
            className="rounded-full"
            style={{ 
              width: size * 0.1, 
              height: size * 0.1, 
              backgroundColor: color 
            }}
          />
          <div 
            className="rounded-full"
            style={{ 
              width: size * 0.1, 
              height: size * 0.1, 
              backgroundColor: color 
            }}
          />
        </div>
      </div>

      {/* Loading text */}
      <p 
        ref={textRef}
        className="text-gray-600 font-medium"
        style={{ color }}
      >
        {text}
      </p>
    </div>
  )
}

export default AnimatedLoader

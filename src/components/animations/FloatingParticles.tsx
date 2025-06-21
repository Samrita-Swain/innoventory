'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'

interface FloatingParticlesProps {
  count?: number
  color?: string
  size?: number
}

const FloatingParticles = ({ 
  count = 20, 
  color = '#3B82F6', 
  size = 4 
}: FloatingParticlesProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const particles: HTMLDivElement[] = []

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute rounded-full opacity-20'
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = color
      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      
      container.appendChild(particle)
      particles.push(particle)
    }

    // Animate particles
    particles.forEach((particle, index) => {
      const animateParticle = () => {
        anime({
          targets: particle,
          translateX: () => anime.random(-100, 100),
          translateY: () => anime.random(-100, 100),
          scale: [1, anime.random(0.5, 1.5), 1],
          opacity: [0.2, anime.random(0.1, 0.4), 0.2],
          duration: anime.random(3000, 6000),
          easing: 'easeInOutSine',
          complete: animateParticle,
          delay: index * 200
        })
      }
      
      animateParticle()
    })

    // Cleanup
    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle)
        }
      })
    }
  }, [count, color, size])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -1 }}
    />
  )
}

export default FloatingParticles

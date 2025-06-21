'use client'

import { useEffect, useRef, useState } from 'react'
// 
import anime from 'animejs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

interface InteractiveChartProps {
  type: 'bar' | 'line' | 'doughnut'
  data: ChartData
  title: string
  onSegmentClick?: (segmentIndex: number, segmentLabel: string) => void
  height?: number
}

const InteractiveChart = ({
  type,
  data,
  title,
  onSegmentClick,
  height = 300
}: InteractiveChartProps) => {
  const chartRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: unknown) {
            const dataset = (context as Record<string, unknown>).dataset as Record<string, unknown>
            const parsed = (context as Record<string, unknown>).parsed as Record<string, unknown>
            const label = dataset?.label || ''
            const value = parsed?.y || parsed
            return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    } : {},
    onClick: (event: unknown, elements: unknown[]) => {
      if (elements.length > 0 && onSegmentClick) {
        const elementIndex = (elements[0] as Record<string, unknown>).index as number
        const segmentLabel = (data.labels as string[])[elementIndex]
        onSegmentClick(elementIndex, segmentLabel)
      }
    },
    onHover: (event: unknown, elements: unknown[]) => {
      const nativeEvent = (event as Record<string, unknown>).native as Record<string, unknown>
      if (nativeEvent && nativeEvent.target) {
        (nativeEvent.target as HTMLElement).style.cursor = elements.length > 0 ? 'pointer' : 'default'
      }
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart' as const,
      onComplete: () => {
        // Add a subtle pulse animation after chart loads
        if (containerRef.current) {
          anime({
            targets: containerRef.current,
            scale: [1, 1.02, 1],
            duration: 1000,
            easing: 'easeInOutSine'
          })
        }
      }
    }
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar ref={chartRef} data={data} options={options} />
      case 'line':
        return <Line ref={chartRef} data={data} options={options} />
      case 'doughnut':
        return <Doughnut ref={chartRef} data={data} options={options} />
      default:
        return null
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)

          // Animate container entrance
          anime({
            targets: containerRef.current,
            translateY: [30, 0],
            opacity: [0, 1],
            scale: [0.95, 1],
            duration: 800,
            easing: 'easeOutCubic',
            delay: Math.random() * 300
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
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
      
      {onSegmentClick && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Click on chart segments to view detailed data
        </p>
      )}
    </div>
  )
}

export default InteractiveChart

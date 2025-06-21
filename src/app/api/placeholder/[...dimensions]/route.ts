import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string[] }> }
) {
  try {
    const { dimensions } = await params
    let width = 100
    let height = 100

    if (dimensions && dimensions.length >= 2) {
      width = parseInt(dimensions[0]) || 100
      height = parseInt(dimensions[1]) || 100
    } else if (dimensions && dimensions.length === 1) {
      const size = parseInt(dimensions[0]) || 100
      width = size
      height = size
    }

    // Limit dimensions for security
    width = Math.min(Math.max(width, 10), 2000)
    height = Math.min(Math.max(height, 10), 2000)

    // Create a simple SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect x="10%" y="10%" width="80%" height="80%" fill="#e5e7eb" rx="8"/>
        <circle cx="30%" cy="35%" r="8%" fill="#d1d5db"/>
        <rect x="45%" y="30%" width="40%" height="4%" fill="#d1d5db" rx="2"/>
        <rect x="45%" y="40%" width="30%" height="4%" fill="#d1d5db" rx="2"/>
        <rect x="20%" y="60%" width="60%" height="4%" fill="#d1d5db" rx="2"/>
        <rect x="20%" y="70%" width="40%" height="4%" fill="#d1d5db" rx="2"/>
        <text x="50%" y="85%" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">
          ${width}x${height}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Placeholder image error:', error)
    
    // Return a minimal SVG on error
    const errorSvg = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="12">
          Error
        </text>
      </svg>
    `
    
    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}

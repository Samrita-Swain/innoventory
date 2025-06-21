'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

interface CountryData {
  country: string
  workCount: number
  coordinates: [number, number]
}

interface WorldMapClientProps {
  data: CountryData[]
  onCountryClick?: (country: string) => void
}

const WorldMapClient = ({ data, onCountryClick }: WorldMapClientProps) => {
  useEffect(() => {
    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
  }, [])

  // Custom marker icon based on work count
  const getMarkerColor = (workCount: number) => {
    if (workCount > 100) return '#DC2626' // red
    if (workCount > 50) return '#F59E0B' // orange
    if (workCount > 20) return '#10B981' // green
    return '#3B82F6' // blue
  }

  const createCustomIcon = (workCount: number) => {
    const color = getMarkerColor(workCount)
    const size = workCount > 100 ? 40 : workCount > 50 ? 30 : 20
    
    return L.divIcon({
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${size > 30 ? '12px' : '10px'};
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${workCount}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    })
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {data.map((item, index) => (
          <Marker
            key={index}
            position={item.coordinates}
            icon={createCustomIcon(item.workCount)}
            eventHandlers={{
              click: () => onCountryClick?.(item.country)
            }}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-semibold text-gray-900">{item.country}</h4>
                <p className="text-sm text-gray-600">
                  Work Count: <span className="font-medium">{item.workCount}</span>
                </p>
                {onCountryClick && (
                  <button
                    onClick={() => onCountryClick(item.country)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                  >
                    View Details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default WorldMapClient

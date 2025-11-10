"use client"

import { useEffect, useState, useRef } from "react"
import { MapPin } from "lucide-react"
import { fetchMapData, type MapEvent } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"
import Map, { Marker, Popup } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Color mapping for event types
const EVENT_COLORS: Record<string, string> = {
  "Disabled Vehicle": "#f59e0b",      // amber
  "Incident": "#ef4444",              // red
  "Construction Work": "#3b82f6",     // blue
  "Obstructions": "#8b5cf6",          // purple
  "Traffic Jam": "#dc2626",           // dark red
  "Weather": "#06b6d4",               // cyan
  "Road Closure": "#991b1b",          // dark red
  "default": "#6b7280"                // gray
}

export function DigitalTwinMap() {
  const { region, timePeriod, customDateRange, refreshTrigger } = useTraffixContext()
  const [events, setEvents] = useState<MapEvent[]>([])
  const [center, setCenter] = useState<{ lat: number; lon: number }>({ lat: 38.9072, lon: -77.0369 })
  const [zoom, setZoom] = useState(10)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    async function loadMapData() {
      try {
        setLoading(true)
        const data = await fetchMapData(region, timePeriod)
        setEvents(data.events)
        setCenter(data.center)
        setZoom(data.zoom)
      } catch (err) {
        console.error('Error loading map data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMapData()
  }, [region, timePeriod, customDateRange, refreshTrigger])

  const getEventColor = (type: string): string => {
    return EVENT_COLORS[type] || EVENT_COLORS.default
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm mb-8">
      <div className="border-b bg-muted/30 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Network Map</h2>
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading events...' : `${events.length} events in ${region}`}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="relative rounded-lg overflow-hidden h-[450px] border">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : (
            <Map
              ref={mapRef}
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.eyJ1IjoidHJhZmZpeCIsImEiOiJjbTJsYzJkNW4wMDJ6MmpzZWJscWN0YmpxIn0.demo"}
              initialViewState={{
                longitude: center.lon,
                latitude: center.lat,
                zoom: zoom
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="mapbox://styles/mapbox/light-v11"
            >
              {events.map((event) => (
                <Marker
                  key={event.id}
                  longitude={event.lon}
                  latitude={event.lat}
                  anchor="center"
                  onClick={(e) => {
                    e.originalEvent.stopPropagation()
                    setSelectedEvent(event)
                  }}
                >
                  <div 
                    className="cursor-pointer transition-transform hover:scale-125"
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: getEventColor(event.type),
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                  />
                </Marker>
              ))}

              {selectedEvent && (
                <Popup
                  longitude={selectedEvent.lon}
                  latitude={selectedEvent.lat}
                  anchor="bottom"
                  onClose={() => setSelectedEvent(null)}
                  closeOnClick={false}
                  className="custom-popup"
                >
                  <div className="p-2 min-w-[200px]">
                    <div 
                      className="w-3 h-3 rounded-full mb-2"
                      style={{ backgroundColor: getEventColor(selectedEvent.type) }}
                    />
                    <h3 className="font-semibold text-sm mb-1">{selectedEvent.road || 'Unknown Road'}</h3>
                    <p className="text-xs text-gray-600 mb-1">{selectedEvent.type}</p>
                    <p className="text-xs text-gray-500">{selectedEvent.description}</p>
                    {selectedEvent.severity && (
                      <span className={`text-xs font-medium mt-2 inline-block ${
                        selectedEvent.severity === 'high' ? 'text-red-600' : 
                        selectedEvent.severity === 'medium' ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {selectedEvent.severity.toUpperCase()} severity
                      </span>
                    )}
                  </div>
                </Popup>
              )}
            </Map>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="font-semibold text-foreground">Legend:</div>
          {Object.entries(EVENT_COLORS)
            .filter(([key]) => key !== 'default')
            .map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div 
                  className="w-3 h-3 rounded-full border border-white" 
                  style={{ backgroundColor: color }}
                />
                <span className="text-muted-foreground">{type}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-cluster"
import { MapPin } from "lucide-react"
import { fetchMapData, type MapEvent } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import { LatLngBounds, DivIcon } from "leaflet"

// Color mapping for event types (updated categories)
const EVENT_COLORS: Record<string, string> = {
  "Hazard": "#15803d",                // dark green
  "Obstructions": "#8b5cf6",          // purple
  "Construction Work": "#f97316",     // orange
  "Accident": "#ef4444",              // red
  "Disabled Vehicle": "#eab308",      // yellow
  "Congestion": "#22c55e",            // green
  "Utility Work": "#06b6d4",          // cyan
  "Other": "#6b7280",                 // gray
  "default": "#6b7280"                // gray (fallback)
}

// Component to auto-fit bounds when events change
function AutoFitBounds({ events }: { events: MapEvent[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (events && events.length > 0) {
      try {
        const bounds = new LatLngBounds(
          events.map(event => [event.lat, event.lon])
        )
        
        // Fit map to show all events with padding
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12,
          animate: true,
          duration: 1
        })
      } catch (error) {
        console.error('Error fitting bounds:', error)
      }
    }
  }, [events, map])
  
  return null
}

export function NetworkMapLeaflet() {
  const { region, timePeriod, customDateRange, refreshTrigger } = useTraffixContext()
  const [events, setEvents] = useState<MapEvent[]>([])
  const [center, setCenter] = useState<{ lat: number; lon: number }>({ lat: 38.9072, lon: -77.0369 })
  const [zoom, setZoom] = useState(10)
  const [loading, setLoading] = useState(true)
  const [selectedEventType, setSelectedEventType] = useState<string>("All")

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

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return 'Not specified'
    try {
      // Try to parse and format the time
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return timeStr
      return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    } catch {
      return timeStr
    }
  }

  const formatDuration = (minutes: string | number): string => {
    if (!minutes) return 'Unknown'
    const mins = typeof minutes === 'string' ? parseFloat(minutes) : minutes
    if (isNaN(mins)) return 'Unknown'
    
    if (mins < 60) return `${Math.round(mins)} min`
    const hours = Math.floor(mins / 60)
    const remainingMins = Math.round(mins % 60)
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`
  }

  // Custom cluster icon with summary tooltip
  const createClusterCustomIcon = (cluster: any) => {
    const childMarkers = cluster.getAllChildMarkers()
    const count = childMarkers.length
    
    // Count event types
    const typeCounts: Record<string, number> = {}
    let totalClearanceTime = 0
    let clearanceCount = 0
    
    childMarkers.forEach((marker: any) => {
      const event = marker.options.eventData as MapEvent
      if (event) {
        typeCounts[event.type] = (typeCounts[event.type] || 0) + 1
        
        if (event.roadway_clearance_time) {
          const time = typeof event.roadway_clearance_time === 'string' 
            ? parseFloat(event.roadway_clearance_time) 
            : event.roadway_clearance_time
          if (!isNaN(time)) {
            totalClearanceTime += time
            clearanceCount++
          }
        }
      }
    })
    
    const avgClearance = clearanceCount > 0 
      ? formatDuration(totalClearanceTime / clearanceCount)
      : 'Unknown'
    
    // Find the dominant event type
    const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])
    const dominantType = sortedTypes[0]?.[0] || 'default'
    const dominantColor = getEventColor(dominantType)
    
    // Build summary text for tooltip
    const breakdown = sortedTypes
      .map(([type, count]) => `• ${count} ${type}`)
      .join('\n')
    
    const tooltipText = `📍 ${count} Events in this area\n\nBreakdown:\n${breakdown}\n\nAverage clearance: ${avgClearance}\n\n💡 Click to zoom in and see individual events`
    
    // Create a darker shade for gradient (darken by 15%)
    const darkerColor = dominantColor === '#6b7280' 
      ? '#4b5563' 
      : dominantColor.replace(/^#/, '').match(/.{2}/g)
          ?.map(hex => Math.max(0, parseInt(hex, 16) - 40).toString(16).padStart(2, '0'))
          .join('') || dominantColor
    
          return new DivIcon({
            html: `
              <div class="custom-cluster-icon" 
                   data-count="${count}"
                   style="
                     background: linear-gradient(135deg, ${dominantColor} 0%, #${darkerColor} 100%);
                     color: white;
                     border-radius: 50%;
                     width: ${30 + Math.min(count / 10, 30)}px;
                     height: ${30 + Math.min(count / 10, 30)}px;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     font-weight: bold;
                     font-size: ${count > 99 ? '11px' : '13px'};
                     border: 3px solid white;
                     box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                     text-shadow: 0 1px 2px rgba(0,0,0,0.3);
                     cursor: pointer;
                     transition: transform 0.2s ease;
                   "
                   onmouseenter="this.style.transform='scale(1.15)'"
                   onmouseleave="this.style.transform='scale(1)'"
                   title="${tooltipText}"
              >
                ${count}
              </div>
            `,
            className: 'custom-div-icon',
            iconSize: [30 + Math.min(count / 10, 30), 30 + Math.min(count / 10, 30)],
          })
  }

  // Filter events based on dropdown selection
  const filteredEvents = selectedEventType === "All" 
    ? events 
    : events.filter(e => e.type === selectedEventType)
  
  // Get unique event types from the loaded events
  const eventTypes = ["All", ...Array.from(new Set(events.map(e => e.type))).sort()]

  return (
    <div className="rounded-xl border bg-card shadow-sm mb-8">
      <div className="border-b bg-muted/30 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Network Map</h2>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading events...' : `${filteredEvents.length} events in ${region}`}
              </p>
            </div>
          </div>
          
          {/* Event Type Filter Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-foreground">
              Filter by Type:
            </label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="px-3 py-1.5 text-sm border rounded-md bg-background focus:ring-primary focus:ring-2 cursor-pointer"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="relative rounded-lg overflow-hidden h-[500px] border">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
              <div className="text-center">
                <MapPin className="h-16 w-16 text-muted-foreground/40 mx-auto mb-3 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={[center.lat, center.lon]}
              zoom={zoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Auto-fit bounds when events change */}
              <AutoFitBounds events={filteredEvents} />
              
              {/* Marker Cluster Group with custom icons */}
              <MarkerClusterGroup
                key={selectedEventType}
                chunkedLoading
                iconCreateFunction={createClusterCustomIcon}
                maxClusterRadius={50}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
              >
                {filteredEvents.map((event) => (
                  <CircleMarker
                    key={event.id}
                    center={[event.lat, event.lon]}
                    radius={8}
                    pathOptions={{
                      fillColor: getEventColor(event.type),
                      fillOpacity: 0.8,
                      color: '#fff',
                      weight: 2,
                    }}
                    eventHandlers={{
                      mouseover: (e) => {
                        e.target.openTooltip()
                      }
                    }}
                    // @ts-ignore - custom property for cluster summary
                    eventData={event}
                  >
                    <Tooltip 
                      direction="top" 
                      offset={[0, -10]} 
                      opacity={0.95}
                      className="custom-leaflet-tooltip"
                      permanent={false}
                    >
                      <div style={{ 
                        minWidth: '280px', 
                        maxWidth: '350px',
                        padding: '12px',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        whiteSpace: 'normal',
                        wordWrap: 'break-word'
                      }}>
                        {/* Header with event type indicator */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          marginBottom: '10px',
                          paddingBottom: '8px',
                          borderBottom: '1px solid #e5e7eb'
                        }}>
                          <div 
                            style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%',
                              backgroundColor: getEventColor(event.type),
                              flexShrink: 0
                            }}
                          />
                          <strong style={{ fontSize: '14px' }}>
                            Incident #{event.id.split('-')[1] || event.id.substring(0, 8)}
                          </strong>
                        </div>

                        {/* Event type */}
                        <div style={{ marginBottom: '8px' }}>
                          <strong style={{ color: '#374151' }}>{event.type}</strong>
                          {event.severity && (
                            <span style={{
                              marginLeft: '8px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: event.severity === 'high' ? '#fee2e2' : '#fef3c7',
                              color: event.severity === 'high' ? '#991b1b' : '#92400e'
                            }}>
                              {event.severity.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Time occurred */}
                        <div style={{ marginBottom: '8px', color: '#6b7280' }}>
                          <strong>Occurred:</strong> {formatTime(event.start_time)}
                        </div>

                        {/* Event details */}
                        <div style={{ 
                          marginBottom: '8px', 
                          color: '#374151',
                          lineHeight: '1.4'
                        }}>
                          {event.description}
                          {event.details && event.details !== event.description && (
                            <span style={{ marginLeft: '4px' }}>- {event.details}</span>
                          )}
                        </div>

                        {/* Location */}
                        <div style={{ marginBottom: '8px', color: '#6b7280' }}>
                          <strong>Location:</strong>{' '}
                          {event.road || event.location || 'Unknown'}
                          {event.county && (
                            <span>, {event.county} County</span>
                          )}
                        </div>

                        {/* Clearance times */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '1fr 1fr',
                          gap: '8px',
                          marginTop: '10px',
                          paddingTop: '8px',
                          borderTop: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}>
                          <div>
                            <div style={{ color: '#9ca3af', marginBottom: '2px' }}>Roadway Clear</div>
                            <div style={{ fontWeight: 600, color: '#059669' }}>
                              {formatDuration(event.roadway_clearance_time)}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: '#9ca3af', marginBottom: '2px' }}>Total Time</div>
                            <div style={{ fontWeight: 600, color: '#2563eb' }}>
                              {formatDuration(event.overall_event_time)}
                            </div>
                          </div>
                        </div>

                        {/* Source */}
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '11px', 
                          color: '#9ca3af',
                          fontStyle: 'italic'
                        }}>
                          Called in by: {event.source}
                        </div>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <div className="font-semibold text-foreground">Legend:</div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#15803d' }} />
            <span className="text-muted-foreground">Hazard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#8b5cf6' }} />
            <span className="text-muted-foreground">Obstructions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#f97316' }} />
            <span className="text-muted-foreground">Construction Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-muted-foreground">Accident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#eab308' }} />
            <span className="text-muted-foreground">Disabled Vehicle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#22c55e' }} />
            <span className="text-muted-foreground">Congestion</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#06b6d4' }} />
            <span className="text-muted-foreground">Utility Work</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2 border-white" style={{ backgroundColor: '#6b7280' }} />
            <span className="text-muted-foreground">Other</span>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
          📍 <strong>Cluster Colors:</strong> The color of each cluster represents the most occurring event type in that area. Hover for breakdown, click to zoom in and see individual events.
        </div>
      </div>
    </div>
  )
}

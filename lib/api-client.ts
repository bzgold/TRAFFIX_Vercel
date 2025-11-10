/**
 * TRAFFIX API Client
 * Central client for all backend API calls from Next.js frontend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface DashboardMetrics {
  total_trips: number
  total_trips_formatted: string
  forecast_trips: number
  forecast_trips_formatted: string
  forecast_gap: number
  forecast_gap_formatted: string
  forecast_gap_percent: number
  avg_reliability: number
  avg_reliability_formatted: string
  avg_efficiency: number
  active_events: number
  region: string
  time_period: string
  start_date: string
  end_date: string
}

export interface RoadEvent {
  id: string
  name: string
  type: string
  description: string
  time: string
  severity: 'high' | 'medium' | 'low'
  location: {
    road: string
    county: string
    state: string
    latitude?: number
    longitude?: number
  }
  duration: number
}

export interface WorstAccident {
  id: string
  road: string
  county: string
  state: string
  location: string
  overall_time: number
  overall_time_formatted: string
  clearance_time: number
  clearance_time_formatted: string
  event_type: string
  event_details_2: string
  event_details_3: string
  summary: string
  start_time: string
  end_time: string
  latitude?: number
  longitude?: number
}

export interface NewsItem {
  title: string
  source: string
  url: string
  content: string
  published: string
  time: string
  category: string
  impact: string
}

export interface MapEvent {
  id: string
  lat: number
  lon: number
  type: string
  road: string
  county: string
  state: string
  severity: 'high' | 'medium' | 'low'
  description: string
  details: string
  start_time: string
  end_time: string
  roadway_clearance_time: string
  overall_event_time: string
  source: string
  location: string
}

export interface ChatResponse {
  success: boolean
  response: string
  metadata?: {
    mode: string
    persona: string
    region: string
    sources: number
  }
  error?: string
}

/**
 * Fetch dashboard metrics (BAN numbers)
 */
export async function fetchMetrics(
  region: string = 'Virginia',
  timePeriod: string = 'MTD',
  startDate?: string,
  endDate?: string
): Promise<DashboardMetrics> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      time_period: timePeriod,
      start_date: startDate,
      end_date: endDate,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

/**
 * Fetch road events
 */
export async function fetchEvents(
  region: string = 'Virginia',
  timePeriod: string = 'MTD',
  limit: number = 20,
  startDate?: string,
  endDate?: string
): Promise<RoadEvent[]> {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      time_period: timePeriod,
      limit,
      start_date: startDate,
      end_date: endDate,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch events: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

/**
 * Fetch worst accidents based on overall roadway clearance time
 */
export async function fetchWorstAccidents(
  region: string = 'Virginia',
  timePeriod: string = 'MTD',
  startDate?: string,
  endDate?: string
): Promise<WorstAccident[]> {
  const response = await fetch(`${API_BASE_URL}/api/worst-accidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      time_period: timePeriod,
      limit: 10,
      start_date: startDate,
      end_date: endDate,
    }),
  })

  if (!response.ok) {
    console.warn('Worst accidents API failed, returning empty array')
    return []
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Fetch news feed from Tavily
 */
export async function fetchNews(
  region: string = 'Virginia',
  query?: string,
  days: number = 7
): Promise<NewsItem[]> {
  const response = await fetch(`${API_BASE_URL}/api/news`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      query,
      days,
    }),
  })

  if (!response.ok) {
    console.warn('News API failed, returning empty array')
    return []
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Fetch map data (events with coordinates)
 */
export async function fetchMapData(
  region: string = 'Virginia',
  timePeriod: string = 'MTD'
): Promise<{ events: MapEvent[]; center: { lat: number; lon: number }; zoom: number }> {
  const response = await fetch(`${API_BASE_URL}/api/map-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      time_period: timePeriod,
      limit: 100,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch map data: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data
}

/**
 * Send chat message to TRAFFIX agent
 */
export async function sendChatMessage(
  message: string,
  persona: 'executive' | 'manager' | 'analyst' = 'manager',
  region: string = 'Virginia',
  timePeriod: string = 'MTD',
  startDate?: string,
  endDate?: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      persona,
      region,
      time_period: timePeriod,
      start_date: startDate,
      end_date: endDate,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send chat message: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{ status: string; components: any }> {
  const response = await fetch(`${API_BASE_URL}/api/health`)

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Recommendations
 */
export interface Recommendation {
  id: string
  insight: string
  confidence: 'High' | 'Medium'
  location: string
  actions: string[]
  impact: string
  full_analysis: string
  category: string
}

export interface HourlyTrafficData {
  hour: number
  hour_label: string
  days: Array<{
    date: string
    day: string
    traffic: number
    reliability: number
  }>
}

export async function fetchRecommendations(
  region: string = 'Virginia',
  timePeriod: string = 'MTD',
  startDate?: string,
  endDate?: string
): Promise<Recommendation[]> {
  const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      time_period: timePeriod,
      start_date: startDate,
      end_date: endDate,
    }),
  })

  if (!response.ok) {
    console.warn('Recommendations API failed, returning empty array')
    return []
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Fetch hourly traffic analytics
 */
export async function fetchHourlyTraffic(
  region: string = 'Virginia',
  timePeriod: string = 'MTD',
  startDate?: string,
  endDate?: string
): Promise<HourlyTrafficData[]> {
  const response = await fetch(`${API_BASE_URL}/api/analytics/hourly-traffic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      region,
      time_period: timePeriod,
      limit: 1000,
      start_date: startDate,
      end_date: endDate,
    }),
  })

  if (!response.ok) {
    console.warn('Hourly traffic API failed, returning empty array')
    return []
  }

  const data = await response.json()
  return data.data || []
}


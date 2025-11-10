"use client"

import { useEffect, useState } from "react"
import { Car, TrendingUp, Users, Activity } from "lucide-react"
import { fetchMetrics, type DashboardMetrics } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"

export function BanNumbers() {
  const { region, timePeriod, customDateRange, refreshTrigger } = useTraffixContext()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [totalEvents, setTotalEvents] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true)
        setError(null)
        
        const data = await fetchMetrics(
          region,
          timePeriod,
          timePeriod === 'CUSTOM' ? customDateRange.start : undefined,
          timePeriod === 'CUSTOM' ? customDateRange.end : undefined
        )
        
        setMetrics(data)

        // Fetch actual event count (not limited like the map)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const eventsRes = await fetch(`${baseUrl}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            region, 
            time_period: timePeriod === 'CUSTOM' ? 'CUSTOM' : timePeriod,
            limit: 100000,
            start_date: timePeriod === 'CUSTOM' ? customDateRange.start : undefined,
            end_date: timePeriod === 'CUSTOM' ? customDateRange.end : undefined
          })
        })
        const eventsData = await eventsRes.json()
        const events = eventsData.data || []
        setTotalEvents(events.length)
        
      } catch (err) {
        console.error('Error loading metrics:', err)
        setError('Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [region, timePeriod, customDateRange, refreshTrigger])

  // Format date range for forecast subtext
  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  const banStats = metrics ? [
    {
      label: "Total Trips",
      value: metrics.total_trips_formatted,
      icon: Car,
      color: "text-primary",
      subtext: `${region} region`,
    },
    {
      label: "Forecast Trips",
      value: metrics.forecast_trips_formatted,
      icon: TrendingUp,
      color: "text-emerald-600",
      subtext: `For same period (${formatDateRange(metrics.start_date, metrics.end_date)})`,
    },
    {
      label: "Active Events",
      value: totalEvents.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      subtext: `${region} incidents`,
    },
    {
      label: "Avg Reliability Score",
      value: metrics.avg_reliability_formatted,
      icon: Activity,
      color: "text-teal-600",
      subtext: "Network average",
    },
  ] : []

  if (error) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-8 mb-8">
        <p className="text-destructive text-center">{error}</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card shadow-sm p-8 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-muted" />
            </div>
            <div className="h-10 w-20 bg-muted rounded mb-2" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {banStats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div key={i} className="rounded-xl border bg-card shadow-sm p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-4xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{stat.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { BarChart3, Info, Loader2 } from "lucide-react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, ZAxis } from "recharts"
import { fetchHourlyTraffic, type HourlyTrafficData } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"

// Color palette for different days
const DAY_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
]

export function AnalyticsGraphs() {
  const { region, timePeriod, customDateRange, refreshTrigger } = useTraffixContext()
  const [data, setData] = useState<HourlyTrafficData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const hourlyData = await fetchHourlyTraffic(
          region,
          timePeriod,
          timePeriod === 'CUSTOM' ? customDateRange.start : undefined,
          timePeriod === 'CUSTOM' ? customDateRange.end : undefined
        )
        setData(hourlyData)
      } catch (err) {
        console.error('Error loading hourly analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [region, timePeriod, customDateRange, refreshTrigger])

  // Prepare data for scatter plot - flatten days into points
  const trafficScatterData = data.flatMap((hourData) =>
    hourData.days.map((day, dayIndex) => ({
      hour: hourData.hour,
      traffic: day.traffic,
      day: day.day,
      dayIndex: dayIndex,
      color: DAY_COLORS[dayIndex % DAY_COLORS.length],
    }))
  )

  const reliabilityScatterData = data.flatMap((hourData) =>
    hourData.days.map((day, dayIndex) => ({
      hour: hourData.hour,
      reliability: day.reliability,
      day: day.day,
      dayIndex: dayIndex,
      color: DAY_COLORS[dayIndex % DAY_COLORS.length],
    }))
  )

  // Get unique days for legend
  const uniqueDays = Array.from(
    new Set(data.flatMap((h) => h.days.map((d) => d.day)))
  ).map((day, index) => ({
    day,
    color: DAY_COLORS[index % DAY_COLORS.length],
  }))

  if (loading) {
    return (
      <div className="space-y-8 mb-20">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Analytics & Trends</h2>
            <p className="text-sm text-muted-foreground">Hourly patterns across selected date range</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 mb-20">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
          <BarChart3 className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Trends</h2>
          <p className="text-sm text-muted-foreground">Hourly patterns across selected date range</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Total Traffic by Hour */}
        <div className="rounded-xl border bg-card shadow-lg p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">Total Traffic by Hour of Day</h3>
            <p className="text-sm text-muted-foreground">Vehicle volume across different hours, each dot represents a specific date</p>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="hour"
                name="Hour"
                domain={[0, 23]}
                ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
                tickFormatter={(value) => `${value}:00`}
                label={{ value: 'Hour of Day', position: 'insideBottom', offset: -10, style: { fontSize: 14, fontWeight: 600 } }}
                stroke="#64748b"
                style={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="traffic"
                name="Traffic"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                label={{ value: 'Traffic Volume', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                stroke="#64748b"
                style={{ fontSize: 12 }}
              />
              <ZAxis range={[80, 80]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-sm mb-1">{data.day}</p>
                        <p className="text-xs text-muted-foreground">Hour: {data.hour}:00</p>
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Traffic: {data.traffic.toLocaleString()}</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {uniqueDays.map((day, index) => (
                <Scatter
                  key={day.day}
                  name={day.day}
                  data={trafficScatterData.filter(d => d.day === day.day)}
                  fill={day.color}
                  opacity={0.7}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                iconType="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Reliability Score by Hour */}
        <div className="rounded-xl border bg-card shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Reliability Score by Hour of Day</h3>
                <p className="text-sm text-muted-foreground">Network reliability across different hours, each dot represents a specific date</p>
              </div>
            </div>
            
            {/* Reliability Score Explanation */}
            <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    How Reliability Score is Calculated
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    The Network Reliability Score measures travel time predictability. It is calculated as the ratio of 
                    observed travel time to the expected free-flow travel time, adjusted for congestion. A score of 100% 
                    indicates perfectly reliable travel times, while lower scores indicate increased variability and unpredictability. 
                    Factors include traffic volume, incidents, weather conditions, and roadway characteristics.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart
              margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                type="number"
                dataKey="hour"
                name="Hour"
                domain={[0, 23]}
                ticks={[0, 3, 6, 9, 12, 15, 18, 21, 23]}
                tickFormatter={(value) => `${value}:00`}
                label={{ value: 'Hour of Day', position: 'insideBottom', offset: -10, style: { fontSize: 14, fontWeight: 600 } }}
                stroke="#64748b"
                style={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="reliability"
                name="Reliability"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Reliability Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 14, fontWeight: 600 } }}
                stroke="#64748b"
                style={{ fontSize: 12 }}
              />
              <ZAxis range={[80, 80]} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                        <p className="font-semibold text-sm mb-1">{data.day}</p>
                        <p className="text-xs text-muted-foreground">Hour: {data.hour}:00</p>
                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Reliability: {data.reliability.toFixed(1)}%</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              {uniqueDays.map((day, index) => (
                <Scatter
                  key={day.day}
                  name={day.day}
                  data={reliabilityScatterData.filter(d => d.day === day.day)}
                  fill={day.color}
                  opacity={0.7}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                iconType="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { TrendingUp, AlertCircle, MapPin, CloudRain, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTraffixContext } from "@/lib/traffix-context"
import { sendChatMessage } from "@/lib/api-client"

interface TrafficData {
  currentTotal: number
  previousPeriodTotal: number
  priorYearTotal: number
  previousPeriodDiff: number
  previousPeriodPercent: number
  priorYearDiff: number
  priorYearPercent: number
  peakCongestionTime: string
}

interface AnomaliesData {
  totalEvents: number
  totalDisruptionTime: number
  avgClearanceTime: number
  totalAccidents: number
}

interface CountyData {
  county: string
  count: number
  topRoads: Array<{ road: string; count: number }>
}

interface WeatherDayData {
  date: string
  avgTemp: number
  topCondition: string
}

export function InsightsAndAnalysis() {
  const { region, customDateRange } = useTraffixContext()
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null)
  const [anomaliesData, setAnomaliesData] = useState<AnomaliesData | null>(null)
  const [countyData, setCountyData] = useState<CountyData[]>([])
  const [weatherData, setWeatherData] = useState<WeatherDayData[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [showAnomaliesDialog, setShowAnomaliesDialog] = useState(false)
  const [showCountyDialog, setShowCountyDialog] = useState(false)
  const [showWeatherDialog, setShowWeatherDialog] = useState(false)
  const [aiSummary, setAiSummary] = useState("")
  const [anomaliesAiSummary, setAnomaliesAiSummary] = useState("")
  const [countyAiSummary, setCountyAiSummary] = useState("")
  const [weatherAiSummary, setWeatherAiSummary] = useState("")
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [anomaliesSummaryLoading, setAnomaliesSummaryLoading] = useState(false)
  const [countySummaryLoading, setCountySummaryLoading] = useState(false)
  const [weatherSummaryLoading, setWeatherSummaryLoading] = useState(false)

  useEffect(() => {
    async function fetchTrafficData() {
      try {
        setLoading(true)
        
        // Calculate date ranges
        const startDate = new Date(customDateRange.start)
        const endDate = new Date(customDateRange.end)
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        
        // Previous period (same number of days before start date)
        const prevEndDate = new Date(startDate)
        prevEndDate.setDate(prevEndDate.getDate() - 1)
        const prevStartDate = new Date(prevEndDate)
        prevStartDate.setDate(prevStartDate.getDate() - daysDiff + 1)
        
        // Prior year (same period, one year ago)
        const priorYearStartDate = new Date(startDate)
        priorYearStartDate.setFullYear(priorYearStartDate.getFullYear() - 1)
        const priorYearEndDate = new Date(endDate)
        priorYearEndDate.setFullYear(priorYearEndDate.getFullYear() - 1)
        
        // Fetch data from backend (using metrics endpoint)
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        
        // Current period
        const currentRes = await fetch(`${baseUrl}/api/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ region, time_period: 'CUSTOM' })
        })
        const currentData = await currentRes.json()
        
        // Mock previous period and prior year for now (would need backend updates)
        const currentTotal = currentData.data?.total_trips || 0
        const previousPeriodTotal = currentTotal * 0.92 // Mock: -8% from previous period
        const priorYearTotal = currentTotal * 0.85 // Mock: +15% from prior year
        
        const data: TrafficData = {
          currentTotal,
          previousPeriodTotal,
          priorYearTotal,
          previousPeriodDiff: currentTotal - previousPeriodTotal,
          previousPeriodPercent: ((currentTotal - previousPeriodTotal) / previousPeriodTotal) * 100,
          priorYearDiff: currentTotal - priorYearTotal,
          priorYearPercent: ((currentTotal - priorYearTotal) / priorYearTotal) * 100,
          peakCongestionTime: "8:15 AM - 9:00 AM" // Would need backend calculation
        }
        
        setTrafficData(data)

        // Fetch events data for anomalies
        const eventsRes = await fetch(`${baseUrl}/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            region, 
            time_period: 'CUSTOM',
            limit: 100000,  // Increased limit to get all events
            start_date: customDateRange.start,
            end_date: customDateRange.end
          })
        })
        const eventsData = await eventsRes.json()
        const events = eventsData.data || []  // API returns data as array, not data.events
        
        console.log('Events fetched for anomalies:', events.length, 'Region:', region, 'Dates:', customDateRange)
        
        // Calculate anomalies metrics
        const totalEvents = events.length
        const totalAccidents = events.filter((e: any) => 
          e.type?.toLowerCase().includes('incident') || 
          e.type?.toLowerCase().includes('accident')
        ).length
        
        let totalDisruptionTime = 0
        let totalClearanceTime = 0
        let clearanceCount = 0
        
        events.forEach((event: any) => {
          // API returns 'duration' field which represents overall event time
          if (event.duration) {
            const time = parseFloat(event.duration)
            if (!isNaN(time)) {
              totalDisruptionTime += time
              totalClearanceTime += time
              clearanceCount++
            }
          }
        })
        
        const anomalies: AnomaliesData = {
          totalEvents,
          totalDisruptionTime: Math.round(totalDisruptionTime),
          avgClearanceTime: clearanceCount > 0 ? Math.round(totalClearanceTime / clearanceCount) : 0,
          totalAccidents
        }
        
        setAnomaliesData(anomalies)

        // Calculate county-based statistics
        const countyMap: Record<string, { count: number; roads: Record<string, number> }> = {}
        
        events.forEach((event: any) => {
          const county = event.location?.county || 'Unknown'
          const road = event.location?.road || event.name || 'Unknown'
          
          if (!countyMap[county]) {
            countyMap[county] = { count: 0, roads: {} }
          }
          countyMap[county].count++
          countyMap[county].roads[road] = (countyMap[county].roads[road] || 0) + 1
        })
        
        // Sort counties by count and get top 3
        const sortedCounties = Object.entries(countyMap)
          .map(([county, data]) => ({
            county,
            count: data.count,
            topRoads: Object.entries(data.roads)
              .map(([road, count]) => ({ road, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5)  // Top 5 roads per county
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)  // Top 3 counties
        
        setCountyData(sortedCounties)

        // Fetch weather data
        const weatherRes = await fetch(`${baseUrl}/api/weather`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_date: customDateRange.start,
            end_date: customDateRange.end
          })
        })
        
        if (weatherRes.ok) {
          const weatherApiData = await weatherRes.json()
          const weatherRecords = weatherApiData.data || []
          
          // Group by date and calculate averages
          const dailyWeather: Record<string, { temps: number[]; conditions: string[] }> = {}
          
          weatherRecords.forEach((record: any) => {
            const date = record.datetime.split('T')[0]  // Get just the date part
            if (!dailyWeather[date]) {
              dailyWeather[date] = { temps: [], conditions: [] }
            }
            if (record.temp) dailyWeather[date].temps.push(record.temp)
            if (record.conditions) dailyWeather[date].conditions.push(record.conditions)
          })
          
          // Calculate daily averages and find top condition
          const weatherByDay = Object.entries(dailyWeather).map(([date, data]) => {
            const avgTemp = data.temps.length > 0 
              ? data.temps.reduce((a, b) => a + b, 0) / data.temps.length 
              : 0
            
            // Count conditions and find most common
            const conditionCounts: Record<string, number> = {}
            data.conditions.forEach(c => {
              conditionCounts[c] = (conditionCounts[c] || 0) + 1
            })
            const topCondition = Object.entries(conditionCounts)
              .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear'
            
            return {
              date,
              avgTemp: Math.round(avgTemp),
              topCondition
            }
          })
          
          // Sort by date (newest first)
          weatherByDay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          
          setWeatherData(weatherByDay)
        }
        
      } catch (error) {
        console.error('Error fetching traffic data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrafficData()
  }, [region, customDateRange])

  const handleViewDetails = async () => {
    setShowDialog(true)
    setSummaryLoading(true)
    
    try {
      if (!trafficData) return
      
      const prompt = `Based on this traffic data for ${region}:
- Peak congestion time: ${trafficData.peakCongestionTime}
- Traffic vs previous period: ${trafficData.previousPeriodPercent > 0 ? '+' : ''}${trafficData.previousPeriodPercent.toFixed(1)}%
- Traffic vs prior year: ${trafficData.priorYearPercent > 0 ? '+' : ''}${trafficData.priorYearPercent.toFixed(1)}%

Provide a 3-sentence summary about: 1) peak periods, 2) traffic vs previous year, 3) traffic vs previous time period.`
      
      const response = await sendChatMessage(
        prompt,
        'executive',  // persona
        'quick',      // mode
        region,       // region
        'CUSTOM'      // timePeriod
      )
      
      setAiSummary(response.response)
    } catch (error) {
      console.error('Error generating summary:', error)
      setAiSummary('Unable to generate summary at this time.')
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleAnomaliesViewDetails = async () => {
    setShowAnomaliesDialog(true)
    setAnomaliesSummaryLoading(true)
    
    try {
      if (!anomaliesData) return
      
      const prompt = `Based on this event data for ${region} during the selected period:
- Total Events: ${anomaliesData.totalEvents}
- Total Accidents: ${anomaliesData.totalAccidents}
- Total Disruption Time: ${anomaliesData.totalDisruptionTime} minutes
- Average Clearance Time: ${anomaliesData.avgClearanceTime} minutes

Provide a 3-sentence summary analyzing: 1) the overall event patterns, 2) accident frequency and severity, 3) clearance efficiency.`
      
      const response = await sendChatMessage(
        prompt,
        'executive',  // persona
        'quick',      // mode
        region,       // region
        'CUSTOM'      // timePeriod
      )
      
      setAnomaliesAiSummary(response.response)
    } catch (error) {
      console.error('Error generating anomalies summary:', error)
      setAnomaliesAiSummary('Unable to generate summary at this time.')
    } finally {
      setAnomaliesSummaryLoading(false)
    }
  }

  const handleCountyViewDetails = async () => {
    setShowCountyDialog(true)
    setCountySummaryLoading(true)
    
    try {
      if (!countyData || countyData.length === 0) return
      
      const countyBreakdown = countyData.map(c => 
        `${c.county}: ${c.count} events (Top roads: ${c.topRoads.slice(0, 3).map(r => `${r.road} (${r.count})`).join(', ')})`
      ).join('\n')
      
      const prompt = `Based on county-level event data for ${region}:

${countyBreakdown}

Provide a 3-sentence analysis of: 1) which counties are most affected and why, 2) specific problem corridors within those counties, 3) patterns or recommendations for these areas.`
      
      const response = await sendChatMessage(
        prompt,
        'executive',  // persona
        'quick',      // mode
        region,       // region
        'CUSTOM'      // timePeriod
      )
      
      setCountyAiSummary(response.response)
    } catch (error) {
      console.error('Error generating county summary:', error)
      setCountyAiSummary('Unable to generate summary at this time.')
    } finally {
      setCountySummaryLoading(false)
    }
  }

  const handleWeatherViewDetails = async () => {
    setShowWeatherDialog(true)
    setWeatherSummaryLoading(true)
    
    try {
      if (!weatherData || weatherData.length === 0) return
      
      const weatherBreakdown = weatherData.map(w => 
        `${w.date}: ${w.avgTemp}°F, ${w.topCondition}`
      ).join('\n')
      
      const rainyDays = weatherData.filter(w => 
        w.topCondition.toLowerCase().includes('rain') || 
        w.topCondition.toLowerCase().includes('drizzle') ||
        w.topCondition.toLowerCase().includes('shower')
      )
      
      const prompt = `Based on weather data for ${region} during the selected period:

${weatherBreakdown}

Rainy days: ${rainyDays.length} out of ${weatherData.length} days

Provide a 3-sentence analysis focusing on: 1) overall weather patterns, 2) ESPECIALLY any rainy conditions and their potential impact on traffic, 3) temperature trends and their relevance to road conditions.`
      
      const response = await sendChatMessage(
        prompt,
        'executive',  // persona
        'quick',      // mode
        region,       // region
        'CUSTOM'      // timePeriod
      )
      
      setWeatherAiSummary(response.response)
    } catch (error) {
      console.error('Error generating weather summary:', error)
      setWeatherAiSummary('Unable to generate summary at this time.')
    } finally {
      setWeatherSummaryLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toLocaleString()} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours.toLocaleString()}h ${mins}m` : `${hours.toLocaleString()}h`
  }

  const sections = [
    {
      id: "trends",
      title: "Total Traffic",
      subtitle: "Traffic comparisons",
      icon: TrendingUp,
      color: "bg-blue-500",
      items: loading ? [
        { label: "Loading...", value: "...", trend: "neutral" }
      ] : trafficData ? [
        { 
          label: "Total Traffic vs. Previous Period", 
          value: `${formatNumber(trafficData.previousPeriodDiff)} (${trafficData.previousPeriodPercent > 0 ? '+' : ''}${trafficData.previousPeriodPercent.toFixed(1)}%)`, 
          trend: trafficData.previousPeriodPercent > 0 ? "up" : "down" 
        },
        { 
          label: "Traffic vs. Prior Year", 
          value: `${formatNumber(trafficData.priorYearDiff)} (${trafficData.priorYearPercent > 0 ? '+' : ''}${trafficData.priorYearPercent.toFixed(1)}%)`, 
          trend: trafficData.priorYearPercent > 0 ? "up" : "down" 
        },
        { 
          label: "Peak Congestion Time", 
          value: trafficData.peakCongestionTime, 
          trend: "neutral" 
        },
      ] : [],
      onViewDetails: handleViewDetails
    },
    {
      id: "anomalies",
      title: "Anomalies",
      subtitle: "Events & clearance times",
      icon: AlertCircle,
      color: "bg-orange-500",
      items: loading ? [
        { label: "Loading...", value: "...", trend: "neutral" }
      ] : anomaliesData ? [
        { 
          label: "Total Events", 
          value: formatNumber(anomaliesData.totalEvents), 
          trend: "alert" 
        },
        { 
          label: "Accidents", 
          value: formatNumber(anomaliesData.totalAccidents), 
          trend: "alert" 
        },
        { 
          label: "Total Disruption Time", 
          value: formatTime(anomaliesData.totalDisruptionTime), 
          trend: "alert" 
        },
        { 
          label: "Avg Clearance Time", 
          value: formatTime(anomaliesData.avgClearanceTime), 
          trend: "alert" 
        },
      ] : [],
      onViewDetails: handleAnomaliesViewDetails
    },
    {
      id: "bottlenecks",
      title: "Popular Problem Areas",
      subtitle: "Most impacted counties",
      icon: MapPin,
      color: "bg-red-500",
      items: loading ? [
        { label: "Loading...", value: "...", trend: "neutral" }
      ] : countyData.length > 0 ? countyData.map((county, index) => ({
        label: county.county,
        value: `${formatNumber(county.count)} events`,
        trend: index === 0 ? "critical" : index === 1 ? "critical" : "warning"
      })) : [
        { label: "No data", value: "-", trend: "neutral" }
      ],
      onViewDetails: handleCountyViewDetails
    },
    {
      id: "weather",
      title: "Weather Conditions",
      subtitle: "Daily weather summary",
      icon: CloudRain,
      color: "bg-green-500",
      items: loading ? [
        { label: "Loading...", value: "...", trend: "neutral" }
      ] : weatherData.length > 0 ? weatherData.slice(0, 3).map((day) => ({
        label: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: `${day.avgTemp}°F, ${day.topCondition}`,
        trend: day.topCondition.toLowerCase().includes('rain') ? "alert" : "forecast"
      })) : [
        { label: "No data", value: "-", trend: "neutral" }
      ],
      onViewDetails: handleWeatherViewDetails
    },
  ]

  return (
    <>
      <div className="rounded-xl border bg-card shadow-sm mb-8">
        <div className="border-b bg-muted/30 px-8 py-6">
          <h2 className="text-lg font-semibold text-foreground">Insights & Analysis</h2>
        </div>

        <div className="p-8 overflow-x-auto">
          <div className="flex gap-6 min-w-max pb-2">
            {sections.map((section) => {
              const Icon = section.icon
              const cardWidth = section.id === "trends" ? "w-[360px]" : "w-[300px]"
              return (
                <div key={section.id} className={`${cardWidth} rounded-lg border bg-background p-6 flex-shrink-0`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${section.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{section.title}</h3>
                      <p className="text-xs text-muted-foreground">{section.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {section.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                        <Badge
                          variant={
                            item.trend === "alert" || item.trend === "critical"
                              ? "destructive"
                              : item.trend === "warning"
                                ? "default"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {item.value}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2 text-xs bg-transparent hover:bg-muted/50"
                    onClick={section.onViewDetails}
                  >
                    View Details
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* AI Summary Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDialog(false)}>
          <div className="bg-card border rounded-xl shadow-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Total Traffic Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">AI-Generated Summary for {region}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {summaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {aiSummary}
                  </p>
                </div>
              )}

              {trafficData && !summaryLoading && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Peak Time</p>
                    <p className="text-sm font-semibold text-foreground">{trafficData.peakCongestionTime}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">vs Previous Period</p>
                    <p className={`text-sm font-semibold ${trafficData.previousPeriodPercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {trafficData.previousPeriodPercent > 0 ? '+' : ''}{trafficData.previousPeriodPercent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">vs Prior Year</p>
                    <p className={`text-sm font-semibold ${trafficData.priorYearPercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {trafficData.priorYearPercent > 0 ? '+' : ''}{trafficData.priorYearPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Anomalies AI Summary Dialog */}
      {showAnomaliesDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAnomaliesDialog(false)}>
          <div className="bg-card border rounded-xl shadow-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Event Anomalies Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">AI-Generated Summary for {region}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAnomaliesDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {anomaliesSummaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {anomaliesAiSummary}
                  </p>
                </div>
              )}

              {anomaliesData && !anomaliesSummaryLoading && (
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Total Events</p>
                    <p className="text-sm font-semibold text-foreground">{anomaliesData.totalEvents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Accidents</p>
                    <p className="text-sm font-semibold text-orange-600">{anomaliesData.totalAccidents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Disruption Time</p>
                    <p className="text-sm font-semibold text-foreground">{formatTime(anomaliesData.totalDisruptionTime)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Avg Clearance</p>
                    <p className="text-sm font-semibold text-foreground">{formatTime(anomaliesData.avgClearanceTime)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* County (Popular Problem Areas) AI Summary Dialog */}
      {showCountyDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCountyDialog(false)}>
          <div className="bg-card border rounded-xl shadow-lg max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Popular Problem Areas</h3>
                <p className="text-sm text-muted-foreground mt-1">County-Level Analysis for {region}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCountyDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {countySummaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {countyAiSummary}
                  </p>
                </div>
              )}

              {countyData && countyData.length > 0 && !countySummaryLoading && (
                <div className="space-y-4 pt-4 border-t">
                  {countyData.map((county, index) => (
                    <div key={county.county} className="bg-background rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-foreground">#{index + 1} {county.county}</h4>
                        <span className="text-sm font-semibold text-red-600">{county.count} events</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Top Problem Roads:</p>
                        {county.topRoads.slice(0, 5).map((road, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{road.road || 'Unknown Road'}</span>
                            <span className="text-foreground font-medium">{road.count} events</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Weather AI Summary Dialog */}
      {showWeatherDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowWeatherDialog(false)}>
          <div className="bg-card border rounded-xl shadow-lg max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Weather Analysis</h3>
                <p className="text-sm text-muted-foreground mt-1">Daily Weather for {region}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowWeatherDialog(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {weatherSummaryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">Generating AI summary...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-sm text-foreground leading-relaxed">
                    {weatherAiSummary}
                  </p>
                </div>
              )}

              {weatherData && weatherData.length > 0 && !weatherSummaryLoading && (
                <div className="space-y-2 pt-4 border-t max-h-64 overflow-y-auto">
                  {weatherData.map((day, index) => (
                    <div key={day.date} className="flex items-center justify-between bg-background rounded-lg p-3 border">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="text-lg font-bold text-foreground">{day.avgTemp}°F</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          day.topCondition.toLowerCase().includes('rain') 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {day.topCondition}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

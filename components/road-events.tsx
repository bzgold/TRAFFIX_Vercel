"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Clock, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { fetchWorstAccidents, type WorstAccident } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"

export function RoadEvents() {
  const { region, timePeriod, customDateRange, refreshTrigger } = useTraffixContext()
  const [accidents, setAccidents] = useState<WorstAccident[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadAccidents() {
      try {
        setLoading(true)
        const data = await fetchWorstAccidents(
          region,
          timePeriod,
          timePeriod === 'CUSTOM' ? customDateRange.start : undefined,
          timePeriod === 'CUSTOM' ? customDateRange.end : undefined
        )
        setAccidents(data)
      } catch (err) {
        console.error('Error loading worst accidents:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAccidents()
  }, [region, timePeriod, customDateRange, refreshTrigger])

  if (loading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Worst Accidents</h2>
              <p className="text-sm text-muted-foreground">Top 10 by overall clearance time</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="rounded-lg border bg-background p-4 animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-3 w-full bg-muted rounded mb-2" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (accidents.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Worst Accidents</h2>
              <p className="text-sm text-muted-foreground">Top 10 by overall clearance time</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            No accidents found for the selected period
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Worst Accidents</h2>
            <p className="text-sm text-muted-foreground">Top 10 by overall clearance time</p>
          </div>
        </div>
      </div>
      <div className="p-6 max-h-[800px] overflow-y-auto">
        <div className="space-y-4">
          {accidents.map((accident, index) => (
            <div key={accident.id} className="rounded-lg border bg-background p-4 hover:shadow-md transition-shadow">
              {/* Rank and Road */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-base mb-1">{accident.road}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>{accident.county}, {accident.state}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="destructive" className="text-xs flex-shrink-0">
                  {accident.overall_time_formatted}
                </Badge>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {accident.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

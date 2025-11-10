"use client"

import { TrendingUp, AlertCircle, MapPin, CloudRain, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function InsightPanels() {
  const insights = [
    {
      id: "trends",
      title: "Trends & Stats",
      icon: TrendingUp,
      color: "bg-blue-500",
      items: [
        { label: "Delay this week vs last", value: "+15%", trend: "up" },
        { label: "Peak congestion time", value: "8:15 AM", trend: "neutral" },
        { label: "Average speed I-495", value: "42 mph", trend: "down" },
      ],
    },
    {
      id: "anomalies",
      title: "Anomalies",
      icon: AlertCircle,
      color: "bg-orange-500",
      items: [
        { label: "Unusual spike on Route 29", value: "🔺 High", trend: "alert" },
        { label: "Unexpected drop I-95 NB", value: "🔻 Medium", trend: "alert" },
        { label: "Off-pattern behavior detected", value: "3 locations", trend: "alert" },
      ],
    },
    {
      id: "bottlenecks",
      title: "Top Bottlenecks",
      icon: MapPin,
      color: "bg-red-500",
      items: [
        { label: "I-495 @ Route 50", value: "Rank #1", trend: "critical" },
        { label: "I-66 EB @ Fairfax", value: "Rank #2", trend: "critical" },
        { label: "Route 29 @ Columbia Pike", value: "Rank #3", trend: "warning" },
      ],
    },
    {
      id: "forecast",
      title: "Forecast",
      icon: CloudRain,
      color: "bg-green-500",
      items: [
        { label: "Tomorrow AM peak", value: "Heavy", trend: "forecast" },
        { label: "Weather impact", value: "Rain 60%", trend: "forecast" },
        { label: "Predicted hotspots", value: "4 corridors", trend: "forecast" },
      ],
    },
  ]

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Insights & Analysis</h2>
        <p className="text-sm text-muted-foreground">What's changing and why</p>
      </div>

      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-2">
          {insights.map((insight) => {
            const Icon = insight.icon
            return (
              <div key={insight.id} className="w-[280px] rounded-lg border bg-background p-4 flex-shrink-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${insight.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">{insight.title}</h3>
                </div>

                <div className="space-y-3 mb-4">
                  {insight.items.map((item, i) => (
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

                <Button variant="outline" size="sm" className="w-full gap-2 text-xs bg-transparent">
                  <HelpCircle className="h-3 w-3" />
                  Explain
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { TrendingUp, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function HistoricalTrends() {
  const trends = [
    {
      route: "I-95 Northbound",
      change: "+23%",
      period: "vs. last week",
      status: "increasing",
      peakTime: "8:00 AM - 9:30 AM",
    },
    {
      route: "Route 66 Eastbound",
      change: "-12%",
      period: "vs. last week",
      status: "decreasing",
      peakTime: "5:00 PM - 6:45 PM",
    },
    {
      route: "Highway 101 South",
      change: "+8%",
      period: "vs. last week",
      status: "increasing",
      peakTime: "7:30 AM - 9:00 AM",
    },
  ]

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Historical Trends</h2>
          </div>
          <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <Calendar className="h-4 w-4" />
            Last 7 Days
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {trends.map((trend, i) => (
            <div key={i} className="rounded-lg border bg-background p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{trend.route}</h3>
                  <p className="text-sm text-muted-foreground">Peak: {trend.peakTime}</p>
                </div>
                <Badge variant={trend.status === "increasing" ? "destructive" : "default"}>{trend.change}</Badge>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${trend.status === "increasing" ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${Math.abs(Number.parseInt(trend.change))}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{trend.period}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

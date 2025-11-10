import { Activity, Clock, AlertCircle, TrendingDown } from "lucide-react"

export function StatsPanel() {
  const stats = [
    {
      label: "Active Incidents",
      value: "12",
      change: "-3 from yesterday",
      icon: AlertCircle,
      trend: "down",
    },
    {
      label: "Avg Delay Time",
      value: "18 min",
      change: "+5 min from yesterday",
      icon: Clock,
      trend: "up",
    },
    {
      label: "Network Health",
      value: "87%",
      change: "+2% from yesterday",
      icon: Activity,
      trend: "up",
    },
    {
      label: "Congestion Index",
      value: "6.2",
      change: "-0.8 from yesterday",
      icon: TrendingDown,
      trend: "down",
    },
  ]

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Live Statistics</h2>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="rounded-lg border bg-background p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <div className="ml-11">
                  <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className={`text-xs ${stat.trend === "up" ? "text-destructive" : "text-primary"}`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

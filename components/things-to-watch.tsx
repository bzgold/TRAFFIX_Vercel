import { AlertCircle, Construction, TrendingUp, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ThingsToWatch() {
  const watchItems = [
    {
      title: "Recurring Congestion on I-66 Eastbound",
      description: "Pattern detected: Daily slowdowns between 7-9 AM near Exit 57",
      severity: "High",
      icon: TrendingUp,
      timeWindow: "Weekdays 7-9 AM",
    },
    {
      title: "Upcoming Work Zone - Route 50",
      description: "Lane closures scheduled starting next Monday for 3 weeks",
      severity: "Medium",
      icon: Construction,
      timeWindow: "Starting Mon, 9 AM",
    },
    {
      title: "Anomaly Detected - I-495 Inner Loop",
      description: "Unusual traffic pattern detected near Tysons Corner exit",
      severity: "Low",
      icon: AlertCircle,
      timeWindow: "Last 2 hours",
    },
  ]

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Eye className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Things to Watch</h2>
            <p className="text-sm text-muted-foreground">Automated insights and alerts</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {watchItems.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="rounded-lg border bg-background p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 mt-1">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <Badge
                        variant={
                          item.severity === "High"
                            ? "destructive"
                            : item.severity === "Medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <p className="text-xs text-muted-foreground/80">⏰ {item.timeWindow}</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Explain Why
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

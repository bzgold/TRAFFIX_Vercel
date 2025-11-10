import { MapPin, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function RoadInformation() {
  const roads = [
    {
      name: "I-95 North",
      status: "Moderate",
      incidents: 2,
      avgSpeed: "45 mph",
      condition: "warning",
    },
    {
      name: "Route 66 East",
      status: "Clear",
      incidents: 0,
      avgSpeed: "62 mph",
      condition: "good",
    },
    {
      name: "Highway 101",
      status: "Heavy",
      incidents: 4,
      avgSpeed: "28 mph",
      condition: "alert",
    },
    {
      name: "I-405 South",
      status: "Moderate",
      incidents: 1,
      avgSpeed: "38 mph",
      condition: "warning",
    },
  ]

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Road Conditions</h2>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {roads.map((road, i) => (
            <div key={i} className="rounded-lg border bg-background p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {road.condition === "good" ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <AlertTriangle
                      className={`h-4 w-4 ${road.condition === "alert" ? "text-destructive" : "text-yellow-500"}`}
                    />
                  )}
                  <h3 className="font-semibold text-foreground text-sm">{road.name}</h3>
                </div>
                <Badge
                  variant={
                    road.condition === "good" ? "default" : road.condition === "alert" ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {road.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{road.incidents} incidents</span>
                <span className="font-medium">{road.avgSpeed}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

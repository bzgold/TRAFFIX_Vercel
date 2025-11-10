import { Card } from "@/components/ui/card"
import { Zap, FileText, Clock, TrendingUp, Database, Mail } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Quick Mode",
    description: "Generate concise daily summaries of congestion patterns and notable events in seconds.",
  },
  {
    icon: FileText,
    title: "Deep Mode",
    description: "Create in-depth research reports with historical context, causes, and contributing factors.",
  },
  {
    icon: Clock,
    title: "Real-Time Analysis",
    description: "Ask targeted questions and get instant answers about current traffic conditions and anomalies.",
  },
  {
    icon: TrendingUp,
    title: "Pattern Recognition",
    description: "Automatically identify recurring congestion patterns and their underlying causes.",
  },
  {
    icon: Database,
    title: "Multi-Source Integration",
    description: "Combines RITIS data with news articles, incident logs, weather data, and more.",
  },
  {
    icon: Mail,
    title: "Export & Share",
    description: "Generate reports suitable for leadership and stakeholders, ready to export or email.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight lg:text-5xl">
            Powerful features for{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              transportation professionals
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything you need to understand traffic patterns, investigate anomalies, and deliver actionable insights
            to stakeholders.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card p-6 transition-all hover:border-primary/50"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

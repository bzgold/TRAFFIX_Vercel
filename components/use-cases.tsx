import { Card } from "@/components/ui/card"
import { Building2, MapPin, BarChart3 } from "lucide-react"

const useCases = [
  {
    icon: Building2,
    title: "Department of Transportation",
    description:
      "Quickly explain traffic changes to leadership, generate performance reports, and identify infrastructure improvement opportunities.",
    examples: ["Daily congestion reports", "Incident impact analysis", "Performance metrics for stakeholders"],
  },
  {
    icon: MapPin,
    title: "City Agencies",
    description:
      "Monitor local traffic patterns, respond to citizen inquiries, and make data-driven decisions for urban planning.",
    examples: ["Event impact assessment", "Construction zone analysis", "Public communication materials"],
  },
  {
    icon: BarChart3,
    title: "Private Sector",
    description:
      "Enhance navigation apps, optimize toll operations, and provide value-added services with deeper traffic insights.",
    examples: ["Route optimization", "Predictive analytics", "Customer reporting"],
  },
]

export function UseCases() {
  return (
    <section id="use-cases" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight lg:text-5xl">
            Built for transportation professionals
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Whether you work at a DOT, city agency, or private sector organization, TRAFFIX helps you work smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <Card key={index} className="border-border bg-card p-8">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <useCase.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">{useCase.title}</h3>
              <p className="mb-6 leading-relaxed text-muted-foreground">{useCase.description}</p>
              <div className="space-y-2">
                {useCase.examples.map((example, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {example}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

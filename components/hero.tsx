import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-20 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">AI-Powered Transportation Analytics</span>
          </div>

          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight tracking-tight lg:text-7xl">
            Understand{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
              why
            </span>{" "}
            congestion changes
          </h1>

          <p className="mb-10 text-pretty text-lg leading-relaxed text-muted-foreground lg:text-xl">
            TRAFFIX is an AI-powered storytelling assistant that helps transportation analysts, planners, and operations
            managers uncover the underlying causes behind traffic pattern changes. Stop spending hours investigating —
            get instant, evidence-based insights.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-primary">10x</div>
              <div className="text-sm text-muted-foreground">Faster Analysis</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Automated Monitoring</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-2 text-3xl font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Evidence-Based</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

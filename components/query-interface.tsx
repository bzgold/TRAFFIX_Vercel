"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkles } from "lucide-react"

const exampleQueries = [
  "Why was congestion higher than normal today?",
  "What major incidents occurred in my region this week?",
  "Did weather affect travel time reliability today?",
  "Summarize this week's mobility highlights",
]

export function QueryInterface() {
  const [query, setQuery] = useState("")
  const [mode, setMode] = useState<"quick" | "deep">("quick")

  return (
    <section id="query" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight lg:text-5xl">
              Ask TRAFFIX anything about your traffic data
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Get instant, evidence-based insights powered by AI
            </p>
          </div>

          <Card className="border-border bg-card p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Button
                variant={mode === "quick" ? "default" : "outline"}
                onClick={() => setMode("quick")}
                className={mode === "quick" ? "bg-primary text-primary-foreground" : ""}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Quick Mode
              </Button>
              <Button
                variant={mode === "deep" ? "default" : "outline"}
                onClick={() => setMode("deep")}
                className={mode === "deep" ? "bg-primary text-primary-foreground" : ""}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Deep Mode
              </Button>
            </div>

            <div className="mb-4">
              <Textarea
                placeholder="Ask a question about traffic patterns, congestion causes, or incidents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-32 resize-none border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {mode === "quick" ? "Get a concise summary in seconds" : "Generate an in-depth research report"}
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Send className="mr-2 h-4 w-4" />
                Analyze
              </Button>
            </div>

            <div>
              <div className="mb-3 text-sm font-medium text-muted-foreground">Example questions:</div>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer border-border bg-secondary text-foreground hover:border-primary/50 hover:bg-secondary/80"
                    onClick={() => setQuery(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Demo Response */}
          <Card className="mt-6 border-border bg-card p-6 lg:p-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              <span className="text-sm font-medium text-muted-foreground">AI Analysis</span>
            </div>
            <div className="space-y-4 text-foreground">
              <p className="leading-relaxed">
                <strong className="text-primary">Congestion Summary:</strong> Traffic on I-95 North was 35% higher than
                normal during morning rush hour (7-9 AM) today.
              </p>
              <p className="leading-relaxed">
                <strong className="text-primary">Primary Cause:</strong> Multi-vehicle accident at Exit 42 blocked two
                lanes from 7:15 AM to 8:45 AM, creating a 3-mile backup.
              </p>
              <p className="leading-relaxed">
                <strong className="text-primary">Contributing Factors:</strong> Light rain reduced visibility and road
                friction. Similar incidents occurred at this location 3 times in the past month, suggesting potential
                infrastructure improvements needed.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}

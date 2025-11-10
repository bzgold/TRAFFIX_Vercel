"use client"

import { useEffect, useState } from "react"
import { Newspaper, ExternalLink, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { fetchNews, type NewsItem } from "@/lib/api-client"
import { useTraffixContext } from "@/lib/traffix-context"

// Format date to readable string
function formatDate(dateString: string): string {
  if (!dateString) return "Recently"
  
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    // If within last 24 hours, show "X hours ago"
    if (diffHours < 24 && diffHours >= 0) {
      if (diffHours === 0) return "Just now"
      if (diffHours === 1) return "1 hour ago"
      return `${diffHours} hours ago`
    }
    
    // If within last 7 days, show "X days ago"
    if (diffDays < 7 && diffDays > 0) {
      if (diffDays === 1) return "Yesterday"
      return `${diffDays} days ago`
    }
    
    // Otherwise show formatted date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch (e) {
    return "Recently"
  }
}

export function NewsFeed() {
  const { region, refreshTrigger } = useTraffixContext()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true)
        const data = await fetchNews(region, undefined, 7)
        setNewsItems(data.slice(0, 10)) // Show top 10 (5 traffic + 5 political/economic)
      } catch (err) {
        console.error('Error loading news:', err)
        // Keep previous news on error
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [region, refreshTrigger])

  if (loading && newsItems.length === 0) {
    return (
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
              <Newspaper className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Latest News & Updates</h2>
              <p className="text-sm text-muted-foreground">Top 10 Most Recent (Traffic & Political/Economy)</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="rounded-lg border bg-background p-4 animate-pulse">
                <div className="h-4 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-48 bg-muted rounded mb-2" />
                <div className="h-3 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Latest News & Updates</h2>
              <p className="text-sm text-muted-foreground">Top 10 Most Recent (Traffic & Political/Economy)</p>
            </div>
        </div>
      </div>
      <div className="p-6 max-h-[800px] overflow-y-auto">
        {newsItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            News feed temporarily unavailable
          </p>
        ) : (
          <div className="space-y-4">
            {newsItems.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border bg-background p-4 hover:bg-accent/50 transition-colors cursor-pointer block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          item.impact === "High" ? "destructive" : item.impact === "Medium" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {item.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(item.published)}</span>
                      </div>
                    </div>
                    <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.source}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

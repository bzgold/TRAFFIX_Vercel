"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { ChatInterface } from "@/components/chat-interface"
import { NewsFeed } from "@/components/news-feed"
import { RoadEvents } from "@/components/road-events"
import { PlatformHeader } from "@/components/platform-header"
import { BanNumbers } from "@/components/ban-numbers"
import { InsightsAndAnalysis } from "@/components/insights-and-analysis"
import { AnalystRecommendations } from "@/components/analyst-recommendations"
import { AnalyticsGraphs } from "@/components/analytics-graphs"
import { X, Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

// Dynamically import Leaflet map component (no SSR - needs browser APIs)
const NetworkMapLeaflet = dynamic(() => import("@/components/network-map-leaflet").then(mod => ({ default: mod.NetworkMapLeaflet })), {
  ssr: false,
  loading: () => <div className="rounded-xl border bg-card shadow-sm mb-8 p-8 h-[550px] flex items-center justify-center"><p className="text-muted-foreground">Loading map...</p></div>
})

type PanelSize = "hidden" | "mid" | "full"

export default function Home() {
  const [panelSize, setPanelSize] = useState<PanelSize>("mid")

  return (
    <main className="min-h-screen bg-background">
      <PlatformHeader />

      <div className="flex">
        {/* Left: Scrollable Content */}
        <div className={`overflow-y-auto transition-all duration-300 ${panelSize === "full" ? "hidden" : "flex-1"}`}>
          <div className="container mx-auto px-12 py-12 max-w-7xl">
            <BanNumbers />
            <NetworkMapLeaflet />
            <InsightsAndAnalysis />
            <AnalystRecommendations />

            {/* Extra spacing before news/events section */}
            <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
              <NewsFeed />
              <RoadEvents />
            </div>

            {/* Analytics section at bottom */}
            <AnalyticsGraphs />
          </div>
        </div>

        {/* Right: Chat Panel (sticky, resizable) */}
        {panelSize !== "hidden" && (
          <div
            className={`border-l bg-card/50 sticky top-[96px] overflow-y-auto transition-all duration-300 ${
              panelSize === "full"
                ? "fixed inset-0 top-[96px] w-full h-[calc(100vh-96px)] z-50"
                : "w-[520px] h-[calc(100vh-96px)]"
            }`}
          >
            <div className="p-10">
              <div className="flex gap-2 mb-6 justify-end">
                {panelSize === "mid" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPanelSize("full")}
                    className="h-8 w-8"
                    title="Expand to full screen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                )}
                {panelSize === "full" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setPanelSize("mid")}
                    className="h-8 w-8"
                    title="Return to mid-way"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setPanelSize("hidden")}
                  className="h-8 w-8"
                  title="Hide panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChatInterface />
            </div>
          </div>
        )}

        {panelSize === "hidden" && (
          <div className="fixed bottom-10 right-10 z-50">
            <Button onClick={() => setPanelSize("mid")} className="bg-primary hover:bg-primary/90">
              Show Analyst Panel
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

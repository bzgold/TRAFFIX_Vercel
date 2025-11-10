"use client"

import { Activity } from "lucide-react"
import { TimePeriodSelector } from "@/components/time-period-selector"
import { Button } from "@/components/ui/button"
import { useTraffixContext } from "@/lib/traffix-context"

export function PlatformHeader() {
  const { region, setRegion, triggerRefresh } = useTraffixContext()

  const handleRegionChange = (newRegion: 'District of Columbia' | 'Virginia' | 'All') => {
    setRegion(newRegion)
    triggerRefresh()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-24 items-center justify-between px-10">
        <div className="flex items-center gap-10">
          <div className="text-2xl font-bold text-foreground tracking-tight">TRANSPORT LLC</div>
          <div className="h-14 w-px bg-border" />
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
              <Activity className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">TRAFFIX</h1>
              <p className="text-sm text-muted-foreground">AI Traffic Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Region Selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Region:</span>
            <div className="flex items-center gap-2">
              <Button
                variant={region === 'District of Columbia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRegionChange('District of Columbia')}
                className="h-9 px-4"
              >
                DC
              </Button>
              <Button
                variant={region === 'Virginia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRegionChange('Virginia')}
                className="h-9 px-4"
              >
                VA
              </Button>
              <Button
                variant={region === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleRegionChange('All')}
                className="h-9 px-4"
              >
                All
              </Button>
            </div>
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Time Period Selector */}
          <TimePeriodSelector />
        </div>
      </div>
    </header>
  )
}
